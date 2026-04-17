"use client";

import { motion } from "framer-motion";

export function Stage9_DecoupledHead() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4 md:p-8 overflow-hidden">
      <div className="text-center space-y-2 z-10 w-full mb-2">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-400">
          Stage 9: Decoupled Detection Head
        </h2>
        <p className="text-slate-500 text-xs max-w-2xl mx-auto">
          Separating the &quot;What is it?&quot; (Classification) from the &quot;Where is it?&quot; (Regression) to eliminate gradient conflicts
        </p>
      </div>

      <div className="relative w-full max-w-5xl h-[380px] bg-slate-900 border border-red-500/20 rounded-xl overflow-hidden shadow-[inset_0_0_80px_rgba(244,63,94,0.04)] flex flex-col items-center justify-center pt-8">
        
        {/* Background circuit grid */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(244,63,94,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(244,63,94,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* ══ INPUT ══ */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <div className="w-[150px] h-[35px] rounded border-2 border-slate-500 bg-slate-800 shadow-[0_0_15px_rgba(100,116,139,0.3)] flex items-center justify-center">
             <span className="text-[12px] font-mono font-bold text-slate-300">Neck Output (P2-P5)</span>
          </div>
        </div>

        {/* ══ PIPELINE PATHS ══ */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Main stem down */}
          <path d="M 50 19 L 50 35" stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" vectorEffect="non-scaling-stroke" />
          
          {/* Fork to Classification (Left) */}
          <path d="M 50 35 Q 50 40 45 40 L 30 40 Q 25 40 25 45 L 25 50" stroke="#ec4899" strokeWidth="2.5" fill="none" className="drop-shadow-[0_0_5px_#ec4899]" vectorEffect="non-scaling-stroke" />
          
          {/* Fork to Regression (Right) */}
          <path d="M 50 35 Q 50 40 55 40 L 70 40 Q 75 40 75 45 L 75 50" stroke="#ef4444" strokeWidth="2.5" fill="none" className="drop-shadow-[0_0_5px_#ef4444]" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* ══ LIVE TENSORS ══ */}
        <motion.div className="absolute w-[12px] h-[12px] bg-white rounded shadow-[0_0_15px_#fff,0_0_30px_#ec4899] z-30" style={{ x: "-50%", y: "-50%" }} animate={{ top: ["19%", "35%", "40%", "40%", "45%", "50%"], left: ["50%", "50%", "50%", "30%", "25%", "25%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
        <motion.div className="absolute w-[12px] h-[12px] bg-white rounded shadow-[0_0_15px_#fff,0_0_30px_#ef4444] z-30" style={{ x: "-50%", y: "-50%" }} animate={{ top: ["19%", "35%", "40%", "40%", "45%", "50%"], left: ["50%", "50%", "50%", "70%", "75%", "75%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.3 }} />

        {/* ══ OUTPUT BRANCHES ══ */}
        <div className="absolute top-[50%] w-full max-w-3xl px-12 flex justify-between z-20">
          
          {/* Classification */}
          <motion.div 
            className="w-[240px] h-[160px] rounded-xl border-2 border-pink-500 bg-pink-950/80 p-4 shadow-[0_0_25px_rgba(236,72,153,0.3)] flex flex-col gap-3 relative overflow-hidden backdrop-blur"
          >
             <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-full bg-pink-500/30 flex items-center justify-center">
                 <span className="text-[12px] font-bold text-pink-300">C</span>
               </div>
               <span className="text-[14px] font-bold text-pink-300">Classification</span>
             </div>
             <span className="text-[10px] text-pink-400/80 mb-1 leading-tight">BCE Loss — &quot;Is it a Person or Card?&quot;</span>
             
             {/* Progress bars */}
             <div className="flex flex-col gap-3 mt-1">
               <div className="flex items-center gap-2 text-[11px] font-mono">
                 <span className="w-10 text-slate-300 text-right">Card</span>
                 <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <motion.div className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full" initial={{ width: 0 }} animate={{ width: "95%" }} transition={{ delay: 1, duration: 1 }} />
                 </div>
                 <span className="w-8 text-pink-300 text-right">0.95</span>
               </div>
               <div className="flex items-center gap-2 text-[11px] font-mono">
                 <span className="w-10 text-slate-300 text-right">Prsn</span>
                 <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <motion.div className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full" initial={{ width: 0 }} animate={{ width: "91%" }} transition={{ delay: 1.2, duration: 1 }} />
                 </div>
                 <span className="w-8 text-pink-300 text-right">0.91</span>
               </div>
             </div>
          </motion.div>

          {/* Regression */}
          <motion.div 
            className="w-[240px] h-[160px] rounded-xl border-2 border-red-500 bg-red-950/80 p-4 shadow-[0_0_25px_rgba(239,68,68,0.3)] flex flex-col gap-3 relative overflow-hidden backdrop-blur"
          >
             <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center">
                 <span className="text-[12px] font-bold text-red-300">R</span>
               </div>
               <span className="text-[14px] font-bold text-red-300">Box Regression</span>
             </div>
             <span className="text-[10px] text-red-400/80 mb-1 leading-tight">CIoU + DFL Loss — &quot;Where is it?&quot;</span>
             
             {/* Bounding box visualizer */}
             <div className="flex-1 bg-slate-900 rounded-lg border-2 border-slate-800 relative overflow-hidden flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                <motion.div className="absolute border border-red-400 bg-red-500/10 rounded-sm" style={{ width: "45%", height: "65%", top: "15%", left: "20%" }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: "spring" }}>
                  <span className="absolute -top-3 -left-1 text-[7px] bg-red-500 text-white px-1 py-0.5 rounded font-mono font-bold whitespace-nowrap">[x, y, w, h]</span>
                </motion.div>
                
                <motion.div className="absolute border border-red-300 bg-red-400/20 rounded-sm" style={{ width: "25%", height: "35%", top: "45%", left: "60%" }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8, type: "spring" }}>
                  <span className="absolute -bottom-3 -right-1 text-[7px] bg-red-500 text-white px-1 py-0.5 rounded font-mono font-bold whitespace-nowrap">[x, y, w, h]</span>
                </motion.div>
             </div>
          </motion.div>

        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-4 rounded-xl border border-red-500/20 text-xs text-slate-300 w-full max-w-4xl text-center leading-relaxed"
      >
        <strong className="text-red-400 font-bold mx-auto block mb-1">Preventing &quot;The What vs Where Conflict&quot;</strong>
        Historically, object detection models like YOLOv5 forced a single neural network branch to learn both <strong>classification</strong> (&quot;what is this?&quot;) and <strong>bounding box regression</strong> (&quot;where exactly are its edges?&quot;). This creates a known gradient conflict, as classification prefers translation invariance (an ID card is an ID card anywhere), while regression demands extreme translation sensitivity. YOLOv8 permanently solves this by <strong className="text-red-300">decoupling the head</strong>: branching the feature map into two entirely independent specialized streams before predicting the final output.
      </motion.div>
    </div>
  );
}
