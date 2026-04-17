"use client";

import { motion } from "framer-motion";

interface Props { scenario: "detected" | "not_detected" }

export function Stage10_FinalOutput({ scenario }: Props) {
  const detected = scenario === "detected";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4 md:p-8 overflow-hidden">
      <div className="text-center space-y-2 z-10 w-full mb-2">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
          Stage 10: Final Detection Output
        </h2>
        <p className="text-slate-500 text-xs max-w-2xl mx-auto">
          Non-Maximum Suppression (NMS) resolves overlapping boxes, delivering the final compliance verdict
        </p>
      </div>

      <div className="relative w-full max-w-5xl h-[380px] bg-slate-900 border border-green-500/20 rounded-xl overflow-hidden shadow-[inset_0_0_80px_rgba(34,197,94,0.04)] flex flex-col items-center justify-center">
        
        {/* Background grid */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(34,197,94,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* ══ FINAL IMAGE ══ */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className={`relative w-[320px] h-[340px] rounded-xl border-[3px] overflow-hidden z-20 ${
            detected
              ? "border-green-500/80 shadow-[0_0_50px_rgba(34,197,94,0.3)]"
              : "border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
          }`}
        >
          {/* Background scene (camera view) */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900 flex items-end justify-center pb-4">
             {/* Simple Person Silhouette */}
             <div className="relative">
               <div className="w-20 h-20 rounded-full bg-slate-500 mx-auto" />
               <div className="w-32 h-44 bg-slate-500 mx-auto mt-2 rounded-t-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
             </div>
          </div>

          {/* Scanning camera effect */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#fff_2px,#fff_4px)] mix-blend-overlay" />

          {/* ══ BOUNDING BOXES ══ */}
          
          {/* Person BBox */}
          <motion.div
            className="absolute border-[3px] border-blue-400 rounded bg-blue-500/5 shadow-[inset_0_0_15px_rgba(59,130,246,0.3)]"
            style={{ top: 30, left: 70, width: 180, height: 280 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              className="absolute -top-6 -left-1 flex items-center gap-1 bg-blue-500 text-white px-2 py-0.5 rounded font-bold shadow-md"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <span className="text-[10px] tracking-wide">PERSON</span>
              <span className="text-[10px] font-mono font-black text-blue-200">99%</span>
            </motion.div>
          </motion.div>

          {/* ID Card BBox */}
          {detected ? (
            <motion.div
              className="absolute border-[3px] border-yellow-400 rounded bg-yellow-400/20 shadow-[0_0_20px_rgba(250,204,21,0.6),inset_0_0_15px_rgba(250,204,21,0.4)] backdrop-blur-sm"
              style={{ top: 140, left: 135, width: 60, height: 80 }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8, type: "spring" }}
            >
              <motion.div
                className="absolute -top-6 -left-1 flex items-center gap-1 bg-yellow-500 text-black px-2 py-0.5 rounded font-bold shadow-md whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.1 }}
              >
                <span className="text-[10px] tracking-wide">ID CARD</span>
                <span className="text-[10px] font-mono font-black text-yellow-900">92%</span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              className="absolute border-[3px] border-dashed border-red-500 rounded bg-red-500/10"
              style={{ top: 140, left: 135, width: 60, height: 80 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.4] }}
              transition={{ delay: 1.8, duration: 1.5, repeat: Infinity, type: "tween" }}
            >
              <motion.div
                className="absolute -top-6 -left-1 flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded font-bold shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                <span className="text-[10px] tracking-wide">MISSING</span>
              </motion.div>
            </motion.div>
          )}

          {/* Crosshairs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white/30 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-white/50 rounded-full" />
          </div>
        </motion.div>

        {/* ══ VERDICT BANNER ══ */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30">
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 2.5, type: "spring" }}
            className={`w-[260px] p-6 rounded-2xl border-2 flex flex-col gap-3 backdrop-blur-md ${
              detected
                ? "bg-green-950/80 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]"
                : "bg-red-950/80 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]"
            }`}
          >
            <div className="flex items-center gap-3">
              {detected ? (
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </div>
              )}
              <motion.div
                className={`font-black text-2xl tracking-wide ${detected ? "text-green-400" : "text-red-400"}`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, type: "tween" }}
              >
                {detected ? "COMPLIANT" : "VIOLATION"}
              </motion.div>
            </div>
            
            <div className={`w-full h-px ${detected ? "bg-green-500/30" : "bg-red-500/30"}`} />
            
            <ul className="text-[11px] font-mono space-y-2">
               <li className="flex justify-between">
                 <span className="text-slate-400">Person Conf:</span>
                 <span className="text-blue-300 font-bold">0.99</span>
               </li>
               <li className="flex justify-between">
                 <span className="text-slate-400">ID Card Conf:</span>
                 <span className={detected ? "text-yellow-400 font-bold" : "text-red-400 font-bold"}>{detected ? "0.92" : "0.00"}</span>
               </li>
               <li className="flex justify-between">
                 <span className="text-slate-400">NMS Status:</span>
                 <span className="text-slate-200">Filtered</span>
               </li>
            </ul>
          </motion.div>
        </div>

      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-4 rounded-xl border border-green-500/20 text-xs text-slate-300 w-full max-w-4xl text-center leading-relaxed"
      >
        <strong className="text-green-400 font-bold mx-auto block mb-1">Non-Maximum Suppression (NMS) &amp; Final Rendering</strong>
        The raw network outputs thousands of bounding box predictions. <strong>NMS</strong> filters these down by picking the highest-confidence box and removing any others that heavily overlap (high Intersection-over-Union) pointing to the same object. The final, pristine bounding boxes are then scaled back to the original image coordinates, rendered with their class labels and confidence scores, and evaluated against the business logic to produce the final <strong className={detected ? "text-green-300" : "text-red-300"}>{detected ? "COMPLIANT" : "VIOLATION"}</strong> verdict.
      </motion.div>
    </div>
  );
}
