import { motion } from "framer-motion";

interface Props {
  scenario: "detected" | "not_detected";
}

export function CBAMStaticNodes({ scenario }: Props) {
  const detected = scenario === "detected";

  const node3d = (deg: number) => ({
    transform: `perspective(600px) rotateY(${deg}deg)`,
    transformStyle: "preserve-3d" as const,
  });

  // Channel attention weights (what channels the model focuses on)
  const channelWeights = detected
    ? [0.95, 0.3, 0.85, 0.1, 0.9, 0.15, 0.75, 0.05]
    : [0.3, 0.25, 0.35, 0.2, 0.3, 0.25, 0.28, 0.22];

  return (
    <>
      {/* ═══ INPUT FEATURE MAP ═══ */}
      <div className="absolute left-[5%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5">
        <div
          className="w-[40px] h-[55px] rounded-md border-2 border-slate-500 bg-gradient-to-b from-slate-700 to-slate-800 shadow-[4px_4px_0_rgba(0,0,0,0.5),0_0_12px_rgba(100,116,139,0.15)] flex items-center justify-center"
          style={node3d(-8)}
        >
          <span className="text-[8px] font-mono text-slate-300 rotate-[-90deg] whitespace-nowrap">Features</span>
        </div>
        <span className="text-[8px] text-slate-500 font-mono">Input</span>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* ═══ CHANNEL ATTENTION SECTION ═══ */}
      {/* ═══════════════════════════════════════ */}

      {/* Section label */}
      <div className="absolute left-[36%] top-[5%] -translate-x-1/2 z-30">
        <div className="px-3 py-1 bg-amber-900/30 border border-amber-500/30 rounded-full flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-amber-400">Channel Attention — &quot;Which features matter?&quot;</span>
        </div>
      </div>

      {/* AvgPool */}
      <div className="absolute left-[33%] top-[22%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[44px] h-[28px] rounded border-2 border-amber-600 bg-amber-950 shadow-[3px_3px_0_rgba(0,0,0,0.5)] flex items-center justify-center" style={node3d(-3)}>
          <span className="text-[7px] font-mono font-bold text-amber-300">AvgPool</span>
        </div>
      </div>

      {/* MaxPool */}
      <div className="absolute left-[33%] top-[58%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[44px] h-[28px] rounded border-2 border-amber-600 bg-amber-950 shadow-[3px_3px_0_rgba(0,0,0,0.5)] flex items-center justify-center" style={node3d(-3)}>
          <span className="text-[7px] font-mono font-bold text-amber-300">MaxPool</span>
        </div>
      </div>

      {/* Shared MLP */}
      <div className="absolute left-[45%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1">
        <div className="w-[38px] h-[45px] rounded-md border-2 border-amber-500 bg-gradient-to-b from-amber-900 to-amber-950 shadow-[4px_4px_0_rgba(0,0,0,0.5),0_0_15px_rgba(245,158,11,0.2)] flex flex-col items-center justify-center gap-0.5" style={node3d(0)}>
          <span className="text-[7px] font-mono font-bold text-amber-300">MLP</span>
          <span className="text-[6px] font-mono text-amber-400/60">shared</span>
        </div>
      </div>

      {/* Sigmoid (channel) */}
      <div className="absolute left-[56%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[30px] h-[30px] rounded-full border-2 border-yellow-500 bg-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center justify-center" style={node3d(0)}>
          <span className="text-[8px] font-mono font-bold text-yellow-300">σ</span>
        </div>
      </div>

      {/* Channel weights bar chart (mini visualization) */}
      <div className="absolute left-[56%] top-[72%] -translate-x-1/2 z-20 flex flex-col items-center gap-1">
        <div className="flex items-end gap-[2px] h-[30px]">
          {channelWeights.map((w, i) => (
            <motion.div
              key={i}
              className={`w-[5px] rounded-t ${detected ? "bg-amber-400" : "bg-red-400/40"}`}
              initial={{ height: 0 }}
              animate={{ height: w * 30 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
            />
          ))}
        </div>
        <span className={`text-[7px] font-mono ${detected ? "text-amber-300/60" : "text-red-400/40"}`}>
          {detected ? "card edges ↑" : "flat weights"}
        </span>
      </div>

      {/* Multiply (×) — Channel Scale */}
      <div className="absolute left-[65%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div
          className="w-[24px] h-[24px] rounded-md border-2 border-yellow-400 bg-yellow-900 shadow-[0_0_12px_rgba(234,179,8,0.3)] flex items-center justify-center"
          animate={{ boxShadow: ["0 0 8px rgba(234,179,8,0.2)", "0 0 18px rgba(234,179,8,0.5)", "0 0 8px rgba(234,179,8,0.2)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] font-bold text-yellow-300">×</span>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* ═══ SPATIAL ATTENTION SECTION ═══ */}
      {/* ═══════════════════════════════════════ */}

      {/* Section label */}
      <div className="absolute left-[82%] top-[5%] -translate-x-1/2 z-30">
        <div className="px-3 py-1 bg-lime-900/30 border border-lime-500/30 rounded-full flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-lime-400">Spatial — &quot;Where to look?&quot;</span>
        </div>
      </div>

      {/* AvgPool (spatial) */}
      <div className="absolute left-[84%] top-[25%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[36px] h-[24px] rounded border-2 border-lime-600 bg-lime-950 shadow-[3px_3px_0_rgba(0,0,0,0.5)] flex items-center justify-center" style={node3d(3)}>
          <span className="text-[6px] font-mono font-bold text-lime-300">AvgP</span>
        </div>
      </div>

      {/* MaxPool (spatial) */}
      <div className="absolute left-[84%] top-[55%] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-[36px] h-[24px] rounded border-2 border-lime-600 bg-lime-950 shadow-[3px_3px_0_rgba(0,0,0,0.5)] flex items-center justify-center" style={node3d(3)}>
          <span className="text-[6px] font-mono font-bold text-lime-300">MaxP</span>
        </div>
      </div>

      {/* 7×7 Conv + Sigmoid (spatial) */}
      <div className="absolute left-[91%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1">
        <div className="w-[38px] h-[36px] rounded-md border-2 border-lime-500 bg-gradient-to-b from-lime-900 to-lime-950 shadow-[4px_4px_0_rgba(0,0,0,0.5),0_0_15px_rgba(132,204,22,0.2)] flex flex-col items-center justify-center gap-0" style={node3d(5)}>
          <span className="text-[7px] font-mono font-bold text-lime-300">7×7</span>
          <span className="text-[6px] font-mono text-lime-400/60">Conv+σ</span>
        </div>
      </div>

      {/* Spatial heatmap mini-preview */}
      <div className="absolute left-[91%] top-[68%] -translate-x-1/2 z-20">
        <div className="w-[40px] h-[30px] rounded border border-lime-500/30 bg-slate-900 overflow-hidden relative">
          <motion.div
            className={`absolute rounded-full blur-md ${detected ? "bg-lime-400/50" : "bg-red-400/15"}`}
            style={{ width: 18, height: 18, top: "20%", left: "35%" }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <span className={`absolute bottom-0 left-0 right-0 text-center text-[5px] font-mono ${detected ? "text-lime-300/50" : "text-red-300/30"}`}>
            {detected ? "focus" : "blur"}
          </span>
        </div>
      </div>

      {/* Output: × (spatial scale) */}
      <div className="absolute left-[98%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div
          className="w-[24px] h-[24px] rounded-md border-2 border-lime-400 bg-lime-900 shadow-[0_0_12px_rgba(132,204,22,0.3)] flex items-center justify-center"
          animate={{ boxShadow: ["0 0 8px rgba(132,204,22,0.2)", "0 0 18px rgba(132,204,22,0.5)", "0 0 8px rgba(132,204,22,0.2)"] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          <span className="text-[10px] font-bold text-lime-300">×</span>
        </motion.div>
      </div>
    </>
  );
}
