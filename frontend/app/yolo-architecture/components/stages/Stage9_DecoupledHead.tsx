"use client";

import { motion } from "framer-motion";

export function Stage9_DecoupledHead() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-400">
          Stage 9: Decoupled Detection Head
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          YOLOv8 separates classification (&quot;what is it?&quot;) from box regression (&quot;where is it?&quot;) into independent branches. This prevents gradient conflicts and improves both accuracy and convergence speed.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {/* Input */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-40 h-10 bg-slate-800 border border-slate-600 rounded-lg flex items-center justify-center"
        >
          <span className="text-xs font-mono text-white font-bold">Neck Feature Map</span>
        </motion.div>

        {/* Split line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.3 }}
          className="w-0.5 h-6 bg-slate-600"
        />

        {/* Fork */}
        <div className="relative w-64 h-1">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute inset-x-0 h-0.5 bg-slate-600 top-0"
          />
        </div>

        {/* Two branches */}
        <div className="flex justify-between w-full gap-6">
          {/* Classification */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex-1 bg-slate-900/50 glass-panel border border-pink-500/30 rounded-2xl p-4 flex flex-col items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <p className="font-bold text-pink-400 text-sm text-center">Classification</p>
            <p className="text-[10px] text-slate-400 text-center">BCE Loss: Is it a Person? An ID Card?</p>
            <div className="w-full space-y-1">
              <div className="flex items-center gap-2 text-[9px]">
                <span className="text-slate-400 w-12">Person:</span>
                <motion.div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-pink-500 rounded-full" initial={{ width: 0 }} animate={{ width: "95%" }} transition={{ delay: 1.5, duration: 0.8 }} />
                </motion.div>
                <span className="text-pink-300 w-8">0.95</span>
              </div>
              <div className="flex items-center gap-2 text-[9px]">
                <span className="text-slate-400 w-12">ID Card:</span>
                <motion.div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-pink-500 rounded-full" initial={{ width: 0 }} animate={{ width: "89%" }} transition={{ delay: 1.8, duration: 0.8 }} />
                </motion.div>
                <span className="text-pink-300 w-8">0.89</span>
              </div>
            </div>
          </motion.div>

          {/* Regression */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex-1 bg-slate-900/50 glass-panel border border-red-500/30 rounded-2xl p-4 flex flex-col items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <p className="font-bold text-red-400 text-sm text-center">Box Regression</p>
            <p className="text-[10px] text-slate-400 text-center">CIoU + DFL Loss: Exact coordinates</p>
            <motion.div
              className="w-full h-16 bg-slate-800 rounded-lg border border-slate-700 relative overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <motion.div
                className="absolute border-2 border-red-400 rounded"
                style={{ top: 8, left: 12, width: 30, height: 40 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.3, type: "spring" }}
              />
              <motion.div
                className="absolute border-2 border-amber-400 rounded"
                style={{ top: 16, left: 24, width: 14, height: 18 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.6, type: "spring" }}
              />
              <span className="absolute bottom-1 right-1 text-[8px] font-mono text-red-300">[x,y,w,h]</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
