"use client";

import { useEffect, useState, useCallback } from "react";
import { UserPlus, Trash2, Upload, Loader2, Users, RefreshCw, Database, CheckCircle } from "lucide-react";

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
        const data = await res.json();
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Face Registry</h1>
          <p className="text-sm text-gray-500">
            {knownFaces.length} known {knownFaces.length === 1 ? "person" : "persons"} loaded
            {recognitionReady ? " · InsightFace ready" : " · Recognition disabled"}
          </p>
        </div>
        <button
          onClick={reloadDB}
          disabled={reloading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} />
          Reload DB
        </button>
      </div>

      {/* Known Faces from known_faces/ directory */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-emerald-400" />
          <h2 className="font-semibold text-sm text-white">Known Faces Database ({knownFaces.length})</h2>
        </div>

        {knownFaces.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <Users className="w-10 h-10 text-gray-700 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No known faces. Add images to backend/known_faces/</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {knownFaces.map((f) => (
              <div key={f.filename} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="h-44 bg-gray-800">
                  <img
                    src={`${BACKEND_URL}${f.image_url}`}
                    alt={f.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{f.name}</p>
                    <p className="text-[10px] text-gray-500">{f.filename}</p>
                  </div>
                  {f.has_embedding && (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Register Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-4 h-4 text-blue-400" />
            <h2 className="font-semibold text-sm text-white">Register New Face</h2>
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Person name"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />

          <div
            onClick={() => document.getElementById("face-input")?.click()}
            className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500/50 transition"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Upload face photo</p>
              </>
            )}
            <input id="face-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
          </div>

          <button
            onClick={register}
            disabled={!file || !name.trim() || loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Register Face
          </button>

          {msg && <p className={`text-xs ${msg.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>{msg}</p>}
        </div>

        {/* Registered Faces (via API) */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-400" />
            <h2 className="font-semibold text-sm text-white">Registered via App ({faces.length})</h2>
          </div>

          {faces.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <Users className="w-10 h-10 text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No faces registered yet. Use the form or add photos to known_faces/</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {faces.map((f) => (
                <div key={f.person_id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group">
                  <div className="h-32 bg-gray-800">
                    <img src={`${BACKEND_URL}/face_db/${f.image}`} alt={f.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{f.name}</p>
                      <p className="text-[10px] text-gray-500">{new Date(f.registered_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => deleteFace(f.person_id)} className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
