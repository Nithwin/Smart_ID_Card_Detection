import { motion } from "framer-motion";

interface Props { scenario: "detected" | "not_detected" }

export function VerdictBanner({ scenario }: Props) {
  const detected = scenario === "detected";

  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30">
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 2.5, type: "spring" }}
        className={`w-[260px] p-6 rounded-2xl border-2 flex flex-col gap-3 backdrop-blur-md ${
          detected
            ? "bg-green-950/80 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]"
            : "bg-red-950/80 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]"
        }`}
      >
        <div className="flex items-center gap-3">
          {detected ? (
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
          )}
          <motion.div
            className={`font-black text-2xl tracking-wide ${detected ? "text-green-400" : "text-red-400"}`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, type: "tween" }}
          >
            {detected ? "COMPLIANT" : "VIOLATION"}
          </motion.div>
        </div>
        
        <div className={`w-full h-px ${detected ? "bg-green-500/30" : "bg-red-500/30"}`} />
        
        <ul className="text-[11px] font-mono space-y-2">
           <li className="flex justify-between">
             <span className="text-slate-400">Person Conf:</span>
             <span className="text-blue-300 font-bold">0.99</span>
           </li>
           <li className="flex justify-between">
             <span className="text-slate-400">ID Card Conf:</span>
             <span className={detected ? "text-yellow-400 font-bold" : "text-red-400 font-bold"}>{detected ? "0.92" : "0.00"}</span>
           </li>
           <li className="flex justify-between">
             <span className="text-slate-400">NMS Status:</span>
             <span className="text-slate-200">Filtered</span>
           </li>
        </ul>
      </motion.div>
    </div>
  );
}
