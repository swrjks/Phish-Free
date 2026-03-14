import { Shield } from "lucide-react";

const Footer = () => (
  <footer className="py-16">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-foreground" />
        <span className="font-heading text-sm font-semibold text-foreground">PhishFree</span>
      </div>
      <p className="text-xs text-muted-foreground">© 2026 PhishFree. AI-powered phishing detection.</p>
    </div>
  </footer>
);

export default Footer;
