import { motion } from "framer-motion";

export function DecoupledPaths() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Main stem down */}
      <path d="M 50 19 L 50 35" stroke="#64748b" strokeWidth="1" strokeDasharray="3 2" vectorEffect="non-scaling-stroke" />
      
      {/* Fork to Classification (Left) */}
      <path d="M 50 35 Q 50 40 45 40 L 30 40 Q 25 40 25 45 L 25 50" stroke="#ec4899" strokeWidth="2.5" fill="none" className="drop-shadow-[0_0_5px_#ec4899]" vectorEffect="non-scaling-stroke" />
      
      {/* Fork to Regression (Right) */}
      <path d="M 50 35 Q 50 40 55 40 L 70 40 Q 75 40 75 45 L 75 50" stroke="#ef4444" strokeWidth="2.5" fill="none" className="drop-shadow-[0_0_5px_#ef4444]" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
