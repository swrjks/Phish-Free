import { motion } from "framer-motion";
import { Brain, Eye, Globe, Layers } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Text Analysis",
    desc: "Detects social engineering language and manipulation patterns in real-time.",
  },
  {
    icon: Eye,
    title: "Visual Page Detection",
    desc: "Identifies cloned login pages by comparing visual layouts against known brands.",
  },
  {
    icon: Globe,
    title: "Domain Intelligence",
    desc: "Analyzes domain age, registration data, and hosting infrastructure.",
  },
  {
    icon: Layers,
    title: "Risk Fusion Engine",
    desc: "Combines all signals into a final phishing risk score with explainable results.",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-32">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">How it works</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Four layers of AI-powered analysis working together to keep you safe.
        </p>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border border-border">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="bg-card p-8 hover:bg-secondary/50 transition-colors group"
          >
            <f.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors mb-5" />
            <h3 className="font-heading font-semibold text-foreground mb-2 text-sm">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
