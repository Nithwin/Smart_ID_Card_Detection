export function C2fPathLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="highway" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="bottleneck" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#d946ef" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* Polyline tracks (exact match to keyframes) */}
      <polyline points="5,50 20,50" fill="none" stroke="#64748b" strokeWidth="0.5" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
      
      {/* Identity Track */}
      <polyline points="20,50 30,20 75,20 80,30" fill="none" stroke="url(#highway)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="opacity-80 drop-shadow-[0_0_5px_#3b82f6]" />
      
      {/* Split to B1 */}
      <polyline points="20,50 30,75 40,75" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
      
      {/* B1 to Concat */}
      <polyline points="40,75 50,62.5 60,50 80,50" fill="none" stroke="#c084fc" strokeWidth="1" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
      
      {/* B1 to B2 */}
      <polyline points="40,75 60,75" fill="none" stroke="url(#bottleneck)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      
      {/* B2 to Concat */}
      <polyline points="60,75 70,70 80,70" fill="none" stroke="#d946ef" strokeWidth="1" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />

      {/* Concat Output */}
      <polyline points="80,50 110,50" fill="none" stroke="#d946ef" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
