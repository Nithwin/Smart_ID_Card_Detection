"use client";

import { motion } from "framer-motion";

interface StageInfo {
  id: number;
  label: string;
  isCA?: boolean;
}

const STAGES: StageInfo[] = [
  { id: 0, label: "Input" },
  { id: 1, label: "Conv" },
  { id: 2, label: "C2f" },
  { id: 3, label: "SPPF" },
  { id: 4, label: "CBAM", isCA: true },
  { id: 5, label: "Coord Attn", isCA: true },
  { id: 6, label: "Neck" },
  { id: 7, label: "P2 Head", isCA: true },
  { id: 8, label: "Dec. Head" },
  { id: 9, label: "Output" },
];

interface Props {
  currentStage: number;
  onJump: (stage: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function TimelineBar({ currentStage, onJump, isPlaying, onTogglePlay }: Props) {
  return (
    <div className="w-full glass-panel rounded-2xl px-6 py-4 flex items-center gap-2 border border-slate-700/50">
      {/* Play/Pause */}
      <button
        onClick={onTogglePlay}
        className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center hover:bg-slate-700 transition shrink-0"
      >
        {isPlaying ? (
          <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><rect x="0" y="0" width="3" height="12" rx="1"/><rect x="7" y="0" width="3" height="12" rx="1"/></svg>
        ) : (
          <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><polygon points="0,0 10,6 0,12"/></svg>
        )}
      </button>

      {/* Progress track */}
      <div className="flex-1 relative flex items-center">
        {/* Background line */}
        <div className="absolute inset-x-0 h-1 bg-slate-700 rounded-full top-1/2 -translate-y-1/2" />
        {/* Progress fill */}
        <motion.div
          className="absolute left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full top-1/2 -translate-y-1/2"
          animate={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />

        {/* Stage dots */}
        <div className="relative w-full flex justify-between z-10">
          {STAGES.map((stage) => {
            const isActive = currentStage === stage.id;
            const isPassed = currentStage > stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => onJump(stage.id)}
                className="flex flex-col items-center group relative"
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    isActive
                      ? stage.isCA
                        ? "bg-amber-400 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-150"
                        : "bg-blue-400 border-blue-300 shadow-[0_0_12px_rgba(96,165,250,0.6)] scale-150"
                      : isPassed
                      ? "bg-emerald-500 border-emerald-400"
                      : "bg-slate-700 border-slate-600 group-hover:bg-slate-500"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white/30"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold mt-2 whitespace-nowrap transition-all ${
                    isActive ? "text-white scale-110" : isPassed ? "text-emerald-400" : "text-slate-500"
                  } ${stage.isCA ? "text-amber-400" : ""}`}
                >
                  {stage.label}
                  {stage.isCA && " ★"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
