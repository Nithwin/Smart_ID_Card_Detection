export function CoordPathLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="coordX" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="coordY" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#e11d48" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="coordMerge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      <g fill="none">
        {/* ── Input → branches ── */}
        <line x1="6" y1="50" x2="12" y2="50" stroke="#64748b" strokeWidth="0.8" vectorEffect="non-scaling-stroke" strokeDasharray="3 2" />

        {/* ── Branch up: X-Pool (horizontal pool) ── */}
        <path d="M 15 44 L 15 25 Q 15 22 18 22 L 27 22" stroke="url(#coordX)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {/* ── Branch down: Y-Pool (vertical pool) ── */}
        <path d="M 15 56 L 15 75 Q 15 78 18 78 L 27 78" stroke="url(#coordY)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

        {/* ── X-Pool → Concat ── */}
        <path d="M 35 22 Q 38 22 38 25 L 38 42" stroke="#ec4899" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {/* ── Y-Pool → Concat ── */}
        <path d="M 35 78 Q 38 78 38 75 L 38 58" stroke="#f43f5e" strokeWidth="1" vectorEffect="non-scaling-stroke" />

        {/* ── Concat → Conv+BN+Act ── */}
        <line x1="42" y1="50" x2="50" y2="50" stroke="url(#coordMerge)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

        {/* ── Conv → Split ── */}
        <line x1="58" y1="50" x2="64" y2="50" stroke="#fb923c" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

        {/* ── Split → X-Sigmoid (up) ── */}
        <path d="M 67 44 L 67 25 Q 67 22 70 22 L 76 22" stroke="#ec4899" strokeWidth="1.2" vectorEffect="non-scaling-stroke" strokeDasharray="3 1.5" />
        {/* ── Split → Y-Sigmoid (down) ── */}
        <path d="M 67 56 L 67 75 Q 67 78 70 78 L 76 78" stroke="#f43f5e" strokeWidth="1.2" vectorEffect="non-scaling-stroke" strokeDasharray="3 1.5" />

        {/* ── X-Sigmoid → Multiply ── */}
        <path d="M 82 22 Q 85 22 85 25 L 85 42" stroke="#ec4899" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {/* ── Y-Sigmoid → Multiply ── */}
        <path d="M 82 78 Q 85 78 85 75 L 85 58" stroke="#f43f5e" strokeWidth="1" vectorEffect="non-scaling-stroke" />

        {/* ── Multiply → Output ── */}
        <line x1="89" y1="50" x2="96" y2="50" stroke="#f97316" strokeWidth="1.8" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_3px_#f97316]" />

        {/* ── Skip connection (input identity) ── */}
        <path d="M 15 50 Q 15 92 30 92 L 80 92 Q 85 92 85 88 L 85 58" stroke="#64748b" strokeWidth="0.8" vectorEffect="non-scaling-stroke" strokeDasharray="4 2" opacity="0.4" />
      </g>
    </svg>
  );
}
