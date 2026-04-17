"use client";

import { motion } from "framer-motion";
import { DecoupledPaths } from "./stage9/DecoupledPaths";
import { DecoupledNodes } from "./stage9/DecoupledNodes";
import { DecoupledLiveTensors } from "./stage9/DecoupledLiveTensors";

interface Props { scenario?: "detected" | "not_detected" }

export function Stage9_DecoupledHead({ scenario }: Props) {
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

        <DecoupledPaths />
        <DecoupledLiveTensors />
        <DecoupledNodes scenario={scenario} />

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
