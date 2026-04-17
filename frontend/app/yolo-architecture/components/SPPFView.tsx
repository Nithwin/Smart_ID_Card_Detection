"use client";

import { motion } from "framer-motion";
import { Maximize, Zap, Crosshair } from "lucide-react";

export function SPPFView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full flex flex-col items-center justify-center space-y-12 py-10"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 drop-shadow-md">
          SPPF: Spatial Pyramid Pooling Fast
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Located at the very end of the Backbone, SPPF extracts spatial pyramids at different scales sequentially. Instead of parallel pooling, passing the tensor through consecutive 5x5 MaxPools enlarges the receptive field immensely without exploding compute costs.
        </p>
      </div>

      {/* Animation Container */}
      <div className="relative w-full max-w-4xl h-80 border border-orange-500/20 rounded-3xl bg-slate-900/40 p-10 flex items-center justify-between overflow-hidden">
        
        {/* Raw In */}
        <div className="relative z-10 w-24 h-48 border-2 border-slate-600 rounded bg-slate-800 flex flex-col items-center justify-center shadow-lg">
           <span className="font-mono text-xs font-bold text-slate-300">Features</span>
           <span className="font-mono text-[10px] text-orange-200 mt-1">C5 Output</span>
        </div>

        {/* The Pipeline */}
        <div className="flex-1 flex items-center justify-around relative px-4">
           {/* Connecting Path */}
           <div className="absolute left-0 right-0 h-1 bg-orange-400/20 top-1/2 -translate-y-1/2 rounded-full" />
           
           {[1, 2, 3].map((poolNumber) => (
             <div key={poolNumber} className="relative z-20 flex flex-col items-center">
               <motion.div 
                 initial={{ scale: 0.8, rotateX: 60 }}
                 animate={{ scale: [0.8, 1.1, 0.8], filter: ["blur(2px)", "blur(0px)", "blur(2px)"] }}
                 transition={{ duration: 2, repeat: Infinity, delay: poolNumber * 0.4 }}
                 className="w-16 h-16 bg-gradient-to-br from-orange-500/40 to-rose-500/40 border border-orange-400 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] backdrop-blur-md"
               >
                 <Maximize className="w-6 h-6 text-orange-200" />
               </motion.div>
               <span className="font-mono text-[10px] text-orange-300 mt-3 font-bold bg-slate-900 px-2 py-1 rounded">5x5 MaxPool</span>
             </div>
           ))}

           {/* Residual Links Animation */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              <motion.path 
                 d="M -10,40 Q 150,-40 300,40" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="5 5"
                 animate={{ strokeDashoffset: [-20, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.path 
                 d="M -10,40 Q 250,-100 500,40" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="5 5"
                 animate={{ strokeDashoffset: [-20, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.path 
                 d="M -10,40 Q 350,-160 700,40" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="5 5"
                 animate={{ strokeDashoffset: [-20, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
           </svg>
        </div>

        {/* Raw Out / Concat */}
        <motion.div 
           initial={{ opacity: 0.5, boxShadow: "0 0 0px #fb923c" }}
           animate={{ opacity: 1, boxShadow: "0 0 30px #fb923c" }}
           transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
           className="relative z-10 w-24 h-48 border-2 border-rose-400 rounded-lg bg-gradient-to-b from-orange-500/20 to-rose-500/20 flex flex-col items-center justify-center"
        >
           <span className="font-mono text-xs font-bold text-white">Concat</span>
           <span className="font-mono text-[9px] text-rose-200 mt-1 max-w-[80px] text-center">Multi-scale Context</span>
        </motion.div>
      </div>

      <div className="flex gap-6 max-w-3xl">
        <div className="glass-panel p-5 rounded-2xl border-orange-500/20 text-sm text-slate-300 flex-1">
          <p><strong className="text-orange-400 flex items-center gap-2 mb-2"><Zap className="w-4 h-4"/> 10x Faster than SPP</strong> By running the max pools consecutively (output of pool 1 goes into pool 2), YOLOv8 simulates massive pooling windows (like 9x9 and 13x13) using only cheaper 5x5 operations.</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border-rose-500/20 text-sm text-slate-300 flex-1">
          <p><strong className="text-rose-400 flex items-center gap-2 mb-2"><Crosshair className="w-4 h-4"/> Vast Receptive Field</strong> Fusing these pools together gives the final tensor immediate global context of the entire image, perfectly priming it for detecting large ID Cards that dominate the frame.</p>
        </div>
      </div>
    </motion.div>
  );
}
