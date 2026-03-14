import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, X, CheckCircle } from "lucide-react";

const alerts = [
  { id: 1, domain: "google-search.com", risk: "NORMAL", rec: "Safe to browse.", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: 2, domain: "amazon-security-check.co", risk: "MEDIUM", rec: "Verify URL before proceeding.", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: 3, domain: "paypal-login-secure.xyz", risk: "HIGH", rec: "Do not enter credentials.", icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10" },
];

const BrowserExtension = () => (
  <section id="browser" className="py-32">
    <div className="container mx-auto px-6 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-5 mt-16 lg:mt-0">
          Protection in your browser.
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed mb-6">
          Our lightweight extension scans every page you visit in real-time. No configuration needed. See risk levels at a glance.
        </p>
        <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          Install Extension
        </button>
      </motion.div>

      <motion.div
         initial={{ opacity: 0, y: 20 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         className="grid md:grid-cols-3 gap-6"
      >
        {alerts.map((alert, i) => {
          const Icon = alert.icon;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="w-full rounded-lg border border-border bg-card overflow-hidden shadow-xl shadow-foreground/5 flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary">
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-4 w-4 ${alert.color}`} />
                  <span className="font-heading font-semibold text-xs text-foreground">PhishFree Scanner</span>
                </div>
                <X className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="p-4 flex-1 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk Score</span>
                    <span className={`rounded-full text-[10px] font-bold px-2 py-0.5 ${alert.color} ${alert.bg}`}>{alert.risk}</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    Domain analysis for <span className="font-semibold">{alert.domain.split('-')[0]}</span> completed.
                  </p>
                </div>
                <div className="rounded-md bg-secondary p-2.5 border border-border mt-auto">
                  <div className="flex items-start gap-1.5">
                    <Icon className={`h-3.5 w-3.5 mt-[1px] flex-shrink-0 ${alert.color}`} />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      <span className="font-medium text-foreground">Rec:</span> {alert.rec}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  </section>
);

export default BrowserExtension;
