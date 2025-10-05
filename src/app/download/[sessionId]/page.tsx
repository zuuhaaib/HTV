"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { FiDownload, FiFileText, FiArchive, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function DownloadPage() {
  const { sessionId } = useParams() as { sessionId: string };
  const [files, setFiles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [mappings, setMappings] = useState<any | null>(null);
  const [openTables, setOpenTables] = useState<Record<string, boolean>>({});

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
          // parsed may be the job.result object with keys: mappings, summary, output_files
          setMappings(parsed.mappings || null);
          // prefer parsed.summary, fallback to mappings.summary
          const s = (parsed.mappings && parsed.mappings.summary) || parsed.summary || null;
          setSummary(s);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      // ignore localStorage parse errors
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
          </div>

          {/* Buttons row: placed below the header, buttons fill available horizontal space */}
          <div className="mt-6 flex w-full gap-3">
            <a href={`${API_BASE}/api/download/${encodeURIComponent(sessionId)}/merged_output.zip`} className="inline-flex flex-1 min-w-0 items-center justify-center rounded-lg h-12 px-4 text-base font-bold text-white bg-[#137fec] hover:bg-[#0f6dc9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#137fec]/50 shadow-sm">
              <FiDownload />
              <span className="ml-2 truncate">Download All</span>
            </a>
            <a href={`${API_BASE}/api/mapping_pdf/${encodeURIComponent(sessionId)}`} className="inline-flex flex-1 min-w-0 items-center justify-center rounded-lg h-12 px-4 text-base font-bold text-white bg-[#10b981] hover:bg-[#0ea46f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10b981]/50 shadow-sm">
              <FiFileText />
              <span className="ml-2 truncate">Download PDF Doc</span>
            </a>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Files</h3>
            <ul className="space-y-3">
              {files && files.map((f) => (
                <li key={f} className="flex items-center justify-between p-3 rounded-lg border border-black/5">
                  <div className="flex items-center gap-3">
                    <FiFileText className="w-5 h-5 text-black/60" />
                    <div className="font-medium">{f}</div>
                  </div>
                  <a href={`${API_BASE}/api/download/${encodeURIComponent(sessionId)}/${encodeURIComponent(f)}`} className="text-sm text-[#137fec]">Download</a>
                </li>
              ))}
            </ul>

            {/* Mapping summary (human friendly) */}
            {summary && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Mapping Summary</h3>
                <p className="text-sm text-black/70">{typeof summary === 'string' ? summary : JSON.stringify(summary)}</p>
              </div>
            )}

            {/* Detailed table/field mappings */}
            <div className="mt-6 space-y-4">
              {mappings && mappings.table_mappings && mappings.table_mappings.map((map: any, idx: number) => {
                const key = `${map.source_table}=>${map.target_table}:${idx}`;
                const open = !!openTables[key];
                return (
                  <div key={key} className="border rounded-lg p-3 bg-white">
                    <button
                      onClick={() => setOpenTables((s) => ({ ...s, [key]: !s[key] }))}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-[#0b2343]">{map.source_table}</div>
                        <div className="text-xs text-black/40">→</div>
                        <div className="text-sm font-semibold text-[#137fec]">{map.target_table}</div>
                      </div>
                      <div className="text-sm text-black/50">{open ? <FiChevronUp /> : <FiChevronDown />}</div>
                    </button>

                    {open && (
                      <div className="mt-3">
                        <div className="text-sm text-black/60 mb-2">Field mappings:</div>
                        <div className="overflow-auto">
                          <table className="w-full text-sm table-fixed">
                            <thead>
                              <tr className="text-left text-xs text-black/60">
                                <th className="w-1/3 px-2 py-1">Source field</th>
                                <th className="w-1/3 px-2 py-1">Target field</th>
                                <th className="w-1/6 px-2 py-1">Confidence</th>
                                <th className="w-1/6 px-2 py-1">Reasoning</th>
                              </tr>
                            </thead>
                            <tbody>
                              {map.field_mappings && map.field_mappings.map((fm: any, i: number) => (
                                <tr key={i} className="border-t">
                                  <td className="px-2 py-2 align-top">{fm.source_field}</td>
                                  <td className="px-2 py-2 align-top">{fm.target_field}</td>
                                  <td className="px-2 py-2 align-top">
                                    <span className="inline-block bg-black/5 px-2 rounded">{(fm.confidence || 0).toFixed(2)}</span>
                                  </td>
                                  <td className="px-2 py-2 align-top text-xs text-black/60">{fm.reasoning}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Raw summary object (if present) */}
            {summary && typeof summary !== 'string' && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Raw Summary</h4>
                <pre className="p-3 rounded bg-black/5 text-sm overflow-auto">{JSON.stringify(summary, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
