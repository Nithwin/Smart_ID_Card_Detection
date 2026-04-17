import { motion } from "framer-motion";

export function NeckStaticNodes() {
  const node3d = (deg: number) => ({
    transform: `perspective(600px) rotateY(${deg}deg)`,
    transformStyle: "preserve-3d" as const,
  });

  return (
    <>
      {/* ══ BACKBONE ══ */}
      {/* P5 */}
      <div className="absolute left-[10%] top-[20%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
        <div className="w-[30px] h-[30px] rounded border-2 border-purple-500 bg-purple-950 flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,0.5)]" style={node3d(-5)}>
          <span className="text-[10px] font-mono font-bold text-purple-300">P5</span>
        </div>
        <span className="text-[7px] text-slate-400 mt-1">Deep (20×20)</span>
      </div>
      {/* P4 */}
      <div className="absolute left-[10%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
        <div className="w-[38px] h-[38px] rounded border-2 border-indigo-500 bg-indigo-950 flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,0.5)]" style={node3d(-5)}>
          <span className="text-[10px] font-mono font-bold text-indigo-300">P4</span>
        </div>
        <span className="text-[7px] text-slate-400 mt-1">Mid (40×40)</span>
      </div>
      {/* P3 */}
      <div className="absolute left-[10%] top-[80%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
        <div className="w-[46px] h-[46px] rounded border-2 border-blue-500 bg-blue-950 flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,0.5)]" style={node3d(-5)}>
          <span className="text-[10px] font-mono font-bold text-blue-300">P3</span>
        </div>
        <span className="text-[7px] text-slate-400 mt-1">High (80×80)</span>
      </div>

      {/* ══ FPN MERGE NODES ══ */}
      {/* P5 is just passed through */}
      <div className="absolute left-[40%] top-[20%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[20px] h-[20px] rounded-full border-2 border-slate-500 bg-slate-800 flex items-center justify-center" style={node3d(0)}>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        </div>
      </div>
      {/* P4 FPN merge */}
      <div className="absolute left-[40%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div className="w-[24px] h-[24px] rounded-full border-2 border-emerald-500 bg-emerald-950 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]" style={node3d(0)} animate={{ boxShadow: ["0 0 10px rgba(16,185,129,0.2)", "0 0 20px rgba(16,185,129,0.5)", "0 0 10px rgba(16,185,129,0.2)"] }} transition={{ duration: 2, repeat: Infinity }}>
          <span className="text-[10px] text-emerald-300 font-bold">+</span>
        </motion.div>
        <span className="absolute -right-8 top-2 text-[7px] text-emerald-400 font-mono">FPN</span>
      </div>
      {/* P3 FPN merge */}
      <div className="absolute left-[40%] top-[80%] -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div className="w-[24px] h-[24px] rounded-full border-2 border-emerald-500 bg-emerald-950 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]" style={node3d(0)} animate={{ boxShadow: ["0 0 10px rgba(16,185,129,0.2)", "0 0 20px rgba(16,185,129,0.5)", "0 0 10px rgba(16,185,129,0.2)"] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
          <span className="text-[10px] text-emerald-300 font-bold">+</span>
        </motion.div>
        <span className="absolute -right-8 top-2 text-[7px] text-emerald-400 font-mono">FPN</span>
      </div>

      {/* ══ PAN MERGE NODES ══ */}
      {/* P3 is passed through */}
      <div className="absolute left-[70%] top-[80%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[20px] h-[20px] rounded-full border-2 border-slate-500 bg-slate-800 flex items-center justify-center" style={node3d(0)}>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        </div>
      </div>
      {/* P4 PAN merge */}
      <div className="absolute left-[70%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div className="w-[24px] h-[24px] rounded-full border-2 border-teal-500 bg-teal-950 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]" style={node3d(0)} animate={{ boxShadow: ["0 0 10px rgba(20,184,166,0.2)", "0 0 20px rgba(20,184,166,0.5)", "0 0 10px rgba(20,184,166,0.2)"] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
          <span className="text-[10px] text-teal-300 font-bold">+</span>
        </motion.div>
        <span className="absolute -left-8 top-2 text-[7px] text-teal-400 font-mono">PAN</span>
      </div>
      {/* P5 PAN merge */}
      <div className="absolute left-[70%] top-[20%] -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div className="w-[24px] h-[24px] rounded-full border-2 border-teal-500 bg-teal-950 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]" style={node3d(0)} animate={{ boxShadow: ["0 0 10px rgba(20,184,166,0.2)", "0 0 20px rgba(20,184,166,0.5)", "0 0 10px rgba(20,184,166,0.2)"] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}>
          <span className="text-[10px] text-teal-300 font-bold">+</span>
        </motion.div>
        <span className="absolute -left-8 top-2 text-[7px] text-teal-400 font-mono">PAN</span>
      </div>

      {/* ══ OUTPUT HEADS ══ */}
      <div className="absolute left-[90%] top-[20%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[36px] h-[36px] rounded border-2 border-teal-400 bg-gradient-to-b from-teal-900 to-teal-950 flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,0.5),0_0_15px_rgba(45,212,191,0.2)]" style={node3d(5)}>
          <span className="text-[8px] font-mono font-bold text-teal-200 rotate-[-90deg] whitespace-nowrap">Head 3</span>
        </div>
      </div>
      <div className="absolute left-[90%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[36px] h-[36px] rounded border-2 border-teal-400 bg-gradient-to-b from-teal-900 to-teal-950 flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,0.5),0_0_15px_rgba(45,212,191,0.2)]" style={node3d(5)}>
          <span className="text-[8px] font-mono font-bold text-teal-200 rotate-[-90deg] whitespace-nowrap">Head 2</span>
        </div>
      </div>
      <div className="absolute left-[90%] top-[80%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[36px] h-[36px] rounded border-2 border-teal-400 bg-gradient-to-b from-teal-900 to-teal-950 flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,0.5),0_0_15px_rgba(45,212,191,0.2)]" style={node3d(5)}>
          <span className="text-[8px] font-mono font-bold text-teal-200 rotate-[-90deg] whitespace-nowrap">Head 1</span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute left-[50%] bottom-[3%] -translate-x-1/2 z-10 flex gap-6">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0 border-t-2 border-emerald-500" />
          <span className="text-[8px] text-emerald-400 font-mono">Top-Down FPN (Semantic → Spatial)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0 border-t-2 border-teal-500" />
          <span className="text-[8px] text-teal-400 font-mono">Bottom-Up PAN (Spatial → Semantic)</span>
        </div>
      </div>
    </>
  );
}
