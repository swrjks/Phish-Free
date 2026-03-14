// content_script.js
(function () {
  "use strict";

  // ---------------------------
  // Utilities / metadata
  // ---------------------------
  function getVisibleText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const txt = node.nodeValue ? node.nodeValue.trim() : "";
        if (!txt) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (["script", "style", "noscript", "iframe"].includes(tag)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let chunks = [];
    let node;
    while ((node = walker.nextNode())) {
      chunks.push(node.nodeValue.trim());
      if (chunks.length >= 200) break;
    }
    let text = chunks.join(" ");
    if (text.length > 40000) text = text.slice(0, 40000);
    return text;
  }

  function getPageMeta() {
    return {
      title: document.title || "",
      url: window.location.href,
      hostname: window.location.hostname,
      metaDescription: (document.querySelector('meta[name="description"]') || {}).content || ""
    };
  }

  // ---------------------------
  // Session dismiss helpers
  // ---------------------------
  function sessionDismissed(hostname) {
    try {
      return sessionStorage.getItem("phishfree.dismissed:" + hostname) === "1";
    } catch (e) {
      return false;
    }
  }
  
  function siteReportedSafe(hostname) {
    try {
      return sessionStorage.getItem("phishfree.reported_safe:" + hostname) === "1";
    } catch (e) {
      return false;
    }
  }
  function setSessionDismissed(hostname) {
    try {
      sessionStorage.setItem("phishfree.dismissed:" + hostname, "1");
    } catch (e) { /* ignore */ }
  }

  // ---------------------------
  // === NEW: Representative image extractor for CNN
  // Attempts to get a sensible image for CNN scoring:
  // - meta[property="og:image"]
  // - first same-origin <img> largest area
  // - data: URL images
  // - returns base64 data URI string or null
  // ---------------------------
  async function getRepresentativeImageBase64(maxWidth = 800) {
    try {
      // 1) og:image
      const og = document.querySelector('meta[property="og:image"], meta[name="og:image"]');
      if (og && og.content) {
        const url = og.content;
        const b64 = await fetchImageToDataUrl(url);
        if (b64) return b64;
      }

      // 2) find largest same-origin <img>
      const imgs = Array.from(document.images || []);
      // filter data: and same-origin images
      const candidates = imgs.filter(img => {
        if (!img || !img.src) return false;
        try {
          if (img.src.startsWith('data:')) return true;
          const srcUrl = new URL(img.src, window.location.href);
          return srcUrl.hostname === window.location.hostname;
        } catch (e) {
          return false;
        }
      });
      // sort by visible area (width*height)
      candidates.sort((a, b) => {
        const aw = (a.naturalWidth || a.width || 0);
        const ah = (a.naturalHeight || a.height || 0);
        const bw = (b.naturalWidth || b.width || 0);
        const bh = (b.naturalHeight || b.height || 0);
        return (bw * bh) - (aw * ah);
      });
      for (const img of candidates) {
        try {
          const b64 = await fetchImageToDataUrl(img.src);
          if (b64) return b64;
        } catch (e) { /* ignore and continue */ }
      }

      // 3) fallback: take a tiny screenshot of the page viewport using toDataURL via inpage canvas
      // NOTE: browsers restrict cross-origin content; this is a best-effort cheap fallback: draw some visible area if possible
      // We'll try to capture via HTMLCanvasElement.drawImage if an <svg> or same-origin image exists; otherwise skip.
      return null;
    } catch (e) {
      console.warn("getRepresentativeImageBase64 failed", e);
      return null;
    }
  }

  // Helper: fetch image bytes and return data:image/png;base64,... or data URL if it's already data:
  async function fetchImageToDataUrl(src) {
    try {
      if (!src) return null;
      if (src.startsWith("data:")) return src; // already a data URL
      const u = new URL(src, window.location.href);
      // Only allow same-origin fetch here for safety and to avoid CORS issues.
      if (u.hostname !== window.location.hostname && u.protocol.startsWith('http')) {
        // try to fetch via CORS — but silently skip if blocked
        // We'll attempt fetch once (server may allow CORS)
        try {
          const r = await fetch(u.href, { mode: 'cors' });
          if (!r.ok) return null;
          const blob = await r.blob();
          return await blobToDataUrl(blob);
        } catch (e) {
          return null;
        }
      } else {
        // same-origin — safe to fetch
        const r2 = await fetch(u.href);
        if (!r2.ok) return null;
        const blob = await r2.blob();
        return await blobToDataUrl(blob);
      }
    } catch (e) {
      return null;
    }
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  }

  // ---------------------------
  // Send to background for analysis
  // - includes text (LLM) and attempts to attach image_b64 (CNN) if available
  // - supports "run_models" array in payload (e.g. ["cnn","gnn"]) for targeted runs
  // ---------------------------
  async function sendForAnalysis(trigger = "auto", extra = {}) {
    try {
      const payload = {
        url: window.location.href,
        hostname: window.location.hostname,
        title: document.title || "",
        meta_description: (document.querySelector('meta[name="description"]') || {}).content || "",
        text: getVisibleText(),
        trigger,
        timestamp: new Date().toISOString(),
        // allow extra to include run_models etc.
        ...extra
      };

      // === NEW: attempt to attach representative image for CNN if backend asked or for manual triggers
      // Only fetch image if caller requested cnn or allowed image attachment
      // ALWAYS attempt to attach a representative image for CNN checks (best-effort)
try {
  const imgB64 = await getRepresentativeImageBase64();
  if (imgB64) {
    payload.image_b64 = imgB64;
    console.debug("[content] Attached image_b64 length:", payload.image_b64.length);
  } else {
    // no image found — still send domain/text
    console.debug("[content] No representative image found for this page");
  }
} catch (e) {
  console.warn("image attach failed", e);
}

// Ensure domain is present (GNN needs domain)
payload.domain = window.location.hostname || payload.hostname || "";

      console.debug("[content] sending analyze payload:", payload);
      chrome.runtime.sendMessage({ action: "analyze_page", payload }, (response) => {
        if (response && response.result) {
          const result = response.result;

          // ALWAYS store the result so popup reads the latest analysis (even for low/benign).
          try {
            const storageObj = {};
            storageObj["analysis:" + window.location.href] = result;
            storageObj["last_analysis_for_current_tab"] = result;
            chrome.storage.local.set(storageObj, () => {
              console.debug("[content] stored analysis for", window.location.href);
            });
          } catch (e) {
            console.warn("[content] store failed:", e);
          }

          // don't show banner this session if user dismissed for this hostname
          if (sessionDismissed(window.location.hostname)) {
            removeBanner();
            return;
          }

          // show banner for all risk levels (low included)
          injectBanner(result);

        } else {
          console.warn("[content] analyze_page: no result returned", response);
        }
      });

    } catch (err) {
      console.error("content_script:failed", err);
    }
  }

  // ---------------------------
  // Message listener (re-analyze trigger)
  // ---------------------------
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    try {
      if (msg && msg.action === "trigger_reanalyze") {
        if (typeof sendForAnalysis === "function") {
          if (sessionDismissed(window.location.hostname) && msg.force !== true) {
            sendResponse({ ok: false, info: "dismissed_for_session" });
            return;
          }
          sendForAnalysis("manual", { run_models: ["text","cnn","gnn"] });

          sendResponse({ ok: true, info: "reanalysis_triggered" });
        } else {
          sendResponse({ ok: false, error: "sendForAnalysis not available" });
        }
      }
    } catch (err) {
      console.error("content_script listener error:", err);
      sendResponse({ ok: false, error: String(err) });
    }
  });

  // ---------------------------
  // Explanation/threat helpers
  // ---------------------------
  function buildThreatPaths(result) {
    const threats = [];
    const reasons = (result.combined_reasons || result.reasons || (result.text && result.text.reasons) || []).map(r => String(r).toLowerCase());
    const components = (result.url && result.url.components) || {};
    const score = typeof result.aggregate_score === "number" ? result.aggregate_score : (result.score || 0);

    if (reasons.some(r => /login|verify|password|signin|confirm|account/.test(r)) ||
        (result.text && /password|account|login|verify|confirm/i.test(result.text.excerpt || "")) ||
        (result.text && result.text.suspicious && result.text.suspicious.length)) {
      threats.push("Credential theft — the page may try to trick you into entering your login & password (e.g. a fake 'LinkedIn' or 'bank' sign-in).");
    }

    if (reasons.some(r => /access.*file|drive|files|upload|permission/i.test(r)) ||
        (result.text && /access your (drive|files|photos|documents)/i.test(result.text.excerpt || ""))) {
      threats.push("Unauthorized data access — the site might try to access your files or cloud storage (e.g. 'Requests access to your Google Drive').");
    }

    if (reasons.some(r => /download|install|update|exe|apk/i.test(r)) ||
        (components && components.path && /download|install|setup|update/i.test(components.path))) {
      threats.push("Malware / unwanted download — the page may try to make you download malicious software (e.g. fake 'update' installers).");
    }

    if (reasons.some(r => /redirect|hop|shortener|bit\.ly|tinyurl|free-gifts|winner|prize/i.test(r)) ||
        (score >= 0.6 && reasons.length && reasons.some(r => /redirect|suspicious/))) {
      threats.push("Redirect-to-scam — you may be redirected to other fraudulent pages (e.g. fake payment pages or prize scams).");
    }

    return threats;
  }

  function headlineAndAdvice(result) {
    const label = (result.label || result.risk_label || "").toString().toLowerCase();
    const score = typeof result.aggregate_score === "number" ? result.aggregate_score : (result.score || 0);
    const advice = { headline: "Unknown", short: "We couldn't determine risk.", className: "risk-unknown" };

    if (label === "high" || score >= 0.6) {
      advice.headline = "High Risk";
      advice.short = "This site looks dangerous — do not enter passwords or personal info.";
      advice.className = "risk-high";
    } else if (label === "medium" || score >= 0.35) {
      advice.headline = "Medium Risk";
      advice.short = "This site looks suspicious — double-check the URL and avoid sensitive input.";
      advice.className = "risk-medium";
    } else {
      advice.headline = "Low Risk";
      advice.short = "This site looks okay, but stay cautious.";
      advice.className = "risk-low";
    }
    return advice;
  }

  // Escape helper for inserted text
  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ---------------------------
  // Banner injection (updated)
  // ---------------------------
  const BANNER_AUTO_HIDE_MS = 15000; // 15s auto-hide default
  let _phishfree_banner_timer = null;

  function injectBanner(result) {
    try {
      // Respect per-host session dismissal
      if (sessionDismissed(window.location.hostname)) {
        removeBanner();
        return;
      }

      // Remove existing banner & clear timer
      removeBanner();

      const advice = headlineAndAdvice(result);
      const reportedSafe = siteReportedSafe(window.location.hostname);
      
      // --- small inline model indicators (CNN / GNN) ---
let _cnn_pct = "—";
let _gnn_pct = "—";
try {
  const c = result.cnn_score ?? result.cnn_score_raw ?? (result.components_raw && result.components_raw.cnn) ?? (result.components && result.components.cnn);
  const g = result.gnn_score ?? result.gnn_score_raw ?? (result.components_raw && result.components_raw.gnn) ?? (result.components && result.components.gnn);
  function _norm(v) {
    if (v === undefined || v === null || v === "") return null;
    const n = Number(v);
    if (isNaN(n)) return null;
    if (n > 1 && n <= 100) return n / 100.0;
    if (n > 100) return Math.min(1, n / 100.0);
    return Math.max(0, Math.min(1, n));
  }
  const nc = _norm(c);
  const ng = _norm(g);
  if (nc !== null) _cnn_pct = `${Math.round(nc*100)}%`;
  if (ng !== null) _gnn_pct = `${Math.round(ng*100)}%`;
} catch (e) { /* ignore */ }

// Hidden model details for cleaner user experience
const modelMini = "";

// Add reported safe indicator
const safeIndicator = reportedSafe ? `<div style="margin-top:4px;font-size:12px;color:rgba(255,255,255,0.9);background:rgba(0,255,0,0.2);padding:2px 6px;border-radius:4px;display:inline-block;">✓ Reported Safe</div>` : '';

      let bullets = [];
      const rawReasons = result.combined_reasons || result.reasons || [];
      
      if (Array.isArray(rawReasons) && rawReasons.length > 0) {
        // filter out analyst/debugger logs and clean up text for normal users
        rawReasons.forEach(r => {
          const text = (r || '').toString().trim();
          if (!text) return;
          const lower = text.toLowerCase();
          // Filter out heavy analyst data outputs
          if (lower.includes('score=') || lower.includes('weights(') || lower.includes('components(') || lower.includes('text model') || lower.includes('visual model') || lower.includes('established domain') || lower.includes('cnn') || lower.includes('gnn')) {
             return;
          }
          let cleanText = text.replace(/^AI Agent:\s*/i, '');
          if (cleanText) bullets.push(cleanText);
        });
      }
      
      if (!bullets.length) {
        // fallback to precanned text
        const threats = buildThreatPaths(result);
        if (threats.length) bullets.push(...threats);
      }

      // try parsing domain age from common backend fields
      const age = result.domain_age_days ?? result.domain_age ?? (result.whois && result.whois.age_days) ?? (result.url && result.url.domain_age_days) ?? (result.url && result.url.components && result.url.components.whois && result.url.components.whois.age_days) ?? (result.features && result.features.domain_age_days);
      
      let parsedAgeText = "Unknown";
      if (age !== undefined && age !== null && age >= 0) {
        const years = Math.floor(age / 365);
        const months = Math.floor((age % 365) / 30);
        const days = Math.floor((age % 365) % 30);
        
        let ageParts = [];
        if (years > 0) ageParts.push(`${years}y`);
        if (months > 0) ageParts.push(`${months}m`);
        if (days > 0 || (years === 0 && months === 0)) ageParts.push(`${days}d`);
        
        parsedAgeText = ageParts.join(' ');
        
        // Remove existing age-related messages to prevent duplicates
        bullets = bullets.filter(b => !b.toLowerCase().includes('domain (age:') && !b.toLowerCase().includes('domain age:'));
      }
      
      let ipValue = "N/A";
      let locationValue = "N/A";
      try {
        if (result.url && result.url.components && result.url.components.asn) {
           ipValue = result.url.components.asn.ip || "N/A";
           const cc = result.url.components.asn.asn_country;
           if (cc) {
               // Translate country code to emoji flag visually if possible, or just string.
               locationValue = cc;
           }
        }
      } catch(e){}
      
      if (!bullets.length) bullets.push("Analysis complete. Site looks generally safe.");

      // create root banner
      const banner = document.createElement("div");
      banner.id = "phishfree-banner";
      banner.setAttribute("role", "region");
      banner.setAttribute("aria-label", "Phishing warning from PhishFree");
      banner.style.position = "fixed";
      banner.style.top = "16px";
      banner.style.left = "50%";
      banner.style.zIndex = "2147483647";
      banner.style.display = "flex";
      banner.style.justifyContent = "center";
      banner.style.pointerEvents = "auto";
      banner.style.transform = "translate(-50%, -150%) scale(0.9)";
      banner.style.opacity = "0";
      banner.style.transition = "all 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)";

      // Minimalist wrapper (visual)
      const wrap = document.createElement("div");
      wrap.className = "phishfree-wrap";
      wrap.style.margin = "0";
      wrap.style.display = "flex";
      wrap.style.flexDirection = "column";
      wrap.style.alignItems = "stretch";
      wrap.style.padding = "6px 12px 6px 16px";
      wrap.style.borderRadius = "30px";
      wrap.style.boxSizing = "border-box";
      wrap.style.color = "#fff";
      wrap.style.boxShadow = "0 8px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)";
      wrap.style.backdropFilter = "saturate(150%) blur(12px)";
      wrap.style.border = "1px solid rgba(255,255,255,0.15)";
      wrap.style.transition = "border-radius 0.3s ease";

      const topWrap = document.createElement("div");
      topWrap.style.display = "flex";
      topWrap.style.alignItems = "center";
      topWrap.style.justifyContent = "space-between";
      topWrap.style.width = "100%";
      topWrap.style.gap = "8px";

      // typography improvements
      const fontStack = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
      banner.style.fontFamily = fontStack;
      banner.style.color = "#fff";
      banner.style.textRendering = "optimizeLegibility";
      banner.style.webkitFontSmoothing = "antialiased";
      banner.style.mozOsxFontSmoothing = "grayscale";
      wrap.style.fontFamily = fontStack;
      wrap.style.fontSize = "14px";
      wrap.style.lineHeight = "1";

      // theme colors (more solid colors for minimalistic thin bar)
      if (advice.className === "risk-high") {
        wrap.style.background = "rgba(220, 38, 38, 0.95)"; // solid red
      } else if (advice.className === "risk-medium") {
        wrap.style.background = "rgba(217, 119, 6, 0.95)"; // solid amber
      } else {
        wrap.style.background = "rgba(5, 150, 105, 0.95)"; // solid green
      }

      // Left: Logo + Headline
      const left = document.createElement("div");
      left.style.display = "flex";
      left.style.alignItems = "center";
      left.style.gap = "12px";
      
      const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
      
      left.innerHTML = `
        <div style="display:flex;align-items:center;opacity:0.9;">${iconSvg}</div>
        <strong style="font-size:15px;font-weight:700;letter-spacing:-0.3px;">PhishFree</strong>
        <span style="background:rgba(0,0,0,0.2);padding:4px 8px;border-radius:6px;font-weight:600;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;">${escapeHtml(advice.headline)}</span>
      `;


      // Center: single primary reason / advice phrase
      const center = document.createElement("div");
      center.style.flex = "1 1 auto";
      center.style.padding = "0 16px";
      
      let primaryReason = bullets[0] || "Analysis complete.";
      // Clean up primary reason if it's too long
      if(primaryReason.length > 55) {
        primaryReason = primaryReason.substring(0, 55) + '...';
      }
      
      center.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
           <span style="opacity:0.95;font-weight:500;letter-spacing:-0.2px;">${escapeHtml(primaryReason)}</span>
        </div>
      `;

      // Right: minimalist actions (Details, Dismiss)
      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.alignItems = "center";
      actions.style.gap = "8px";

      // Details drawer container
      const detailsContainer = document.createElement("div");
      detailsContainer.style.width = "100%";
      detailsContainer.style.maxHeight = "0px";
      detailsContainer.style.overflow = "hidden";
      detailsContainer.style.transition = "max-height 0.3s ease, margin-top 0.3s ease, opacity 0.3s ease";
      detailsContainer.style.opacity = "0";
      
      const detailsContent = document.createElement("div");
      detailsContent.style.paddingTop = "12px";
      detailsContent.style.borderTop = "1px solid rgba(255,255,255,0.15)";
      detailsContent.style.marginTop = "12px";
      detailsContent.style.fontSize = "13px";
      detailsContent.style.lineHeight = "1.5";
      detailsContent.style.paddingBottom = "4px";
      
      // Cool Data Grid for Layman
      const dataGrid = document.createElement("div");
      dataGrid.style.display = "grid";
      dataGrid.style.gridTemplateColumns = "repeat(3, 1fr)";
      dataGrid.style.gap = "8px";
      dataGrid.style.marginBottom = "14px";
      dataGrid.style.background = "rgba(0,0,0,0.15)";
      dataGrid.style.padding = "10px";
      dataGrid.style.borderRadius = "8px";
      dataGrid.style.textAlign = "center";
      
      const makeCol = (label, val) => `
        <div style="display:flex; flex-direction:column; gap:2px;">
           <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;opacity:0.7;">${label}</span>
           <span style="font-size:14px;font-weight:600;opacity:1;">${val}</span>
        </div>
      `;
      dataGrid.innerHTML = makeCol("Age", parsedAgeText) + makeCol("IP Address", ipValue) + makeCol("Origin", locationValue);
      detailsContent.appendChild(dataGrid);
      
      const list = document.createElement("ul");
      list.style.margin = "0";
      list.style.paddingLeft = "24px";
      bullets.forEach(b => {
        const li = document.createElement("li");
        li.textContent = b;
        li.style.margin = "6px 0";
        list.appendChild(li);
      });
      
      const what = document.createElement("div");
      what.style.marginTop = "12px";
      what.innerHTML = `<strong style="opacity:1;">Recommendation:</strong> <span style="opacity:0.9;">${advice.headline === "High Risk" ? 'Do not enter passwords or payment info. Close the tab if unsure.' : (advice.headline === "Medium Risk" ? 'Check the URL carefully, do not provide sensitive information.' : 'Proceed with normal caution.')}</span>`;
      
      detailsContent.appendChild(list);
      detailsContent.appendChild(what);
      detailsContainer.appendChild(detailsContent);

      // Details button
      const detailsBtn = document.createElement("button");
      detailsBtn.textContent = "Details";
      detailsBtn.style.padding = "6px 14px";
      detailsBtn.style.borderRadius = "20px";
      detailsBtn.style.border = "none";
      detailsBtn.style.cursor = "pointer";
      detailsBtn.style.background = "rgba(0,0,0,0.2)";
      detailsBtn.style.color = "#fff";
      detailsBtn.style.fontWeight = "600";
      detailsBtn.style.fontSize = "12px";
      detailsBtn.style.transition = "background 0.2s";
      detailsBtn.onmouseover = () => detailsBtn.style.background = "rgba(0,0,0,0.3)";
      detailsBtn.onmouseleave = () => detailsBtn.style.background = "rgba(0,0,0,0.2)";
      detailsBtn.addEventListener("click", () => {
        const isOpen = detailsContainer.style.maxHeight !== "0px" && detailsContainer.style.maxHeight !== "";
        if (isOpen) {
          detailsContainer.style.maxHeight = "0px";
          detailsContainer.style.opacity = "0";
          wrap.style.borderRadius = "30px";
          detailsBtn.textContent = "Details";
        } else {
           // Provide enough height
          detailsContainer.style.maxHeight = "300px";
          detailsContainer.style.opacity = "1";
          wrap.style.borderRadius = "16px";
          detailsBtn.textContent = "Hide";
        }
      });

      

      const reportBtn = document.createElement("button");
      reportBtn.className = "phishfree-btn outline";
      reportBtn.textContent = "Report Safe";
      reportBtn.style.padding = "8px 12px";
      reportBtn.style.borderRadius = "8px";
      reportBtn.style.cursor = "pointer";
      reportBtn.style.background = "transparent";
      reportBtn.style.color = "#fff";
      reportBtn.style.border = "1px solid rgba(255,255,255,0.18)";
      reportBtn.style.fontWeight = "700";
      reportBtn.addEventListener("click", () => {
        try {
          reportBtn.disabled = true;
          reportBtn.textContent = "Reporting.";
          const payload = {
            url: window.location.href,
            hostname: window.location.hostname,
            timestamp: new Date().toISOString(),
            note: "reported_safe_by_user",
            analysis: result
          };
          chrome.runtime.sendMessage({ action: "report_false_positive", payload }, (resp) => {
            if (resp && resp.ok) {
              reportBtn.textContent = "Reported ✓";
              // Store in session storage that this site was reported safe
              try {
                sessionStorage.setItem("phishfree.reported_safe:" + window.location.hostname, "1");
              } catch (e) { /* ignore */ }
              setTimeout(() => { reportBtn.textContent = "Report Safe"; }, 2500);
            } else {
              reportBtn.textContent = "Report Failed";
              setTimeout(() => { reportBtn.textContent = "Report Safe"; }, 2500);
            }
            reportBtn.disabled = false;
          });
        } catch (e) {
          console.error("report error", e);
          reportBtn.textContent = "Report failed";
          setTimeout(() => { reportBtn.textContent = "Report Safe"; }, 2500);
          reportBtn.disabled = false;
        }
      });

      // Dismiss (X) button
      const dismissBtn = document.createElement("button");
      dismissBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
      dismissBtn.style.padding = "6px";
      dismissBtn.style.borderRadius = "50%";
      dismissBtn.style.cursor = "pointer";
      dismissBtn.style.background = "transparent";
      dismissBtn.style.color = "#fff";
      dismissBtn.style.border = "none";
      dismissBtn.style.display = "flex";
      dismissBtn.style.alignItems = "center";
      dismissBtn.style.justifyContent = "center";
      dismissBtn.style.opacity = "0.7";
      dismissBtn.style.transition = "opacity 0.2s, background 0.2s";
      dismissBtn.onmouseover = () => { dismissBtn.style.opacity = "1"; dismissBtn.style.background = "rgba(255,255,255,0.1)"; };
      dismissBtn.onmouseleave = () => { dismissBtn.style.opacity = "0.7"; dismissBtn.style.background = "transparent"; };
      dismissBtn.setAttribute("aria-label", "Dismiss");
      dismissBtn.addEventListener("click", () => {
        setSessionDismissed(window.location.hostname);
        removeBanner();
      });

      // Append actions
      actions.appendChild(detailsBtn);
      actions.appendChild(dismissBtn);

      topWrap.appendChild(left);
      topWrap.appendChild(center);
      topWrap.appendChild(actions);

      wrap.appendChild(topWrap);
      wrap.appendChild(detailsContainer);

      banner.appendChild(wrap);

      // Insert at top of documentElement (fixed overlay), avoids layout shifts
      document.documentElement.prepend(banner);

      // trigger pop-up slide-in
      window.requestAnimationFrame(() => {
        banner.style.transform = "translate(-50%, 0) scale(1)";
        banner.style.opacity = "1";
      });

      // Auto-hide behavior (clear any old timer)
      if (_phishfree_banner_timer) {
        clearTimeout(_phishfree_banner_timer);
        _phishfree_banner_timer = null;
      }
      if (BANNER_AUTO_HIDE_MS > 0) {
        _phishfree_banner_timer = setTimeout(() => {
          removeBanner();
        }, BANNER_AUTO_HIDE_MS);
      }

      // Pause auto-hide on hover or focus within banner
      banner.addEventListener("mouseenter", () => {
        if (_phishfree_banner_timer) {
          clearTimeout(_phishfree_banner_timer);
          _phishfree_banner_timer = null;
        }
      });
      banner.addEventListener("mouseleave", () => {
        if (BANNER_AUTO_HIDE_MS > 0 && !_phishfree_banner_timer) {
          _phishfree_banner_timer = setTimeout(() => removeBanner(), BANNER_AUTO_HIDE_MS);
        }
      });

      // diagnostics marker
      try { sessionStorage.setItem("phishfree.lastShown", window.location.href); } catch (e) { /* ignore */ }

    } catch (err) {
      console.error("injectBanner error", err);
    }
  }

  function removeBanner() {
    try {
      const existing = document.getElementById("phishfree-banner");
      if (existing) {
        // animate out smoothly then remove
        existing.style.transform = "translateY(-120%)";
        if (_phishfree_banner_timer) {
          clearTimeout(_phishfree_banner_timer);
          _phishfree_banner_timer = null;
        }
        // remove after animation time (match transition 330ms)
        setTimeout(() => {
          try { existing.remove(); } catch (e) {}
        }, 360);
      }
      if (window._phishfree_banner_injected) delete window._phishfree_banner_injected;
    } catch (e) {
      console.error("[content] removeBanner failed:", e);
    }
  }

  // ---------------------------
  // Auto-run only if user enabled preference (defaults to ON if not set)
  // ---------------------------
  (async function autoRunIfEnabled() {
    try {
      chrome.storage.local.get(["phishfree_auto_analyze"], (items) => {
        const prefVal = items && Object.prototype.hasOwnProperty.call(items, "phishfree_auto_analyze")
                         ? !!items.phishfree_auto_analyze
                         : true;
        const enabled = prefVal;
        console.debug("[content] auto-analyze preference:", enabled);

        if (enabled) {
  let lastPath = location.pathname + location.search;
  if (!sessionDismissed(window.location.hostname)) sendForAnalysis("auto", { run_models: ["text","cnn","gnn"] });

  window.addEventListener("popstate", () => {
    const newPath = location.pathname + location.search;
    if (newPath !== lastPath) {
      lastPath = newPath;
      if (!sessionDismissed(window.location.hostname)) sendForAnalysis("auto", { run_models: ["text","cnn","gnn"] });
    }
  });

  const _push = history.pushState;
  history.pushState = function () {
    _push.apply(this, arguments);
    const np = location.pathname + location.search;
    if (np !== lastPath) {
      lastPath = np;
      if (!sessionDismissed(window.location.hostname)) sendForAnalysis("auto", { run_models: ["text","cnn","gnn"] });
    }
  };
        }
 else {
          console.debug("content_script: auto-analyze disabled by user preference.");
        }
      });
    } catch (e) {
      console.error("content_script: auto-run check error", e);
    }
  })();

})();
