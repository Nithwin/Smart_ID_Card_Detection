"use client";

import { motion } from "framer-motion";

export function StatCard({ 
  icon, 
  label, 
  value, 
  gradient, 
  border, 
  text, 
  delay = 0 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  gradient: string; 
  border: string; 
  text: string;
  delay?: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`app-card p-5 border ${border} hover:-translate-y-0.5 transition cursor-default relative overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30`} />
      <div className="relative z-10">
        <div className={`flex items-center gap-2 mb-3 opacity-80 ${text}`}>
          <div className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-900/40 border border-white/50 dark:border-slate-700">
            {icon}
          </div>
          <span className="text-xs font-semibold tracking-wide uppercase">{label}</span>
        </div>
        <p className={`text-3xl font-black ${text}`}>{value.toLocaleString()}</p>
      </div>
    </motion.div>
  );
}
