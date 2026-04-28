"use client";

import { useEffect, useState } from "react";
import { useCallback } from "react";
import Image from "next/image";
import { AlertTriangle, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card, PageSection } from "../components/ui";

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

  const fetchAlerts = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/alerts?limit=${PAGE_SIZE}&offset=${p * PAGE_SIZE}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts);
        setTotal(data.total);
      }
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const clearAlerts = async () => {
    if (!confirm("Clear all alerts?")) return;
    await fetch("/api/alerts", { method: "DELETE" });
    setAlerts([]);
    setTotal(0);
    setPage(0);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="page-shell page-animate space-y-6 pb-10">
      <div className="section-animate">
        <PageSection
        title="Alert Log"
        description={`${total} total violations recorded`}
        actions={
          <>
            <button onClick={() => fetchAlerts(page)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition">
            <RefreshCw className="w-4 h-4" />
            </button>
            <Button onClick={clearAlerts} variant="danger" className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Clear All
            </Button>
          </>
        }
        />
      </div>

      {loading ? (
        <div className="text-center py-16 muted-text text-sm">Loading...</div>
      ) : alerts.length === 0 ? (
        <Card className="p-16 text-center section-animate delay-1">
          <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="muted-text text-sm">No violations recorded</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 section-animate delay-1">
            {alerts.map((a) => (
              <Card key={a.id} className="overflow-hidden">
                <div className="h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {a.face_image ? (
                    <Image src={`data:image/jpeg;base64,${a.face_image}`} alt="Violator" width={360} height={220} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    <div className="muted-text text-sm">No face captured</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-sm font-medium text-red-400">
                      {a.identified_name ? `${a.identified_name} — No ID` : "ID Card Violation"}
                    </span>
                  </div>
                  <p className="text-xs muted-text">
                    {new Date(a.timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs muted-text mt-1">
                    Face: {a.face_detected ? "Detected" : "Not found"}
                    {a.identified_name && ` · Match: ${(a.similarity * 100).toFixed(0)}%`}
                    {" · ID: "}{a.id}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm muted-text">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
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
