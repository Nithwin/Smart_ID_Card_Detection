import { motion } from "framer-motion";

interface Props { scenario?: "detected" | "not_detected" }

export function DecoupledNodes({ scenario }: Props) {
  const detected = scenario === "detected" || scenario === undefined; 
  
  return (
    <>
      {/* ══ INPUT ══ */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <div className="w-[150px] h-[35px] rounded border-2 border-slate-500 bg-slate-800 shadow-[0_0_15px_rgba(100,116,139,0.3)] flex items-center justify-center">
           <span className="text-[12px] font-mono font-bold text-slate-300">Neck Output (P2-P5)</span>
        </div>
      </div>

      {/* ══ OUTPUT BRANCHES ══ */}
      <div className="absolute top-[50%] w-full max-w-3xl px-12 flex justify-between z-20">
        
        {/* Classification */}
        <motion.div 
          className="w-[240px] h-[160px] rounded-xl border-2 border-pink-500 bg-pink-950/80 p-4 shadow-[0_0_25px_rgba(236,72,153,0.3)] flex flex-col gap-3 relative overflow-hidden backdrop-blur"
        >
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-pink-500/30 flex items-center justify-center">
               <span className="text-[12px] font-bold text-pink-300">C</span>
             </div>
             <span className="text-[14px] font-bold text-pink-300">Classification</span>
           </div>
           <span className="text-[10px] text-pink-400/80 mb-1 leading-tight">BCE Loss — &quot;Is it a Person or Card?&quot;</span>
           
           {/* Progress bars */}
           <div className="flex flex-col gap-3 mt-1">
             <div className="flex items-center gap-2 text-[11px] font-mono">
               <span className="w-10 text-slate-300 text-right">Card</span>
               <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <motion.div className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full" initial={{ width: 0 }} animate={{ width: detected ? "95%" : "2%" }} transition={{ delay: 1, duration: 1 }} />
               </div>
               <span className="w-8 text-pink-300 text-right">{detected ? "0.95" : "0.02"}</span>
             </div>
             <div className="flex items-center gap-2 text-[11px] font-mono">
               <span className="w-10 text-slate-300 text-right">Prsn</span>
               <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <motion.div className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full" initial={{ width: 0 }} animate={{ width: "91%" }} transition={{ delay: 1.2, duration: 1 }} />
               </div>
               <span className="w-8 text-pink-300 text-right">0.91</span>
             </div>
           </div>
        </motion.div>

        {/* Regression */}
        <motion.div 
          className="w-[240px] h-[160px] rounded-xl border-2 border-red-500 bg-red-950/80 p-4 shadow-[0_0_25px_rgba(239,68,68,0.3)] flex flex-col gap-3 relative overflow-hidden backdrop-blur"
        >
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center">
               <span className="text-[12px] font-bold text-red-300">R</span>
             </div>
             <span className="text-[14px] font-bold text-red-300">Box Regression</span>
           </div>
           <span className="text-[10px] text-red-400/80 mb-1 leading-tight">CIoU + DFL Loss — &quot;Where is it?&quot;</span>
           
           {/* Bounding box visualizer */}
           <div className="flex-1 bg-slate-900 rounded-lg border-2 border-slate-800 relative overflow-hidden flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
              <motion.div className="absolute border border-red-400 bg-red-500/10 rounded-sm" style={{ width: "45%", height: "65%", top: "15%", left: "20%" }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: "spring" }}>
                <span className="absolute -top-3 -left-1 text-[7px] bg-red-500 text-white px-1 py-0.5 rounded font-mono font-bold whitespace-nowrap">[x, y, w, h]</span>
              </motion.div>
              
              {detected && (
                <motion.div className="absolute border border-red-300 bg-red-400/20 rounded-sm" style={{ width: "25%", height: "35%", top: "45%", left: "60%" }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8, type: "spring" }}>
                  <span className="absolute -bottom-3 -right-1 text-[7px] bg-red-500 text-white px-1 py-0.5 rounded font-mono font-bold whitespace-nowrap">[x, y, w, h]</span>
                </motion.div>
              )}
           </div>
        </motion.div>

      </div>
    </>
  );
}
