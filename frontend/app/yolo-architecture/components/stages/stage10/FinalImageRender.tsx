import { motion } from "framer-motion";

interface Props { scenario: "detected" | "not_detected" }

export function FinalImageRender({ scenario }: Props) {
  const detected = scenario === "detected";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring" }}
      className={`relative w-[320px] h-[340px] rounded-xl border-[3px] overflow-hidden z-20 ${
        detected
          ? "border-green-500/80 shadow-[0_0_50px_rgba(34,197,94,0.3)]"
          : "border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
      }`}
    >
      {/* Background scene (camera view) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900 flex items-end justify-center pb-4">
         {/* Simple Person Silhouette */}
         <div className="relative">
           <div className="w-20 h-20 rounded-full bg-slate-500 mx-auto" />
           <div className="w-32 h-44 bg-slate-500 mx-auto mt-2 rounded-t-2xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
         </div>
      </div>

      {/* Scanning camera effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#fff_2px,#fff_4px)] mix-blend-overlay" />

      {/* ══ BOUNDING BOXES ══ */}
      
      {/* Person BBox */}
      <motion.div
        className="absolute border-[3px] border-blue-400 rounded bg-blue-500/5 shadow-[inset_0_0_15px_rgba(59,130,246,0.3)]"
        style={{ top: 30, left: 70, width: 180, height: 280 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="absolute -top-6 -left-1 flex items-center gap-1 bg-blue-500 text-white px-2 py-0.5 rounded font-bold shadow-md"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <span className="text-[10px] tracking-wide">PERSON</span>
          <span className="text-[10px] font-mono font-black text-blue-200">99%</span>
        </motion.div>
      </motion.div>

      {/* ID Card BBox */}
      {detected ? (
        <motion.div
          className="absolute border-[3px] border-yellow-400 rounded bg-yellow-400/20 shadow-[0_0_20px_rgba(250,204,21,0.6),inset_0_0_15px_rgba(250,204,21,0.4)] backdrop-blur-sm"
          style={{ top: 140, left: 135, width: 60, height: 80 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, type: "spring" }}
        >
          <motion.div
            className="absolute -top-6 -left-1 flex items-center gap-1 bg-yellow-500 text-black px-2 py-0.5 rounded font-bold shadow-md whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1 }}
          >
            <span className="text-[10px] tracking-wide">ID CARD</span>
            <span className="text-[10px] font-mono font-black text-yellow-900">92%</span>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="absolute border-[3px] border-dashed border-red-500 rounded bg-red-500/10"
          style={{ top: 140, left: 135, width: 60, height: 80 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.4] }}
          transition={{ delay: 1.8, duration: 1.5, repeat: Infinity, type: "tween" }}
        >
          <motion.div
            className="absolute -top-6 -left-1 flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded font-bold shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <span className="text-[10px] tracking-wide">MISSING</span>
          </motion.div>
        </motion.div>
      )}

      {/* Crosshairs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white/30 rounded-full flex items-center justify-center">
        <div className="w-1 h-1 bg-white/50 rounded-full" />
      </div>
    </motion.div>
  );
}
