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
    <div className="page-shell space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full soft-card text-xs text-blue-700 dark:text-blue-200">
            <Zap className="w-3.5 h-3.5" />
            <span>CA-YOLOv8 Active</span>
          </div>
          <h1 className="section-title">Command Center</h1>
          <p className="muted-text text-sm mt-1 flex items-center gap-2">Real-time compliance intelligence <Activity className="w-4 h-4" /></p>
        </div>
        <div className="app-card px-4 py-2 flex items-center gap-2 text-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${online ? "bg-emerald-500" : "bg-red-500"}`} />
          <span className="muted-text">{online ? "System online" : "System offline"}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard delay={0.1} icon={<Eye className="w-5 h-5" />} label="Frames Processed" value={stats.total_frames} gradient="from-blue-600/20 to-blue-400/5" border="border-blue-500/30" text="text-blue-600 dark:text-blue-300" />
        <StatCard delay={0.2} icon={<Users className="w-5 h-5" />} label="Total Detections" value={stats.total_detections} gradient="from-purple-600/20 to-purple-400/5" border="border-purple-500/30" text="text-purple-600 dark:text-purple-300" />
        <StatCard delay={0.3} icon={<CheckCircle className="w-5 h-5" />} label="Compliant" value={stats.compliant} gradient="from-emerald-600/20 to-emerald-400/5" border="border-emerald-500/30" text="text-emerald-600 dark:text-emerald-300" />
        <StatCard delay={0.4} icon={<ShieldAlert className="w-5 h-5" />} label="Violations" value={stats.violations} gradient="from-red-600/20 to-rose-400/5" border="border-red-500/30" text="text-red-600 dark:text-red-300" />
        <StatCard delay={0.5} icon={<Brain className="w-5 h-5" />} label="Identified" value={stats.identified} gradient="from-indigo-600/20 to-indigo-400/5" border="border-indigo-500/30" text="text-indigo-600 dark:text-indigo-300" />
        <StatCard delay={0.6} icon={<Users className="w-5 h-5" />} label="Known Persons" value={stats.known_persons} gradient="from-sky-600/20 to-sky-400/5" border="border-sky-500/30" text="text-sky-600 dark:text-sky-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="lg:col-span-4 space-y-6">
          <div className="app-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold">Compliance Rate</h2>
            </div>
            <div className="relative mx-auto w-40 h-40">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(100,116,139,0.2)" strokeWidth="12" />
                <motion.circle
                  initial={{ strokeDasharray: "0 339" }}
                  animate={{ strokeDasharray: `${rate * 3.39} 339` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  cx="60" cy="60" r="54" fill="none"
                  stroke={rate >= 75 ? "#10b981" : rate >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="12" strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{rate}%</span>
                <span className="text-xs muted-text">Target: 95%</span>
              </div>
            </div>
          </div>

          <div className="app-card p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-500" /> Pipeline Flow</h2>
            <div className="space-y-2">
              {[
                { n: "1", t: "CA-YOLOv8", d: "Context-aware card detection" },
                { n: "2", t: "Spatial Logic", d: "Person-card association checks" },
                { n: "3", t: "InsightFace", d: "Violator identity matching" },
              ].map((s) => (
                <div key={s.n} className="soft-card p-3 flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{s.n}</span>
                  <div>
                    <p className="text-sm font-semibold">{s.t}</p>
                    <p className="text-xs muted-text">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="lg:col-span-8">
          <div className="app-card p-6 h-full">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className="font-semibold text-lg flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-500" /> Live Violation Feed</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Recording Active</span>
            </div>
            {alerts.length === 0 ? (
              <div className="py-20 text-center muted-text">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                All clear. No recent violations.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[640px] overflow-y-auto pr-1">
                {alerts.map((a) => (
                  <motion.div layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} key={a.id} className="soft-card p-3 flex gap-3">
                    <div className="shrink-0">
                      {a.face_image ? (
                        <Image src={`data:image/jpeg;base64,${a.face_image}`} alt="Face" width={64} height={64} className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                          <Eye className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-red-600 truncate">{a.identified_name || "Unknown entity"}</p>
                      <p className="text-xs muted-text mt-1">No ID card detected</p>
                      <p className="text-xs muted-text mt-1">{new Date(a.timestamp).toLocaleTimeString()} · ID: {a.id}</p>
                      {a.identified_name ? (
                        <p className="text-xs text-blue-600 mt-1">Confidence: {(a.similarity * 100).toFixed(1)}%</p>
                      ) : null}
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
