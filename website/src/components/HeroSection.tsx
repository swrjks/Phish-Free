import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex flex-col items-center justify-center pt-16 overflow-hidden"
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      
      {/* Gradient glow at top */}
      <div className="absolute top-0 left-0 right-0 h-[400px] hero-glow" />

      <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
        {/* Small badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground mb-8"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Now protecting 10,000+ users
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] text-foreground mb-6"
        >
          Detect phishing
          <br />
          before you click.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
        >
          PhishFree uses AI to analyze webpage text, visual layout, and domain intelligence in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#scanner"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Scan a URL <ArrowRight className="h-4 w-4" />
          </a>
          <button className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            <Download className="h-4 w-4" /> Download Extension
          </button>
        </motion.div>
      </div>

      {/* Gradient line separator like Vercel */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="hero-gradient-line" />
      </div>
    </section>
  );
};

export default HeroSection;
