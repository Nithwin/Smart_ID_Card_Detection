"use client";

import { motion } from "framer-motion";

interface Props {
  hasCard: boolean;
}

/**
 * Grid of extracted feature maps showing what patterns the convolution detected.
 * Scenario-aware: with card shows strong card-edge activations, without card shows none.
 */
export function FeatureMapGrid({ hasCard }: Props) {
  const features = [
    {
      name: "Horiz. Edges",
      desc: "Body outline",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <line x1="4" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="2" />
          <line x1="4" y1="16" x2="20" y2="16" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      strength: 0.85,
      active: true,
    },
    {
      name: "Vert. Edges",
      desc: "Body sides",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <line x1="8" y1="4" x2="8" y2="20" stroke="currentColor" strokeWidth="2" />
          <line x1="16" y1="4" x2="16" y2="20" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      strength: 0.78,
      active: true,
    },
    {
      name: "Corners",
      desc: "Shoulders, head",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polyline points="6,6 6,12 12,12" stroke="currentColor" strokeWidth="2" fill="none" />
          <polyline points="18,6 18,12 12,12" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      ),
      strength: 0.7,
      active: true,
    },
    {
      name: "Card Edges",
      desc: hasCard ? "Strong rectangle" : "Not found",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="6" y="7" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="2" />
          {hasCard && <line x1="9" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1" />}
          {hasCard && <line x1="9" y1="14" x2="13" y2="14" stroke="currentColor" strokeWidth="1" />}
        </svg>
      ),
      strength: hasCard ? 0.92 : 0.1,
      active: hasCard,
    },
    {
      name: "Round Shapes",
      desc: "Head detected",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      strength: 0.65,
      active: true,
    },
    {
      name: "Textures",
      desc: "Clothing fabric",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="4" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="4" y1="14" x2="20" y2="14" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      ),
      strength: 0.5,
      active: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 5 }}
      className="flex flex-col items-center gap-2"
    >
      <span className="text-[10px] font-mono text-violet-300 font-bold">Feature Maps (what the Conv sees)</span>
      <div className="grid grid-cols-3 gap-2">
        {features.map((feat, i) => (
          <motion.div
            key={feat.name}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 5.3 + i * 0.25, type: "tween", duration: 0.3 }}
            className={`w-20 h-[72px] rounded-lg border flex flex-col items-center justify-center gap-0.5 p-1 ${
              feat.active
                ? "border-violet-400/50 bg-violet-500/10"
                : "border-red-400/30 bg-red-500/5"
            }`}
          >
            <div className={feat.active ? "text-violet-300" : "text-red-400/40"}>
              {feat.icon}
            </div>
            <span className={`text-[7px] font-mono font-bold leading-tight text-center ${feat.active ? "text-violet-200" : "text-red-400/50"}`}>
              {feat.name}
            </span>
            {/* Strength bar */}
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${feat.active ? "bg-violet-400" : "bg-red-400/40"}`}
                initial={{ width: 0 }}
                animate={{ width: `${feat.strength * 100}%` }}
                transition={{ delay: 5.8 + i * 0.25, duration: 0.5 }}
              />
            </div>
            <span className={`text-[6px] font-mono ${feat.active ? "text-slate-400" : "text-red-400/40"}`}>{feat.desc}</span>
          </motion.div>
        ))}
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 7 }}
        className="text-[9px] font-mono text-violet-300 bg-slate-800 border border-violet-500/30 px-2 py-0.5 rounded"
      >
        Output: 160×160×128 channels
      </motion.span>
    </motion.div>
  );
}
