import { motion, Transition } from "framer-motion";

interface Props {
  scenario: "detected" | "not_detected";
}

export function CoordLiveTensors({ scenario }: Props) {
  const detected = scenario === "detected";
  const TIMES = [0, 0.07, 0.14, 0.21, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
  const DURATION = 9;

  const T: Transition = {
    duration: DURATION,
    times: TIMES,
    ease: "linear" as const,
    repeat: Infinity,
  };

  // Phase flow:
  // 1. Input → branches into X-Pool (up) and Y-Pool (down)
  // 2. Both → Concat
  // 3. Concat → Conv+BN → Split
  // 4. Split → X-Sigmoid (up) and Y-Sigmoid (down)
  // 5. Both → Multiply → Output

  // ═══ INPUT ═══
  const inOp = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const inX  = ["2%","11%","15%","15%","15%","15%","15%","15%","15%","15%","15%","15%"];
  const inY  = ["50%","50%","50%","50%","50%","50%","50%","50%","50%","50%","50%","50%"];

  // ═══ X-POOL branch (goes up) ═══
  const xpOp = [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
  const xpX  = ["15%","15%","15%","31%","31%","31%","31%","31%","31%","31%","31%","31%"];
  const xpY  = ["50%","50%","44%","22%","22%","22%","22%","22%","22%","22%","22%","22%"];

  // ═══ Y-POOL branch (goes down) ═══
  const ypOp = [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
  const ypX  = ["15%","15%","15%","31%","31%","31%","31%","31%","31%","31%","31%","31%"];
  const ypY  = ["50%","50%","56%","78%","78%","78%","78%","78%","78%","78%","78%","78%"];

  // ═══ MERGE → Concat → Conv+BN ═══
  const mergeOp = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0];
  const mergeX  = ["38%","38%","38%","38%","40%","54%","54%","54%","54%","54%","54%","54%"];
  const mergeY  = ["50%","50%","50%","50%","50%","50%","50%","50%","50%","50%","50%","50%"];

  // ═══ CONV → SPLIT → X-Sigmoid (goes up) ═══
  const xsOp = [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0];
  const xsX  = ["60%","60%","60%","60%","60%","60%","67%","79%","79%","79%","79%","79%"];
  const xsY  = ["50%","50%","50%","50%","50%","50%","44%","22%","22%","22%","22%","22%"];

  // ═══ SPLIT → Y-Sigmoid (goes down) ═══
  const ysOp = [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0];
  const ysX  = ["60%","60%","60%","60%","60%","60%","67%","79%","79%","79%","79%","79%"];
  const ysY  = ["50%","50%","50%","50%","50%","50%","56%","78%","78%","78%","78%","78%"];

  // ═══ BOTH SIGMOIDS → MULTIPLY ═══
  const mulOp = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0];
  const mulX  = ["83%","83%","83%","83%","83%","83%","83%","83%","85%","87%","87%","87%"];
  const mulY  = ["50%","50%","50%","50%","50%","50%","50%","50%","50%","50%","50%","50%"];

  // ═══ OUTPUT ═══
  const outOp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
  const outX  = ["89%","89%","89%","89%","89%","89%","89%","89%","89%","89%","96%","100%"];
  const outY  = ["50%","50%","50%","50%","50%","50%","50%","50%","50%","50%","50%","50%"];

  const block = "absolute flex items-center justify-center z-30";
  const pinkBorder = detected ? "border-pink-400" : "border-red-400/40";
  const roseBorder = detected ? "border-rose-400" : "border-red-400/40";

  return (
    <>
      {/* Input */}
      <motion.div
        className={`${block} w-[22px] h-[34px] bg-slate-600 border-2 border-slate-400 rounded shadow-[0_0_10px_rgba(148,163,184,0.3)]`}
        animate={{ opacity: inOp, left: inX, top: inY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* X-Pool branch */}
      <motion.div
        className={`${block} w-[18px] h-[24px] ${detected ? "bg-pink-600 shadow-[0_0_14px_rgba(236,72,153,0.5)]" : "bg-red-500/30 shadow-none"} border-2 ${pinkBorder} rounded`}
        animate={{ opacity: xpOp, left: xpX, top: xpY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Y-Pool branch */}
      <motion.div
        className={`${block} w-[18px] h-[24px] ${detected ? "bg-rose-600 shadow-[0_0_14px_rgba(244,63,94,0.5)]" : "bg-red-500/30 shadow-none"} border-2 ${roseBorder} rounded`}
        animate={{ opacity: ypOp, left: ypX, top: ypY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Merged → Conv */}
      <motion.div
        className={`${block} w-[22px] h-[30px] ${detected ? "bg-gradient-to-b from-pink-500 to-rose-500 border-orange-400 shadow-[0_0_16px_rgba(249,115,22,0.4)]" : "bg-gradient-to-b from-red-400/30 to-red-500/30 border-red-300/30"} border-2 rounded`}
        animate={{ opacity: mergeOp, left: mergeX, top: mergeY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* X-Sigmoid branch */}
      <motion.div
        className={`${block} w-[16px] h-[20px] ${detected ? "bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.4)]" : "bg-red-400/20"} border ${pinkBorder} rounded`}
        animate={{ opacity: xsOp, left: xsX, top: xsY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Y-Sigmoid branch */}
      <motion.div
        className={`${block} w-[16px] h-[20px] ${detected ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]" : "bg-red-400/20"} border ${roseBorder} rounded`}
        animate={{ opacity: ysOp, left: ysX, top: ysY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Multiply merge */}
      <motion.div
        className={`${block} w-[22px] h-[34px] ${detected ? "bg-gradient-to-b from-pink-500 via-rose-500 to-orange-500 border-orange-300 shadow-[0_0_18px_rgba(249,115,22,0.5)]" : "bg-slate-600/50 border-slate-400/30"} border-2 rounded`}
        animate={{ opacity: mulOp, left: mulX, top: mulY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Output */}
      <motion.div
        className={`${block} w-[22px] h-[38px] ${detected ? "bg-gradient-to-b from-orange-500 to-orange-700 border-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.5)]" : "bg-slate-600/40 border-slate-400/30"} border-2 rounded`}
        animate={{ opacity: outOp, left: outX, top: outY, x: "-50%", y: "-50%" }}
        transition={T}
      />
    </>
  );
}
