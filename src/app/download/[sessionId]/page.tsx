"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { FiDownload, FiFileText, FiArchive } from "react-icons/fi";

export default function DownloadPage() {
  const { sessionId } = useParams() as { sessionId: string };
  const [files, setFiles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  useEffect(() => {
    if (!sessionId) return;

    // Try localStorage first
    try {
      const raw = localStorage.getItem(`merge_result_${sessionId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          setFiles(parsed.output_files || ["merged_output.zip"]);
          setSummary(parsed.summary || null);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    // Fallback: attempt to fetch session status and show generic zip
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/session/${encodeURIComponent(sessionId)}/status`);
        if (!res.ok) throw new Error("Could not fetch session status");
        // We don't get filenames from /session, so show the zip as default
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
    <div className="font-display bg-[#f6f7f8] min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-6 border border-black/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-[#eaf2ff] text-[#0b2343]">
              <FiArchive className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Merge Complete</h2>
              <p className="text-sm text-black/60 mt-1">Your merged files are ready for download. You can download individual files or grab the bundled ZIP.</p>
            </div>
            <div className="ml-auto">
              <a href={`${API_BASE}/api/download/${encodeURIComponent(sessionId)}/merged_output.zip`} className="inline-flex items-center gap-2 bg-[#137fec] text-white px-4 py-2 rounded-lg hover:bg-[#0f6dc9]">
                <FiDownload /> Download All
              </a>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Files</h3>
            <ul className="space-y-3">
              {files && files.map((f) => (
                <li key={f} className="flex items-center justify-between p-3 rounded-lg border border-black/5">
                  <div className="flex items-center gap-3">
                    <FiFileText className="text-[#137fec]" />
                    <span className="font-medium text-sm text-black">{f}</span>
                  </div>
                  <a className="text-sm text-[#137fec] hover:underline" href={`${API_BASE}/api/download/${encodeURIComponent(sessionId)}/${encodeURIComponent(f)}`}>Download</a>
                </li>
              ))}
            </ul>
          </div>

          {summary && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <pre className="p-3 rounded bg-black/5 text-sm overflow-auto">{JSON.stringify(summary, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
