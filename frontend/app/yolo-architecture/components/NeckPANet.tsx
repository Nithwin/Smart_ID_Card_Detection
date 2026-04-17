"use client";

import { motion } from "framer-motion";
import { Merge, ArrowDownToLine, ArrowUpToLine } from "lucide-react";

export function NeckPANetView() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col items-center justify-center space-y-10 py-10"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 drop-shadow-md">
          Neck PANet: Path Aggregation
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          The Neck merges high-level semantic concepts (like &quot;what is a card&quot;) with low-level spatial geometry (like &quot;where are the edges&quot;). It does this through a bi-directional PANet structure.
        </p>
      </div>

      <div className="relative w-full max-w-4xl h-96 bg-slate-900/30 glass-panel rounded-3xl p-6 overflow-hidden flex">
        
        {/* Left: Backbone inputs */}
        <div className="w-1/4 h-full flex flex-col justify-between border-r border-slate-700/50 pr-4">
          {[
            { id: 'P3', label: 'High Res (Spatial)', color: 'blue' },
            { id: 'P4', label: 'Mid Res', color: 'indigo' },
            { id: 'P5', label: 'Low Res (Semantic)', color: 'purple' }
          ].map((level) => (
            <div key={level.id} className="relative w-full h-16 bg-slate-800 rounded flex flex-col items-center justify-center border border-slate-600">
               <span className={`text-${level.color}-400 font-bold font-mono`}>{level.id}</span>
               <span className="text-[9px] text-slate-400">{level.label}</span>
               {/* Output dot */}
               <div className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-${level.color}-500 rounded-full border-2 border-slate-900 z-10`}></div>
            </div>
          ))}
        </div>

        {/* Center: The FPN (Top-Down) & PANet (Bottom-Up) Grid */}
        <div className="flex-1 relative h-full">
           {/* Animated paths demonstrating Up and Down sampling */}
           <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              {/* P5 to P4 Upsample */}
              <motion.path d="M0,280 C 100,280 100,140 200,140" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="8 8" animate={{ strokeDashoffset: [24, 0] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
              {/* P4 to P3 Upsample */}
              <motion.path d="M200,140 C 300,140 300,30 400,30" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="8 8" animate={{ strokeDashoffset: [24, 0] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
              
              {/* P3 to P4 Downsample */}
              <motion.path d="M400,30 C 500,30 500,140 550,140" fill="none" stroke="#14b8a6" strokeWidth="3" strokeDasharray="8 8" animate={{ strokeDashoffset: [-24, 0] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
              {/* P4 to P5 Downsample */}
              <motion.path d="M550,140 C 650,140 650,280 700,280" fill="none" stroke="#14b8a6" strokeWidth="3" strokeDasharray="8 8" animate={{ strokeDashoffset: [-24, 0] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
           </svg>

           {/* Nodes */}
           <div className="absolute left-[180px] top-[120px] w-10 h-10 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_15px_#10b981]">
             <Merge className="w-5 h-5 text-emerald-300" />
           </div>
           <div className="absolute left-[380px] top-[10px] w-10 h-10 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_15px_#10b981]">
             <Merge className="w-5 h-5 text-emerald-300" />
           </div>

           <div className="absolute left-[530px] top-[120px] w-10 h-10 bg-teal-500/20 border-2 border-teal-400 rounded-full flex items-center justify-center shadow-[0_0_15px_#14b8a6]">
             <Merge className="w-5 h-5 text-teal-300" />
           </div>
           <div className="absolute left-[680px] top-[260px] w-10 h-10 bg-teal-500/20 border-2 border-teal-400 rounded-full flex items-center justify-center shadow-[0_0_15px_#14b8a6]">
             <Merge className="w-5 h-5 text-teal-300" />
           </div>
           
           <div className="absolute top-[80px] left-[170px] bg-slate-900 border border-emerald-500/50 px-2 rounded font-mono text-[9px] text-emerald-300"><ArrowUpToLine className="w-3 h-3 inline mr-1"/>Upsample</div>
           <div className="absolute top-[80px] left-[520px] bg-slate-900 border border-teal-500/50 px-2 rounded font-mono text-[9px] text-teal-300"><ArrowDownToLine className="w-3 h-3 inline mr-1"/>Conv Down</div>
        </div>

        {/* Right: Neck Outputs */}
        <div className="w-1/6 h-full flex flex-col justify-between border-l border-slate-700/50 pl-4 py-8">
           <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5 }} className="w-full h-12 bg-emerald-500/20 border border-emerald-400 rounded flex items-center justify-center">
             <span className="font-mono text-xs font-bold text-white shadow">To Head 1</span>
           </motion.div>
           <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5, delay: 0.5 }} className="w-full h-12 bg-teal-500/20 border border-teal-400 rounded flex items-center justify-center">
             <span className="font-mono text-xs font-bold text-white shadow">To Head 2</span>
           </motion.div>
           <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5, delay: 1 }} className="w-full h-12 bg-cyan-500/20 border border-cyan-400 rounded flex items-center justify-center">
             <span className="font-mono text-xs font-bold text-white shadow">To Head 3</span>
           </motion.div>
        </div>
      </div>

    </motion.div>
  );
}
