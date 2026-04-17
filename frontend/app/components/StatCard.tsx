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
      className={`glass-panel rounded-2xl p-5 border ${border} hover:scale-105 transition-transform duration-300 cursor-default relative overflow-hidden group`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="relative z-10">
        <div className={`flex items-center gap-2 mb-3 opacity-80 ${text}`}>
          <div className="p-1.5 rounded-lg bg-white/5 backdrop-blur-md">
            {icon}
          </div>
          <span className="text-xs font-semibold tracking-wide uppercase">{label}</span>
        </div>
        <p className={`text-3xl font-black ${text} glow-text drop-shadow-sm`}>{value.toLocaleString()}</p>
      </div>
    </motion.div>
  );
}
