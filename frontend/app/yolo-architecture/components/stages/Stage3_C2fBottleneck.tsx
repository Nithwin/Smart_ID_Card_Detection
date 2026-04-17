"use client";

import { motion } from "framer-motion";
import { C2fPathLines } from "./stage3/C2fPathLines";
import { C2fStaticNodes } from "./stage3/C2fStaticNodes";
import { C2fLiveTensors } from "./stage3/C2fLiveTensors";

export function Stage3_C2fBottleneck() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4 md:p-8 overflow-hidden">
      <div className="text-center space-y-2 z-10 w-full mb-2">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
          Stage 3: C2f Live Tensor Routing
        </h2>
      </div>

      <div className="relative w-full max-w-5xl h-[380px] bg-slate-900 border border-purple-500/20 rounded-xl overflow-hidden shadow-[inset_0_0_80px_rgba(168,85,247,0.05)]">
        
        {/* Background circuit grid */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(168,85,247,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* --- SCHEMATIC SVG PATHS --- */}
        <C2fPathLines />

        {/* --- STATIC MACHINE NODES --- */}
        <C2fStaticNodes />

        {/* --- LIVE TENSOR DATA BLOCKS --- */}
        <C2fLiveTensors />

      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-4 rounded-xl border border-purple-500/20 text-xs text-slate-300 w-full max-w-4xl text-center leading-relaxed"
      >
        <strong className="text-purple-400 font-bold mx-auto block mb-1">This is how C2f out-performs ResNets:</strong>
        Watch the animation carefully! The network splits the input tensor explicitly. Instead of passing everything into a bottleneck where gradients vanish, 50% of the raw data perfectly preserves its gradients via the <strong>Identity Highway</strong>. The other 50% iterates through deep Bottlenecks, and <em>the result of every single operation is stacked at the end!</em>
      </motion.div>
    </div>
  );
}
