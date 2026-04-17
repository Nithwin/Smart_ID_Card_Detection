"use client";

import { motion } from "framer-motion";
import { P2Stack } from "./stage8/P2Stack";

interface Props { scenario: "detected" | "not_detected" }

export function Stage8_P2Head({ scenario }: Props) {
  const detected = scenario === "detected";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4 md:p-8 overflow-hidden">
      <div className="text-center space-y-2 z-10 w-full mb-2">
        <div className="inline-block px-3 py-1 bg-lime-500/20 border border-lime-500/50 rounded-full text-[10px] font-bold text-lime-400 mb-2">
          ★ CA-YOLOv8 Custom Addition
        </div>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-400">
          Stage 8: P2 Micro-Object Detection Head
        </h2>
        <p className="text-slate-500 text-xs max-w-2xl mx-auto">
          Standard YOLOv8 drops high-resolution features. We re-attach the P2 layer to detect objects smaller than 10x10 pixels.
        </p>
      </div>

      <div className="relative w-full max-w-5xl h-[380px] bg-slate-900 border border-lime-500/20 rounded-xl overflow-hidden shadow-[inset_0_0_80px_rgba(132,204,22,0.04)] flex items-center justify-center perspective-[1200px]">
        
        {/* Background circuit grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(132,204,22,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(132,204,22,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <P2Stack scenario={scenario} />

      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-4 rounded-xl border border-lime-500/20 text-xs text-slate-300 w-full max-w-4xl text-center leading-relaxed"
      >
        <strong className={`font-bold mx-auto block mb-1 ${detected ? "text-lime-400" : "text-red-400"}`}>
          {detected ? "Micro-object isolated in the hyper-dense P2 grid" : "Scanning ultra-high resolution P2 feature map"}
        </strong>
        In standard YOLOv8, an ID card occupying a <strong className="text-amber-300">12×18 pixel</strong> area in the original image gets downsampled into a sub-pixel fraction in the P3 (Stride 8) layer, making it completely invisible to the detector. By wiring the <strong className="text-lime-300">P2 (Stride 4) feature map</strong> directly into the head, CA-YOLOv8 preserves a dense 160×160 spatial grid. Here, the micro-object retains enough distinct geometric structure (3×4 pixels) for the decoupled head to correctly classify and bound it.
      </motion.div>
    </div>
  );
}
