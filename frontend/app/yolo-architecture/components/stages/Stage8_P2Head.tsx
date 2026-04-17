"use client";

import { motion } from "framer-motion";

interface Props { scenario: "detected" | "not_detected" }

export function Stage8_P2Head({ scenario }: Props) {
  const detected = scenario === "detected";

  const layer3d = (size: number, deg: number) => ({
    width: size,
    height: size,
    transform: `perspective(800px) rotateY(${deg}deg)`,
    transformStyle: "preserve-3d" as const,
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4 md:p-8 overflow-hidden">
      <div className="text-center space-y-2 z-10 w-full mb-2">
        <div className="inline-block px-3 py-1 bg-lime-500/20 border border-lime-500/50 rounded-full text-[10px] font-bold text-lime-400 mb-2">
          ★ CA-YOLOv8 Custom Addition
        </div>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-400">
          Stage 8: P2 Micro-Object Detection Head
        </h2>
        <p className="text-slate-500 text-xs max-w-2xl mx-auto">
          Adding a high-resolution detection head to catch tiny details like ID cards
        </p>
      </div>

      <div className="relative w-full max-w-5xl h-[380px] bg-slate-900 border border-lime-500/20 rounded-xl overflow-hidden shadow-[inset_0_0_80px_rgba(132,204,22,0.04)] flex items-center justify-center">
        
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(132,204,22,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(132,204,22,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* ═══ 3D FEATURE MAP STACK ═══ */}
        <div className="relative w-full max-w-3xl h-full flex items-center justify-center">
          
          {/* P5 (Smallest) */}
          <div className="absolute left-[15%] z-10 flex flex-col items-center gap-4 opacity-40">
            <div className="border border-purple-500 bg-purple-900/50 flex items-center justify-center relative shadow-[10px_10px_0_rgba(0,0,0,0.5)]" style={layer3d(60, -30)}>
              <span className="text-[10px] font-mono font-bold text-purple-300 transform scale-x-[-1] absolute right-2 bottom-2 rotate-[30deg]">P5</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">20×20</span>
          </div>

          {/* P4 */}
          <div className="absolute left-[30%] z-20 flex flex-col items-center gap-4 opacity-50">
            <div className="border border-indigo-500 bg-indigo-900/50 flex items-center justify-center relative shadow-[10px_10px_0_rgba(0,0,0,0.5)]" style={layer3d(100, -30)}>
              <span className="text-[12px] font-mono font-bold text-indigo-300 transform scale-x-[-1] absolute right-2 bottom-2 rotate-[30deg]">P4</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">40×40</span>
          </div>

          {/* P3 (Standard highest res) */}
          <div className="absolute left-[45%] z-30 flex flex-col items-center gap-4 opacity-60">
            <div className="border border-blue-500 bg-blue-900/50 flex items-center justify-center relative shadow-[10px_10px_0_rgba(0,0,0,0.5)]" style={layer3d(150, -30)}>
              <span className="text-[14px] font-mono font-bold text-blue-300 transform scale-x-[-1] absolute right-3 bottom-3 rotate-[30deg]">P3</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">80×80</span>
          </div>

          {/* Connecting dashed line indicating addition */}
          <svg className="absolute left-[58%] w-[10%] h-[200px] z-30" viewBox="0 0 100 100">
            <path d="M 0 50 Q 50 50 100 50" fill="none" stroke="#a3e635" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="10" fill="#1e293b" stroke="#a3e635" strokeWidth="2" />
            <text x="50" y="55" fill="#a3e635" fontSize="16" fontWeight="bold" textAnchor="middle">+</text>
          </svg>

          {/* P2 (Custom Head, huge) */}
          <div className="absolute left-[70%] z-40 flex flex-col items-center gap-4">
            <motion.div 
              className={`border-2 flex items-center justify-center relative overflow-hidden ${detected ? "border-lime-400 bg-lime-900/40 shadow-[15px_15px_0_rgba(0,0,0,0.6),0_0_40px_rgba(132,204,22,0.3)]" : "border-red-500/50 bg-red-900/20 shadow-[15px_15px_0_rgba(0,0,0,0.6)]"}`} 
              style={layer3d(240, -30)}
            >
              {/* Grid pattern representing high res */}
              <div className="absolute inset-0 grid grid-cols-[repeat(16,1fr)] grid-rows-[repeat(16,1fr)] opacity-20">
                {[...Array(256)].map((_, i) => (
                  <div key={i} className={`border ${detected ? "border-lime-400" : "border-red-400"}`} />
                ))}
              </div>

              {/* Scanning highlight */}
              <motion.div
                className={`absolute w-full h-1 z-10 ${detected ? "bg-lime-400 shadow-[0_0_15px_#a3e635]" : "bg-red-500/50 shadow-[0_0_10px_#ef4444]"}`}
                animate={{ top: ["5%", "95%", "5%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />

              <span className={`text-[18px] font-mono font-bold transform scale-x-[-1] absolute right-4 bottom-4 rotate-[30deg] ${detected ? "text-lime-300" : "text-red-300"}`}>P2</span>

              {/* Detection Point */}
              {detected && (
                <motion.div
                  className="absolute border-[3px] border-amber-300 rounded shadow-[0_0_20px_#fcd34d] z-20"
                  style={{ top: "35%", left: "55%", width: "15%", height: "20%" }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: [0, 1.3, 1] }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  <span className="absolute -top-6 -left-2 text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-bold transform scale-x-[-1] rotate-[30deg] whitespace-nowrap">ID CARD</span>
                </motion.div>
              )}
            </motion.div>
            <span className={`text-[12px] font-mono font-bold ${detected ? "text-lime-400" : "text-red-400"}`}>160×160 (Stride 4)</span>
          </div>

        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-4 rounded-xl border border-lime-500/20 text-xs text-slate-300 w-full max-w-4xl text-center leading-relaxed"
      >
        <strong className={`font-bold mx-auto block mb-1 ${detected ? "text-lime-400" : "text-red-400"}`}>
          {detected ? "P2 Head successfully caught the micro-object" : "P2 Head scanning for micro-objects"}
        </strong>
        Standard YOLOv8 models drop the highest-resolution feature map (P2) to save computation, outputting only P3, P4, and P5. However, ID cards are often tiny patches of pixels in a full surveillance frame. CA-YOLOv8 explicitly <strong>re-introduces the P2 head</strong> at <strong className="text-lime-300">160×160 resolution (Stride 4)</strong>. This provides the granular spatial detail needed to detect micro-objects that would otherwise be entirely lost to the downsampling of deeper layers.
      </motion.div>
    </div>
  );
}
