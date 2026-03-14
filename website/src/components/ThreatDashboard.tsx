import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Shield, Target, Globe, AlertTriangle, CheckCircle } from "lucide-react";

const threats = [
  { url: "paypal-login-secure.xyz", score: 94 },
  { url: "amazon-security-check.co", score: 87 },
  { url: "apple-id-verify.info", score: 92 },
  { url: "google-search.com", score: 10 },
  { url: "facebook-login-verify.net", score: 88 },
  { url: "github.com", score: 5 },
  { url: "local-bank.com", score: 45 },
];

const chartData = [
  { name: 'Mon', threats: 120 },
  { name: 'Tue', threats: 150 },
  { name: 'Wed', threats: 180 },
  { name: 'Thu', threats: 240 },
  { name: 'Fri', threats: 210 },
  { name: 'Sat', threats: 170 },
  { name: 'Sun', threats: 290 },
];

const dashboardData = [
  { sl: 1, domain: "paypal-login-secure.xyz", age: "2 Days", risk: "CRITICAL", icon: Shield, color: "text-destructive" },
  { sl: 2, domain: "amazon-security-check.co", age: "5 Days", risk: "HIGH", icon: Target, color: "text-orange-500" },
  { sl: 3, domain: "netflix-billing-alert.net", age: "1 Day", risk: "CRITICAL", icon: Target, color: "text-destructive" },
  { sl: 4, domain: "apple-id-verify.info", age: "12 hours", risk: "CRITICAL", icon: Target, color: "text-destructive" },
  { sl: 5, domain: "local-bank.com", age: "3 Years", risk: "MODERATE", icon: AlertTriangle, color: "text-yellow-500" },
  { sl: 6, domain: "google-search.com", age: "20 Years", risk: "SAFE", icon: CheckCircle, color: "text-emerald-500" },
  { sl: 7, domain: "github.com", age: "15 Years", risk: "SAFE", icon: CheckCircle, color: "text-emerald-500" },
];

const ThreatDashboard = () => (
  <section id="threats" className="py-32">
    <div className="container mx-auto px-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">
          Threat intelligence
        </h2>
        <p className="text-muted-foreground">Recent phishing threats detected by PhishFree AI.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Recent Threats List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-lg border border-border overflow-hidden bg-card shadow-sm lg:h-[420px] flex flex-col"
        >
          <div className="px-5 py-4 border-b border-border bg-secondary flex items-center gap-2 shrink-0">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">Recent Threats</span>
          </div>
          <div className="divide-y divide-border flex-1 overflow-y-auto">
            {threats.map((t, i) => {
              let scoreColor = "text-destructive";
              if (t.score < 30) scoreColor = "text-emerald-500";
              else if (t.score < 70) scoreColor = "text-yellow-500";
              else if (t.score < 90) scoreColor = "text-orange-500";

              return (
                <motion.div
                  key={t.url}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
                >
                  <span className="font-mono text-xs text-foreground truncate max-w-[150px] sm:max-w-[200px]">{t.url}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:block">Risk</span>
                    <span className={`font-mono font-semibold text-xs ${scoreColor}`}>{t.score}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Side: Combined Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-lg border border-border bg-card shadow-sm lg:h-[420px] flex flex-col overflow-hidden"
        >
          {/* Top Half: Chart */}
          <div className="p-5 border-b border-border shrink-0 bg-secondary/10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-semibold text-sm">Threat Volume</h3>
                <p className="text-[10px] text-muted-foreground">Phishing attempts blocked in the last 7 days</p>
              </div>
              <div className="rounded-full bg-secondary px-3 py-1 flex items-center gap-2 border border-border">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Live</span>
              </div>
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" width={30} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '10px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="threats" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--destructive))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Half: Table */}
          <div className="flex flex-col flex-1 min-h-0 relative">
            <div className="px-5 py-3 border-b border-border bg-secondary flex items-center gap-2 shrink-0 z-20">
              <Globe className="h-3.5 w-3.5 text-foreground" />
              <h3 className="font-heading font-semibold text-xs">Domain Intelligence</h3>
            </div>
            
            {/* Table Header (Fixed) */}
            <div className="z-10 bg-card border-b border-border">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-secondary/30 text-[10px] text-muted-foreground uppercase tracking-wider block">
                  <tr className="flex w-full">
                    <th className="px-5 py-2 font-medium w-[15%]">Sl No.</th>
                    <th className="px-5 py-2 font-medium w-[15%]">Image</th>
                    <th className="px-5 py-2 font-medium w-[35%]">Domain Name</th>
                    <th className="px-5 py-2 font-medium w-[20%]">Domain Age</th>
                    <th className="px-5 py-2 font-medium w-[15%]">Severity</th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Table Body (Auto-scrolling) */}
            <div className="flex-1 overflow-hidden relative group">
              {/* Fade out top/bottom for smoother visual loop effect */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />

              <motion.div
                animate={{
                  y: ["0%", "-50%"],
                }}
                transition={{
                  repeat: Infinity,
                  ease: "linear",
                  duration: 10,
                }}
                className="absolute w-full mt-2"
              >
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <tbody className="divide-y divide-border">
                    {/* Render list twice to create continuous scroll illusion */}
                    {[...dashboardData, ...dashboardData].map((data, idx) => {
                      const Icon = data.icon;

                      let badgeColor = "bg-destructive/10 text-destructive";
                      if (data.risk === 'SAFE') badgeColor = "bg-emerald-500/10 text-emerald-500";
                      else if (data.risk === 'MODERATE') badgeColor = "bg-yellow-500/10 text-yellow-500";
                      else if (data.risk === 'HIGH') badgeColor = "bg-orange-500/10 text-orange-500";

                      return (
                        <tr 
                          key={`${data.sl}-${idx}`}
                          className="hover:bg-secondary/40 transition-colors flex w-full"
                        >
                          <td className="px-5 py-3 font-mono text-xs text-muted-foreground w-[15%] flex items-center">{String(data.sl).padStart(2, '0')}</td>
                          <td className="px-5 py-3 w-[15%] flex items-center">
                            <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center border border-border">
                              <Icon className={`h-3 w-3 ${data.color}`} />
                            </div>
                          </td>
                          <td className="px-5 py-3 font-mono text-foreground text-xs w-[35%] flex items-center truncate">{data.domain}</td>
                          <td className="px-5 py-3 text-xs w-[20%] flex items-center">{data.age}</td>
                          <td className="px-5 py-3 w-[15%] flex items-center">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${badgeColor}`}>
                              {data.risk}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ThreatDashboard;
