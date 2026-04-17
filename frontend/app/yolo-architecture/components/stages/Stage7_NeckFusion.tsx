"use client";

import { motion } from "framer-motion";

export function Stage7_NeckFusion() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
          Stage 7: Neck — PANet Feature Fusion
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          The Path Aggregation Network merges high-resolution spatial details (P3) with deep semantic understanding (P5). Features flow both top-down and bottom-up, creating rich multi-scale representations.
        </p>
      </div>

      <div className="relative w-full max-w-lg h-72 bg-slate-900/50 rounded-2xl border border-emerald-500/20 overflow-hidden p-6">
        {/* Left: Backbone pyramid */}
        <div className="absolute left-6 top-6 bottom-6 flex flex-col justify-between">
          {[
            { label: "P3", size: "w-16 h-10", detail: "80&times;80", color: "blue" },
            { label: "P4", size: "w-14 h-10", detail: "40&times;40", color: "indigo" },
            { label: "P5", size: "w-12 h-10", detail: "20&times;20", color: "purple" },
          ].map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.3 }}
              className={`${p.size} bg-${p.color}-500/20 border border-${p.color}-400 rounded flex flex-col items-center justify-center`}
            >
              <span className={`text-xs font-mono font-bold text-${p.color}-300`}>{p.label}</span>
              <span className="text-[8px] text-slate-400" dangerouslySetInnerHTML={{ __html: p.detail }} />
            </motion.div>
          ))}
        </div>

        {/* Center: Animated flow paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
          {/* Top-down: P5 → P4 (upsample) */}
          <motion.path
            d="M 100,200 C 180,200 180,130 260,130"
            fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="8 4"
            animate={{ strokeDashoffset: [24, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {/* P4 → P3 (upsample) */}
          <motion.path
            d="M 260,130 C 320,130 320,55 380,55"
            fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="8 4"
            animate={{ strokeDashoffset: [24, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {/* Bottom-up: P3 → P4 (downsample) */}
          <motion.path
            d="M 380,55 C 410,55 410,130 440,130"
            fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeDasharray="8 4"
            animate={{ strokeDashoffset: [-24, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {/* P4 → P5 (downsample) */}
          <motion.path
            d="M 440,130 C 460,130 460,200 480,200"
            fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeDasharray="8 4"
            animate={{ strokeDashoffset: [-24, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* Merge nodes */}
        {[
          { x: 245, y: 118, delay: 1 },
          { x: 365, y: 43, delay: 1.5 },
          { x: 425, y: 118, delay: 2 },
          { x: 465, y: 188, delay: 2.5 },
        ].map((node, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: node.delay, type: "spring" }}
            className="absolute w-6 h-6 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            style={{ left: node.x, top: node.y }}
          >
            <span className="text-[7px] font-bold text-emerald-300">+</span>
          </motion.div>
        ))}

        {/* Right: Output heads */}
        <div className="absolute right-6 top-6 bottom-6 flex flex-col justify-between">
          {["Head 1", "Head 2", "Head 3"].map((label, i) => (
            <motion.div
              key={label}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 2.5 + i * 0.3 }}
              className="w-16 h-10 bg-teal-500/20 border border-teal-400 rounded flex items-center justify-center"
            >
              <span className="text-[10px] font-mono font-bold text-teal-300">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* Labels */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute top-2 left-1/3 text-[9px] font-mono text-emerald-300 bg-slate-800 px-2 rounded border border-emerald-500/30">
          Upsample ↑ (Top-Down FPN)
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="absolute bottom-2 right-1/3 text-[9px] font-mono text-teal-300 bg-slate-800 px-2 rounded border border-teal-500/30">
          Downsample ↓ (Bottom-Up PAN)
        </motion.div>
      </div>
    </div>
  );
}
