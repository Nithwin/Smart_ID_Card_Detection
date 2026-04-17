"use client";

import { motion } from "framer-motion";
import { Copy, GitBranch } from "lucide-react";

export function C2fModuleView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full flex flex-col items-center justify-center space-y-12 py-10"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 drop-shadow-md">
          C2f Module: Efficient Gradient Flow
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          The C2f block is a major upgrade in YOLOv8 from C3. It splits the feature map, passes one part through bottleneck networks (ResNet-like), and concatenates them all back. This preserves rich gradients without heavy computation!
        </p>
      </div>

      <div className="relative w-full max-w-3xl h-64 border border-purple-500/30 rounded-3xl bg-slate-900/50 backdrop-blur-sm p-8 flex items-center justify-center">
        {/* Input */}
        <div className="absolute left-8 h-16 w-16 bg-blue-500/20 border border-blue-400 rounded-lg flex items-center justify-center font-mono text-xs text-blue-300 font-bold">Input</div>
        
        {/* Split operation */}
        <motion.div 
          className="absolute left-28 h-0.5 bg-blue-400"
          initial={{ width: 0 }} animate={{ width: 40 }} transition={{ delay: 0.5, duration: 0.5 }}
        />
        <div className="absolute left-36 w-8 h-24 flex flex-col justify-between">
           <svg className="w-full h-full" viewBox="0 0 40 100">
              <motion.path d="M0,50 L40,10" fill="none" stroke="#60a5fa" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 0.5 }} />
              <motion.path d="M0,50 L40,90" fill="none" stroke="#60a5fa" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 0.5 }} />
           </svg>
        </div>

        {/* Top Path (Identity) */}
        <div className="absolute top-10 left-[180px] w-48 h-0.5 bg-blue-400 shadow-[0_0_10px_#60a5fa]">
           <motion.div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#fff] -mt-[5px]" animate={{ x: [0, 192] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
        </div>

        {/* Bottom Path (Bottlenecks) */}
        <div className="absolute bottom-10 left-[180px] flex items-center gap-4">
           <motion.div 
              className="w-16 h-12 bg-purple-500/20 border-2 border-purple-400 rounded flex flex-col items-center justify-center"
              initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} transition={{ delay: 1.5, duration: 0.5 }}
           >
             <span className="text-[10px] font-mono text-purple-300 font-bold">Conv</span>
           </motion.div>
           <motion.div className="w-6 h-0.5 bg-purple-400" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2, duration: 0.3 }} />
           <motion.div 
              className="w-16 h-12 bg-purple-500/20 border-2 border-purple-400 rounded flex flex-col items-center justify-center"
              initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} transition={{ delay: 2.3, duration: 0.5 }}
           >
             <span className="text-[10px] font-mono text-purple-300 font-bold">Conv</span>
           </motion.div>
        </div>

        {/* Concat operation */}
        <div className="absolute right-36 w-8 h-24 flex flex-col justify-between">
            <svg className="w-full h-full" viewBox="0 0 40 100">
              <motion.path d="M0,10 L40,50" fill="none" stroke="#a855f7" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 3, duration: 0.5 }} />
              <motion.path d="M0,90 L40,50" fill="none" stroke="#a855f7" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 3, duration: 0.5 }} />
           </svg>
        </div>

        {/* Output */}
        <motion.div 
            className="absolute right-8 h-20 w-16 bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-purple-400 rounded-lg flex items-center justify-center font-mono text-xs text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 3.5, type: 'spring' }}
        >
          Concat
        </motion.div>

        <span className="absolute bottom-2 font-mono text-[10px] text-slate-500 tracking-widest">SPLIT → PROCESS → CONCAT</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
        <div className="glass-panel p-5 border border-purple-500/20 rounded-2xl flex gap-3 text-sm text-slate-300">
           <GitBranch className="w-6 h-6 text-purple-400 shrink-0" />
           <p><strong>Split Logic</strong>: By splitting the tensor, YOLOv8 avoids processing redundant features, saving immense computational power while retaining deep representations.</p>
        </div>
        <div className="glass-panel p-5 border border-fuchsia-500/20 rounded-2xl flex gap-3 text-sm text-slate-300">
           <Copy className="w-6 h-6 text-fuchsia-400 shrink-0" />
           <p><strong>Rich Gradients</strong>: The concatenation of the identity branch ensures raw features bypass convolution degradation, fixing the vanishing gradient problem.</p>
        </div>
      </div>
    </motion.div>
  );
}
