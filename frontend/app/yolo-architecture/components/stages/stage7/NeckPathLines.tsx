export function NeckPathLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <marker id="arrowFPN" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="rgba(16, 185, 129, 0.6)" />
        </marker>
        <marker id="arrowPAN" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="rgba(20, 184, 166, 0.6)" />
        </marker>
      </defs>

      <g fill="none">
        {/* Backbone to FPN */}
        <line x1="15" y1="20" x2="35" y2="20" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="15" y1="50" x2="35" y2="50" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="15" y1="80" x2="35" y2="80" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1" strokeDasharray="2 2" />

        {/* Top-Down FPN (Upsample) */}
        <path d="M 40 25 L 40 45" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrowFPN)" />
        <path d="M 40 55 L 40 75" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrowFPN)" />

        {/* FPN to PAN */}
        <line x1="45" y1="20" x2="65" y2="20" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="45" y1="50" x2="65" y2="50" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="45" y1="80" x2="65" y2="80" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="1" strokeDasharray="2 2" />

        {/* Bottom-Up PAN (Downsample) */}
        <path d="M 70 75 L 70 55" stroke="#14b8a6" strokeWidth="1.5" markerEnd="url(#arrowPAN)" />
        <path d="M 70 45 L 70 25" stroke="#14b8a6" strokeWidth="1.5" markerEnd="url(#arrowPAN)" />

        {/* PAN to Outputs */}
        <line x1="75" y1="20" x2="85" y2="20" stroke="#14b8a6" strokeWidth="1.5" />
        <line x1="75" y1="50" x2="85" y2="50" stroke="#14b8a6" strokeWidth="1.5" />
        <line x1="75" y1="80" x2="85" y2="80" stroke="#14b8a6" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
