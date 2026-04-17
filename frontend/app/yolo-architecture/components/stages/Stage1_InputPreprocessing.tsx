"use client";

import { motion } from "framer-motion";

interface Props { scenario: "detected" | "not_detected" }

export function Stage1_InputPreprocessing({ scenario }: Props) {
  const hasCard = scenario === "detected";
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          Stage 1: Input Preprocessing
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          The raw surveillance frame is resized to 640&times;640 pixels and normalized. The image is decomposed into RGB channels for the neural network.
        </p>
      </div>

      <div className="flex items-center gap-8">
        {/* Original image representation */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative w-40 h-48 rounded-xl border-2 border-slate-600 bg-slate-800 overflow-hidden shadow-xl"
        >
          {/* Simulated surveillance image */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
          {/* Person silhouette */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-28">
            <div className="w-8 h-8 rounded-full bg-slate-500 mx-auto" />
            <div className="w-12 h-16 bg-slate-500 mx-auto mt-1 rounded-t-lg" />
          </div>
          {/* ID card on person — only shown in 'detected' scenario */}
          {hasCard ? (
            <div className="absolute bottom-12 left-1/2 translate-x-1 w-5 h-7 bg-amber-500/60 border border-amber-400 rounded-sm">
              <span className="absolute -top-3 left-0 text-[5px] text-amber-300 font-bold">ID</span>
            </div>
          ) : (
            <motion.span
              className="absolute bottom-20 left-1/2 -translate-x-1/2 text-[7px] font-bold text-red-400 bg-red-900/60 px-1 rounded whitespace-nowrap"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, type: "tween" }}
            >
              No Card
            </motion.span>
          )}
          <span className="absolute top-2 left-2 text-[10px] font-mono text-slate-400 bg-black/40 px-1 rounded">1920&times;1080</span>

          {/* Scan line */}
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
            animate={{ top: ["5%", "95%", "5%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", type: "tween" }}
          />
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-20 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 relative">
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-transparent border-l-cyan-400"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", type: "tween" }}
            />
          </div>
          <span className="text-[10px] font-mono text-cyan-300">resize</span>
        </motion.div>

        {/* Resized 640x640 with grid */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="relative w-40 h-40 rounded-xl border-2 border-cyan-500/50 bg-slate-800 overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.15)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
          {/* Person silhouette (resized) */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-22">
            <div className="w-6 h-6 rounded-full bg-slate-500 mx-auto" />
            <div className="w-10 h-14 bg-slate-500 mx-auto mt-0.5 rounded-t-lg" />
          </div>
          {hasCard && (
            <div className="absolute bottom-10 left-1/2 translate-x-1 w-4 h-5 bg-amber-500/60 border border-amber-400 rounded-sm" />
          )}

          {/* Grid overlay animating in */}
          <motion.svg
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            {[...Array(8)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`} stroke="#22d3ee" strokeWidth="0.5" />
            ))}
            {[...Array(8)].map((_, i) => (
              <line key={`v${i}`} x1={`${(i + 1) * 12.5}%`} y1="0" x2={`${(i + 1) * 12.5}%`} y2="100%" stroke="#22d3ee" strokeWidth="0.5" />
            ))}
          </motion.svg>

          <span className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300 bg-black/40 px-1 rounded">640&times;640</span>
        </motion.div>
      </div>

      {/* RGB Channel split */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="flex items-center gap-4"
      >
        {[
          { label: "R", color: "from-red-500/30 to-red-900/30", border: "border-red-500/40", text: "text-red-400" },
          { label: "G", color: "from-green-500/30 to-green-900/30", border: "border-green-500/40", text: "text-green-400" },
          { label: "B", color: "from-blue-500/30 to-blue-900/30", border: "border-blue-500/40", text: "text-blue-400" },
        ].map((ch, i) => (
          <motion.div
            key={ch.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.3 + i * 0.2, type: "spring" }}
            className={`w-20 h-20 rounded-lg bg-gradient-to-br ${ch.color} border ${ch.border} flex items-center justify-center`}
          >
            <span className={`font-mono font-black text-lg ${ch.text}`}>{ch.label}</span>
          </motion.div>
        ))}
        <span className="font-mono text-xs text-slate-500 ml-2">[640, 640, 3]</span>
      </motion.div>
    </div>
  );
}
