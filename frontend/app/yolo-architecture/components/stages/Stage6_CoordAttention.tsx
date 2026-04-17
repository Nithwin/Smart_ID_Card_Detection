"use client";

import { motion } from "framer-motion";
import { CoordPathLines } from "./stage6/CoordPathLines";
import { CoordStaticNodes } from "./stage6/CoordStaticNodes";
import { CoordLiveTensors } from "./stage6/CoordLiveTensors";

interface Props { scenario: "detected" | "not_detected" }

export function Stage6_CoordAttention({ scenario }: Props) {
  const detected = scenario === "detected";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4 md:p-8 overflow-hidden">
      <div className="text-center space-y-2 z-10 w-full mb-2">
        <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-[10px] font-bold text-amber-400 mb-2">
          ★ CA-YOLOv8 Custom Addition
        </div>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
          Stage 6: Coordinate Attention
        </h2>
        <p className="text-slate-500 text-xs max-w-2xl mx-auto">
          Decomposes spatial awareness into X and Y axes independently — capturing <em>where</em> the card is, directionally
        </p>
      </div>

      <div className="relative w-full max-w-5xl h-[380px] bg-slate-900 border border-pink-500/20 rounded-xl overflow-hidden shadow-[inset_0_0_80px_rgba(236,72,153,0.04)]">
        
        {/* Background circuit grid */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(236,72,153,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <CoordPathLines />
        <CoordStaticNodes scenario={scenario} />
        <CoordLiveTensors scenario={scenario} />

      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-4 rounded-xl border border-pink-500/20 text-xs text-slate-300 w-full max-w-4xl text-center leading-relaxed"
      >
        <strong className={`font-bold mx-auto block mb-1 ${detected ? "text-pink-400" : "text-red-400"}`}>
          {detected ? "Coordinate Attention pinpoints the card's exact position" : "No clear directional signal detected"}
        </strong>
        {detected ? (
          <>
            Unlike CBAM which uses a single 2D spatial map, Coordinate Attention encodes position information <em>directionally</em>. 
            <strong className="text-pink-300"> X-Pool</strong> compresses height to learn <em>&quot;which horizontal strip contains the card?&quot;</em>, while 
            <strong className="text-rose-300"> Y-Pool</strong> compresses width to learn <em>&quot;which vertical column?&quot;</em>. 
            After a shared transform, these produce two 1D attention maps that are multiplied with the input — 
            giving the network <strong className="text-orange-300">precise coordinate awareness</strong> of where the ID card sits in the image.
          </>
        ) : (
          <>
            With no ID card present, both X-Pool and Y-Pool produce uniform encodings — 
            no specific horizontal or vertical strip stands out. The sigmoid outputs approach 0.5 everywhere, 
            making the attention near-identity. The network correctly finds no position-specific features to amplify.
          </>
        )}
      </motion.div>
    </div>
  );
}
