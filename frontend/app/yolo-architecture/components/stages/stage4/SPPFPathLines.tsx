export function SPPFPathLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sppfMain" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="sppfSkip1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="sppfSkip2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="sppfSkip3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      <g fill="none">
        {/* ══ MAIN TOP PIPELINE ══ */}
        {/* Input → Conv1 */}
        <line x1="6" y1="40" x2="14" y2="40" stroke="#64748b" strokeWidth="0.8" vectorEffect="non-scaling-stroke" strokeDasharray="3 2" />
        {/* Conv1 → MaxPool1 */}
        <line x1="24" y1="40" x2="32" y2="40" stroke="url(#sppfMain)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {/* MaxPool1 → MaxPool2 */}
        <line x1="44" y1="40" x2="50" y2="40" stroke="#f97316" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {/* MaxPool2 → MaxPool3 */}
        <line x1="62" y1="40" x2="68" y2="40" stroke="#ea580c" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

        {/* ══ SKIP CONNECTIONS (smooth curves down to concat) ══ */}
        {/* Conv1 → Concat (identity) */}
        <path d="M 19 47 L 19 82 Q 19 85 22 85 L 82 85 Q 85 85 85 82 L 85 72" stroke="url(#sppfSkip1)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="4 2" />
        {/* MaxPool1 → Concat */}
        <path d="M 38 47 L 38 72 Q 38 75 41 75 L 82 75 Q 85 75 85 72 L 85 65" stroke="url(#sppfSkip2)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="4 2" />
        {/* MaxPool2 → Concat */}
        <path d="M 56 47 L 56 62 Q 56 65 59 65 L 82 65 Q 85 65 85 62 L 85 58" stroke="url(#sppfSkip3)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="4 2" />
        {/* MaxPool3 → Concat (direct) */}
        <path d="M 78 40 Q 82 40 82 43 L 82 48 Q 82 50 85 50" stroke="#c2410c" strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0.7" />

        {/* ══ CONCAT → Conv2 ══ */}
        <line x1="89" y1="60" x2="94" y2="60" stroke="#fbbf24" strokeWidth="2" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_4px_#fbbf24]" />
      </g>
    </svg>
  );
}
