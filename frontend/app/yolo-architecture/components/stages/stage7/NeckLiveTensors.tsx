import { motion, Transition } from "framer-motion";

export function NeckLiveTensors() {
  const tProps = (delay: number, duration: number = 2): Transition => ({
    duration,
    ease: "linear",
    repeat: Infinity,
    delay
  });

  const block = "absolute flex items-center justify-center z-30";

  return (
    <>
      {/* ══ BACKBONE → FPN (horizontal) ══ */}
      {/* P5 → FPN */}
      <motion.div className={`${block} w-[16px] h-[16px] rounded bg-purple-500/80 border border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]`} animate={{ left: ["10%", "40%"] }} style={{ top: "20%", x: "-50%", y: "-50%" }} transition={tProps(0)} />
      {/* P4 → FPN */}
      <motion.div className={`${block} w-[20px] h-[20px] rounded bg-indigo-500/80 border border-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]`} animate={{ left: ["10%", "40%"] }} style={{ top: "50%", x: "-50%", y: "-50%" }} transition={tProps(0.3)} />
      {/* P3 → FPN */}
      <motion.div className={`${block} w-[24px] h-[24px] rounded bg-blue-500/80 border border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]`} animate={{ left: ["10%", "40%"] }} style={{ top: "80%", x: "-50%", y: "-50%" }} transition={tProps(0.6)} />

      {/* ══ TOP-DOWN FPN ══ */}
      {/* P5_fpn → P4_fpn */}
      <motion.div className={`${block} w-[14px] h-[14px] rounded-full bg-emerald-500 border border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]`} animate={{ top: ["20%", "50%"] }} style={{ left: "40%", x: "-50%", y: "-50%" }} transition={tProps(1)} />
      {/* P4_fpn → P3_fpn */}
      <motion.div className={`${block} w-[18px] h-[18px] rounded-full bg-emerald-500 border border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]`} animate={{ top: ["50%", "80%"] }} style={{ left: "40%", x: "-50%", y: "-50%" }} transition={tProps(1.5)} />

      {/* ══ FPN → PAN (horizontal) ══ */}
      {/* P5_fpn → P5_pan */}
      <motion.div className={`${block} w-[16px] h-[16px] rounded bg-purple-400/80 border border-purple-200 shadow-[0_0_10px_rgba(192,132,252,0.5)]`} animate={{ left: ["40%", "70%"] }} style={{ top: "20%", x: "-50%", y: "-50%" }} transition={tProps(1)} />
      {/* P4_fpn → P4_pan */}
      <motion.div className={`${block} w-[20px] h-[20px] rounded bg-emerald-400/80 border border-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.5)]`} animate={{ left: ["40%", "70%"] }} style={{ top: "50%", x: "-50%", y: "-50%" }} transition={tProps(1.5)} />
      {/* P3_fpn → P3_pan */}
      <motion.div className={`${block} w-[24px] h-[24px] rounded bg-emerald-400/80 border border-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.5)]`} animate={{ left: ["40%", "70%"] }} style={{ top: "80%", x: "-50%", y: "-50%" }} transition={tProps(2)} />

      {/* ══ BOTTOM-UP PAN ══ */}
      {/* P3_pan → P4_pan */}
      <motion.div className={`${block} w-[18px] h-[18px] rounded-full bg-teal-500 border border-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.6)]`} animate={{ top: ["80%", "50%"] }} style={{ left: "70%", x: "-50%", y: "-50%" }} transition={tProps(2.5)} />
      {/* P4_pan → P5_pan */}
      <motion.div className={`${block} w-[14px] h-[14px] rounded-full bg-teal-500 border border-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.6)]`} animate={{ top: ["50%", "20%"] }} style={{ left: "70%", x: "-50%", y: "-50%" }} transition={tProps(3)} />

      {/* ══ PAN → HEADS (horizontal) ══ */}
      {/* P5_pan → Head 3 */}
      <motion.div className={`${block} w-[16px] h-[16px] rounded bg-teal-400/80 border border-teal-200 shadow-[0_0_10px_rgba(45,212,191,0.5)]`} animate={{ left: ["70%", "90%"] }} style={{ top: "20%", x: "-50%", y: "-50%" }} transition={tProps(3.5)} />
      {/* P4_pan → Head 2 */}
      <motion.div className={`${block} w-[20px] h-[20px] rounded bg-teal-400/80 border border-teal-200 shadow-[0_0_10px_rgba(45,212,191,0.5)]`} animate={{ left: ["70%", "90%"] }} style={{ top: "50%", x: "-50%", y: "-50%" }} transition={tProps(3)} />
      {/* P3_pan → Head 1 */}
      <motion.div className={`${block} w-[24px] h-[24px] rounded bg-emerald-400/80 border border-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.5)]`} animate={{ left: ["70%", "90%"] }} style={{ top: "80%", x: "-50%", y: "-50%" }} transition={tProps(2.5)} />
    </>
  );
}
