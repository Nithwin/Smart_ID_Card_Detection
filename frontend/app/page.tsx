"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  Users,
  CheckCircle,
  AlertTriangle,
  Activity,
  TrendingUp,
} from "lucide-react";

interface Stats {
  total_frames: number;
  total_detections: number;
  violations: number;
  compliant: number;
  identified: number;
  known_persons: number;
}

interface Alert {
  id: string;
  timestamp: string;
  person_box: number[];
  face_detected: boolean;
  face_image: string | null;
  identified_name: string | null;
  similarity: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total_frames: 0, total_detections: 0, violations: 0, compliant: 0, identified: 0, known_persons: 0 });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const [sRes, aRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/alerts?limit=10"),
        ]);
        if (sRes.ok) { setStats(await sRes.json()); setOnline(true); }
        if (aRes.ok) { setAlerts((await aRes.json()).alerts.reverse()); }
      } catch { setOnline(false); }
    };
    poll();
    const i = setInterval(poll, 3000);
    return () => clearInterval(i);
  }, []);

  const rate = stats.compliant + stats.violations > 0
    ? Math.round((stats.compliant / (stats.compliant + stats.violations)) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time compliance monitoring overview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-800 bg-gray-900">
          <span className={`w-2 h-2 rounded-full ${online ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-xs text-gray-400">{online ? "System Online" : "Offline"}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Eye className="w-5 h-5" />} label="Frames Processed" value={stats.total_frames} color="blue" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Detections" value={stats.total_detections} color="violet" />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Compliant" value={stats.compliant} color="green" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Violations" value={stats.violations} color="red" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Identified" value={stats.identified} color="blue" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Known Persons" value={stats.known_persons} color="violet" />
      </div>

      {/* Compliance Meter + Recent alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h2 className="font-semibold text-sm text-white">Compliance Rate</h2>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={rate >= 70 ? "#22c55e" : rate >= 40 ? "#eab308" : "#ef4444"}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${rate * 3.27} 327`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{rate}%</span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500">
            {stats.compliant} compliant / {stats.violations} violations
          </p>
        </div>

        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="font-semibold text-sm text-white">Recent Violations</h2>
          </div>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">No violations detected yet</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-800/50">
                  {a.face_image ? (
                    <img src={`data:image/jpeg;base64,${a.face_image}`} alt="face" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-gray-500 text-xs">N/A</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-red-400 font-medium">
                      {a.identified_name ? `${a.identified_name} — No ID` : "ID Card Violation"}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {new Date(a.timestamp).toLocaleTimeString()} · Face {a.face_detected ? "captured" : "not found"}
                      {a.identified_name && ` · ${(a.similarity * 100).toFixed(0)}% match`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pipeline info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-blue-400" />
          <h2 className="font-semibold text-sm text-white">Detection Pipeline</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { n: "1", t: "Detect", d: "CA-YOLOv8 finds persons & cards" },
            { n: "2", t: "Compliance", d: "Check card-person association" },
            { n: "3", t: "Face Capture", d: "MediaPipe detects violator faces" },
            { n: "4", t: "Identify", d: "InsightFace matches known persons" },
          ].map((s) => (
            <div key={s.n} className="p-3 rounded-lg bg-gray-800/40 text-center">
              <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">{s.n}</div>
              <p className="text-xs font-semibold text-white">{s.t}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const cls: Record<string, string> = {
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400",
    green: "from-green-500/10 to-green-500/5 border-green-500/20 text-green-400",
    red: "from-red-500/10 to-red-500/5 border-red-500/20 text-red-400",
    violet: "from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400",
  };
  return (
    <div className={`rounded-xl border p-4 bg-gradient-to-br ${cls[color]}`}>
      <div className="flex items-center gap-2 mb-2 opacity-70">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
