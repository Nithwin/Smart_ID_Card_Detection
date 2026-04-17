"use client";

import { ShieldCheck, ShieldX } from "lucide-react";

interface Props {
  scenario: "detected" | "not_detected";
  onChange: (s: "detected" | "not_detected") => void;
}

export function ScenarioToggle({ scenario, onChange }: Props) {
  const isDetected = scenario === "detected";
  return (
    <div className="flex items-center gap-3 z-20">
      <button
        onClick={() => onChange("detected")}
        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
          isDetected
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
        }`}
      >
        <ShieldCheck className="w-4 h-4" /> With ID Card
      </button>
      <button
        onClick={() => onChange("not_detected")}
        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
          !isDetected
            ? "bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
        }`}
      >
        <ShieldX className="w-4 h-4" /> No ID Card
      </button>
    </div>
  );
}
