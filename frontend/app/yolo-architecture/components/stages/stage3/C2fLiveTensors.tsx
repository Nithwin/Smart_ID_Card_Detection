"use client";

import { motion } from "framer-motion";

export function C2fLiveTensors() {
  const TIMES = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const DURATION = 10; // 10s loop

  const TENSOR_PROPS = {
    duration: DURATION,
    times: TIMES,
    ease: "linear" as const,
    repeat: Infinity,
  };

  const inOp = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const inX = ["5%", "20%", "20%", "20%", "20%", "20%", "20%", "20%", "20%", "20%", "20%"];
  const inY = ["50%", "50%", "50%", "50%", "50%", "50%", "50%", "50%", "50%", "50%", "50%"];

  const ch0Op = [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0];
  const ch0X = ["20%", "20%", "30%", "45%", "60%", "75%", "75%", "80%", "80%", "80%", "80%"];
  const ch0Y = ["50%", "50%", "20%", "20%", "20%", "20%", "20%", "30%", "30%", "30%", "30%"];

  const ch1Op = [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0];
  const ch1X = ["20%", "20%", "30%", "40%", "40%", "40%", "40%", "40%", "40%", "40%", "40%"];
  const ch1Y = ["50%", "50%", "75%", "75%", "75%", "75%", "75%", "75%", "75%", "75%", "75%"];

  const ch1aOp = [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0];
  const ch1aX = ["40%", "40%", "40%", "40%", "50%", "60%", "70%", "80%", "80%", "80%", "80%"];
  const ch1aY = ["75%", "75%", "75%", "75%", "62.5%", "50%", "50%", "50%", "50%", "50%", "50%"];

  const ch1bOp = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0];
  const ch1bX = ["40%", "40%", "40%", "40%", "50%", "60%", "60%", "60%", "60%", "60%", "60%"];
  const ch1bY = ["75%", "75%", "75%", "75%", "75%", "75%", "75%", "75%", "75%", "75%", "75%"];

  const ch1cOp = [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0];
  const ch1cX = ["60%", "60%", "60%", "60%", "60%", "60%", "70%", "80%", "80%", "80%", "80%"];
  const ch1cY = ["75%", "75%", "75%", "75%", "75%", "75%", "70%", "70%", "70%", "70%", "70%"];

  const outOp = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0];
  const outX = ["80%", "80%", "80%", "80%", "80%", "80%", "80%", "80%", "92%", "110%", "110%"];
  const outY = ["50%", "50%", "50%", "50%", "50%", "50%", "50%", "50%", "50%", "50%", "50%"];
  const outHeight = ["100px", "100px", "100px", "100px", "100px", "100px", "100px", "100px", "60px", "60px", "60px"];
  const outLabel = ["192ch", "192ch", "192ch", "192ch", "192ch", "192ch", "192ch", "192ch", "128ch", "128ch", "128ch"];

  return (
    <>
      <motion.div
        className="absolute w-[40px] h-[80px] bg-slate-700 border-2 border-slate-500 rounded-lg shadow-xl flex items-center justify-center origin-center z-30"
        animate={{ opacity: inOp, left: inX, top: inY, x: "-50%", y: "-50%" }}
        transition={TENSOR_PROPS}
      >
        <span className="text-[10px] font-mono font-bold text-slate-300 rotate-[-90deg]">128ch</span>
      </motion.div>

      <motion.div
        className="absolute w-[40px] h-[40px] bg-blue-600 border-2 border-blue-400 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center z-30"
        animate={{ opacity: ch0Op, left: ch0X, top: ch0Y, x: "-50%", y: "-50%" }}
        transition={TENSOR_PROPS}
      >
        <span className="text-[9px] font-mono font-bold text-white">64ch</span>
      </motion.div>

      <motion.div
        className="absolute w-[40px] h-[40px] bg-purple-700 border-2 border-purple-400 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.6)] flex items-center justify-center z-30"
        animate={{ opacity: ch1Op, left: ch1X, top: ch1Y, x: "-50%", y: "-50%" }}
        transition={TENSOR_PROPS}
      >
        <span className="text-[9px] font-mono font-bold text-white">64ch</span>
      </motion.div>

      <motion.div
        className="absolute w-[40px] h-[40px] bg-purple-500 border-2 border-purple-300 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center z-30"
        animate={{ opacity: ch1aOp, left: ch1aX, top: ch1aY, x: "-50%", y: "-50%" }}
        transition={TENSOR_PROPS}
      >
        <span className="text-[8px] font-mono font-bold text-white">64ch</span>
      </motion.div>

      <motion.div
        className="absolute w-[40px] h-[40px] bg-fuchsia-700 border-2 border-fuchsia-400 rounded-lg shadow-[0_0_20px_rgba(217,70,239,0.6)] flex items-center justify-center z-30"
        animate={{ opacity: ch1bOp, left: ch1bX, top: ch1bY, x: "-50%", y: "-50%" }}
        transition={TENSOR_PROPS}
      >
        <span className="text-[9px] font-mono font-bold text-white">64ch</span>
      </motion.div>

      <motion.div
        className="absolute w-[40px] h-[40px] bg-fuchsia-500 border-2 border-fuchsia-300 rounded-lg shadow-[0_0_15px_rgba(217,70,239,0.4)] flex items-center justify-center z-30"
        animate={{ opacity: ch1cOp, left: ch1cX, top: ch1cY, x: "-50%", y: "-50%" }}
        transition={TENSOR_PROPS}
      >
        <span className="text-[8px] font-mono font-bold text-white">64ch</span>
      </motion.div>

      <motion.div
        className="absolute w-[40px] bg-[#d946ef] border-2 border-pink-300 rounded-lg shadow-[0_0_30px_rgba(217,70,239,0.8)] flex items-center justify-center z-40 overflow-hidden"
        animate={{ opacity: outOp, left: outX, top: outY, height: outHeight, x: "-50%", y: "-50%" }}
        transition={TENSOR_PROPS}
      >
        <div className="absolute inset-0 bg-white/20" />
        <motion.span 
           className="text-[11px] font-mono font-black text-white rotate-[-90deg] whitespace-nowrap z-10"
           animate={{ height: outLabel }}
           transition={TENSOR_PROPS}
        >
           Output
        </motion.span>
      </motion.div>
    </>
  );
}
