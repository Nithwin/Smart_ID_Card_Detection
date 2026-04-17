"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Eye,
  Users,
  CheckCircle,
  Activity,
  TrendingUp,
  Brain,
  ShieldAlert,
  Zap
} from "lucide-react";
import { StatCard } from "./components/StatCard";
import { GuardAssistant } from "./components/GuardAssistant";

interface Stats {
  total_frames: number;
  total_detections: number;
  violations: number;
  compliant: number;
  identified: number;
  known_persons: number;
}

interface Alert {
  id: string;
  timestamp: string;
  person_box: number[];
  face_detected: boolean;
  face_image: string | null;
  identified_name: string | null;
  similarity: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total_frames: 0, total_detections: 0, violations: 0, compliant: 0, identified: 0, known_persons: 0 });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const [sRes, aRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/alerts?limit=10"),
        ]);
        if (sRes.ok) { setStats(await sRes.json()); setOnline(true); }
        if (aRes.ok) { setAlerts((await aRes.json()).alerts.reverse()); }
      } catch { setOnline(false); }
    };
    poll();
    const i = setInterval(poll, 3000);
    return () => clearInterval(i);
  }, []);

  const rate = stats.compliant + stats.violations > 0
    ? Math.round((stats.compliant / (stats.compliant + stats.violations)) * 100) : 0;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-end justify-between border-b border-foreground/10 pb-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full glass-panel border-blue-500/20 text-xs text-blue-400">
             <Zap className="w-3.5 h-3.5" />
             <span>CA-YOLOv8 Active</span>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400 mb-2 glow-text">Command Center</h1>
          <p className="text-sm text-muted flex items-center gap-2">
            Real-time compliance intelligence <Activity className="w-4 h-4 text-emerald-400" />
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 px-4 py-2 rounded-xl glass-panel">
          <div className="relative flex h-3 w-3">
            {online && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${online ? "bg-emerald-500" : "bg-red-500"}`}></span>
          </div>
          <span className="text-sm font-medium text-muted">{online ? "System Online & Secure" : "System Offline"}</span>
        </div>
      </motion.div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard delay={0.1} icon={<Eye className="w-5 h-5" />} label="Frames Processed" value={stats.total_frames} gradient="from-blue-600/20 to-blue-400/5" border="border-blue-500/30" text="text-blue-400" />
        <StatCard delay={0.2} icon={<Users className="w-5 h-5" />} label="Total Detections" value={stats.total_detections} gradient="from-purple-600/20 to-purple-400/5" border="border-purple-500/30" text="text-purple-400" />
        <StatCard delay={0.3} icon={<CheckCircle className="w-5 h-5" />} label="Compliant" value={stats.compliant} gradient="from-emerald-600/20 to-emerald-400/5" border="border-emerald-500/30" text="text-emerald-400" />
        <StatCard delay={0.4} icon={<ShieldAlert className="w-5 h-5" />} label="Violations" value={stats.violations} gradient="from-red-600/20 to-rose-400/5" border="border-red-500/30" text="text-red-400" />
        <StatCard delay={0.5} icon={<Brain className="w-5 h-5" />} label="Identified" value={stats.identified} gradient="from-indigo-600/20 to-indigo-400/5" border="border-indigo-500/30" text="text-indigo-400" />
        <StatCard delay={0.6} icon={<Users className="w-5 h-5" />} label="Known Persons" value={stats.known_persons} gradient="from-sky-600/20 to-sky-400/5" border="border-sky-500/30" text="text-sky-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Compliance Meter & Pipeline Info */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-4 flex flex-col gap-8"
        >
          {/* Circular Progress Meter */}
          <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="font-bold text-lg text-foreground">Compliance Rate</h2>
            </div>
            
            <div className="flex items-center justify-center py-6">
              <div className="relative w-48 h-48 drop-shadow-2xl">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(15, 23, 42, 0.4)" strokeWidth="12" />
                  <motion.circle
                    initial={{ strokeDasharray: "0 339" }}
                    animate={{ strokeDasharray: `${rate * 3.39} 339` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="60" cy="60" r="54" fill="none"
                    stroke={rate >= 75 ? "#10b981" : rate >= 50 ? "#f59e0b" : "#f43f5e"}
                    strokeWidth="12" strokeLinecap="round"
                    style={{ filter: "drop-shadow(0px 0px 8px rgba(59,130,246,0.3))" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-400 glow-text">{rate}%</span>
                  <span className="text-xs font-semibold uppercase tracking-widest mt-1 text-muted group-hover:text-blue-400 transition-colors">Target: 95%</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted font-medium">
              <span className="text-emerald-400">{stats.compliant} OK</span> <span className="mx-2 opacity-30">|</span> <span className="text-red-400">{stats.violations} Violations</span>
            </p>
          </div>

          {/* Pipeline Explanation Mini-Cards */}
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
            <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" /> Pipeline Flow
            </h2>
            <div className="space-y-3 relative z-10">
              {[
                { n: "1", t: "CA-YOLOv8", d: "Context-aware card detection", color: "blue" },
                { n: "2", t: "Spatial Logic", d: "Person-Card IOU association", color: "emerald" },
                { n: "3", t: "InsightFace", d: "Violator identity extraction", color: "indigo" },
              ].map((s, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  key={s.n} 
                  className="flex gap-4 items-center p-3 rounded-xl bg-background/50 border border-foreground/5 hover:bg-background/80 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full bg-\${s.color}-500/20 text-\${s.color}-400 font-bold flex items-center justify-center shrink-0`}>
                    {s.n}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.t}</p>
                    <p className="text-[11px] text-muted">{s.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Alerts Live Feed */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-8"
        >
          <div className="glass-panel rounded-3xl p-8 h-full flex flex-col relative overflow-hidden">
            {/* Ambient Red Glow for Alerts Area */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">Live Violation Feed</h2>
                  <p className="text-xs text-muted">Real-time unmasked access attempts</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded bg-background border border-red-500/20 text-red-400 text-xs font-semibold animate-pulse">
                Recording Active
              </div>
            </div>

            {alerts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted space-y-4">
                <CheckCircle className="w-16 h-16 opacity-20 text-emerald-400" />
                <p className="font-medium">All clear. No recent violations detected.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 relative z-10 pb-4">
                {alerts.map((a) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={a.id} 
                    className="group relative flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-b from-background/80 to-background border border-foreground/10 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] transition-all duration-300"
                  >
                    
                    {/* Image Area */}
                    <div className="shrink-0 relative">
                      {a.face_image ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-foreground/10 group-hover:border-red-500/50 transition-colors">
                          <Image src={`data:image/jpeg;base64,${a.face_image}`} alt="Face" width={64} height={64} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-background border border-foreground/10 flex items-center justify-center text-muted">
                           <Eye className="w-6 h-6 opacity-30" />
                        </div>
                      )}
                      {a.face_detected && (
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                          <Brain className="w-3 h-3 text-emerald-400" />
                        </div>
                      )}
                    </div>

                    {/* Alert Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                         <h3 className="text-sm font-bold text-red-500 truncate pr-2">
                           {a.identified_name ? a.identified_name : "UNKNOWN ENTITY"}
                         </h3>
                         <span className="text-[10px] py-0.5 px-2 rounded-full bg-red-500/10 text-red-400 font-mono">ID: {a.id}</span>
                      </div>
                      
                      <div className="space-y-1 mt-2">
                        <p className="text-xs flex items-center justify-between text-foreground/80">
                          <span>Status:</span>
                          <span className="font-semibold px-2 py-0.5 rounded bg-red-500/20 text-red-400">NO ID CARD</span>
                        </p>
                        <p className="text-xs flex items-center justify-between text-muted">
                          <span>Time:</span>
                          <span className="font-mono">{new Date(a.timestamp).toLocaleTimeString()}</span>
                        </p>
                        {a.identified_name && (
                          <div className="w-full bg-background rounded-full h-1.5 mt-2 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${a.similarity * 100}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full" 
                            />
                          </div>
                        )}
                        {a.identified_name && (
                           <p className="text-[10px] text-right mt-0.5 text-indigo-400 font-medium">Confidence: {(a.similarity * 100).toFixed(1)}%</p>
                        )}
                      </div>
                    </div>

                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </div>
      <GuardAssistant />
    </div>
  );
}
