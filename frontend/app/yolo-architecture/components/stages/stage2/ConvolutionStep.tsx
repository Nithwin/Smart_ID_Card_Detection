"use client";

import { motion } from "framer-motion";

interface Props {
  hasCard: boolean;
}

/**
 * Shows the convolution operation step by step:
 * Input patch × Kernel weights = Output activation value
 */
export function ConvolutionStep({ hasCard }: Props) {
  // Simulated pixel patch (numbers represent brightness 0-255 scaled to 0-9)
  const inputPatch = hasCard
    ? [2, 7, 8, 1, 9, 9, 0, 3, 2] // high contrast = card edge
    : [4, 5, 4, 5, 5, 4, 4, 5, 4]; // low contrast = flat area

  const kernel = [-1, -1, -1, 0, 0, 0, 1, 1, 1]; // horizontal edge
  const output = inputPatch.reduce((sum, px, i) => sum + px * kernel[i], 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.5 }}
      className="flex items-center gap-2 flex-wrap justify-center"
    >
      {/* Input patch */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[7px] font-mono text-cyan-400">Image Patch</span>
        <div className="grid grid-cols-3 gap-[1px] bg-slate-700 p-[1px] rounded">
          {inputPatch.map((v, i) => (
            <motion.div
              key={i}
              className="w-6 h-6 flex items-center justify-center text-[8px] font-mono text-white rounded-sm"
              style={{ backgroundColor: `rgba(100,180,255,${v / 10})` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8 + i * 0.05 }}
            >
              {v}
            </motion.div>
          ))}
        </div>
      </div>

      {/* × symbol */}
      <motion.span
        className="text-indigo-400 font-bold text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.3 }}
      >
        ×
      </motion.span>

      {/* Kernel */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[7px] font-mono text-indigo-400">Edge Kernel</span>
        <div className="grid grid-cols-3 gap-[1px] bg-slate-700 p-[1px] rounded border border-indigo-500/30">
          {kernel.map((w, i) => (
            <motion.div
              key={i}
              className={`w-6 h-6 flex items-center justify-center text-[8px] font-mono rounded-sm ${
                w > 0 ? "bg-indigo-500/30 text-indigo-200" : w < 0 ? "bg-red-500/20 text-red-300" : "bg-slate-800 text-slate-500"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.3 + i * 0.05 }}
            >
              {w > 0 ? `+${w}` : w}
            </motion.div>
          ))}
        </div>
      </div>

      {/* = symbol */}
      <motion.span
        className="text-emerald-400 font-bold text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.8 }}
      >
        =
      </motion.span>

      {/* Output value */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 4, type: "tween", duration: 0.4 }}
        className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center ${
          Math.abs(output) > 5
            ? "bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
            : "bg-slate-800 border-2 border-slate-600"
        }`}
      >
        <span className={`font-mono font-black text-lg ${Math.abs(output) > 5 ? "text-emerald-300" : "text-slate-500"}`}>
          {output}
        </span>
        <span className={`text-[7px] font-mono ${Math.abs(output) > 5 ? "text-emerald-400" : "text-slate-500"}`}>
          {Math.abs(output) > 5 ? "EDGE!" : "flat"}
        </span>
      </motion.div>
    </motion.div>
  );
}
