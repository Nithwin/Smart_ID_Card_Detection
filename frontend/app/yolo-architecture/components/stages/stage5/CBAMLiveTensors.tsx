import { motion, Transition } from "framer-motion";

interface Props {
  scenario: "detected" | "not_detected";
}

export function CBAMLiveTensors({ scenario }: Props) {
  const detected = scenario === "detected";
  const TIMES = [0, 0.08, 0.16, 0.24, 0.32, 0.42, 0.52, 0.62, 0.72, 0.82, 0.90, 1.0];
  const DURATION = 8;

  const T: Transition = {
    duration: DURATION,
    times: TIMES,
    ease: "linear" as const,
    repeat: Infinity,
  };

  // ═══ CHANNEL ATTENTION PHASE ═══
  // Input → splits into AvgPool (top) and MaxPool (bottom) → merge at MLP → Sigmoid → ×
  // ═══ SPATIAL ATTENTION PHASE ═══  
  // Scaled input → splits into AvgPool (top) and MaxPool (bottom) → merge at Conv → ×

  // Input entering
  const inOp = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const inX  = ["2%","11%","18%","18%","18%","18%","18%","18%","18%","18%","18%","18%"];
  const inY  = ["40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%"];

  // Channel: AvgPool branch (top)
  const cAvgOp = [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
  const cAvgX  = ["18%","18%","18%","30%","33%","33%","33%","33%","33%","33%","33%","33%"];
  const cAvgY  = ["40%","40%","35%","22%","22%","22%","22%","22%","22%","22%","22%","22%"];

  // Channel: MaxPool branch (bottom)
  const cMaxOp = [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
  const cMaxX  = ["18%","18%","18%","30%","33%","33%","33%","33%","33%","33%","33%","33%"];
  const cMaxY  = ["40%","40%","45%","58%","58%","58%","58%","58%","58%","58%","58%","58%"];

  // Channel: Both → MLP → Sigmoid → Multiply
  const cMergeOp = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0];
  const cMergeX  = ["37%","37%","37%","37%","42%","55%","56%","56%","56%","56%","56%","56%"];
  const cMergeY  = ["40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%"];

  // Channel-scaled data → moving to spatial section
  const csOp = [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
  const csX  = ["65%","65%","65%","65%","65%","65%","65%","76%","76%","76%","76%","76%"];
  const csY  = ["40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%"];

  // Spatial: AvgPool branch (top)
  const sAvgOp = [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0];
  const sAvgX  = ["76%","76%","76%","76%","76%","76%","76%","76%","84%","84%","84%","84%"];
  const sAvgY  = ["40%","40%","40%","40%","40%","40%","40%","35%","25%","25%","25%","25%"];

  // Spatial: MaxPool branch (bottom)
  const sMaxOp = [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0];
  const sMaxX  = ["76%","76%","76%","76%","76%","76%","76%","76%","84%","84%","84%","84%"];
  const sMaxY  = ["40%","40%","40%","40%","40%","40%","40%","45%","55%","55%","55%","55%"];

  // Spatial: merge → Conv → Sigmoid → Output
  const sMergeOp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0];
  const sMergeX  = ["88%","88%","88%","88%","88%","88%","88%","88%","88%","91%","98%","100%"];
  const sMergeY  = ["40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%","40%"];

  const block = "absolute flex items-center justify-center z-30";
  return (
    <>
      {/* Input */}
      <motion.div
        className={`${block} w-[22px] h-[34px] bg-slate-600 border-2 border-slate-400 rounded shadow-[0_0_10px_rgba(148,163,184,0.3)]`}
        animate={{ opacity: inOp, left: inX, top: inY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Channel: AvgPool track */}
      <motion.div
        className={`${block} w-[16px] h-[22px] ${detected ? "bg-amber-500 border-amber-300" : "bg-red-500/50 border-red-400/50"} border rounded shadow-[0_0_10px_${detected ? "rgba(245,158,11,0.4)" : "rgba(239,68,68,0.3)"}]`}
        animate={{ opacity: cAvgOp, left: cAvgX, top: cAvgY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Channel: MaxPool track */}
      <motion.div
        className={`${block} w-[16px] h-[22px] ${detected ? "bg-amber-600 border-amber-400" : "bg-red-600/50 border-red-400/50"} border rounded shadow-[0_0_10px_${detected ? "rgba(217,119,6,0.4)" : "rgba(239,68,68,0.3)"}]`}
        animate={{ opacity: cMaxOp, left: cMaxX, top: cMaxY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Channel: MLP → Sigmoid merge tensor */}
      <motion.div
        className={`${block} w-[20px] h-[28px] ${detected ? "bg-yellow-500 border-yellow-300 shadow-[0_0_14px_rgba(234,179,8,0.5)]" : "bg-red-400/40 border-red-300/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]"} border-2 rounded`}
        animate={{ opacity: cMergeOp, left: cMergeX, top: cMergeY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Channel-scaled → Spatial */}
      <motion.div
        className={`${block} w-[22px] h-[34px] ${detected ? "bg-gradient-to-b from-amber-500 to-yellow-600 border-yellow-300 shadow-[0_0_16px_rgba(234,179,8,0.5)]" : "bg-gradient-to-b from-red-400/40 to-red-500/40 border-red-300/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]"} border-2 rounded`}
        animate={{ opacity: csOp, left: csX, top: csY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Spatial: AvgPool track */}
      <motion.div
        className={`${block} w-[14px] h-[18px] ${detected ? "bg-lime-500 border-lime-300 shadow-[0_0_10px_rgba(132,204,22,0.4)]" : "bg-red-400/30 border-red-300/30"} border rounded`}
        animate={{ opacity: sAvgOp, left: sAvgX, top: sAvgY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Spatial: MaxPool track */}
      <motion.div
        className={`${block} w-[14px] h-[18px] ${detected ? "bg-lime-600 border-lime-400 shadow-[0_0_10px_rgba(101,163,13,0.4)]" : "bg-red-500/30 border-red-400/30"} border rounded`}
        animate={{ opacity: sMaxOp, left: sMaxX, top: sMaxY, x: "-50%", y: "-50%" }}
        transition={T}
      />

      {/* Spatial: Conv merge → Output */}
      <motion.div
        className={`${block} w-[22px] h-[34px] ${detected ? "bg-gradient-to-b from-lime-500 to-green-600 border-lime-300 shadow-[0_0_18px_rgba(132,204,22,0.5)]" : "bg-gradient-to-b from-red-400/30 to-red-500/30 border-red-300/30"} border-2 rounded`}
        animate={{ opacity: sMergeOp, left: sMergeX, top: sMergeY, x: "-50%", y: "-50%" }}
        transition={T}
      />
    </>
  );
}
