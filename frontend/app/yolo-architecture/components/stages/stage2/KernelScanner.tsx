"use client";

import { motion } from "framer-motion";

/**
 * Animated 3x3 convolution kernel that scans across the input image.
 * Shows the kernel weights and highlights the receptive field.
 */
export function KernelScanner() {
  // 3 different kernels shown in sequence: horizontal edge, vertical edge, corner
  const kernelWeights = [
    // Horizontal edge detector
    [-1, -1, -1, 0, 0, 0, 1, 1, 1],
    // Vertical edge detector
    [-1, 0, 1, -1, 0, 1, -1, 0, 1],
    // Corner detector
    [0, -1, 0, -1, 4, -1, 0, -1, 0],
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] font-mono text-indigo-300 font-bold">3×3 Kernels (Filters)</span>

      <div className="flex gap-3">
        {["Horizontal\nEdge", "Vertical\nEdge", "Corner\nDetector"].map((label, ki) => (
          <motion.div
            key={ki}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + ki * 0.6, type: "tween", duration: 0.4 }}
            className="flex flex-col items-center gap-1"
          >
            {/* Kernel grid */}
            <div className="grid grid-cols-3 gap-[1px] bg-slate-700 p-[1px] rounded border border-indigo-400/50">
              {kernelWeights[ki].map((w, wi) => (
                <motion.div
                  key={wi}
                  className={`w-5 h-5 flex items-center justify-center text-[7px] font-mono font-bold rounded-sm ${
                    w > 0 ? "bg-indigo-500/40 text-indigo-200" : w < 0 ? "bg-red-500/30 text-red-300" : "bg-slate-800 text-slate-500"
                  }`}
                  animate={{
                    boxShadow: w !== 0
                      ? ["0 0 0px rgba(99,102,241,0)", "0 0 6px rgba(99,102,241,0.5)", "0 0 0px rgba(99,102,241,0)"]
                      : "none",
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: wi * 0.1, type: "tween" }}
                >
                  {w > 0 ? `+${w}` : w}
                </motion.div>
              ))}
            </div>
            <span className="text-[7px] font-mono text-slate-400 text-center whitespace-pre-line leading-tight">{label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
