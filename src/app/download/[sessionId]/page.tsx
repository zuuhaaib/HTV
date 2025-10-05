"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DownloadPage() {
  const { sessionId } = useParams() as { sessionId: string };
  const [files, setFiles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  useEffect(() => {
    if (!sessionId) return;

    // Try localStorage first
    try {
      const raw = localStorage.getItem(`merge_result_${sessionId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.output_files) {
          setFiles(parsed.output_files as string[]);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    // Fallback: attempt to fetch session status and list files (best-effort)
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/session/${encodeURIComponent(sessionId)}/status`);
        if (!res.ok) throw new Error("Could not fetch session status");
        const json = await res.json();
        // The backend doesn't return filenames here, so show a generic zip
        setFiles([`merged_output.zip`]);
      } catch (e: any) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading) return <div className="p-6">Loading results…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Merge Results</h2>
      {files && files.length > 0 ? (
        <ul className="space-y-3">
          {files.map((f) => (
            <li key={f} className="flex items-center gap-4">
              <a className="text-[#137fec] hover:underline" href={`${API_BASE}/api/download/${encodeURIComponent(sessionId)}/${encodeURIComponent(f)}`}>
                {f}
              </a>
              <a className="text-sm text-slate-500" href={`${API_BASE}/api/download/${encodeURIComponent(sessionId)}/${encodeURIComponent(f)}`} target="_blank" rel="noreferrer">Download</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No output files were found for this session.</p>
      )}
    </div>
  );
}
