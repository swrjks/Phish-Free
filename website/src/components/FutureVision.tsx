import { motion } from "framer-motion";
import { Mail, MessageSquare, Monitor, Building2 } from "lucide-react";

const items = [
  { icon: Mail, title: "Email Protection", desc: "Scan incoming emails for phishing links and social engineering." },
  { icon: MessageSquare, title: "Messaging Apps", desc: "Detect malicious links shared through messaging platforms." },
  { icon: Monitor, title: "Desktop Security", desc: "System-wide protection against phishing across all applications." },
  { icon: Building2, title: "Enterprise APIs", desc: "Integrate PhishFree intelligence into your security stack." },
];

const FutureVision = () => (
  <section id="vision" className="py-32">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">Future vision</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Expanding protection across every digital touchpoint.
        </p>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border border-border">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="bg-card p-8 hover:bg-secondary/50 transition-colors group"
          >
            <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors mb-5" />
            <h3 className="font-heading font-semibold text-foreground mb-2 text-sm">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FutureVision;
