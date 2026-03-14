"use client";

import { useState, useEffect } from "react";
import { Camera, CameraOff, Loader2, CheckCircle, AlertTriangle, Users, CreditCard, Fingerprint, Smartphone, Monitor, Wifi } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface CameraDevice {
  index: number;
  name: string;
  resolution: string;
}

export default function CameraPage() {
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total_frames: 0, total_detections: 0, violations: 0, compliant: 0, identified: 0, known_persons: 0 });
  const [feedKey, setFeedKey] = useState(0);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState(0);
  const [sourceMode, setSourceMode] = useState<"usb" | "ip">("usb");
  const [ipUrl, setIpUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedCams, setDetectedCams] = useState<{name: string; url: string}[]>([]);
  const [testResult, setTestResult] = useState<null | boolean>(null);
  const [testing, setTesting] = useState(false);

  // Scan for available cameras on mount
  useEffect(() => {
    fetch("/api/camera/status").then(r => r.json()).then(d => setRunning(d.running)).catch(() => {});
    scanDevices();
  }, []);

  const scanDevices = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/camera/devices");
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices);
        if (data.devices.length > 0 && !data.devices.find((d: CameraDevice) => d.index === selectedDevice)) {
          setSelectedDevice(data.devices[0].index);
        }
      }
    } catch {} finally { setScanning(false); }
  };

  const autoDetectMobile = async () => {
    setDetecting(true);
    setDetectedCams([]);
    try {
      const res = await fetch("/api/camera/auto-detect");
      if (res.ok) {
        const data = await res.json();
        setDetectedCams(data.cameras);
        if (data.cameras.length > 0) {
          setIpUrl(data.cameras[0].url);
          setTestResult(true);
        } else if (data.default_url) {
          setIpUrl(data.default_url);
        }
      }
    } catch {} finally { setDetecting(false); }
  };

  const testUrl = async () => {
    if (!ipUrl.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/camera/test-url?url=${encodeURIComponent(ipUrl.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setTestResult(data.reachable);
      }
    } catch { setTestResult(false); } finally { setTesting(false); }
  };

  useEffect(() => {
    if (!running) return;
    const i = setInterval(async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) setStats(await res.json());
      } catch {}
    }, 2000);
    return () => clearInterval(i);
  }, [running]);

  const toggle = async () => {
    setLoading(true);
    try {
      if (running) {
        const res = await fetch("/api/camera/stop");
        if (res.ok) setRunning(false);
      } else {
        const params = new URLSearchParams();
        if (sourceMode === "ip" && ipUrl.trim()) {
          params.set("url", ipUrl.trim());
        } else {
          params.set("device", String(selectedDevice));
        }
        const res = await fetch(`/api/camera/start?${params}`);
        if (res.ok) {
          setRunning(true);
          setFeedKey(prev => prev + 1);
        } else {
          const err = await res.json();
          alert(err.detail || "Failed to start camera");
        }
      }
    } catch {
      alert("Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Camera</h1>
          <p className="text-sm text-gray-500">Backend camera with real-time detection (MJPEG stream)</p>
        </div>
        <button
          onClick={toggle}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
            running
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          } disabled:opacity-50`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : running ? (
            <CameraOff className="w-4 h-4" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
          {running ? "Stop Camera" : "Start Camera"}
        </button>
      </div>

      {/* Camera Source Selector */}
      {!running && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
          <p className="text-sm font-medium text-white">Select Camera Source</p>
          <div className="flex gap-2">
            <button
              onClick={() => setSourceMode("usb")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                sourceMode === "usb" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <Monitor className="w-4 h-4" /> USB / Built-in
            </button>
            <button
              onClick={() => setSourceMode("ip")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                sourceMode === "ip" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <Wifi className="w-4 h-4" /> IP Camera / Mobile
            </button>
          </div>

          {sourceMode === "usb" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">Available devices:</p>
                <button onClick={scanDevices} disabled={scanning} className="text-xs text-blue-400 hover:text-blue-300 transition">
                  {scanning ? "Scanning..." : "Rescan"}
                </button>
              </div>
              {devices.length === 0 ? (
                <p className="text-xs text-gray-600">No cameras found. Connect a camera and click Rescan.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {devices.map(d => (
                    <button
                      key={d.index}
                      onClick={() => setSelectedDevice(d.index)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                        selectedDevice === d.index
                          ? "border-blue-500 bg-blue-500/10 text-white"
                          : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      {d.index === 0 ? <Monitor className="w-5 h-5 shrink-0" /> : <Smartphone className="w-5 h-5 shrink-0" />}
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs opacity-60">{d.resolution} · Index {d.index}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Mobile camera via <strong className="text-gray-300">DroidCam</strong>, <strong className="text-gray-300">IP Webcam</strong>, or any MJPEG/RTSP source
                </p>
                <button
                  onClick={autoDetectMobile}
                  disabled={detecting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium transition disabled:opacity-50"
                >
                  <Wifi className="w-3 h-3" />
                  {detecting ? "Scanning network..." : "Auto-Detect"}
                </button>
              </div>

              {/* Auto-detected cameras */}
              {detectedCams.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-green-400 font-medium">Found {detectedCams.length} camera(s):</p>
                  <div className="grid grid-cols-1 gap-2">
                    {detectedCams.map((cam, i) => (
                      <button
                        key={i}
                        onClick={() => { setIpUrl(cam.url); setTestResult(true); }}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                          ipUrl === cam.url
                            ? "border-green-500 bg-green-500/10 text-white"
                            : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        <Smartphone className="w-5 h-5 shrink-0 text-green-400" />
                        <div>
                          <p className="text-sm font-medium">{cam.name}</p>
                          <p className="text-xs opacity-60">{cam.url}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual URL input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ipUrl}
                  onChange={e => { setIpUrl(e.target.value); setTestResult(null); }}
                  placeholder="http://192.168.1.100:8080/video"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  onClick={testUrl}
                  disabled={testing || !ipUrl.trim()}
                  className="px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 font-medium transition disabled:opacity-40"
                >
                  {testing ? "Testing..." : "Test"}
                </button>
              </div>

              {/* Test result */}
              {testResult !== null && (
                <p className={`text-xs font-medium ${testResult ? "text-green-400" : "text-red-400"}`}>
                  {testResult ? "Connected — camera is reachable!" : "Failed — camera not reachable. Check the URL and make sure the app is running."}
                </p>
              )}

              <div className="text-xs text-gray-600 space-y-0.5 pt-1 border-t border-gray-800">
                <p className="text-gray-500 font-medium mb-1">Common URLs:</p>
                <p><button onClick={() => setIpUrl("http://localhost:4747/video")} className="text-blue-400 hover:underline">DroidCam USB</button> — http://localhost:4747/video</p>
                <p><button onClick={() => setIpUrl("http://192.168.1.100:8080/video")} className="text-blue-400 hover:underline">IP Webcam</button> — http://PHONE_IP:8080/video</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Feed */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {running ? (
          <div className="relative">
            <img
              src={`${BACKEND_URL}/api/camera/feed?t=${feedKey}`}
              alt="Live camera feed"
              className="w-full"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-white font-medium">LIVE</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <Camera className="w-16 h-16 mb-3 text-gray-700" />
            <p className="text-sm">Camera is off. Select a source above and click &quot;Start Camera&quot;.</p>
            <p className="text-xs text-gray-700 mt-1">Supports USB cameras, built-in webcams, and IP/mobile cameras</p>
          </div>
        )}
      </div>

      {/* Live Stats */}
      {running && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <LiveStat icon={<Users className="w-4 h-4" />} label="Detections" value={stats.total_detections} color="text-blue-400 bg-blue-500/10 border-blue-500/20" />
          <LiveStat icon={<CreditCard className="w-4 h-4" />} label="Frames" value={stats.total_frames} color="text-violet-400 bg-violet-500/10 border-violet-500/20" />
          <LiveStat icon={<CheckCircle className="w-4 h-4" />} label="Compliant" value={stats.compliant} color="text-green-400 bg-green-500/10 border-green-500/20" />
          <LiveStat icon={<AlertTriangle className="w-4 h-4" />} label="Violations" value={stats.violations} color="text-red-400 bg-red-500/10 border-red-500/20" />
          <LiveStat icon={<Fingerprint className="w-4 h-4" />} label="Identified" value={stats.identified} color="text-amber-400 bg-amber-500/10 border-amber-500/20" />
        </div>
      )}

      {/* Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-400">
        <p className="font-medium text-white text-xs mb-2">How it works</p>
        <ul className="space-y-1 text-xs text-gray-500">
          <li>• Camera capture runs on the <strong className="text-gray-300">backend server</strong> (not your browser)</li>
          <li>• <strong className="text-gray-300">USB cameras:</strong> Detected automatically — laptops, external webcams, phones via USB</li>
          <li>• <strong className="text-gray-300">Mobile via USB:</strong> Use <strong className="text-gray-300">DroidCam</strong> app — install on phone + PC, connect USB, select Camera 1</li>
          <li>• <strong className="text-gray-300">Mobile via WiFi:</strong> Use IP Webcam app, enter the stream URL in IP Camera mode</li>
          <li>• Each frame is processed through CA-YOLOv8 + InsightFace pipeline</li>
          <li>• Violations are automatically logged with identified names to the database</li>
        </ul>
      </div>
    </div>
  );
}

function LiveStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center gap-1.5 text-xs opacity-70 mb-1">{icon} {label}</div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
