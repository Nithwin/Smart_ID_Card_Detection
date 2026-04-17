"use client";

import { motion } from "framer-motion";
import { FinalImageRender } from "./stage10/FinalImageRender";
import { VerdictBanner } from "./stage10/VerdictBanner";

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

        <FinalImageRender scenario={scenario} />
        <VerdictBanner scenario={scenario} />

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
