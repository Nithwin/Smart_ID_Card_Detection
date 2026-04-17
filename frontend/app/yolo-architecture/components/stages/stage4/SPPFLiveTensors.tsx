import { motion, Transition } from "framer-motion";

export function SPPFLiveTensors() {
  const TIMES = [0, 0.06, 0.12, 0.18, 0.26, 0.34, 0.42, 0.50, 0.58, 0.66, 0.74, 0.82, 0.90, 0.96, 1.0];
  const DURATION = 10;

  const T: Transition = {
    duration: DURATION,
    times: TIMES,
    ease: "linear" as const,
    repeat: Infinity,
  };

  // ── PHASE 1: Input slides into Conv1
  // ── PHASE 2: Conv1 → MaxPool1 (top) + skip clone drops to concat
  // ── PHASE 3: MaxPool1 → MaxPool2 (top) + skip clone drops to concat
  // ── PHASE 4: MaxPool2 → MaxPool3 (top) + skip clone drops to concat
  // ── PHASE 5: MaxPool3 → Concat direct, merged output exits

  // ═════ INPUT (grey) ═════
  const inOp = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const inX  = ["2%","15%","19%","19%","19%","19%","19%","19%","19%","19%","19%","19%","19%","19%","19%"];
  const inY  = ["40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%"];

  // ═════ CV1 → POOL1 (blue, forward track) ═════
  const f1Op = [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const f1X  = ["21%","21%","21%","35%","38%","38%","38%","38%","38%","38%","38%","38%","38%","38%","38%"];
  const f1Y  = ["40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%"];

  // ═════ CV1 → CONCAT (blue skip — drops down, travels right) ═════
  const s1Op = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0];
  const s1X  = ["19%","19%","19%","19%","19%","28%","40%","52%","64%","76%","85%","85%","85%","85%","85%"];
  const s1Y  = ["40%","40%","40%","47%","85%","85%","85%","85%","85%","85%","85%","85%","85%","85%","85%"];

  // ═════ POOL1 → POOL2 (orange, forward) ═════
  const f2Op = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const f2X  = ["40%","40%","40%","40%","40%","53%","56%","56%","56%","56%","56%","56%","56%","56%","56%"];
  const f2Y  = ["40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%"];

  // ═════ POOL1 → CONCAT (orange skip) ═════
  const s2Op = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
  const s2X  = ["38%","38%","38%","38%","38%","38%","38%","52%","65%","85%","85%","85%","85%","85%","85%"];
  const s2Y  = ["40%","40%","40%","40%","40%","47%","75%","75%","75%","75%","75%","75%","75%","75%","75%"];

  // ═════ POOL2 → POOL3 (deeper orange, forward) ═════
  const f3Op = [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0];
  const f3X  = ["58%","58%","58%","58%","58%","58%","58%","72%","75%","75%","75%","75%","75%","75%","75%"];
  const f3Y  = ["40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%"];

  // ═════ POOL2 → CONCAT (skip) ═════
  const s3Op = [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0];
  const s3X  = ["56%","56%","56%","56%","56%","56%","56%","56%","85%","85%","85%","85%","85%","85%","85%"];
  const s3Y  = ["40%","40%","40%","40%","40%","40%","40%","47%","65%","65%","65%","65%","65%","65%","65%"];

  // ═════ POOL3 → CONCAT (direct) ═════
  const f4Op = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0];
  const f4X  = ["77%","77%","77%","77%","77%","77%","77%","77%","80%","85%","85%","85%","85%","85%","85%"];
  const f4Y  = ["40%","40%","40%","40%","40%","40%","40%","40%","40%","50%","50%","50%","50%","50%","50%"];

  // ═════ CONCAT → OUTPUT ═════
  const outOp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0];
  const outX  = ["87%","87%","87%","87%","87%","87%","87%","87%","87%","87%","87%","92%","97%","102%","102%"];
  const outY  = ["60%","60%","60%","60%","60%","60%","60%","60%","60%","60%","60%","60%","60%","60%","60%"];

  const block = "absolute flex items-center justify-center z-30";

  return (
    <>
      {/* Input tensor */}
      <motion.div
        className={`${block} w-[22px] h-[36px] bg-slate-600 border-2 border-slate-400 rounded shadow-[0_0_12px_rgba(148,163,184,0.3)]`}
        animate={{ opacity: inOp, left: inX, top: inY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Conv1 → Pool1 (forward) */}
      <motion.div
        className={`${block} w-[22px] h-[30px] bg-blue-600 border-2 border-blue-400 rounded shadow-[0_0_16px_rgba(59,130,246,0.5)]`}
        animate={{ opacity: f1Op, left: f1X, top: f1Y, x: "-50%", y: "-50%" }}
        transition={T}
      />
      {/* Conv1 → Concat (identity skip) */}
      <motion.div
        className={`${block} w-[16px] h-[22px] bg-blue-500/80 border border-blue-300 rounded shadow-[0_0_12px_rgba(59,130,246,0.4)]`}
        animate={{ opacity: s1Op, left: s1X, top: s1Y, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Pool1 → Pool2 (forward) */}
      <motion.div
        className={`${block} w-[22px] h-[30px] bg-orange-600 border-2 border-orange-400 rounded shadow-[0_0_16px_rgba(249,115,22,0.5)]`}
        animate={{ opacity: f2Op, left: f2X, top: f2Y, x: "-50%", y: "-50%" }}
        transition={T}
      />
      {/* Pool1 → Concat (skip) */}
      <motion.div
        className={`${block} w-[16px] h-[22px] bg-orange-500/80 border border-orange-300 rounded shadow-[0_0_12px_rgba(249,115,22,0.4)]`}
        animate={{ opacity: s2Op, left: s2X, top: s2Y, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Pool2 → Pool3 (forward) */}
      <motion.div
        className={`${block} w-[22px] h-[30px] bg-orange-700 border-2 border-orange-500 rounded shadow-[0_0_16px_rgba(234,88,12,0.5)]`}
        animate={{ opacity: f3Op, left: f3X, top: f3Y, x: "-50%", y: "-50%" }}
        transition={T}
      />
      {/* Pool2 → Concat (skip) */}
      <motion.div
        className={`${block} w-[16px] h-[22px] bg-orange-600/80 border border-orange-400 rounded shadow-[0_0_12px_rgba(234,88,12,0.4)]`}
        animate={{ opacity: s3Op, left: s3X, top: s3Y, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Pool3 → Concat (direct, darkest) */}
      <motion.div
        className={`${block} w-[22px] h-[30px] bg-orange-800 border-2 border-orange-600 rounded shadow-[0_0_16px_rgba(194,65,12,0.5)]`}
        animate={{ opacity: f4Op, left: f4X, top: f4Y, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Concat → Output (merged gradient block) */}
      <motion.div
        className={`${block} w-[22px] h-[55px] bg-gradient-to-b from-blue-500 via-orange-500 to-orange-800 border-2 border-amber-300 rounded shadow-[0_0_22px_rgba(251,191,36,0.5)] overflow-hidden`}
        animate={{ opacity: outOp, left: outX, top: outY, x: "-50%", y: "-50%" }}
        transition={T}
      >
        <div className="absolute inset-0 bg-white/10" />
      </motion.div>
    </>
  );
}
