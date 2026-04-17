import { motion } from "framer-motion";

export function DecoupledLiveTensors() {
  return (
    <>
      <motion.div className="absolute w-[12px] h-[12px] bg-white rounded shadow-[0_0_15px_#fff,0_0_30px_#ec4899] z-30" style={{ x: "-50%", y: "-50%" }} animate={{ top: ["19%", "35%", "40%", "40%", "45%", "50%"], left: ["50%", "50%", "50%", "30%", "25%", "25%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
      <motion.div className="absolute w-[12px] h-[12px] bg-white rounded shadow-[0_0_15px_#fff,0_0_30px_#ef4444] z-30" style={{ x: "-50%", y: "-50%" }} animate={{ top: ["19%", "35%", "40%", "40%", "45%", "50%"], left: ["50%", "50%", "50%", "70%", "75%", "75%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.3 }} />
    </>
  );
}
