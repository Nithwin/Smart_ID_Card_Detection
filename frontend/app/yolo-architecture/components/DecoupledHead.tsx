"use client";

import { motion } from "framer-motion";
import { Target, Split, Search } from "lucide-react";

export function DecoupledHeadView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      className="h-full flex flex-col items-center justify-center space-y-10 py-10"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 drop-shadow-md">
          Decoupled Head: Anchor-Free Precision
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Object Classification (what is it?) and Bounding Box Regression (where is it?) are inherently different tasks. YOLOv8 completely separates them into two distinct convolutional branches, preventing them from interfering with each other&apos;s gradient learning.
        </p>
      </div>

      <div className="flex flex-col items-center relative w-full max-w-4xl">
        
        {/* Fused Neck Feature Input */}
        <div className="w-48 h-12 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center z-10 shadow-xl relative">
          <span className="font-mono text-sm text-white font-bold">Neck Feature Map</span>
          <div className="absolute -bottom-6 w-1 h-6 bg-slate-600"></div>
        </div>

        <div className="w-96 border-b-2 border-slate-600 mt-6 relative z-0"></div>

        {/* The Decoupled Branches */}
        <div className="flex justify-between w-full max-w-lg mt-6 relative z-10">
          
          {/* Classification Branch */}
          <motion.div 
             initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
             className="w-48 bg-slate-900/50 glass-panel border border-pink-500/30 rounded-2xl p-4 flex flex-col items-center gap-4"
          >
             <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.4)]">
               <Search className="w-6 h-6 text-pink-400" />
             </div>
             <div className="text-center">
               <p className="font-bold text-pink-400 text-sm">Classification Branch</p>
               <p className="text-[10px] text-slate-400 mt-1">Computes BCE Loss to identify &quot;ID Card&quot; or &quot;Person&quot;</p>
             </div>
             <div className="w-full h-8 bg-pink-500/10 rounded flex items-center justify-center font-mono text-xs text-pink-300">
               Conv x2 &rarr; Linear
             </div>
             <motion.div className="w-full text-center py-2 bg-pink-500 text-white font-bold rounded-lg text-sm drop-shadow-md" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                Class: &quot;ID Card&quot;
             </motion.div>
          </motion.div>

          <div className="flex flex-col items-center justify-center text-slate-500">
             <Split className="w-8 h-8 opacity-50" />
             <span className="text-[10px] font-bold mt-2">DECOUPLED</span>
          </div>

          {/* Regression Branch */}
          <motion.div 
             initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
             className="w-48 bg-slate-900/50 glass-panel border border-red-500/30 rounded-2xl p-4 flex flex-col items-center gap-4"
          >
             <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]">
               <Target className="w-6 h-6 text-red-400" />
             </div>
             <div className="text-center">
               <p className="font-bold text-red-400 text-sm">Regression Branch</p>
               <p className="text-[10px] text-slate-400 mt-1">Computes CIoU & DFL Loss for precise coordinates</p>
             </div>
             <div className="w-full h-8 bg-red-500/10 rounded flex items-center justify-center font-mono text-xs text-red-300">
               Conv x2 &rarr; Linear
             </div>
             <motion.div className="w-full text-center py-2 bg-red-500 text-white font-bold rounded-lg text-sm drop-shadow-md font-mono" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
                [ x, y, w, h ]
             </motion.div>
          </motion.div>
        
        </div>
      </div>
    </motion.div>
  );
}
