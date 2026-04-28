"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Box, FastForward, ShieldCheck, ShieldX, ArrowRight } from "lucide-react";

export default function NNTrainingVisualization() {
  const [phase, setPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scenario, setScenario] = useState<"detected" | "not_detected">("detected");

  const isDetected = scenario === "detected";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPhase((p) => {
          if (p >= 5) {
            setIsPlaying(false);
            return 5;
          }
          return p + 1;
        });
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const reset = () => {
    setPhase(0);
    setIsPlaying(false);
  };

  const phaseLabels = ['Input Image', 'Rasterization', 'Convolution', 'Pooling', 'Flattening', 'Result'];
  return (
    <div className="min-h-screen max-w-7xl mx-auto p-4 md:p-8 flex flex-col pt-8 md:pt-12 overflow-hidden page-animate">
      <div className={`pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full blur-3xl ${isDetected ? "bg-cyan-500/10" : "bg-red-500/10"}`} />
      <div className={`pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full blur-3xl ${isDetected ? "bg-emerald-500/10" : "bg-orange-500/10"}`} />

      <div className="text-center mb-6 md:mb-10 z-20 section-animate">
        <h1 className={`text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${isDetected ? 'from-emerald-400 to-cyan-500' : 'from-orange-400 to-red-500'} mb-3 drop-shadow-sm glow-text transition-all duration-500`}>
          Deep Learning 3D Visualizer
        </h1>
        <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto">
          Watch how a CNN processes an image through convolutions, pooling, and classification — for both compliant and non-compliant scenarios.
        </p>
      </div>

      {/* Scenario Toggle */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6 z-20 section-animate delay-1">
        <button
          onClick={() => { setScenario("detected"); reset(); }}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
            isDetected
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> ID Card Present
        </button>
        <button
          onClick={() => { setScenario("not_detected"); reset(); }}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
            !isDetected
              ? "bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
          }`}
        >
          <ShieldX className="w-4 h-4" /> No ID Card
        </button>
      </div>

      {/* Control Panel */}
      <div className="flex items-center justify-center gap-4 mb-6 relative z-20 section-animate delay-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
            isPlaying ? 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'PAUSE' : 'START SIMULATION'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Progress Timeline */}
      <div className="w-full max-w-3xl mx-auto mb-10 md:mb-16 relative z-20 section-animate delay-3">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-out ${isDetected ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}
            style={{ width: `${(phase / 5) * 100}%` }}
          ></div>
        </div>
        <div className="relative flex justify-between">
          {phaseLabels.map((label, idx) => (
            <div key={idx} className="flex flex-col items-center group cursor-pointer" onClick={() => setPhase(idx)}>
              <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-500 border-2 z-10 ${
                phase >= idx
                  ? (isDetected ? 'bg-cyan-400 border-cyan-200 shadow-[0_0_12px_#22d3ee]' : 'bg-red-400 border-red-200 shadow-[0_0_12px_#f87171]')
                  : 'bg-slate-900 border-slate-700'
              } ${phase === idx ? 'scale-150 animate-pulse' : ''}`}></div>
              <span className={`absolute -bottom-6 text-[8px] md:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${
                phase >= idx ? (isDetected ? 'text-cyan-400' : 'text-red-400') : 'text-slate-500'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Visualization Arena */}
      <div className="flex-1 relative w-full flex items-center justify-center min-h-[400px] md:min-h-[500px] section-animate delay-4" style={{perspective: '1200px'}}>

        {/* Phase 0: Regular Image */}
        <div className={`absolute transition-all duration-1000 ${
          phase === 0 ? 'opacity-100 scale-75 md:scale-100' :
          phase > 0 ? 'opacity-0 scale-50 -translate-y-32' : ''
        }`} style={{transformStyle: 'preserve-3d'}}>
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700 bg-slate-800 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900"></div>
            {/* Simulated person silhouette */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-600 border-2 border-slate-500"></div>
              <div className="absolute bottom-6 w-24 md:w-32 h-16 md:h-20 bg-slate-600 rounded-t-3xl border-2 border-slate-500 border-b-0"></div>
            </div>
            {isDetected && (
              <div className="absolute bottom-10 right-6 w-10 h-7 md:w-12 md:h-8 bg-yellow-500/60 border border-yellow-400 rounded-sm shadow-[0_0_10px_rgba(234,179,8,0.3)] flex items-center justify-center">
                <span className="text-[6px] text-yellow-200 font-bold">ID</span>
              </div>
            )}
            <div className={`absolute bottom-2 text-xs font-mono px-2 py-0.5 rounded ${isDetected ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
              {isDetected ? 'Person + ID Card' : 'Person Only (No Card)'}
            </div>
          </div>
        </div>

        {/* Phase 1: Grid / Rasterization */}
        <div className={`absolute transition-all duration-1000 ${
          phase === 1 ? 'opacity-100 scale-[0.6] md:scale-100' :
          phase === 0 ? 'opacity-0 scale-150 translate-y-32' :
          phase > 1 ? 'opacity-0 scale-75 -translate-y-48' : ''
        }`} style={{transformStyle: 'preserve-3d', transform: phase === 1 ? 'rotateX(50deg) rotateZ(10deg)' : ''}}>
          <div className={`w-[280px] h-[280px] md:w-[400px] md:h-[400px] grid grid-cols-[repeat(10,1fr)] grid-rows-[repeat(10,1fr)] gap-[1px] border relative shadow-[0_0_50px] ${
            isDetected ? 'bg-cyan-500/20 border-cyan-500/50 shadow-cyan-500/15' : 'bg-red-500/20 border-red-500/50 shadow-red-500/15'
          }`}>
            {[...Array(100)].map((_, i) => {
              const isCardPixel = isDetected && [67, 68, 77, 78, 87, 88].includes(i);
              return (
                <div key={i} className={`transition-all duration-500 hover:scale-110 ${
                  isCardPixel ? 'bg-yellow-500/60 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-slate-900/80 hover:bg-slate-700'
                }`}></div>
              );
            })}
            <div className={`absolute -left-10 top-1/2 -translate-y-1/2 font-mono text-xs -rotate-90 origin-center whitespace-nowrap ${isDetected ? 'text-cyan-500' : 'text-red-500'}`}>HEIGHT</div>
            <div className={`absolute -bottom-7 left-1/2 -translate-x-1/2 font-mono text-xs whitespace-nowrap ${isDetected ? 'text-cyan-500' : 'text-red-500'}`}>WIDTH</div>
            <div className={`absolute -top-8 left-1/2 -translate-x-1/2 font-mono text-sm font-bold tracking-widest ${isDetected ? 'text-cyan-400' : 'text-red-400'}`}>
              TENSOR [640, 640, 3]
            </div>
          </div>
        </div>

        {/* Phase 2: Convolution Filters */}
        <div className={`absolute transition-all duration-1000 ${
          phase === 2 ? 'opacity-100 scale-[0.6] md:scale-100' :
          phase < 2 ? 'opacity-0 scale-150 translate-y-48' :
          phase > 2 ? 'opacity-0 scale-50 -translate-y-64' : ''
        }`} style={{transformStyle: 'preserve-3d', transform: phase === 2 ? 'rotateX(50deg) rotateZ(-8deg)' : ''}}>
          <div className={`w-[280px] h-[280px] md:w-[400px] md:h-[400px] grid grid-cols-[repeat(10,1fr)] grid-rows-[repeat(10,1fr)] gap-[2px] border relative shadow-[0_0_80px] ${
            isDetected ? 'bg-purple-500/20 border-purple-500/50 shadow-purple-500/20' : 'bg-orange-500/10 border-orange-500/50 shadow-orange-500/10'
          }`}>
            {[...Array(100)].map((_, i) => {
              const litCells = isDetected ? [12,13,14,22,23,24,32,33,34,67,68,77,78] : [45,46,55,56];
              const isLit = litCells.includes(i);
              return (
                <div key={i} className={`transition-all duration-300 ${
                  isLit
                    ? (isDetected ? 'bg-purple-400 shadow-[0_0_15px_#a855f7] animate-pulse' : 'bg-orange-400/40 shadow-[0_0_8px_#fb923c]')
                    : 'bg-slate-900/90'
                }`}></div>
              );
            })}

            {/* Sliding Conv Filter */}
            <div className={`absolute top-[10%] left-[20%] w-[30%] h-[30%] border-4 bg-white/10 shadow-[0_0_20px] z-10 pointer-events-none animate-[slideFilter_3.5s_linear_infinite] ${
              isDetected ? 'border-white/80 shadow-white' : 'border-orange-300/60 shadow-orange-400'
            }`}>
              <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-1 opacity-60 gap-0.5">
                {[...Array(9)].map((_, j) => (
                  <div key={j} className="flex items-center justify-center text-[6px] text-white font-mono bg-white/20 rounded-sm">W</div>
                ))}
              </div>
            </div>

            {/* Feature Map Output */}
            {phase === 2 && (
              <div className={`absolute -right-36 md:-right-48 top-1/2 -translate-y-1/2 flex items-center gap-3`}>
                <ArrowRight className={`w-6 h-6 ${isDetected ? 'text-indigo-400' : 'text-orange-400'} animate-pulse`} />
                <div className={`w-24 h-24 md:w-32 md:h-32 border-2 flex items-center justify-center animate-fade-in-up ${
                  isDetected ? 'border-indigo-400 bg-indigo-500/30 shadow-[0_0_30px_#6366f1]' : 'border-orange-400 bg-orange-500/10 shadow-[0_0_15px_#f97316]'
                }`}>
                  <span className={`font-bold text-xs tracking-widest drop-shadow-md ${isDetected ? 'text-white' : 'text-orange-300'}`}>
                    {isDetected ? 'FEATURE MAP' : 'WEAK MAP'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phase 3: Max Pooling */}
        <div className={`absolute transition-all duration-1000 ${
          phase === 3 ? 'opacity-100 scale-[0.65] md:scale-100' :
          phase < 3 ? 'opacity-0 scale-50 translate-y-32' :
          phase > 3 ? 'opacity-0 scale-0 -translate-y-24' : ''
        }`} style={{transformStyle: 'preserve-3d', transform: phase === 3 ? 'rotateX(45deg)' : ''}}>
          <div className="flex items-center gap-8 md:gap-16">
            <div className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] grid grid-cols-4 grid-rows-4 gap-1 p-1 bg-slate-800 border-2 border-slate-600 relative">
              {[...Array(16)].map((_, i) => {
                const vals = [9,3,1,7,2,8,4,6,5,1,3,9,7,2,8,4];
                const isMax = [0,5,11,12].includes(i);
                return (
                  <div key={i} className={`flex items-center justify-center text-[10px] border border-slate-700/50 font-mono ${
                    isMax
                      ? (isDetected ? 'bg-rose-500/30 text-rose-300 font-bold' : 'bg-orange-500/30 text-orange-300 font-bold')
                      : 'text-slate-500'
                  }`}>{vals[i]}</div>
                );
              })}
              <div className={`absolute top-1 left-1 w-[calc(50%-0.15rem)] h-[calc(50%-0.15rem)] border-2 z-10 animate-pulse ${
                isDetected ? 'border-rose-400 bg-rose-500/10 shadow-[0_0_15px_#f43f5e]' : 'border-orange-400 bg-orange-500/10 shadow-[0_0_15px_#f97316]'
              }`}></div>
            </div>

            <FastForward className={`w-8 h-8 md:w-12 md:h-12 mx-2 md:mx-4 opacity-50 ${isDetected ? 'text-rose-500' : 'text-orange-500'}`} />

            <div className={`w-[70px] h-[70px] md:w-[100px] md:h-[100px] grid grid-cols-2 grid-rows-2 gap-1 p-1 bg-slate-800 border-2 shadow-[0_0_30px] relative ${
              isDetected ? 'border-rose-500 shadow-rose-500/30' : 'border-orange-500 shadow-orange-500/30'
            }`}>
              <div className={`flex items-center justify-center font-bold text-sm shadow-inner font-mono ${isDetected ? 'bg-rose-500/80 text-white' : 'bg-orange-500/60 text-white'}`}>9</div>
              <div className="flex items-center justify-center bg-slate-700 text-slate-400 text-sm font-mono">8</div>
              <div className="flex items-center justify-center bg-slate-700 text-slate-400 text-sm font-mono">9</div>
              <div className="flex items-center justify-center bg-slate-700 text-slate-400 text-sm font-mono">8</div>
            </div>
          </div>
          <div className={`absolute -bottom-12 md:-bottom-16 left-1/2 -translate-x-1/2 font-mono tracking-widest text-sm md:text-lg ${isDetected ? 'text-rose-400 drop-shadow-[0_0_5px_#f43f5e]' : 'text-orange-400 drop-shadow-[0_0_5px_#f97316]'}`}>
            DOWNSAMPLING (2&times;2 MAX POOL)
          </div>
        </div>

        {/* Phase 4: Flattening */}
        <div className={`absolute transition-all duration-1000 flex flex-col items-center ${
          phase === 4 ? 'opacity-100 scale-[0.7] md:scale-100 translate-y-0' :
          'opacity-0 scale-0 translate-y-64'
        }`} style={{transformStyle: 'preserve-3d'}}>
          <div className="flex items-end gap-8 md:gap-16">
            <div className="relative w-24 h-24 md:w-32 md:h-32" style={{transformStyle: 'preserve-3d', transform: 'rotateX(55deg) rotateZ(45deg)'}}>
              <div className={`absolute inset-0 border ${isDetected ? 'bg-blue-500/20 border-blue-400' : 'bg-red-500/10 border-red-400/50'}`}></div>
              <div className={`absolute inset-0 border ${isDetected ? 'bg-indigo-500/20 border-indigo-400' : 'bg-orange-500/10 border-orange-400/50'}`} style={{transform: 'translateZ(20px)'}}></div>
              <div className={`absolute inset-0 border ${isDetected ? 'bg-purple-500/20 border-purple-400' : 'bg-red-500/10 border-red-400/30'}`} style={{transform: 'translateZ(40px)'}}></div>
              <div className={`absolute inset-0 border ${isDetected ? 'bg-fuchsia-500/20 border-fuchsia-400' : 'bg-orange-500/5 border-orange-400/30'}`} style={{transform: 'translateZ(60px)'}}></div>
            </div>

            <ArrowRight className={`w-8 h-8 ${isDetected ? 'text-cyan-400' : 'text-red-400'} animate-pulse`} />

            <div className="flex flex-col gap-1 transform translate-y-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`w-6 md:w-8 h-1.5 md:h-2 rounded-full border animate-pulse ${
                  isDetected ? 'border-cyan-500/50 shadow-[0_0_10px_#22d3ee]' : 'border-red-500/50 shadow-[0_0_10px_#ef4444]'
                }`} style={{
                  animationDelay: `${i * 0.1}s`,
                  backgroundColor: isDetected
                    ? (i % 3 === 0 ? 'rgba(34,211,238,0.8)' : 'rgba(34,211,238,0.2)')
                    : (i % 4 === 0 ? 'rgba(248,113,113,0.8)' : 'rgba(248,113,113,0.15)')
                }}></div>
              ))}
            </div>
          </div>

          <div className="mt-12 md:mt-20">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-800/80 border shadow-[0_0_20px] ${
              isDetected ? 'border-cyan-500/50 shadow-cyan-800' : 'border-red-500/50 shadow-red-900'
            }`}>
              <Box className={`w-5 h-5 ${isDetected ? 'text-cyan-400' : 'text-red-400'}`} />
              <span className={`font-bold tracking-widest text-xs md:text-sm ${isDetected ? 'text-cyan-400' : 'text-red-400'}`}>FLATTEN &rarr; FULLY CONNECTED</span>
            </div>
          </div>
        </div>

        {/* Phase 5: Result */}
        <div className={`absolute transition-all duration-1000 flex flex-col items-center ${
          phase === 5 ? 'opacity-100 scale-[0.8] md:scale-100 translate-y-0' : 'opacity-0 scale-0 translate-y-32'
        }`}>
          <div className={`relative w-56 h-56 md:w-64 md:h-64 border-2 rounded-2xl flex items-center justify-center flex-col overflow-hidden ${
            isDetected ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'
          }`}>
            <div className={`absolute inset-x-0 bottom-0 w-full animate-[grow_1s_ease-out_forwards] ${isDetected ? 'bg-green-500/20' : 'bg-red-500/20'}`} style={{height: '90%'}}></div>

            {isDetected ? (
              <>
                <CheckCircleIcon className="w-16 h-16 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)] relative z-10 mb-3 animate-bounce" />
                <span className="font-mono text-xl font-bold text-white relative z-10 drop-shadow-md">COMPLIANT</span>
                <span className="font-mono text-xs text-green-300 relative z-10 mt-1">ID CARD DETECTED • CONF: 0.95</span>
                <div className="mt-3 flex gap-2 relative z-10">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-[10px] font-mono border border-blue-500/30">person</span>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-[10px] font-mono border border-yellow-500/30">id_card</span>
                </div>
              </>
            ) : (
              <>
                <XCircleIcon className="w-16 h-16 text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)] relative z-10 mb-3 animate-pulse" />
                <span className="font-mono text-xl font-bold text-white relative z-10 drop-shadow-md">NON-COMPLIANT</span>
                <span className="font-mono text-xs text-red-300 relative z-10 mt-1">NO ID CARD DETECTED</span>
                <div className="mt-3 flex gap-2 relative z-10">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-[10px] font-mono border border-blue-500/30">person</span>
                  <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-[10px] font-mono border border-red-500/30 line-through">id_card</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideFilter {
          0% { top: 0; left: 0; }
          25% { top: 0; left: 60%; }
          50% { top: 35%; left: 60%; }
          75% { top: 35%; left: 0; }
          100% { top: 60%; left: 60%; }
        }
        @keyframes grow { 0% { height: 0%; } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}} />
    </div>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
