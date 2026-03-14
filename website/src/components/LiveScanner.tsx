import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertTriangle, Zap, ShieldAlert, Loader2 } from "lucide-react";

interface ScanResult {
  url: string;
  score: number;
  features: {
    "Protocol": string;
    "Domain": string;
    "Subdomains": number | string;
    "URL Length": number;
    "IP Address": string;
    "Domain Age": string;
    "Hyphens in Domain": number;
    "Digits in Domain": number;
    "Keywords Detected": number;
    "Query Parameters": number;
  };
}

const DEMO_RESULTS: ScanResult[] = [
  {
    url: "paypal-login-secure.xyz",
    score: 92,
    features: {
      "Protocol": "HTTPS",
      "Domain": "paypal-login-secure.xyz",
      "Subdomains": 2,
      "URL Length": 23,
      "IP Address": "104.21.5.122",
      "Domain Age": "3 days",
      "Hyphens in Domain": 2,
      "Digits in Domain": 0,
      "Keywords Detected": 2,
      "Query Parameters": 0,
    }
  },
  {
    url: "amazon-security-check.co",
    score: 87,
    features: {
      "Protocol": "HTTPS",
      "Domain": "amazon-security-check.co",
      "Subdomains": 1,
      "URL Length": 24,
      "IP Address": "192.168.1.5",
      "Domain Age": "5 days",
      "Hyphens in Domain": 2,
      "Digits in Domain": 0,
      "Keywords Detected": 1,
      "Query Parameters": 0,
    }
  },
];

const LiveScanner = () => {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loadingText, setLoadingText] = useState("Initializing url_analyzer.py...");

  const handleScan = async (demoUrl?: string) => {
    const target = demoUrl || url;
    if (!target) return;

    setResult(null);
    setScanning(true);
    setLoadingText("Initializing url_analyzer.py...");

    setTimeout(() => {
      setLoadingText("Extracting domain features...");
    }, 800);

    setTimeout(() => {
      setLoadingText("Computing heuristic risk score...");
    }, 1800);

    try {
      const response = await fetch("http://127.0.0.1:8000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target })
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      setResult(data);
    } catch (e) {
      console.error("Backend unavailable.", e);
      setResult({
        url: target,
        score: 0,
        features: {
          "Protocol": "Unknown",
          "Domain": target,
          "Subdomains": 0,
          "URL Length": target.length,
          "IP Address": "Unknown",
          "Domain Age": "Unknown",
          "Hyphens in Domain": 0,
          "Digits in Domain": 0,
          "Keywords Detected": 0,
          "Query Parameters": 0,
        }
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <section id="scanner" className="py-16 md:py-24 lg:py-32 relative min-h-screen flex flex-col justify-center">
      <div className="container mx-auto px-4 sm:px-6 max-w-8xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 mt-16"
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">
            Try it now
          </h2>
          <p className="text-muted-foreground">Paste a suspicious URL to analyze it with our AI engine.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste suspicious URL…"
                className="w-full rounded-lg border border-border bg-background pl-11 pr-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-shadow"
              />
            </div>
            <button
              onClick={() => handleScan()}
              disabled={scanning}
              className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {scanning ? "Scanning…" : "Scan Now"}
            </button>
          </div>
          <button
            onClick={() => {
              setUrl("paypal-login-secure.xyz");
              handleScan("paypal-login-secure.xyz");
            }}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Zap className="h-3 w-3" /> Try Live Demo
          </button>
        </motion.div>

        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-3 rounded-lg border border-border px-5 py-3 bg-card shadow-sm">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                <span className="text-sm font-medium text-foreground">{loadingText}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && !scanning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 rounded-lg border border-border bg-card p-6 w-full max-w-[1400px] mx-auto"
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                <span className="font-heading font-semibold text-lg text-foreground">Phishing Risk Detected</span>
              </div>
              <p className="font-mono text-sm text-muted-foreground mb-6 bg-secondary/50 p-3 rounded-md border border-border/50 truncate">
                {result.url}
              </p>

              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Risk Score</span>
                <span className="font-heading font-bold text-5xl text-destructive">{result.score}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden mb-8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.score}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-destructive shadow-[0_0_10px_var(--destructive)]"
                />
              </div>

              {/* 2-Column Features Set */}
              {result.features && (
                <div className="bg-secondary/10 rounded-xl border border-border/50 p-6 h-fit mb-8">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-0 md:divide-x md:divide-border/50">
                    <div className="flex-1 space-y-4 md:pr-4">
                      {Object.entries(result.features).slice(0, Math.ceil(Object.entries(result.features).length / 3)).map(([key, value], i) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.05 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex-shrink-0">{key}:</span>
                          <span className="text-sm font-mono text-foreground font-medium truncate">{value}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex-1 space-y-4 md:px-4">
                      {Object.entries(result.features).slice(Math.ceil(Object.entries(result.features).length / 3), Math.ceil(Object.entries(result.features).length / 3) * 2).map(([key, value], i) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + (Math.ceil(Object.entries(result.features).length / 3) + i) * 0.05 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex-shrink-0">{key}:</span>
                          <span className="text-sm font-mono text-foreground font-medium truncate">{value}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex-1 space-y-4 md:pl-4">
                      {Object.entries(result.features).slice(Math.ceil(Object.entries(result.features).length / 3) * 2).map(([key, value], i) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + (Math.ceil(Object.entries(result.features).length / 3) * 2 + i) * 0.05 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex-shrink-0">{key}:</span>
                          <span className="text-sm font-mono text-foreground font-medium truncate">{value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default LiveScanner;
