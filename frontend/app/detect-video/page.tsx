"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Film,
  Activity,
} from "lucide-react";

interface VideoDetectionResult {
  video_info: {
    total_frames: number;
    fps: number;
    frames_processed: number;
  };
  summary: {
    total_violations: number;
    total_compliant: number;
  };
  frames: Array<{
    frame: number;
    time_sec: number;
    stats: { persons_detected: number; cards_detected: number };
    compliance: { person_box: number[]; compliant: boolean }[];
    violators: { person_box: number[]; face_detected: boolean }[];
  }>;
}

export default function DetectVideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VideoDetectionResult | null>(null);
  const [confidence, setConfidence] = useState(0.5);
  const [sampleRate, setSampleRate] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("video/")) handleFile(f);
  }, [handleFile]);

  const runDetection = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("confidence", confidence.toString());
      fd.append("sample_rate", sampleRate.toString());
      
      const res = await fetch("/api/detect-video", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setResult(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Detection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center gap-2">
          <Film className="w-8 h-8 text-blue-500" />
          Pre-Recorded Video Analysis
        </h1>
        <p className="text-slate-400 mt-2">Upload a video clip to run CA-YOLOv8 sequence detection and compliance checks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload Controls */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            className="border-2 border-dashed border-slate-700/50 rounded-3xl p-10 text-center hover:border-blue-500/50 transition cursor-pointer glass-panel"
          >
            {file ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                   <Film className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                   <p className="text-white font-medium truncate">{file.name}</p>
                   <p className="text-xs text-slate-400 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                   <Upload className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-300 font-medium">Drop video here or click</p>
                <p className="text-xs text-slate-500 mt-2">MP4, WEBM, MOV (Max 50MB recommended)</p>
              </>
            )}
            <input id="file-input" type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-300 flex items-center justify-between mb-2">
                <span>Confidence Threshold</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-mono">{confidence.toFixed(2)}</span>
              </label>
              <input
                type="range" min={0.1} max={0.95} step={0.05} value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-300 flex items-center justify-between mb-2">
                <span>Sample Rate (Process every Nth frame)</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-mono">{sampleRate}</span>
              </label>
              <input
                type="range" min={1} max={30} step={1} value={sampleRate}
                onChange={(e) => setSampleRate(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={runDetection}
            disabled={!file || loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold transition flex items-center justify-center gap-3 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Abstracting Sequence...</> : <><Activity className="w-5 h-5" /> Run Sequence Analysis</>}
          </button>

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 font-medium">{error}</div>}
        </div>

        {/* Right Column: Processing Results Dashboard */}
        <div className="col-span-1 lg:col-span-8">
          {result ? (
            <div className="space-y-6">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <Mini icon={<Film className="w-4 h-4" />} label="Total Frames" value={result.video_info.total_frames} color="text-slate-300 border-slate-700 bg-slate-800/50" />
                 <Mini icon={<Activity className="w-4 h-4" />} label="Processed" value={result.video_info.frames_processed} color="text-blue-400 border-blue-500/30 bg-blue-500/5" />
                 <Mini icon={<CheckCircle className="w-4 h-4" />} label="Total Compliant" value={result.summary.total_compliant} color="text-emerald-400 border-emerald-500/30 bg-emerald-500/5" />
                 <Mini icon={<AlertTriangle className="w-4 h-4" />} label="Total Violations" value={result.summary.total_violations} color="text-red-400 border-red-500/30 bg-red-500/5" />
               </div>

               <div className="glass-panel rounded-3xl p-6">
                 <h2 className="text-xl font-bold text-white mb-4">Sequence Timeline</h2>
                 
                 <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                   {result.frames.map((f, i) => {
                     const violationsCount = f.violators.length;
                     return (
                       <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between ${violationsCount > 0 ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`}>
                         <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold font-mono text-sm ${violationsCount > 0 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                             {f.time_sec.toFixed(1)}s
                           </div>
                           <div>
                             <p className="text-sm font-semibold text-white">Frame {f.frame}</p>
                             <p className="text-xs text-slate-400">Detections: {f.stats.persons_detected} persons, {f.stats.cards_detected} cards</p>
                           </div>
                         </div>
                         
                         <div className="text-right">
                           {violationsCount > 0 ? (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-xs font-bold font-mono">
                               <AlertTriangle className="w-3.5 h-3.5" /> {violationsCount} Violations
                             </span>
                           ) : (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                               <CheckCircle className="w-3.5 h-3.5" /> Compliant
                             </span>
                           )}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
            </div>
          ) : (
            <div className="glass-panel border-slate-800 rounded-3xl p-16 h-full flex flex-col items-center justify-center text-center space-y-4">
              <Film className="w-20 h-20 text-slate-800 mx-auto" />
              <div>
                <p className="text-slate-300 font-bold text-xl">Video Analysis Readiness Base</p>
                <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Upload an MP4 or WEBM file and adjust processing parameters to extract compliance statistics and Face identification matches from a pre-recorded sequence.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Mini({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${color} hover:scale-105 transition-transform duration-300`}>
      <div className="flex items-center gap-2 text-xs font-medium opacity-80 mb-2 uppercase tracking-wider">{icon} {label}</div>
      <p className="text-3xl font-black drop-shadow-sm glow-text">{value}</p>
    </div>
  );
}
