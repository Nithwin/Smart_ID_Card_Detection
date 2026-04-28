import { motion } from "framer-motion";

export function SPPFStaticNodes() {
  const nodeStyle3d = (depth: number) => ({
    transform: `perspective(600px) rotateY(${depth}deg)`,
    transformStyle: "preserve-3d" as const,
  });

  return (
    <>
      {/* ═══════ INPUT TENSOR ═══════ */}
      <div className="absolute left-[5%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5">
        <div className="w-[38px] h-[58px] rounded-md border-2 border-slate-500 bg-gradient-to-b from-slate-700 to-slate-800 shadow-[4px_4px_0_rgba(0,0,0,0.5),0_0_15px_rgba(100,116,139,0.15)] flex items-center justify-center"
             style={nodeStyle3d(-8)}>
          <span className="text-[8px] font-mono text-slate-300 rotate-[-90deg] whitespace-nowrap">128ch</span>
        </div>
        <span className="text-[9px] text-slate-500 font-mono">Input</span>
      </div>

      {/* ═══════ CONV 1×1 ═══════ */}
      <div className="absolute left-[19%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5">
        <div className="w-[55px] h-[58px] rounded-md border-2 border-blue-500 bg-gradient-to-b from-blue-900 to-blue-950 shadow-[4px_4px_0_rgba(0,0,30,0.6),0_0_20px_rgba(59,130,246,0.2)] flex flex-col items-center justify-center gap-0.5"
             style={nodeStyle3d(-5)}>
          <span className="text-[9px] font-mono font-bold text-blue-300">1×1 Conv</span>
          <span className="text-[7px] font-mono text-blue-400/60">128→64</span>
        </div>
        <span className="text-[9px] text-blue-400/80 font-mono">cv1</span>
      </div>

      {/* ═══════ MAXPOOL-1 ═══════ */}
      <div className="absolute left-[38%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5">
        <motion.div
          className="w-[60px] h-[58px] rounded-lg border-2 border-orange-500 bg-gradient-to-b from-orange-900 to-orange-950 shadow-[5px_5px_0_rgba(30,10,0,0.6)] flex flex-col items-center justify-center gap-0.5 relative overflow-hidden"
          style={nodeStyle3d(-3)}
          animate={{ boxShadow: ["5px 5px 0 rgba(30,10,0,0.6), 0 0 15px rgba(249,115,22,0.15)", "5px 5px 0 rgba(30,10,0,0.6), 0 0 25px rgba(249,115,22,0.35)", "5px 5px 0 rgba(30,10,0,0.6), 0 0 15px rgba(249,115,22,0.15)"] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {/* mini grid overlay */}
          <div className="absolute inset-[3px] grid grid-cols-5 grid-rows-5 opacity-20">
            {[...Array(25)].map((_, i) => (
              <div key={i} className="border border-orange-400/40" />
            ))}
          </div>
          <span className="text-[10px] font-mono font-bold text-orange-300 z-10">5×5</span>
          <span className="text-[7px] font-mono text-orange-400/70 z-10">MaxPool</span>
        </motion.div>
        <div className="flex flex-col items-center leading-none">
          <span className="text-[9px] text-orange-400/80 font-mono">Pool-1</span>
          <span className="text-[7px] text-orange-500/50 font-mono">RF 5×5</span>
        </div>
      </div>

      {/* ═══════ MAXPOOL-2 ═══════ */}
      <div className="absolute left-[56%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5">
        <motion.div
          className="w-[60px] h-[58px] rounded-lg border-2 border-orange-400 bg-gradient-to-b from-orange-800 to-orange-950 shadow-[5px_5px_0_rgba(30,10,0,0.6)] flex flex-col items-center justify-center gap-0.5 relative overflow-hidden"
          style={nodeStyle3d(0)}
          animate={{ boxShadow: ["5px 5px 0 rgba(30,10,0,0.6), 0 0 15px rgba(234,88,12,0.15)", "5px 5px 0 rgba(30,10,0,0.6), 0 0 25px rgba(234,88,12,0.4)", "5px 5px 0 rgba(30,10,0,0.6), 0 0 15px rgba(234,88,12,0.15)"] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        >
          <div className="absolute inset-[3px] grid grid-cols-5 grid-rows-5 opacity-20">
            {[...Array(25)].map((_, i) => (
              <div key={i} className="border border-orange-300/40" />
            ))}
          </div>
          <span className="text-[10px] font-mono font-bold text-orange-200 z-10">5×5</span>
          <span className="text-[7px] font-mono text-orange-300/70 z-10">MaxPool</span>
        </motion.div>
        <div className="flex flex-col items-center leading-none">
          <span className="text-[9px] text-orange-300/80 font-mono">Pool-2</span>
          <span className="text-[7px] text-orange-400/50 font-mono">RF 9×9</span>
        </div>
      </div>

      {/* ═══════ MAXPOOL-3 ═══════ */}
      <div className="absolute left-[75%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5">
        <motion.div
          className="w-[60px] h-[58px] rounded-lg border-2 border-orange-300 bg-gradient-to-b from-orange-700 to-orange-950 shadow-[5px_5px_0_rgba(30,10,0,0.6)] flex flex-col items-center justify-center gap-0.5 relative overflow-hidden"
          style={nodeStyle3d(3)}
          animate={{ boxShadow: ["5px 5px 0 rgba(30,10,0,0.6), 0 0 15px rgba(194,65,12,0.15)", "5px 5px 0 rgba(30,10,0,0.6), 0 0 30px rgba(194,65,12,0.45)", "5px 5px 0 rgba(30,10,0,0.6), 0 0 15px rgba(194,65,12,0.15)"] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        >
          <div className="absolute inset-[3px] grid grid-cols-5 grid-rows-5 opacity-20">
            {[...Array(25)].map((_, i) => (
              <div key={i} className="border border-orange-200/40" />
            ))}
          </div>
          <span className="text-[10px] font-mono font-bold text-orange-100 z-10">5×5</span>
          <span className="text-[7px] font-mono text-orange-200/70 z-10">MaxPool</span>
        </motion.div>
        <div className="flex flex-col items-center leading-none">
          <span className="text-[9px] text-orange-200/80 font-mono">Pool-3</span>
          <span className="text-[7px] text-orange-300/50 font-mono">RF 13×13</span>
        </div>
      </div>

      {/* ═══════ CONCAT ═══════ */}
      <div className="absolute left-[87%] top-[60%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[36px] h-[130px] rounded-lg border-2 border-dashed border-amber-400/50 bg-slate-900/90 shadow-[0_0_25px_rgba(251,191,36,0.15)] flex items-center justify-center relative overflow-hidden"
             style={nodeStyle3d(5)}>
          {/* Color-coded channel bands */}
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 bg-blue-500/10 border-b border-blue-400/15" />
            <div className="flex-1 bg-orange-500/10 border-b border-orange-400/15" />
            <div className="flex-1 bg-orange-600/10 border-b border-orange-500/15" />
            <div className="flex-1 bg-orange-700/10" />
          </div>
          <span className="text-[12px] tracking-[0.2em] font-mono font-black text-amber-300/80 rotate-[-90deg] z-10">CONCAT</span>
        </div>
      </div>

      {/* ═══════ CONV 2 (output) ═══════ */}
      <div className="absolute left-[96%] top-[60%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5">
        <div className="w-[38px] h-[65px] rounded-md border-2 border-amber-400 bg-gradient-to-b from-amber-900 to-amber-950 shadow-[4px_4px_0_rgba(30,20,0,0.6),0_0_20px_rgba(251,191,36,0.2)] flex items-center justify-center"
             style={nodeStyle3d(8)}>
          <span className="text-[8px] font-mono font-bold text-amber-200 rotate-[-90deg] whitespace-nowrap">1×1 Conv</span>
        </div>
        <span className="text-[9px] text-amber-400/80 font-mono">cv2</span>
      </div>

      {/* ═══════ SKIP LABELS (HTML, not SVG) ═══════ */}
      <div className="absolute left-[52%] bottom-[6%] -translate-x-1/2 z-10 flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0 border-t-2 border-dashed border-blue-500/40" />
          <span className="text-[8px] text-blue-400/50 font-mono">identity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0 border-t-2 border-dashed border-orange-500/40" />
          <span className="text-[8px] text-orange-400/50 font-mono">pooled skip</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0 border-t-2 border-orange-400/60" />
          <span className="text-[8px] text-orange-300/50 font-mono">forward</span>
        </div>
      </div>
    </>
  );
}
