import { useState, useEffect } from "react";
import { Moon, Sun, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const scrollableDiv = document.getElementById("main-scroll-container");
    const target = scrollableDiv || window;
    
    const onScroll = () => {
      const scrollPos = scrollableDiv ? (scrollableDiv as HTMLElement).scrollTop : window.scrollY;
      setScrolled(scrollPos > 10);
    };
    
    target.addEventListener("scroll", onScroll);
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    
    e.preventDefault();
    const element = document.getElementById(href.substring(1));
    if (element) {
      // Small delay to ensure any layout shifts are complete
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-200"
    >
      <div className="relative mt-4 max-w-5xl w-full mx-6 rounded-full p-[1px] overflow-hidden nav-glow-wrapper">
        {/* Rotating border glow – two opposite orbits */}
        <div className="nav-glow-orbit nav-glow-orbit--cw" />
        <div className="nav-glow-orbit nav-glow-orbit--ccw" />

        <div
          className={`relative z-10 flex items-center justify-between px-6 h-14 w-full rounded-full border border-border/50 backdrop-blur-lg transition-colors ${scrolled
            ? "bg-secondary/90"
            : "bg-secondary/70"
            }`}
        >

          <div className="flex items-center gap-2 relative z-10">
            <Shield className="h-5 w-5 text-foreground" />
            <span className="font-heading text-sm font-bold text-foreground">PhishFree</span>
          </div>
          <div className="hidden md:flex items-center gap-6 relative z-10">
            <a href="#scanner" onClick={handleScroll} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Scanner</a>
            <a href="#how-it-works" onClick={handleScroll} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">How it Works</a>
            <a href="#threats" onClick={handleScroll} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Threats</a>
            <a href="#vision" onClick={handleScroll} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Vision</a>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => setDark(!dark)}
              className="rounded-full p-2 hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4 text-foreground" /> : <Moon className="h-4 w-4 text-foreground" />}
            </button>
            <a href="#scanner" onClick={handleScroll} className="hidden sm:inline-flex cursor-pointer rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
