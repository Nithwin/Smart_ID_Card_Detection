"use client";

import { useEffect, useState } from "react";
import { Brain, Layers, Crosshair, Target, Image as ImageIcon, Maximize, ShieldCheck, ShieldX } from "lucide-react";

export default function YoloPipelineFlow() {
  const [pipelineState, setPipelineState] = useState(0);
  const [scenario, setScenario] = useState<"detected" | "not_detected">("detected");

  useEffect(() => {
    const sequenceLength = 6;
    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % sequenceLength;
      setPipelineState(current);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const isDetected = scenario === "detected";

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col items-center">
      <div className="text-center mb-8 md:mb-16 animate-fade-in-up">
        <h1 className="text-3xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 pb-2">
          CA-YOLOv8 Live Pipeline
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto mt-4 text-sm md:text-lg">
          Watch how our neural network processes raw image data step-by-step into a highly precise Smart ID compliance decision.
        </p>
      </div>

      {/* Scenario Toggle */}
      <div className="flex items-center gap-3 mb-8 z-20">
        <button
          onClick={() => setScenario("detected")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
            isDetected
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> ID Card Detected
        </button>
        <button
          onClick={() => setScenario("not_detected")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
            !isDetected
              ? "bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
          }`}
        >
          <ShieldX className="w-4 h-4" /> No ID Card
        </button>
      </div>

      <div className="relative w-full max-w-5xl h-auto min-h-[500px] md:h-[600px] glass-panel rounded-3xl p-4 md:p-8 overflow-hidden flex flex-col items-center justify-center">

        {/* Background Grid */}
        <div className="absolute inset-0 z-0 h-full w-full opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-blue-500" />
          </svg>
          <div className="absolute top-0 w-px h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] left-1/4 animate-[fall_3s_linear_infinite]"></div>
          <div className="absolute top-0 w-px h-full bg-purple-500 shadow-[0_0_10px_#a855f7] left-3/4 animate-[fall_5s_linear_infinite_1s]"></div>
        </div>

        {/* SVG Pipeline Track */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <svg className="w-full h-1/2 overflow-visible" viewBox="0 0 1000 200">
            <path d="M 100,100 C 300,100 300,50 500,50 C 700,50 700,150 900,150" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
            <path
              d="M 100,100 C 300,100 300,50 500,50 C 700,50 700,150 900,150"
              fill="none"
              stroke={isDetected ? "url(#gradientGreen)" : "url(#gradientRed)"}
              strokeWidth="6" strokeLinecap="round" strokeDasharray="20 10"
              className="animate-[flow_1s_linear_infinite]"
              opacity={pipelineState > 0 ? "0.8" : "0.2"}
            />
            <circle r="8" fill={isDetected ? "#4ade80" : "#f87171"} filter="url(#glow)">
              <animateMotion
                dur="4.5s" repeatCount="indefinite"
                path="M 100,100 C 300,100 300,50 500,50 C 700,50 700,150 900,150"
                keyPoints={pipelineState === 0 ? "0;0.2" : pipelineState === 1 ? "0.2;0.4" : pipelineState === 2 ? "0.4;0.6" : pipelineState === 3 ? "0.6;0.8" : "0.8;1.0"}
                keyTimes="0;1" calcMode="linear" fill="freeze"
              />
            </circle>
            <defs>
              <linearGradient id="gradientGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" /><stop offset="50%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="gradientRed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" /><stop offset="50%" stopColor="#f97316" /><stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
          </svg>
        </div>

        {/* Pipeline Nodes */}
        <div className="relative z-20 w-full flex flex-wrap md:flex-nowrap items-center justify-between gap-2 px-2 md:px-10 mt-8 md:mt-16">
          <PipelineNode title="Raw Input" icon={<ImageIcon />} active={pipelineState === 0} passed={pipelineState > 0} color="blue" description="Incoming 640px surveillance frame." />
          <PipelineNode title="Backbone" icon={<Layers />} active={pipelineState === 1} passed={pipelineState > 1} color="indigo" description="CSPDarknet extracts multi-scale feature pyramids from raw pixels." />
          <PipelineNode title="CBAM" icon={<Brain />} active={pipelineState === 2} passed={pipelineState > 2} color="purple" description={isDetected ? "Channel + Spatial gates amplify card edge features." : "Attention gates find no strong card-like edge patterns."} />
          <PipelineNode title="Coord. Att." icon={<Crosshair />} active={pipelineState === 3} passed={pipelineState > 3} color="pink" description={isDetected ? "X-Y directional pooling maps Person + Card spatial context." : "Spatial decomposition finds person but no card co-location."} />
          <PipelineNode title="P2 Head" icon={<Target />} active={pipelineState === 4} passed={pipelineState > 4} color="emerald" description="160×160 stride-4 micro detection head targets small objects." />
          <PipelineNode title="Decision" icon={<Maximize />} active={pipelineState === 5} passed={pipelineState > 5} color={isDetected ? "green" : "red"} description={isDetected ? "Bounding boxes drawn. Compliance confirmed." : "No ID card bbox found. Non-compliant."} />
        </div>

        {/* Center Stage Visualization */}
        <div className="relative z-30 mt-8 md:mt-20 w-full max-w-2xl h-48 md:h-64 border border-white/10 rounded-2xl bg-black/40 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden">

          {pipelineState === 0 && (
            <div className="w-full h-full flex items-center justify-center animate-fade-in-up">
              <div className="relative w-48 h-32 rounded bg-slate-800 border-2 border-slate-600 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/20 mix-blend-screen opacity-50 animate-pulse"></div>
                <div className="w-[80%] h-[1px] bg-blue-500/50 absolute top-1/2 animate-[scan_2s_linear_infinite]"></div>
                <span className="font-mono text-xs text-blue-400 font-bold tracking-widest relative z-10 bg-black/50 px-2 py-1 rounded">IMAGE[640,640,3]</span>
              </div>
            </div>
          )}

          {pipelineState === 1 && (
            <div className="w-full h-full flex items-center justify-center gap-2 animate-fade-in-up">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-32 rounded bg-indigo-500/20 border border-indigo-500/40 relative shadow-[0_0_10px_rgba(99,102,241,0.2)]" style={{ animation: `pulse-glow 1s ease-in-out infinite ${i*0.2}s` }}>
                  <div className="absolute inset-2 flex flex-col gap-1 justify-between">
                    <div className="h-1 bg-indigo-400/50 rounded-full"></div>
                    <div className="h-1 bg-indigo-400/50 rounded-full"></div>
                    <div className="h-1 bg-indigo-400/50 rounded-full"></div>
                  </div>
                </div>
              ))}
              <p className="absolute bottom-4 font-mono text-xs text-indigo-400 tracking-widest">EXTRACTING MULTI-SCALE C3 FEATURES...</p>
            </div>
          )}

          {pipelineState === 2 && (
            <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in-up gap-4">
              <div className="flex gap-8">
                <div className={`relative w-32 h-20 rounded-lg border-2 flex flex-col justify-end overflow-hidden p-1 ${isDetected ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'}`}>
                  <div className={`w-full animate-[grow_1s_ease-out_forwards] ${isDetected ? 'bg-purple-500/40' : 'bg-red-500/20'}`} style={{height: isDetected ? '70%' : '15%'}}></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white font-mono z-10 drop-shadow-md">CHANNEL GATE</div>
                </div>
                <div className={`relative w-32 h-20 rounded-lg border-2 overflow-hidden ${isDetected ? 'border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.3)]' : 'border-orange-500/50 shadow-[0_0_15px_rgba(251,146,60,0.3)]'}`}>
                  <div className={`absolute top-1/2 left-1/2 w-8 h-8 -ml-4 -mt-4 rounded-full blur-md ${isDetected ? 'bg-fuchsia-400/80 animate-ping' : 'bg-orange-400/30 animate-pulse'}`}></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white font-mono z-10 drop-shadow-md">SPATIAL MAP</div>
                </div>
              </div>
              <p className={`font-mono text-xs tracking-widest ${isDetected ? 'text-purple-400' : 'text-red-400'}`}>
                {isDetected ? "CBAM: STRONG CARD EDGES DETECTED" : "CBAM: WEAK RESPONSE — NO CARD EDGES"}
              </p>
            </div>
          )}

          {pipelineState === 3 && (
            <div className="w-full h-full flex items-center justify-center animate-fade-in-up">
              <div className={`relative w-40 h-40 border overflow-hidden ${isDetected ? 'border-pink-500/30 shadow-[0_0_20px_rgba(244,114,182,0.2)]' : 'border-orange-500/30 shadow-[0_0_20px_rgba(251,146,60,0.2)]'}`}>
                {[...Array(6)].map((_, i) => (
                  <div key={`h${i}`} className={`absolute w-full h-[1px] ${isDetected ? 'bg-pink-500/20' : 'bg-orange-500/15'}`} style={{top: `${i*20}%`}}></div>
                ))}
                {[...Array(6)].map((_, i) => (
                  <div key={`v${i}`} className={`absolute h-full w-[1px] ${isDetected ? 'bg-pink-500/20' : 'bg-orange-500/15'}`} style={{left: `${i*20}%`}}></div>
                ))}
                <div className={`absolute top-1/3 left-0 right-0 h-1 shadow-[0_0_10px] animate-[slideX_2s_ease-in-out_infinite_alternate] ${isDetected ? 'bg-pink-500 shadow-pink-500' : 'bg-orange-500 shadow-orange-500'}`}></div>
                <div className={`absolute left-2/3 top-0 bottom-0 w-1 shadow-[0_0_10px] animate-[slideY_3s_ease-in-out_infinite_alternate] ${isDetected ? 'bg-rose-500 shadow-rose-500' : 'bg-red-500 shadow-red-500'}`}></div>
                {isDetected && <div className="absolute top-1/3 left-2/3 w-3 h-3 bg-white rounded-full -ml-[4px] -mt-[4px] shadow-[0_0_15px_#fff]"></div>}
                {!isDetected && <div className="absolute top-1/3 left-2/3 w-3 h-3 bg-red-500 rounded-full -ml-[4px] -mt-[4px] shadow-[0_0_15px_#ef4444] animate-pulse"></div>}
              </div>
              <p className={`absolute bottom-4 font-mono text-xs tracking-widest ${isDetected ? 'text-pink-400' : 'text-orange-400'}`}>
                {isDetected ? "X-Y POOLING: CARD + PERSON LOCATED" : "X-Y POOLING: PERSON ONLY — NO CARD CONTEXT"}
              </p>
            </div>
          )}

          {pipelineState === 4 && (
            <div className="w-full h-full flex items-center justify-center animate-fade-in-up gap-4">
              <div className="flex flex-col gap-2">
                <div className="w-16 h-8 bg-slate-800 border border-slate-700 rounded flex items-center justify-center text-slate-400 text-xs font-mono">P5</div>
                <div className="w-16 h-8 bg-slate-800 border border-slate-700 rounded flex items-center justify-center text-slate-400 text-xs font-mono">P4</div>
                <div className="w-16 h-8 bg-slate-800 border border-slate-700 rounded flex items-center justify-center text-slate-400 text-xs font-mono">P3</div>
              </div>
              <div className={`w-32 h-32 border-2 rounded-lg flex items-center justify-center relative overflow-hidden ${isDetected ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)]' : 'bg-red-500/10 border-red-400/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]'}`}>
                <div className={`w-4 h-4 font-black rounded-sm blur-[1px] ${isDetected ? 'bg-emerald-400 animate-ping' : 'bg-red-400 animate-pulse'}`}></div>
                <span className={`absolute bottom-2 font-mono text-[10px] font-bold ${isDetected ? 'text-emerald-100' : 'text-red-200'}`}>160×160</span>
              </div>
              <p className={`absolute bottom-4 font-mono text-xs tracking-widest ${isDetected ? 'text-emerald-400' : 'text-red-400'}`}>
                {isDetected ? "P2 HEAD: MICRO-OBJECT LOCKED" : "P2 HEAD: NO SMALL CARD FEATURES FOUND"}
              </p>
            </div>
          )}

          {pipelineState === 5 && (
            <div className="w-full h-full flex items-center justify-center animate-fade-in-up">
              <div className={`relative w-48 h-48 border-2 rounded-lg flex items-center justify-center flex-col overflow-hidden ${
                isDetected ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'
              }`}>
                <div className={`absolute inset-x-0 bottom-0 w-full animate-[grow_1s_ease-out_forwards] ${isDetected ? 'bg-green-500/30' : 'bg-red-500/30'}`} style={{height: '80%'}}></div>

                {isDetected ? (
                  <>
                    <CheckCircleIcon className="w-12 h-12 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)] relative z-10 mb-2 animate-bounce" />
                    <span className="font-mono text-lg font-bold text-white relative z-10 drop-shadow-md">COMPLIANT</span>
                    <span className="font-mono text-xs text-green-300 relative z-10">IOU: 0.98 | CONF: 0.95</span>
                    <div className="absolute top-4 left-6 w-16 h-32 border-2 border-blue-400 z-10">
                      <span className="absolute -top-3 left-0 text-[8px] bg-blue-500 text-white px-1 rounded">Person</span>
                    </div>
                    <div className="absolute top-12 left-12 w-8 h-10 border-2 border-yellow-400 z-10 shadow-[0_0_5px_#facc15]">
                      <span className="absolute -top-3 left-0 text-[8px] bg-yellow-500 text-black px-1 font-bold rounded">ID</span>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-12 h-12 text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)] relative z-10 mb-2 animate-pulse" />
                    <span className="font-mono text-lg font-bold text-white relative z-10 drop-shadow-md">NON-COMPLIANT</span>
                    <span className="font-mono text-xs text-red-300 relative z-10">NO ID CARD BBOX FOUND</span>
                    <div className="absolute top-4 left-6 w-16 h-32 border-2 border-blue-400 z-10">
                      <span className="absolute -top-3 left-0 text-[8px] bg-blue-500 text-white px-1 rounded">Person</span>
                    </div>
                    <div className="absolute top-12 left-12 w-8 h-10 border-2 border-dashed border-red-400/50 z-10">
                      <span className="absolute -top-3 left-0 text-[8px] bg-red-500/80 text-white px-1 rounded animate-pulse">???</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fall { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes flow { 0% { stroke-dashoffset: 30; } 100% { stroke-dashoffset: 0; } }
        @keyframes scan { 0% { top: 10%; } 50% { top: 90%; } 100% { top: 10%; } }
        @keyframes grow { 0% { height: 0%; } }
        @keyframes slideX { 0% { top: 20%; } 100% { top: 80%; } }
        @keyframes slideY { 0% { left: 20%; } 100% { left: 80%; } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}} />
    </div>
  );
}

function PipelineNode({ title, icon, active, passed, color, description }: { title: string; icon: React.ReactNode; active: boolean; passed: boolean; color: string; description: string }) {
  return (
    <div className={`relative flex flex-col items-center group w-16 md:w-32 cursor-pointer transition-all duration-300 ${active ? 'scale-110 -translate-y-4' : 'hover:-translate-y-2'}`}>
      <div className={`relative w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-700 z-20 overflow-hidden ${
        active ? 'bg-' + color + '-500 shadow-[0_0_40px_rgba(255,255,255,0.4)] border-2 border-white scale-110'
        : passed && !active ? 'bg-' + color + '-500/40 border border-' + color + '-400/50 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
        : 'bg-slate-800 border border-slate-700 opacity-60'
      }`}>
        {active && <div className="absolute inset-0 bg-white/20 animate-ping"></div>}
        <div className={active || passed ? 'text-white drop-shadow-md' : 'text-slate-500'}>{icon}</div>
      </div>
      <div className={`mt-2 md:mt-3 text-center transition-all duration-300 ${active ? 'opacity-100' : 'opacity-60'}`}>
        <h3 className={`text-[9px] md:text-xs font-black uppercase tracking-wider ${active ? 'text-' + color + '-400 glow-text' : 'text-slate-300'}`}>{title}</h3>
      </div>
      <div className={`absolute top-16 md:top-24 w-48 p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 shadow-2xl transition-all duration-300 pointer-events-none z-50 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {description}
      </div>
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
