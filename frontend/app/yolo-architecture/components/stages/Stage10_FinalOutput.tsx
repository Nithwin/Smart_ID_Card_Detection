"use client";

import { motion } from "framer-motion";

interface Props { scenario: "detected" | "not_detected" }

export function Stage10_FinalOutput({ scenario }: Props) {
  const detected = scenario === "detected";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
          Stage 10: Final Detection Output
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Non-Maximum Suppression removes overlapping boxes. The final bounding boxes are drawn on the original image with class labels and confidence scores.
        </p>
      </div>

      {/* Final annotated image */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className={`relative w-64 h-72 rounded-2xl border-2 overflow-hidden ${
          detected
            ? "border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.3)]"
            : "border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)]"
        }`}
      >
        {/* Background scene */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />

        {/* Person */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="w-12 h-12 rounded-full bg-slate-500 mx-auto" />
          <div className="w-18 h-28 bg-slate-500 mx-auto mt-1 rounded-t-lg" style={{ width: 72 }} />
        </div>

        {/* Person BBox */}
        <motion.div
          className="absolute border-2 border-blue-400 rounded"
          style={{ top: 30, left: 55, width: 150, height: 220 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.span
            className="absolute -top-5 left-0 text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            Person 0.95
          </motion.span>
        </motion.div>

        {/* ID Card BBox (or missing) */}
        {detected ? (
          <motion.div
            className="absolute border-2 border-yellow-400 rounded shadow-[0_0_10px_rgba(250,204,21,0.5)]"
            style={{ top: 110, left: 110, width: 50, height: 65 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, type: "spring" }}
          >
            <motion.span
              className="absolute -top-5 left-0 text-[8px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.1 }}
            >
              ID Card 0.92
            </motion.span>
          </motion.div>
        ) : (
          <motion.div
            className="absolute border-2 border-dashed border-red-400/50 rounded"
            style={{ top: 110, left: 110, width: 50, height: 65 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0.3] }}
            transition={{ delay: 1.8, duration: 1.5, repeat: Infinity, type: "tween" }}
          >
            <motion.span
              className="absolute -top-5 left-0 text-[8px] bg-red-500/80 text-white px-1 py-0.5 rounded font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              ???
            </motion.span>
          </motion.div>
        )}
      </motion.div>

      {/* Verdict */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.5, type: "spring" }}
        className={`px-8 py-4 rounded-2xl border-2 flex items-center gap-4 ${
          detected
            ? "bg-green-500/10 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
            : "bg-red-500/10 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
        }`}
      >
        {detected ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        )}
        <div>
          <motion.p
            className={`font-black text-xl ${detected ? "text-green-400" : "text-red-400"}`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, type: "tween" }}
          >
            {detected ? "COMPLIANT" : "NON-COMPLIANT"}
          </motion.p>
          <p className={`text-xs font-mono ${detected ? "text-green-300" : "text-red-300"}`}>
            {detected ? "IoU: 0.98 | Conf: 0.92" : "No ID Card Bounding Box Found"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
