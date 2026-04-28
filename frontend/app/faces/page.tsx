"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { UserPlus, Trash2, Upload, Loader2, Users, RefreshCw, Database, CheckCircle } from "lucide-react";
import { Button, Card, PageSection, TextInput } from "../components/ui";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface Face {
  person_id: string;
  name: string;
  image: string;
  registered_at: string;
}

interface KnownFace {
  name: string;
  filename: string;
  image_url: string;
  has_embedding: boolean;
}

export default function FacesPage() {
  const [faces, setFaces] = useState<Face[]>([]);
  const [knownFaces, setKnownFaces] = useState<KnownFace[]>([]);
  const [recognitionReady, setRecognitionReady] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchFaces = useCallback(async () => {
    try {
      const [regRes, knownRes] = await Promise.all([
        fetch("/api/faces"),
        fetch("/api/known-faces"),
      ]);
      if (regRes.ok) setFaces((await regRes.json()).faces);
      if (knownRes.ok) {
        const data = await knownRes.json();
        setKnownFaces(data.faces);
        setRecognitionReady(data.recognition_ready);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchFaces(); }, [fetchFaces]);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMsg(null);
  };

  const register = async () => {
    if (!file || !name.trim()) return;
    setLoading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("file", file);
      const res = await fetch("/api/faces/register", { method: "POST", body: fd });
      if (res.ok) {
        await res.json();
        setMsg(`Registered ${name} successfully!`);
        setName("");
        setFile(null);
        setPreview(null);
        fetchFaces();
      } else {
        const err = await res.json();
        setMsg(`Error: ${err.detail}`);
      }
    } catch {
      setMsg("Failed — is backend running?");
    } finally {
      setLoading(false);
    }
  };

  const deleteFace = async (pid: string) => {
    if (!confirm("Remove this face?")) return;
    await fetch(`/api/faces/${pid}`, { method: "DELETE" });
    fetchFaces();
  };

  const reloadDB = async () => {
    setReloading(true);
    try {
      await fetch("/api/known-faces/reload", { method: "POST" });
      await fetchFaces();
    } catch {} finally { setReloading(false); }
  };

  return (
    <div className="page-shell page-animate space-y-6 pb-10">
      <div className="section-animate">
        <PageSection
        title="Face Registry"
        description={
          `${knownFaces.length} known ${knownFaces.length === 1 ? "person" : "persons"} loaded` +
          (recognitionReady ? " · InsightFace ready" : " · Recognition disabled")
        }
        actions={
          <Button
            onClick={reloadDB}
            disabled={reloading}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} />
            Reload DB
          </Button>
        }
        />
      </div>

      {/* Known Faces from known_faces/ directory */}
      <div className="section-animate delay-1">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-emerald-400" />
          <h2 className="font-semibold text-sm">Known Faces Database ({knownFaces.length})</h2>
        </div>

        {knownFaces.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm muted-text">No known faces. Add images to backend/known_faces/</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {knownFaces.map((f) => (
              <Card key={f.filename} className="overflow-hidden">
                <div className="h-44 bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={`${BACKEND_URL}${f.image_url}`}
                    alt={f.name}
                    width={400}
                    height={300}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{f.name}</p>
                    <p className="text-[10px] muted-text">{f.filename}</p>
                  </div>
                  {f.has_embedding && (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 section-animate delay-2">
        {/* Register Form */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-4 h-4 text-blue-400" />
            <h2 className="font-semibold text-sm">Register New Face</h2>
          </div>

          <TextInput
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Person name"
          />

          <div
            onClick={() => document.getElementById("face-input")?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500/50 transition"
          >
            {preview ? (
              <Image src={preview} alt="Preview" width={180} height={180} unoptimized className="max-h-32 w-auto mx-auto rounded" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                <p className="text-xs muted-text">Upload face photo</p>
              </>
            )}
            <input id="face-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
          </div>

          <Button
            onClick={register}
            disabled={!file || !name.trim() || loading}
            className="w-full py-2.5 rounded-lg text-sm flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Register Face
          </Button>

          {msg && <p className={`text-xs ${msg.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>{msg}</p>}
        </Card>

        {/* Registered Faces (via API) */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-400" />
            <h2 className="font-semibold text-sm">Registered via App ({faces.length})</h2>
          </div>

          {faces.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm muted-text">No faces registered yet. Use the form or add photos to known_faces/</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {faces.map((f) => (
                <Card key={f.person_id} className="overflow-hidden group">
                  <div className="h-32 bg-slate-100 dark:bg-slate-800">
                    <Image src={`${BACKEND_URL}/face_db/${f.image}`} alt={f.name} width={300} height={200} unoptimized className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{f.name}</p>
                      <p className="text-[10px] muted-text">{new Date(f.registered_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => deleteFace(f.person_id)} className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition opacity-100 md:opacity-0 md:group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
