"use client";

import { motion } from "framer-motion";

interface Props { scenario: "detected" | "not_detected" }

export function Stage8_P2Head({ scenario }: Props) {
  const detected = scenario === "detected";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center space-y-2">
        <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-[10px] font-bold text-amber-400 mb-2">
          ★ CA-YOLOv8 Custom Addition
        </div>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-400">
          Stage 8: P2 Micro-Object Detection Head
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Standard YOLOv8 only uses P3/P4/P5 heads. Our CA-YOLOv8 adds a P2 head at 160&times;160 resolution (stride 4) to detect tiny objects like ID cards worn on a lanyard.
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* Standard heads (dimmed) */}
        <div className="flex flex-col gap-2 opacity-40">
          {["P5 (20&times;20)", "P4 (40&times;40)", "P3 (80&times;80)"].map((label, i) => (
            <div key={i} className="w-20 h-8 bg-slate-800 border border-slate-600 rounded flex items-center justify-center">
              <span className="text-[9px] font-mono text-slate-400" dangerouslySetInnerHTML={{ __html: label }} />
            </div>
          ))}
        </div>

        {/* Plus sign */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="text-2xl font-bold text-amber-400"
        >
          +
        </motion.div>

        {/* P2 Head — the star */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          className={`relative w-44 h-44 rounded-2xl border-2 overflow-hidden ${
            detected
              ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(52,211,153,0.4)]"
              : "border-red-400/50 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          }`}
        >
          {/* Fine-grained 160x160 grid */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            {[...Array(16)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i+1)*6.25}%`} x2="100%" y2={`${(i+1)*6.25}%`} stroke={detected ? "#34d399" : "#f87171"} strokeWidth="0.3" />
            ))}
            {[...Array(16)].map((_, i) => (
              <line key={`v${i}`} x1={`${(i+1)*6.25}%`} y1="0" x2={`${(i+1)*6.25}%`} y2="100%" stroke={detected ? "#34d399" : "#f87171"} strokeWidth="0.3" />
            ))}
          </svg>

          {/* Scanning highlight */}
          <motion.div
            className={`absolute w-full h-1 ${detected ? "bg-emerald-400 shadow-[0_0_10px_#34d399]" : "bg-red-400/50 shadow-[0_0_5px_#f87171]"}`}
            animate={{ top: ["5%", "95%", "5%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", type: "tween" }}
          />

          {/* Detection point */}
          {detected && (
            <motion.div
              className="absolute w-8 h-10 border-2 border-lime-400 rounded shadow-[0_0_15px_rgba(163,230,53,0.6)]"
              style={{ top: "35%", left: "55%" }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: [0, 1.3, 1] }}
              transition={{ delay: 2, duration: 0.8, type: "tween" }}
            >
              <span className="absolute -top-3 left-0 text-[7px] bg-lime-500 text-black px-0.5 rounded font-bold">ID Card</span>
            </motion.div>
          )}

          {!detected && (
            <motion.span
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono text-red-400 bg-red-900/50 px-2 py-1 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5] }}
              transition={{ delay: 2, duration: 1.5, repeat: Infinity, type: "tween" }}
            >
              No micro-object found
            </motion.span>
          )}

          <span className={`absolute bottom-1 left-1 text-[9px] font-mono ${detected ? "text-emerald-300" : "text-red-300"}`}>P2: 160&times;160 stride-4</span>
        </motion.div>
      </div>
    </div>
  );
}
