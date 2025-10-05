"use client";
import React, { useCallback, useMemo, useState } from "react";
import { FiHelpCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import UploadDropzone from "@/components/UploadDropzone";
import UploadedList from "@/components/UploadedList";
import AdvancedSettings from "@/components/AdvancedSettings";
import ContinueButton from "@/components/ContinueButton";

type UploadedFile = {
  name: string;
  sizeBytes: number;
  prettySize?: string;
  icon?: string;
};

export default function Page() {
  // Files
  const [bundleAFiles, setBundleAFiles] = useState<UploadedFile[]>([]);
  const [bundleBFiles, setBundleBFiles] = useState<UploadedFile[]>([]);
  // Optional schema docs
  const [schemaAFiles, setSchemaAFiles] = useState<UploadedFile[]>([]);
  const [schemaBFiles, setSchemaBFiles] = useState<UploadedFile[]>([]);

  // UI / state
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  // Accept & validator
  const acceptExts = useMemo(() => [".csv", ".xlsx", ".xls", ".parquet"], []);
  const prettySize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };
  const validateFiles = useCallback(
    (files: File[], { maxSizeMB = 100 }: { maxSizeMB?: number } = {}) => {
      const allowed = new Set(acceptExts);
      for (const f of files) {
        const ext = `.${f.name.split(".").pop()?.toLowerCase()}`;
        if (!allowed.has(ext)) return `Unsupported file: "${f.name}". Allowed: ${Array.from(allowed).join(", ")}`;
        if (f.size > maxSizeMB * 1024 * 1024) return `File too large: "${f.name}" exceeds ${maxSizeMB} MB.`;
      }
      return null;
    },
    [acceptExts]
  );

  // Single stable handler (fixes rules-of-hooks)
  const handleAdd = useCallback(
    async (which: "A" | "B", files: File[]) => {
      const err = validateFiles(files, { maxSizeMB: 100 });
      if (err) {
        setUploadError(err);
        return;
      }

      try {
        // Build form data
        const fd = new FormData();
        for (const f of files) fd.append("files", f);

        if (which === "A") {
          // Upload bundle1 - this returns a session_id
          const res = await fetch(`${API_BASE}/api/upload-bundle1`, {
            method: "POST",
            body: fd,
          });
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Upload failed");
          }
          const json = await res.json();
          setSessionId(json.session_id || null);
          // update UI state
          const mapped: UploadedFile[] = files.map((f) => ({
            name: f.name,
            sizeBytes: f.size,
            prettySize: prettySize(f.size),
          }));
          setBundleAFiles((p) => [...p, ...mapped]);
        } else {
          // Bundle B requires sessionId
          if (!sessionId) {
            setUploadError("Please upload Bundle A first (a session must be created).");
            return;
          }
          // append session id as form field (also accepted as query param)
          fd.append("session_id", sessionId);
          const res = await fetch(`${API_BASE}/api/upload-bundle2?session_id=${encodeURIComponent(
            sessionId
          )}`, {
            method: "POST",
            body: fd,
          });
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Upload failed");
          }
          const json = await res.json();
          // update UI state
          const mapped: UploadedFile[] = files.map((f) => ({
            name: f.name,
            sizeBytes: f.size,
            prettySize: prettySize(f.size),
          }));
          setBundleBFiles((p) => [...p, ...mapped]);
        }

        setUploadError(null);
      } catch (e: any) {
        setUploadError(e.message || String(e));
      }
    },
    [validateFiles, sessionId, API_BASE]
  );

  const canContinue = bundleAFiles.length > 0 && bundleBFiles.length > 0 && !uploadError;

  const handleContinue = async () => {
    if (!canContinue) {
      setUploadError("Please upload at least one file in both Bundle A and Bundle B to continue.");
      return;
    }
    if (!sessionId) {
      setUploadError("Missing session id. Please re-upload Bundle A to create a session.");
      return;
    }

    try {
      setMerging(true);
      setUploadError(null);

      const res = await fetch(`${API_BASE}/api/merge/${encodeURIComponent(sessionId)}`, {
        method: "POST",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to start merge job");
      }

      const jobJson = await res.json();
      const jobId = jobJson.job_id;

      // Poll job status
      const poll = async (): Promise<void> => {
        try {
          const r = await fetch(`${API_BASE}/api/job/${encodeURIComponent(jobId)}`);
          if (!r.ok) {
            const t = await r.text();
            throw new Error(t || "Job status fetch failed");
          }
          const j = await r.json();
          if (j.status === "success") {
            // save result and navigate
            try {
              localStorage.setItem(`merge_result_${sessionId}`, JSON.stringify(j.result));
            } catch (e) {}
            router.push(`/download/${sessionId}`);
            return;
          } else if (j.status === "failed") {
            setUploadError(j.error || "Merge job failed");
            setMerging(false);
            return;
          } else {
            // still queued/running -> wait and poll again
            setTimeout(poll, 1500);
          }
        } catch (err: any) {
          setUploadError(err.message || String(err));
          setMerging(false);
        }
      };

      poll();

    } catch (e: any) {
      setUploadError(e.message || String(e));
      setMerging(false);
    }
  };

  return (
    <div className="font-display bg-[#f6f7f8] flex flex-col min-h-screen">

      {/* Your existing site header */}
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-black">Upload Data Bundles</h2>
            <p className="mt-2 text-black/60">
              Drag and drop your data files or select them from your computer. Ensure both Bundle A and Bundle B have at least one file for merging.
            </p>
          </div>

          {/* Cards with dropzones */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Bundle A */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-black/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#0b2343]">Bundle A</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-[#fff7e0] text-[#7a5d00] border border-[#ffd200]">
                  {bundleAFiles.length} file{bundleAFiles.length === 1 ? "" : "s"}
                </span>
              </div>
              <UploadDropzone
                title="Drop files here"
                accept={acceptExts}
                maxSizeMB={100}
                onFilesAdded={(files) => handleAdd("A", files)}
                highlightClass="border-[#ffd200] bg-[#fff7e0]"
              />
              <div className="mt-4">
                <div className="text-sm text-black/60 mb-2">Optional: Upload schema documentation for Bundle A</div>
                <UploadDropzone
                  title="Drop schema files (optional)"
                  accept={[".csv", ".xlsx", ".xls"]}
                  maxSizeMB={10}
                  uploadEndpoint={`${API_BASE}/api/upload-schema1`}
                  sessionId={sessionId}
                  onFilesAdded={(files) => {
                    const mapped: UploadedFile[] = files.map((f) => ({ name: f.name, sizeBytes: f.size, prettySize: prettySize(f.size) }));
                    setSchemaAFiles((p) => [...p, ...mapped]);
                  }}
                  highlightClass="border-[#ffd200] bg-[#fff7e0]"
                />
                <div className="mt-3">
                  <UploadedList files={schemaAFiles} title="Schema Files (Bundle A)" onRemove={(idx) => setSchemaAFiles((prev) => prev.filter((_, i) => i !== idx))} />
                </div>
              </div>
              <div className="mt-4">
                <UploadedList
                  files={bundleAFiles}
                  title="Uploaded Files (Bundle A)"
                  onRemove={(idx) => setBundleAFiles((prev) => prev.filter((_, i) => i !== idx))}
                />
              </div>
            </div>

            {/* Bundle B */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-black/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#0b2343]">Bundle B</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-[#eaf2ff] text-[#0b2343] border border-[#b3ccff]">
                  {bundleBFiles.length} file{bundleBFiles.length === 1 ? "" : "s"}
                </span>
              </div>
              <UploadDropzone
                title="Drop files here"
                accept={acceptExts}
                maxSizeMB={100}
                onFilesAdded={(files) => handleAdd("B", files)}
                highlightClass="border-[#b3ccff] bg-[#eaf2ff]"
              />
              <div className="mt-4">
                <div className="text-sm text-black/60 mb-2">Optional: Upload schema documentation for Bundle B</div>
                <UploadDropzone
                  title="Drop schema files (optional)"
                  accept={[".csv", ".xlsx", ".xls"]}
                  maxSizeMB={10}
                  uploadEndpoint={`${API_BASE}/api/upload-schema2`}
                  sessionId={sessionId}
                  onFilesAdded={(files) => {
                    const mapped: UploadedFile[] = files.map((f) => ({ name: f.name, sizeBytes: f.size, prettySize: prettySize(f.size) }));
                    setSchemaBFiles((p) => [...p, ...mapped]);
                  }}
                  highlightClass="border-[#b3ccff] bg-[#eaf2ff]"
                />
                <div className="mt-3">
                  <UploadedList files={schemaBFiles} title="Schema Files (Bundle B)" onRemove={(idx) => setSchemaBFiles((prev) => prev.filter((_, i) => i !== idx))} />
                </div>
              </div>
              <div className="mt-4">
                <UploadedList
                  files={bundleBFiles}
                  title="Uploaded Files (Bundle B)"
                  onRemove={(idx) => setBundleBFiles((prev) => prev.filter((_, i) => i !== idx))}
                />
              </div>
            </div>
          </div>

          {/* Error toast */}
          {uploadError && (
            <div className="mt-8 p-4 rounded-lg bg-red-500/10 text-red-700 flex items-center gap-3 border border-red-200">
              <FiHelpCircle className="text-red-700 shrink-0" />
              <p className="text-sm font-medium">{uploadError}</p>
              <button className="ml-auto text-sm font-bold text-[#137fec] hover:underline" onClick={() => setUploadError(null)}>
                Dismiss
              </button>
            </div>
          )}

          {/* Desktop continue bar */}
          <div className="hidden md:flex mt-10 justify-end border-t border-black/10 pt-6">
            <div className={merging ? "animate-pulse" : ""}>
              <ContinueButton disabled={!canContinue || merging} onClick={handleContinue}>
                {merging ? "Merging..." : "Continue"}
              </ContinueButton>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky mobile footer */}
      <div className="md:hidden sticky bottom-0 inset-x-0 bg-white border-t border-black/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="text-xs text-black/60">
            {bundleAFiles.length} in A · {bundleBFiles.length} in B
          </div>
            <div className="ml-auto w-[50%]">
              <ContinueButton disabled={!canContinue || merging} onClick={handleContinue}>
                {merging ? "Merging..." : "Continue"}
              </ContinueButton>
            </div>
        </div>
      </div>
    </div>
  );
}
