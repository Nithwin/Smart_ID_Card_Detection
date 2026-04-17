"use client";

import { motion } from "framer-motion";
import { SPPFPathLines } from "./stage4/SPPFPathLines";
import { SPPFStaticNodes } from "./stage4/SPPFStaticNodes";
import { SPPFLiveTensors } from "./stage4/SPPFLiveTensors";

export function Stage4_SPPF() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4 md:p-8 overflow-hidden">
      <div className="text-center space-y-2 z-10 w-full mb-2">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
          Stage 4: SPPF — Spatial Pyramid Pooling Fast
        </h2>
        <p className="text-slate-500 text-xs max-w-2xl mx-auto">
          Watch how the same feature map is pooled at increasingly larger windows to capture context at every scale
        </p>
      </div>

      <div className="relative w-full max-w-5xl h-[380px] bg-slate-900 border border-orange-500/20 rounded-xl overflow-hidden shadow-[inset_0_0_80px_rgba(251,146,60,0.05)]">
        
        {/* Background circuit grid */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(251,146,60,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(251,146,60,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* --- SCHEMATIC SVG PATHS --- */}
        <SPPFPathLines />

        {/* --- STATIC MACHINE NODES --- */}
        <SPPFStaticNodes />

        {/* --- LIVE TENSOR DATA BLOCKS --- */}
        <SPPFLiveTensors />

      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-4 rounded-xl border border-orange-500/20 text-xs text-slate-300 w-full max-w-4xl text-center leading-relaxed"
      >
        <strong className="text-orange-400 font-bold mx-auto block mb-1">Why SPPF matters for ID Card Detection</strong>
        Imagine a person holding an ID card — the card might be tiny (far away) or huge (close-up). 
        SPPF solves this by running <strong>three sequential 5×5 MaxPool</strong> operations. Each pool doubles the 
        receptive field: <em className="text-orange-300">5×5 → 9×9 → 13×13</em>. The outputs from 
        <em> every</em> scale are <strong className="text-amber-300">concatenated</strong> together, giving the model 
        simultaneous awareness of fine details <em>and</em> broad context — all in a single, fast operation. 
        This is equivalent to a 13×13 Spatial Pyramid Pooling layer, but runs <strong>~3× faster</strong>.
      </motion.div>
    </div>
  );
}
