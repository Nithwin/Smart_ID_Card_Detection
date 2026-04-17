"use client";

import { motion } from "framer-motion";
import { NeckPathLines } from "./stage7/NeckPathLines";
import { NeckStaticNodes } from "./stage7/NeckStaticNodes";
import { NeckLiveTensors } from "./stage7/NeckLiveTensors";

export function Stage7_NeckFusion() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4 md:p-8 overflow-hidden">
      <div className="text-center space-y-2 z-10 w-full mb-2">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
          Stage 7: Neck — PANet Feature Fusion
        </h2>
        <p className="text-slate-500 text-xs max-w-2xl mx-auto">
          Merging high-resolution spatial details (P3) with deep semantic understanding (P5)
        </p>
      </div>

      <div className="relative w-full max-w-5xl h-[380px] bg-slate-900 border border-emerald-500/20 rounded-xl overflow-hidden shadow-[inset_0_0_80px_rgba(16,185,129,0.04)]">
        
        {/* Background circuit grid */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(16,185,129,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <NeckPathLines />
        <NeckStaticNodes />
        <NeckLiveTensors />

      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-4 rounded-xl border border-emerald-500/20 text-xs text-slate-300 w-full max-w-4xl text-center leading-relaxed"
      >
        <strong className="text-emerald-400 font-bold mx-auto block mb-1">Path Aggregation Network (PANet)</strong>
        YOLOv8&apos;s neck doesn&apos;t just pass features through; it fuses them. The <strong className="text-emerald-300">Feature Pyramid Network (FPN)</strong> pathway goes top-down, taking deep semantic features from P5 and upsampling them to give context to P4 and P3. Then, the <strong className="text-teal-300">Path Aggregation Network (PAN)</strong> pathway goes bottom-up, taking crisp spatial details from P3 and downsampling them to help P4 and P5 locate objects accurately. This two-way street creates rich, multi-scale representations for the final detection heads.
      </motion.div>
    </div>
  );
}
