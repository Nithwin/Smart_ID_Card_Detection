"use client";

import { motion } from "framer-motion";

interface Props {
  hasCard: boolean;
  className?: string;
}

/**
 * Shared person silhouette SVG with optional ID card.
 * Reusable across all stages that need to show the input person.
 */
export function PersonInput({ hasCard, className = "" }: Props) {
  return (
    <div className={`relative rounded-xl border-2 border-cyan-500/40 bg-slate-800 overflow-hidden ${className}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />

      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-15">
        {[...Array(8)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`} stroke="#22d3ee" strokeWidth="0.5" />
        ))}
        {[...Array(8)].map((_, i) => (
          <line key={`v${i}`} x1={`${(i + 1) * 12.5}%`} y1="0" x2={`${(i + 1) * 12.5}%`} y2="100%" stroke="#22d3ee" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Person body */}
      <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2">
        {/* Head */}
        <div className="w-[18%] aspect-square rounded-full bg-slate-500 mx-auto" style={{ width: "28%" }} />
        {/* Torso */}
        <div className="bg-slate-500 mx-auto mt-[2%] rounded-t-lg" style={{ width: "42%", paddingBottom: "60%" }} />
      </div>

      {/* ID card or missing indicator */}
      {hasCard ? (
        <div className="absolute bottom-[28%] left-[54%] bg-amber-500/60 border border-amber-400 rounded-sm" style={{ width: "14%", height: "16%" }}>
          <div className="absolute inset-[15%] border border-amber-300/40 rounded-sm" />
        </div>
      ) : (
        <motion.div
          className="absolute bottom-[35%] left-1/2 -translate-x-1/2 text-[7px] font-bold text-red-400 bg-red-900/60 px-1 rounded whitespace-nowrap"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, type: "tween" }}
        >
          No Card
        </motion.div>
      )}

      <span className="absolute top-1 left-1 text-[8px] font-mono text-cyan-300 bg-black/50 px-1 rounded">640×640</span>
    </div>
  );
}
