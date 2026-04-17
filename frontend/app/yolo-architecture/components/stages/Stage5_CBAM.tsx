"use client";

import { motion } from "framer-motion";
import { CBAMPathLines } from "./stage5/CBAMPathLines";
import { CBAMStaticNodes } from "./stage5/CBAMStaticNodes";
import { CBAMLiveTensors } from "./stage5/CBAMLiveTensors";

interface Props { scenario: "detected" | "not_detected" }

export function Stage5_CBAM({ scenario }: Props) {
  const detected = scenario === "detected";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4 md:p-8 overflow-hidden">
      <div className="text-center space-y-2 z-10 w-full mb-2">
        <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-[10px] font-bold text-amber-400 mb-2">
          ★ CA-YOLOv8 Custom Addition
        </div>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
          Stage 5: CBAM — Convolutional Block Attention
        </h2>
        <p className="text-slate-500 text-xs max-w-2xl mx-auto">
          Two-stage attention: first select <em>which</em> feature channels matter, then pinpoint <em>where</em> in the image to focus
        </p>
      </div>

      <div className="relative w-full max-w-5xl h-[380px] bg-slate-900 border border-amber-500/20 rounded-xl overflow-hidden shadow-[inset_0_0_80px_rgba(245,158,11,0.04)]">
        
        {/* Background circuit grid */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(245,158,11,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* --- SCHEMATIC SVG PATHS --- */}
        <CBAMPathLines />

        {/* --- STATIC MACHINE NODES --- */}
        <CBAMStaticNodes scenario={scenario} />

        {/* --- LIVE TENSOR DATA BLOCKS --- */}
        <CBAMLiveTensors scenario={scenario} />

      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-4 rounded-xl border border-amber-500/20 text-xs text-slate-300 w-full max-w-4xl text-center leading-relaxed"
      >
        <strong className={`font-bold mx-auto block mb-1 ${detected ? "text-amber-400" : "text-red-400"}`}>
          {detected ? "CBAM is amplifying ID card features" : "CBAM finds no significant card features to amplify"}
        </strong>
        {detected ? (
          <>
            <strong className="text-amber-300">Channel Attention</strong> asks: <em>&quot;Which of these 128 feature channels describe card edges, text, and hologram patterns?&quot;</em> — 
            it boosts those channels and suppresses noise. Then <strong className="text-lime-300">Spatial Attention</strong> asks: 
            <em>&quot;Where in this feature map is the card located?&quot;</em> — it creates a heat-map mask that highlights the card region and 
            dims the irrelevant background. The result: the network <strong>laser-focuses</strong> on the ID card.
          </>
        ) : (
          <>
            When no card is present, <strong className="text-red-400">Channel Attention</strong> finds no dominant edge/text features — 
            weights stay flat and uniform. <strong className="text-red-400">Spatial Attention</strong> has no region to highlight, 
            so attention distributes evenly (unfocused). CBAM essentially produces a near-identity transformation — confirming there&apos;s nothing special to amplify.
          </>
        )}
      </motion.div>
    </div>
  );
}
