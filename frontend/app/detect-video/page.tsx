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
import { Button, Card, PageSection, StatusBadge } from "../components/ui";

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
    <div className="page-shell page-animate space-y-6 pb-10">
      <div className="section-animate">
        <PageSection title="Pre-Recorded Video Analysis" description="Upload a video clip to run sequence detection and compliance checks." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 section-animate delay-1">
        
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <Card
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            className="app-card border-2 border-dashed border-slate-300 dark:border-slate-700 p-10 text-center hover:border-blue-500/50 transition cursor-pointer"
          >
            {file ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                   <Film className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                   <p className="text-slate-900 dark:text-white font-medium truncate">{file.name}</p>
                   <p className="text-xs muted-text mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                   <Upload className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-medium">Drop video here or click</p>
                <p className="text-xs muted-text mt-2">MP4, WEBM, MOV (Max 50MB recommended)</p>
              </>
            )}
            <input id="file-input" type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
          </Card>

          <Card className="p-6 rounded-3xl space-y-5">
            <div>
              <label className="text-sm font-medium muted-text flex items-center justify-between mb-2">
                <span>Confidence Threshold</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-mono">{confidence.toFixed(2)}</span>
              </label>
              <input
                type="range" min={0.1} max={0.95} step={0.05} value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium muted-text flex items-center justify-between mb-2">
                <span>Sample Rate (Process every Nth frame)</span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-mono">{sampleRate}</span>
              </label>
              <input
                type="range" min={1} max={30} step={1} value={sampleRate}
                onChange={(e) => setSampleRate(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </Card>

          <Button
            onClick={runDetection}
            disabled={!file || loading}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-3"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Abstracting Sequence...</> : <><Activity className="w-5 h-5" /> Run Sequence Analysis</>}
          </Button>

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 font-medium">{error}</div>}
        </div>

        <div className="col-span-1 lg:col-span-8 section-animate delay-2">
          {result ? (
            <div className="space-y-6">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <Mini icon={<Film className="w-4 h-4" />} label="Total Frames" value={result.video_info.total_frames} color="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50" />
                 <Mini icon={<Activity className="w-4 h-4" />} label="Processed" value={result.video_info.frames_processed} color="text-blue-700 dark:text-blue-300 border-blue-500/30 bg-blue-500/5" />
                 <Mini icon={<CheckCircle className="w-4 h-4" />} label="Total Compliant" value={result.summary.total_compliant} color="text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/5" />
                 <Mini icon={<AlertTriangle className="w-4 h-4" />} label="Total Violations" value={result.summary.total_violations} color="text-red-700 dark:text-red-300 border-red-500/30 bg-red-500/5" />
               </div>

               <Card className="rounded-3xl p-6">
                 <h2 className="text-xl font-bold mb-4">Sequence Timeline</h2>
                 
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
                             <p className="text-sm font-semibold">Frame {f.frame}</p>
                             <p className="text-xs muted-text">Detections: {f.stats.persons_detected} persons, {f.stats.cards_detected} cards</p>
                           </div>
                         </div>
                         
                         <div className="text-right">
                           {violationsCount > 0 ? (
                             <StatusBadge tone="danger">
                               <AlertTriangle className="w-3.5 h-3.5" /> {violationsCount} Violations
                             </StatusBadge>
                           ) : (
                             <StatusBadge tone="success">
                               <CheckCircle className="w-3.5 h-3.5" /> Compliant
                             </StatusBadge>
                           )}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </Card>
            </div>
          ) : (
            <Card className="rounded-3xl p-16 h-full flex flex-col items-center justify-center text-center space-y-4">
              <Film className="w-20 h-20 text-slate-300 dark:text-slate-700 mx-auto" />
              <div>
                <p className="font-bold text-xl">Video Analysis Ready</p>
                <p className="muted-text text-sm mt-2 max-w-sm mx-auto">Upload an MP4 or WEBM file and adjust settings to get compliance statistics and face matches.</p>
              </div>
            </Card>
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
