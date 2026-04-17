import { motion } from "framer-motion";

interface Props { scenario: "detected" | "not_detected" }

export function P2Stack({ scenario }: Props) {
  const detected = scenario === "detected";

  // 3D Isometric plane generator
  const layer3d = (scale: number, x: number, y: number, z: number) => ({
    transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(60deg) rotateZ(-45deg) scale(${scale})`,
    transformStyle: "preserve-3d" as const,
  });

  return (
    <div className="relative w-[800px] h-full flex items-center justify-center transform-gpu">

      {/* Standard YOLO Heads (P5, P4, P3) */}
      <div className="absolute left-[5%] top-[25%] flex flex-col items-center text-slate-500 text-[10px] font-mono z-10">
        <span className="bg-slate-900 px-2 border border-slate-700 rounded">Standard YOLOv8 Heads</span>
        <div className="w-px h-16 bg-slate-700 my-1" />
      </div>

      {/* P5: 20x20 (Stride 32) */}
      <div className="absolute left-[15%] top-1/2 -translate-y-1/2 z-10 opacity-30 group">
         <div className="w-32 h-32 bg-purple-900/40 border-2 border-purple-500 shadow-[8px_8px_0_rgba(0,0,0,0.4)] flex items-center justify-center relative" style={layer3d(0.5, 0, 0, -100)}>
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-30">
              {[...Array(16)].map((_, i) => <div key={i} className="border border-purple-400/50" />)}
            </div>
            <span className="text-[20px] font-mono font-bold text-purple-300 absolute right-2 bottom-2 transform rotate-[45deg] translate-x-2 translate-y-2">P5</span>
         </div>
         <span className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 font-mono whitespace-nowrap">20×20 (Stride 32)</span>
      </div>

      {/* P4: 40x40 (Stride 16) */}
      <div className="absolute left-[30%] top-1/2 -translate-y-1/2 z-20 opacity-50 group">
         <div className="w-40 h-40 bg-indigo-900/40 border-2 border-indigo-500 shadow-[10px_10px_0_rgba(0,0,0,0.4)] flex items-center justify-center relative" style={layer3d(0.7, 0, 0, -50)}>
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-30">
              {[...Array(64)].map((_, i) => <div key={i} className="border border-indigo-400/50" />)}
            </div>
            <span className="text-[16px] font-mono font-bold text-indigo-300 absolute right-2 bottom-2 transform rotate-[45deg] translate-x-2 translate-y-2">P4</span>
         </div>
         <span className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 font-mono whitespace-nowrap">40×40 (Stride 16)</span>
      </div>

      {/* P3: 80x80 (Stride 8) */}
      <div className="absolute left-[48%] top-1/2 -translate-y-1/2 z-30 opacity-80 group">
         <div className="w-48 h-48 bg-blue-900/40 border-2 border-blue-500 shadow-[12px_12px_0_rgba(0,0,0,0.4)] flex items-center justify-center relative" style={layer3d(0.9, 0, 0, 0)}>
            <div className="absolute inset-0 grid grid-cols-[repeat(16,1fr)] grid-rows-[repeat(16,1fr)] opacity-30">
              {[...Array(256)].map((_, i) => <div key={i} className="border border-blue-400/50" />)}
            </div>
            {/* Tiny undetectable dot in P3 */}
            {detected && (
              <div className="absolute top-[40%] left-[60%] w-[2px] h-[2px] bg-red-500 rounded-full shadow-[0_0_5px_#ef4444]" />
            )}
            <span className="text-[14px] font-mono font-bold text-blue-300 absolute right-3 bottom-3 transform rotate-[45deg] translate-x-2 translate-y-2">P3</span>
         </div>
         <span className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 font-mono whitespace-nowrap">80×80 (Stride 8)</span>
      </div>

      {/* Branching wire to P2 */}
      <svg className="absolute left-[58%] top-[35%] w-[12%] h-[150px] z-30 pointer-events-none" viewBox="0 0 100 150">
        <path d="M 0 130 Q 50 130 100 50" fill="none" stroke="#a3e635" strokeWidth="2" strokeDasharray="4 4" className="drop-shadow-[0_0_8px_#a3e635]" />
        <motion.circle cx="100" cy="50" r="4" fill="#a3e635" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} />
      </svg>

      {/* CA-YOLO Custom P2 Head */}
      <div className="absolute left-[72%] top-1/2 -translate-y-1/2 z-40 group">
         <motion.div 
           className={`w-64 h-64 border-[3px] flex items-center justify-center relative overflow-hidden ${detected ? "border-lime-400 bg-lime-950/60 shadow-[15px_15px_0_rgba(0,0,0,0.6),0_0_50px_rgba(132,204,22,0.4)] backdrop-blur-sm" : "border-red-500/50 bg-red-950/40 shadow-[15px_15px_0_rgba(0,0,0,0.6)]"}`} 
           style={layer3d(1.1, 0, -40, 80)}
         >
            {/* 32x32 hyper-dense grid representing 160x160 */}
            <div className="absolute inset-0 grid grid-cols-[repeat(32,1fr)] grid-rows-[repeat(32,1fr)] opacity-20">
              {[...Array(1024)].map((_, i) => <div key={i} className={`border ${detected ? "border-lime-400" : "border-red-400"}`} />)}
            </div>

            {/* Laser scanline */}
            <motion.div
              className={`absolute w-full h-[2px] z-10 ${detected ? "bg-lime-400 shadow-[0_0_20px_#a3e635]" : "bg-red-500 shadow-[0_0_15px_#ef4444]"}`}
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />

            <span className={`text-[12px] font-mono font-bold absolute right-4 bottom-4 transform rotate-[45deg] translate-x-3 translate-y-3 ${detected ? "text-lime-300" : "text-red-300"}`}>P2</span>

            {/* The Micro-Object Detection */}
            {detected && (
              <motion.div
                className="absolute border-[2px] border-amber-300 bg-amber-400/30 z-20 shadow-[0_0_25px_#fcd34d]"
                style={{ top: "38%", left: "58%", width: "6%", height: "9%" }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [0, 1.4, 1] }}
                transition={{ delay: 1, duration: 0.6, type: "tween" }} // FIXED: spring with 3 frames is invalid
              >
                {/* Floating Label pointing to the detection */}
                <div className="absolute -top-[40px] -left-[40px] w-[80px] h-[40px] transform rotate-[45deg]">
                   <div className="absolute bottom-0 right-0 w-[30px] h-[30px] border-b border-r border-amber-400 border-dashed" />
                   <span className="absolute -top-4 -left-10 text-[8px] bg-amber-400 text-black px-1.5 py-0.5 rounded-sm font-bold whitespace-nowrap shadow-lg">
                     12×18 px ID CARD
                   </span>
                </div>
              </motion.div>
            )}
         </motion.div>
         <span className={`absolute -bottom-16 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold whitespace-nowrap ${detected ? "text-lime-400" : "text-red-400"}`}>160×160 (Stride 4)</span>
      </div>

    </div>
  );
}
