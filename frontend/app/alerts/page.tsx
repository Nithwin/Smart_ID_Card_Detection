"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface Alert {
  id: string;
  timestamp: string;
  person_box: number[];
  face_detected: boolean;
  face_image: string | null;
  identified_name: string | null;
  similarity: number;
}

const PAGE_SIZE = 30;

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async (p = page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/alerts?limit=${PAGE_SIZE}&offset=${p * PAGE_SIZE}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts);
        setTotal(data.total);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); }, [page]);

  const clearAlerts = async () => {
    if (!confirm("Clear all alerts?")) return;
    await fetch("/api/alerts", { method: "DELETE" });
    setAlerts([]);
    setTotal(0);
    setPage(0);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alert Log</h1>
          <p className="text-sm text-gray-500">{total} total violations recorded (stored in database)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchAlerts(page)} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={clearAlerts} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm transition">
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500 text-sm">Loading...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">No violations recorded</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((a) => (
              <div key={a.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="h-40 bg-gray-800 flex items-center justify-center">
                  {a.face_image ? (
                    <img src={`data:image/jpeg;base64,${a.face_image}`} alt="Violator" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-gray-600 text-sm">No face captured</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-sm font-medium text-red-400">
                      {a.identified_name ? `${a.identified_name} — No ID` : "ID Card Violation"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(a.timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Face: {a.face_detected ? "Detected" : "Not found"}
                    {a.identified_name && ` · Match: ${(a.similarity * 100).toFixed(0)}%`}
                    {" · ID: "}{a.id}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-400">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
