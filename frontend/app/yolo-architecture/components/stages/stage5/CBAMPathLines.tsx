export function CBAMPathLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cbamChannel" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#eab308" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="cbamSpatial" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#eab308" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#84cc16" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      <g fill="none">
        {/* ── INPUT → CHANNEL ATTENTION BLOCK ── */}
        <line x1="5" y1="40" x2="14" y2="40" stroke="#64748b" strokeWidth="0.8" vectorEffect="non-scaling-stroke" strokeDasharray="3 2" />

        {/* ── Channel Attention internal: Input → AvgPool/MaxPool (branch up/down) ── */}
        {/* Top branch: AvgPool */}
        <path d="M 18 35 L 18 22 L 30 22" stroke="url(#cbamChannel)" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="3 1.5" />
        {/* Bottom branch: MaxPool */}
        <path d="M 18 45 L 18 58 L 30 58" stroke="url(#cbamChannel)" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="3 1.5" />
        {/* AvgPool → MLP */}
        <line x1="37" y1="22" x2="42" y2="22" stroke="#f59e0b" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {/* MaxPool → MLP (shared) */}
        <line x1="37" y1="58" x2="42" y2="58" stroke="#f59e0b" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {/* MLP top merge → Sigmoid */}
        <path d="M 48 22 L 48 35 Q 48 40 50 40 L 54 40" stroke="#f59e0b" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {/* MLP bottom merge → Sigmoid */}
        <path d="M 48 58 L 48 45 Q 48 40 50 40" stroke="#f59e0b" strokeWidth="1" vectorEffect="non-scaling-stroke" />

        {/* ── Sigmoid → Channel Scale (×) ── */}
        <line x1="58" y1="40" x2="63" y2="40" stroke="#eab308" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

        {/* ── Multiply → Spatial Attention ── */}
        <line x1="67" y1="40" x2="73" y2="40" stroke="url(#cbamSpatial)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

        {/* ── Spatial Attention internal: branch up/down for pool ── */}
        <path d="M 76 35 L 76 25 L 82 25" stroke="#84cc16" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="3 1.5" />
        <path d="M 76 45 L 76 55 L 82 55" stroke="#84cc16" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="3 1.5" />
        {/* Pool → Conv merge */}
        <path d="M 86 25 L 88 25 L 88 35 Q 88 40 90 40" stroke="#84cc16" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M 86 55 L 88 55 L 88 45 Q 88 40 90 40" stroke="#84cc16" strokeWidth="1" vectorEffect="non-scaling-stroke" />

        {/* ── Conv → Sigmoid → Spatial Scale (×) → Output ── */}
        <line x1="93" y1="40" x2="98" y2="40" stroke="#84cc16" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}
