"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  User,
  Clock,
  ImageIcon,
} from "lucide-react";
import { Button, Card, PageSection, StatusBadge } from "../components/ui";

interface DetectionResult {
  stats: {
    persons_detected: number;
    cards_detected: number;
    compliant: number;
    violations: number;
    identified: number;
    inference_ms: number;
  };
  compliance: { person_box: number[]; compliant: boolean; card_box: number[] | null; identified_name: string | null; similarity: number }[];
  violators: { person_box: number[]; face_detected: boolean; identified_name: string | null; similarity: number }[];
  annotated_image: string;
}

export default function DetectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [confidence, setConfidence] = useState(0.5);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) handleFile(f);
  }, [handleFile]);

  const runDetection = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("confidence", confidence.toString());
      const res = await fetch("/api/detect", { method: "POST", body: fd });
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
        <PageSection title="Image Detection" description="Upload an image to detect ID cards and check compliance." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 section-animate delay-1">
        <div className="space-y-4">
          <Card
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            className="app-card border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center hover:border-blue-500/50 transition cursor-pointer"
          >
            {preview ? (
              <Image src={preview} alt="Preview" width={720} height={480} unoptimized className="max-h-72 w-auto mx-auto rounded-lg" />
            ) : (
              <>
                <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-700 dark:text-slate-200 font-medium">Drop image here or click to upload</p>
                <p className="text-xs muted-text mt-1">JPG, PNG, WEBP</p>
              </>
            )}
            <input id="file-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
          </Card>

          <Card className="p-4">
            <label className="text-sm muted-text flex items-center justify-between">
              <span>Confidence Threshold</span>
              <span className="font-mono text-blue-600 dark:text-blue-300">{confidence.toFixed(2)}</span>
            </label>
            <input
              type="range" min={0.1} max={0.95} step={0.05} value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full mt-2 accent-blue-500"
            />
          </Card>

          <Button
            onClick={runDetection}
            disabled={!file || loading}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><Upload className="w-5 h-5" /> Run Detection</>}
          </Button>

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">{error}</div>}
        </div>

        <div className="space-y-4 section-animate delay-2">
          {result ? (
            <>
              <Card className="overflow-hidden">
                <Image src={`data:image/jpeg;base64,${result.annotated_image}`} alt="Result" width={1280} height={720} unoptimized className="w-full h-auto" />
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Mini icon={<User className="w-4 h-4" />} label="Persons" value={result.stats.persons_detected} color="text-blue-400 bg-blue-500/10 border-blue-500/20" />
                <Mini icon={<CreditCard className="w-4 h-4" />} label="ID Cards" value={result.stats.cards_detected} color="text-violet-400 bg-violet-500/10 border-violet-500/20" />
                <Mini icon={<CheckCircle className="w-4 h-4" />} label="Compliant" value={result.stats.compliant} color="text-green-400 bg-green-500/10 border-green-500/20" />
                <Mini icon={<AlertTriangle className="w-4 h-4" />} label="Violations" value={result.stats.violations} color="text-red-400 bg-red-500/10 border-red-500/20" />
              </div>

              <Card className="p-3 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="muted-text">Inference:</span>
                <StatusBadge tone="info">{result.stats.inference_ms}ms</StatusBadge>
              </Card>

              {result.compliance.length > 0 && (
                <Card className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm mb-2">Compliance Details</h3>
                  {result.compliance.map((c, i) => (
                    <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${c.compliant ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                      <div className="flex items-center gap-2">
                        {c.compliant ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        <span>
                          {c.identified_name ? (
                            <strong>{c.identified_name}</strong>
                          ) : (
                            `Person ${i + 1}`
                          )}
                          : {c.compliant ? "Wearing ID Card ✓" : "NO ID Card ✗"}
                        </span>
                      </div>
                      {c.identified_name && (
                        <span className="text-xs opacity-60">{(c.similarity * 100).toFixed(0)}% match</span>
                      )}
                    </div>
                  ))}
                </Card>
              )}
            </>
          ) : (
            <Card className="p-16 text-center">
              <ImageIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="muted-text text-sm">Upload an image and click detect.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Mini({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <div className="flex items-center gap-1.5 text-xs opacity-70 mb-1">{icon} {label}</div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
