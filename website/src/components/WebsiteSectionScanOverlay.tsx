import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type SectionDef = { id: string; label: string };
type Target = { el: Element; lastHitMs: number };

const TARGET_SELECTOR = [
  "img",
  "svg",
  "button",
  "a",
  "input",
  "textarea",
  "select",
  "h1",
  "h2",
  "h3",
  "[role='button']",
  "[class*='card']",
  "[class*='rounded']",
  "[class*='border']",
].join(",");

function pickTargetsInSection(sectionEl: Element): Target[] {
  const els = Array.from(sectionEl.querySelectorAll(TARGET_SELECTOR));

  const scored = els
    .map((el) => {
      const rect = el.getBoundingClientRect();
      const area = Math.max(0, rect.width) * Math.max(0, rect.height);
      const style = window.getComputedStyle(el);
      const hidden =
        style.display === "none" ||
        style.visibility === "hidden" ||
        Number(style.opacity) === 0;

      const important =
        el.tagName === "BUTTON" || el.tagName === "INPUT" || el.tagName === "A" || el.tagName === "H1";

      // Prefer things that look like UI elements.
      const weight = important ? 2 : 1;
      return { el, score: hidden ? 0 : area * weight };
    })
    .filter((x) => x.score > 1500)
    .sort((a, b) => b.score - a.score)
    .slice(0, 70)
    .map((x) => ({ el: x.el, lastHitMs: 0 }));

  return scored;
}

function getActiveSectionIndex(sections: SectionDef[]): number {
  let bestIdx = 0;
  let bestScore = -Infinity;

  for (let i = 0; i < sections.length; i++) {
    const el = document.getElementById(sections[i].id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const visible = Math.max(0, Math.min(window.innerHeight, r.bottom) - Math.max(0, r.top));
    const score = visible - Math.abs(r.top) * 0.15; // prefer the one closest to top
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }

  return bestIdx;
}

export default function WebsiteSectionScanOverlay() {
  const sections = useMemo<SectionDef[]>(
    () => [
      { id: "hero", label: "Initial Section (Hero)" },
      { id: "scanner", label: "Try It Now" },
      { id: "how-it-works", label: "How It Works" },
      { id: "browser", label: "Protection in Your Browser" },
      { id: "threats", label: "Threat Intelligence" },
      { id: "global-map", label: "Global Threat Map" },
      { id: "vision", label: "Future Vision" },
    ],
    []
  );

  const [scanKey, setScanKey] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [running, setRunning] = useState(true);

  const rafRef = useRef<number | null>(null);
  const targetsRef = useRef<Target[]>([]);
  const isAutoScrollingRef = useRef(false);
  const lastUserScrollMsRef = useRef(0);
  const scanStartedMsRef = useRef(0);
  const stoppedRef = useRef(false);

  useEffect(() => {
    const stopAll = () => {
      if (stoppedRef.current) return;
      stoppedRef.current = true;
      setRunning(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      targetsRef.current.forEach((t) => t.el.classList.remove("scan-highlight"));
    };

    window.addEventListener("mousemove", stopAll);
    window.addEventListener("keydown", stopAll);
    window.addEventListener("wheel", stopAll);
    window.addEventListener("touchstart", stopAll);

    return () => {
      window.removeEventListener("mousemove", stopAll);
      window.removeEventListener("keydown", stopAll);
      window.removeEventListener("wheel", stopAll);
      window.removeEventListener("touchstart", stopAll);
    };
  }, []);

  const restartScan = (nextIdx: number) => {
    if (stoppedRef.current) return;
    setActiveIdx(nextIdx);
    setRunning(true);
    setScanKey((k) => k + 1);
  };

  useEffect(() => {
    // Initialize to the most visible section on load.
    if (stoppedRef.current) return;
    restartScan(getActiveSectionIndex(sections));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (stoppedRef.current) return;
      if (isAutoScrollingRef.current) return;
      lastUserScrollMsRef.current = performance.now();

      const idx = getActiveSectionIndex(sections);
      if (idx !== activeIdx) {
        restartScan(idx);
      } else {
        // If user scrolls within same section, re-scan after a short idle.
        // (Debounced via timeout below.)
        window.clearTimeout((onScroll as unknown as { _t?: number })._t);
        (onScroll as unknown as { _t?: number })._t = window.setTimeout(() => {
          if (isAutoScrollingRef.current) return;
          const idx2 = getActiveSectionIndex(sections);
          restartScan(idx2);
        }, 180);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeIdx, sections]);

  useEffect(() => {
    if (stoppedRef.current) return;

    // Drive highlights for the current scan run.
    const section = document.getElementById(sections[activeIdx]?.id);
    if (!section) return;

    // Clear any lingering highlights.
    document.querySelectorAll(".scan-highlight").forEach((el) => el.classList.remove("scan-highlight"));

    targetsRef.current = pickTargetsInSection(section);
    scanStartedMsRef.current = performance.now();

    const durationMs = 2600;
    const cooldownMs = 380;
    const thresholdPx = 14;

    const tick = (now: number) => {
      if (stoppedRef.current) return;
      const t = Math.min(1, (now - scanStartedMsRef.current) / durationMs);
      const y = t * window.innerHeight;

      const sectionRect = section.getBoundingClientRect();
      const inViewport =
        sectionRect.bottom > 0 && sectionRect.top < window.innerHeight && sectionRect.height > 0;

      if (inViewport) {
        for (const target of targetsRef.current) {
          if (now - target.lastHitMs < cooldownMs) continue;
          const rect = target.el.getBoundingClientRect();

          // Only highlight elements that are within this section's vertical bounds.
          const withinSection = rect.top < sectionRect.bottom && rect.bottom > sectionRect.top;
          if (!withinSection) continue;

          if (y >= rect.top - thresholdPx && y <= rect.bottom + thresholdPx) {
            target.lastHitMs = now;
            target.el.classList.add("scan-highlight");
            window.setTimeout(() => target.el.classList.remove("scan-highlight"), 820);
          }
        }
      }

      if (t < 1 && !stoppedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Auto-advance to next section unless user recently scrolled manually.
        const nowMs = performance.now();
        const userRecentlyScrolled = nowMs - lastUserScrollMsRef.current < 350;

        if (!userRecentlyScrolled && activeIdx < sections.length - 1) {
          const next = sections[activeIdx + 1];
          const nextEl = next ? document.getElementById(next.id) : null;
          if (nextEl) {
            isAutoScrollingRef.current = true;
            nextEl.scrollIntoView({ behavior: "smooth", block: "start" });
            window.setTimeout(() => {
              isAutoScrollingRef.current = false;
              restartScan(activeIdx + 1);
            }, 750);
            return;
          }
        }

        // If we reached the end, stop the moving line (highlights already fade).
        if (activeIdx >= sections.length - 1) {
          stoppedRef.current = true;
          setRunning(false);
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      targetsRef.current.forEach((t) => t.el.classList.remove("scan-highlight"));
    };
  }, [activeIdx, scanKey, sections]);

  if (!running) return null;

  return (
    <div className="scan-overlay" aria-hidden="true">
      <motion.div
        key={`${scanKey}-${activeIdx}`}
        className="scan-line"
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: "100vh", opacity: 0 }}
        transition={{ duration: 2.4, ease: "easeInOut" }}
      />
      <div className="scan-wash" />
    </div>
  );
}

