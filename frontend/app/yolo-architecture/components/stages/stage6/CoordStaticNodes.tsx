import { motion } from "framer-motion";

export function CoordStaticNodes() {
  const node3d = (deg: number) => ({
    transform: `perspective(600px) rotateY(${deg}deg)`,
    transformStyle: "preserve-3d" as const,
  });

  return (
    <>
      {/* ═══ INPUT ═══ */}
      <div className="absolute left-[5%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5">
        <div className="w-[38px] h-[55px] rounded-md border-2 border-slate-500 bg-gradient-to-b from-slate-700 to-slate-800 shadow-[4px_4px_0_rgba(0,0,0,0.5),0_0_12px_rgba(100,116,139,0.15)] flex items-center justify-center" style={node3d(-8)}>
          <span className="text-[8px] font-mono text-slate-300 rotate-[-90deg] whitespace-nowrap">Features</span>
        </div>
        <span className="text-[8px] text-slate-500 font-mono">Input</span>
      </div>

      {/* ═══ Section label: Encode ═══ */}
      <div className="absolute left-[25%] top-[4%] -translate-x-1/2 z-30">
        <div className="px-2.5 py-1 bg-pink-900/30 border border-pink-500/30 rounded-full flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
          <span className="text-[8px] font-mono font-bold text-pink-400">1. Encode Position</span>
        </div>
      </div>

      {/* ═══ X-POOL (Global Avg Pool across X-axis → 1×W encoding) ═══ */}
      <div className="absolute left-[31%] top-[22%] -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div
          className="w-[55px] h-[32px] rounded border-2 border-pink-500 bg-gradient-to-r from-pink-900 to-pink-950 shadow-[4px_4px_0_rgba(0,0,0,0.5)] flex flex-col items-center justify-center" style={node3d(-4)}
          animate={{ boxShadow: ["4px 4px 0 rgba(0,0,0,0.5), 0 0 10px rgba(236,72,153,0.15)", "4px 4px 0 rgba(0,0,0,0.5), 0 0 20px rgba(236,72,153,0.35)", "4px 4px 0 rgba(0,0,0,0.5), 0 0 10px rgba(236,72,153,0.15)"] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="text-[8px] font-mono font-bold text-pink-300">X-Pool</span>
          <span className="text-[6px] font-mono text-pink-400/60">AvgPool(H)</span>
        </motion.div>
        <div className="flex justify-center mt-1">
          <span className="text-[7px] text-pink-400/50 font-mono">1×W×C</span>
        </div>
      </div>

      {/* ═══ Y-POOL (Global Avg Pool across Y-axis → H×1 encoding) ═══ */}
      <div className="absolute left-[31%] top-[78%] -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div
          className="w-[55px] h-[32px] rounded border-2 border-rose-500 bg-gradient-to-r from-rose-900 to-rose-950 shadow-[4px_4px_0_rgba(0,0,0,0.5)] flex flex-col items-center justify-center" style={node3d(-4)}
          animate={{ boxShadow: ["4px 4px 0 rgba(0,0,0,0.5), 0 0 10px rgba(244,63,94,0.15)", "4px 4px 0 rgba(0,0,0,0.5), 0 0 20px rgba(244,63,94,0.35)", "4px 4px 0 rgba(0,0,0,0.5), 0 0 10px rgba(244,63,94,0.15)"] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
        >
          <span className="text-[8px] font-mono font-bold text-rose-300">Y-Pool</span>
          <span className="text-[6px] font-mono text-rose-400/60">AvgPool(W)</span>
        </motion.div>
        <div className="flex justify-center mt-1">
          <span className="text-[7px] text-rose-400/50 font-mono">H×1×C</span>
        </div>
      </div>

      {/* ═══ CONCAT ═══ */}
      <div className="absolute left-[40%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[28px] h-[60px] rounded border-2 border-dashed border-pink-400/50 bg-slate-900/80 shadow-[0_0_15px_rgba(236,72,153,0.15)] flex items-center justify-center relative overflow-hidden" style={node3d(0)}>
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 bg-pink-500/10" />
            <div className="flex-1 bg-rose-500/10" />
          </div>
          <span className="text-[8px] font-mono font-black text-pink-300 rotate-[-90deg] z-10">CAT</span>
        </div>
      </div>

      {/* ═══ Section label: Transform ═══ */}
      <div className="absolute left-[54%] top-[4%] -translate-x-1/2 z-30">
        <div className="px-2.5 py-1 bg-orange-900/30 border border-orange-500/30 rounded-full flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-[8px] font-mono font-bold text-orange-400">2. Shared Transform</span>
        </div>
      </div>

      {/* ═══ CONV 1×1 + BN + Act ═══ */}
      <div className="absolute left-[54%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[48px] h-[50px] rounded-md border-2 border-orange-500 bg-gradient-to-b from-orange-900 to-orange-950 shadow-[4px_4px_0_rgba(0,0,0,0.5),0_0_15px_rgba(249,115,22,0.2)] flex flex-col items-center justify-center gap-0.5" style={node3d(0)}>
          <span className="text-[8px] font-mono font-bold text-orange-300">1×1</span>
          <span className="text-[6px] font-mono text-orange-400/60">Conv+BN</span>
          <span className="text-[6px] font-mono text-orange-400/60">+SiLU</span>
        </div>
      </div>

      {/* ═══ SPLIT ═══ */}
      <div className="absolute left-[67%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[36px] h-[36px] rounded-md border-2 border-orange-400 bg-slate-800 shadow-[3px_3px_0_rgba(0,0,0,0.5)] flex items-center justify-center" style={node3d(2)}>
          <span className="text-[7px] font-mono font-bold text-orange-300">Split</span>
        </div>
      </div>

      {/* ═══ Section label: Attend ═══ */}
      <div className="absolute left-[82%] top-[4%] -translate-x-1/2 z-30">
        <div className="px-2.5 py-1 bg-rose-900/30 border border-rose-500/30 rounded-full flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          <span className="text-[8px] font-mono font-bold text-rose-400">3. Directional Attend</span>
        </div>
      </div>

      {/* ═══ X-SIGMOID ═══ */}
      <div className="absolute left-[79%] top-[22%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[30px] h-[30px] rounded-full border-2 border-pink-500 bg-pink-950 shadow-[0_0_14px_rgba(236,72,153,0.25)] flex items-center justify-center" style={node3d(3)}>
          <span className="text-[9px] font-mono font-bold text-pink-300">σ</span>
        </div>
        <div className="flex justify-center mt-1">
          <span className="text-[7px] text-pink-400/50 font-mono">X-attn</span>
        </div>
      </div>

      {/* ═══ Y-SIGMOID ═══ */}
      <div className="absolute left-[79%] top-[78%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[30px] h-[30px] rounded-full border-2 border-rose-500 bg-rose-950 shadow-[0_0_14px_rgba(244,63,94,0.25)] flex items-center justify-center" style={node3d(3)}>
          <span className="text-[9px] font-mono font-bold text-rose-300">σ</span>
        </div>
        <div className="flex justify-center mt-1">
          <span className="text-[7px] text-rose-400/50 font-mono">Y-attn</span>
        </div>
      </div>

      {/* ═══ MULTIPLY (×) ═══ */}
      <div className="absolute left-[87%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div
          className="w-[28px] h-[28px] rounded-md border-2 border-orange-400 bg-orange-900 shadow-[0_0_15px_rgba(249,115,22,0.3)] flex items-center justify-center"
          animate={{ boxShadow: ["0 0 10px rgba(249,115,22,0.2)", "0 0 22px rgba(249,115,22,0.55)", "0 0 10px rgba(249,115,22,0.2)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[12px] font-bold text-orange-300">×</span>
        </motion.div>
      </div>

      {/* ═══ OUTPUT ═══ */}
      <div className="absolute left-[96%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5">
        <div className="w-[38px] h-[55px] rounded-md border-2 border-orange-400 bg-gradient-to-b from-orange-900 to-orange-950 shadow-[4px_4px_0_rgba(0,0,0,0.5),0_0_18px_rgba(249,115,22,0.25)] flex items-center justify-center" style={node3d(8)}>
          <span className="text-[8px] font-mono text-orange-200 rotate-[-90deg] whitespace-nowrap">Output</span>
        </div>
      </div>

      {/* ═══ Legend ═══ */}
      <div className="absolute left-[50%] bottom-[3%] -translate-x-1/2 z-10 flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0 border-t-2 border-pink-500/50" />
          <span className="text-[7px] text-pink-400/50 font-mono">X-axis (horizontal)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0 border-t-2 border-rose-500/50" />
          <span className="text-[7px] text-rose-400/50 font-mono">Y-axis (vertical)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0 border-t-2 border-dashed border-slate-500/40" />
          <span className="text-[7px] text-slate-500/50 font-mono">identity skip</span>
        </div>
      </div>
    </>
  );
}
