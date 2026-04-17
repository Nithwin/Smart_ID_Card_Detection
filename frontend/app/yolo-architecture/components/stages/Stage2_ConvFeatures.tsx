"use client";

import { motion } from "framer-motion";

interface Props {
  scenario: "detected" | "not_detected";
}

export function Stage2_ConvFeatures({ scenario }: Props) {
  const hasCard = scenario === "detected";

  // Grid dimensions
  const GRID_SIZE = 8;
  const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
  const CELL_PCT = 100 / GRID_SIZE;
  
  const DURATION = 12; // 12 seconds for the full 64-step scan

  const kernelXKeyframes: string[] = [];
  const kernelYKeyframes: string[] = [];
  
  // Classification dictionary
  // 0: Texture (flat/noise)
  // 1: Vertical Edge
  // 2: Horizontal Edge
  // 3: Corner
  // 4: Critical Edge (ID Card)
  const getCellValue = (r: number, c: number) => {
    // Top of head (Horizontal edge)
    if (r === 2 && (c === 3 || c === 4)) return 2;
    // Sides of head (Vertical edge)
    if (r === 3 && (c === 3 || c === 4)) return 1;
    // Shoulders (Corners)
    if (r === 4 && (c === 2 || c === 5)) return 3;
    // Sides of body (Vertical edge)
    if (r > 4 && (c === 2 || c === 5)) return 1;
    // Body interior 
    if (r > 4 && c > 2 && c < 5) {
      if (hasCard && r === 5 && c === 4) return 4; // ID Card
      return 0; // Texture/Fabric
    }
    return 0; // Background (Texture)
  };

  const outputGrid: number[] = [];
  const scanLogKeyframes: string[] = [];
  const scanColorKeyframes: string[] = [];

  const types = {
    0: { label: "Texture Filter: Background", color: "rgba(71,85,105,1)" }, // slate-600
    1: { label: "Edge Filter: Vertical Boundary", color: "rgba(34,211,238,1)" }, // cyan-400
    2: { label: "Edge Filter: Horizontal Boundary", color: "rgba(56,189,248,1)" }, // sky-400
    3: { label: "Corner Filter: Sharp Angle", color: "rgba(167,139,250,1)" }, // violet-400
    4: { label: "High-Contrast Edge: CARD DETECTED!", color: "rgba(251,191,36,1)" }, // amber-400
  };

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      kernelXKeyframes.push(`${(c - 1) * CELL_PCT}%`);
      kernelYKeyframes.push(`${(r - 1) * CELL_PCT}%`);
      
      const val = getCellValue(r, c);
      outputGrid.push(val);
      
      scanLogKeyframes.push(types[val as keyof typeof types].label);
      scanColorKeyframes.push(types[val as keyof typeof types].color);
    }
  }

  // Close the loop to prevent snap back
  kernelXKeyframes.push(kernelXKeyframes[0]);
  kernelYKeyframes.push(kernelYKeyframes[0]);
  scanLogKeyframes.push(scanLogKeyframes[0]);
  scanColorKeyframes.push(scanColorKeyframes[0]);

  // Helper to generate opacity keyframes for sequential filling
  const getCellOpacityKeyframes = (index: number) => {
    const frames = new Array(TOTAL_CELLS + 1).fill(0);
    for (let i = index; i <= TOTAL_CELLS; i++) {
        frames[i] = 1;
    }
    frames[TOTAL_CELLS] = 0; 
    return frames;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-4 md:p-6 overflow-hidden [perspective:1200px]">
      <div className="text-center space-y-2 z-10 w-full">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
          Stage 2: Live Convolutional Extraction
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 w-full max-w-6xl mt-4">
        
        {/* === LEFT: Flat Input Image === */}
        <div className="flex flex-col items-center gap-3 relative">
          <span className="text-[11px] font-mono text-cyan-300 font-bold bg-cyan-900/40 px-3 py-1 rounded border border-cyan-500/50">
            Source Image (Flattened)
          </span>
          <div 
            className="relative w-56 h-56 rounded-md border-2 border-slate-600 bg-slate-800 shadow-[0_0_30px_rgba(34,211,238,0.15)]"
          >
            {/* Person silhouette */}
            <div className="absolute inset-0">
              <div aria-label="head" className="absolute top-[25%] left-[37.5%] w-[25%] h-[25%] rounded-full bg-slate-500" />
              <div aria-label="body" className="absolute top-[50%] left-[25%] w-[50%] h-[50%] bg-slate-500 rounded-t-lg" />
              {hasCard && (
                <div className="absolute top-[62.5%] left-[50%] w-[12.5%] h-[12.5%] bg-amber-500/80 border border-amber-300 rounded-sm" />
              )}
            </div>

            {/* Grid Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20 z-10 pointer-events-none">
              {[...Array(GRID_SIZE)].map((_, i) => (
                <line key={`h${i}`} x1="0" y1={`${i * CELL_PCT}%`} x2="100%" y2={`${i * CELL_PCT}%`} stroke="#22d3ee" strokeWidth="1" />
              ))}
              {[...Array(GRID_SIZE)].map((_, i) => (
                <line key={`v${i}`} x1={`${i * CELL_PCT}%`} y1="0" x2={`${i * CELL_PCT}%`} y2="100%" stroke="#22d3ee" strokeWidth="1" />
              ))}
            </svg>

            {/* Scanning 3x3 kernel */}
            <motion.div
              className="absolute border-[3px] border-indigo-400 bg-indigo-500/20 z-20 shadow-[0_0_20px_rgba(99,102,241,0.8)]"
              style={{
                width: `${CELL_PCT * 3}%`,
                height: `${CELL_PCT * 3}%`,
              }}
              animate={{
                left: kernelXKeyframes,
                top: kernelYKeyframes,
              }}
              transition={{
                duration: DURATION,
                ease: "linear",
                repeat: Infinity,
                type: "tween",
              }}
            >
              <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-indigo-300/30" />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Live Text Log directly under the input */}
          <div className="mt-2 w-full text-center">
            <span className="text-[10px] text-slate-500 font-mono block mb-1">Live Extraction Log:</span>
            <motion.div 
              className="text-[11px] font-mono px-3 py-1.5 rounded-lg border inline-block min-w-[200px]"
              animate={{
                // We fake the text update by mapping an array of strings in CSS content using a hack, 
                // OR better, we use an array of colors to animate the border and glow, and we use a clever CSS trick for text,
                // but Framer Motion's `animate` doesn't support string arrays easily for textContent.
                // Wait, Framer motion CANNOT animate text content arrays natively.
                // It's okay, I will use background color and border color to show the live status.
                borderColor: scanColorKeyframes,
                boxShadow: scanColorKeyframes.map(c => `0 0 15px ${c.replace('1)', '0.5)')}`),
              }}
              transition={{ duration: DURATION, ease: "linear", repeat: Infinity, type: "tween" }}
            >
              <motion.span
                animate={{ color: scanColorKeyframes }}
                transition={{ duration: DURATION, ease: "linear", repeat: Infinity, type: "tween" }}
                className="font-bold"
              >
                Scanning active cell...
              </motion.span>
            </motion.div>
          </div>
        </div>

        {/* === CENTER: Depth math arrows === */}
        <div className="hidden lg:flex flex-col items-center justify-center gap-1 z-10">
           <motion.div 
             animate={{ x: [0, 20, 0] }}
             transition={{ duration: 1, repeat: Infinity, type: "tween" }}
           >
             <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
               <path d="M0,10 L35,10 M30,5 L35,10 L30,15" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
             </svg>
           </motion.div>
           <span className="text-[9px] font-mono text-indigo-400">1 Image</span>
           <span className="text-[9px] font-mono text-slate-500">↓</span>
           <span className="text-[9px] font-mono text-violet-400">Multiple Channels</span>
        </div>

        {/* === RIGHT: 3D Isometric Output Feature Maps === */}
        <div className="flex flex-col items-center gap-6">
          <span className="text-[11px] font-mono text-violet-300 font-bold bg-violet-900/40 px-3 py-1 rounded border border-violet-500/50">
            3D Feature Volume
          </span>
          
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* The 3 layers stacked in 3D */}
            {[
              { id: "Texture", dz: -40, dy: -20, dx: -20, match: 0, color: "bg-slate-600/60" },
              { id: "Edges", dz: 0, dy: 0, dx: 0, match: 1, match2: 2, color: "bg-cyan-500/80" },
              { id: "Corners/Card", dz: 40, dy: 20, dx: 20, match: 3, match2: 4, color: "bg-violet-500/80" },
            ].map((layer) => (
              <div 
                key={layer.id}
                className="absolute w-44 h-44 border-2 border-slate-600/50 bg-slate-900/80 backdrop-blur-sm rounded shadow-[0_15px_30px_rgba(0,0,0,0.5)] transform-gpu"
                style={{
                  transform: `rotateX(60deg) rotateZ(-45deg) translate3d(${layer.dx}px, ${layer.dy}px, ${layer.dz}px)`,
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Grid Overlay inside the 3D plane */}
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
                  {outputGrid.map((val, idx) => {
                    const isMyLayer = (val === layer.match) || (val === layer.match2);
                    
                    // Specific highlight colors per feature type
                    let cellColor = layer.color;
                    if (val === 4 && layer.id === "Corners/Card") cellColor = "bg-amber-400 shadow-[0_0_15px_#fbbf24]";
                    else if (val === 1 && layer.id === "Edges") cellColor = "bg-cyan-400 shadow-[0_0_10px_#22d3ee]";
                    else if (val === 2 && layer.id === "Edges") cellColor = "bg-sky-400 shadow-[0_0_10px_#38bdf8]";
                    else if (val === 3 && layer.id === "Corners/Card") cellColor = "bg-violet-400 shadow-[0_0_10px_#a78bfa]";
                    else if (!isMyLayer) cellColor = "transparent"; // invisible on this layer

                    return (
                      <motion.div
                        key={idx}
                        className="w-full h-full border-[0.5px] border-slate-700/30"
                        animate={{
                          opacity: getCellOpacityKeyframes(idx)
                        }}
                        transition={{
                          duration: DURATION,
                          ease: "linear",
                          repeat: Infinity,
                          type: "tween",
                        }}
                      >
                       <div className={`w-full h-full ${cellColor}`} />
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Scanning Trail specific to each layer */}
                <motion.div
                  className={`absolute border border-white/50 bg-white/10 z-20`}
                  style={{
                    width: `${CELL_PCT}%`,
                    height: `${CELL_PCT}%`,
                  }}
                  animate={{
                    left: kernelXKeyframes.map(x => `${parseFloat(x) + CELL_PCT}%`),
                    top: kernelYKeyframes.map(y => `${parseFloat(y) + CELL_PCT}%`),
                  }}
                  transition={{
                    duration: DURATION,
                    ease: "linear",
                    repeat: Infinity,
                    type: "tween",
                  }}
                />

                {/* Layer Label */}
                <div className="absolute -bottom-6 -right-6 text-[10px] font-mono text-slate-300 transform-gpu rotate-45 px-2 bg-slate-800/80 rounded border border-slate-600">
                  {layer.id}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="glass-panel p-4 mt-6 rounded-xl border border-indigo-500/20 text-xs text-slate-300 w-full max-w-4xl text-center leading-relaxed">
        <strong className="text-violet-400">Deep Extraction</strong>: Convolution doesn&apos;t just create one flat image. It stacks multiple filters (Edge filters, Corner filters, Texture filters) yielding a <strong>3D Volume of Features</strong>. {hasCard ? <span className="text-amber-400 font-bold">Watch the ID Card trigger massive spikes on the top filter layer!</span> : ""}
      </div>
    </div>
  );
}
