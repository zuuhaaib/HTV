"use client";
import React, { useCallback, useMemo, useState } from "react";
import "@fontsource/inter";
import { FiHelpCircle } from "react-icons/fi";

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
  const [bundleAFiles, setBundleAFiles] = useState<UploadedFile[]>([
    { name: "customer_data_q1.csv", sizeBytes: 2.4 * 1024 * 1024, prettySize: "2.4 MB", icon: "description" },
    { name: "sales_records.parquet", sizeBytes: 15.1 * 1024 * 1024, prettySize: "15.1 MB", icon: "backup_table" },
  ]);
  const [bundleBFiles, setBundleBFiles] = useState<UploadedFile[]>([]);

  // UI / state
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [overrides, setOverrides] = useState("");
  const [sampling, setSampling] = useState("");
  const [justContinued, setJustContinued] = useState(false);

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
    (which: "A" | "B", files: File[]) => {
      const err = validateFiles(files, { maxSizeMB: 100 });
      if (err) {
        setUploadError(err);
        return;
      }

      const mapped: UploadedFile[] = files.map((f) => ({
        name: f.name,
        sizeBytes: f.size,
        prettySize: prettySize(f.size),
        icon: "description",
      }));

      if (which === "A") setBundleAFiles((p) => [...p, ...mapped]);
      else setBundleBFiles((p) => [...p, ...mapped]);

      setUploadError(null);
    },
    [validateFiles] // prettySize is stable here; it's a local function with no closure over state
  );

  const canContinue = bundleAFiles.length > 0 && bundleBFiles.length > 0 && !uploadError;

  const handleContinue = () => {
    if (!canContinue) {
      setUploadError("Please upload at least one file in both Bundle A and Bundle B to continue.");
      return;
    }
    setJustContinued(true);
    setTimeout(() => setJustContinued(false), 1200);
    // router.push("/map"); // if routing to the next step
  };

  return (
    <div className="font-display bg-[#f6f7f8] flex flex-col min-h-screen">
      {/* EY-style top bar accent */}
      <div className="h-1 w-full bg-[#ffd200]" />
      <div className="bg-[#0b2343] text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-[#ffd200] rotate-12" />
              <span className="text-sm opacity-90">EY Canada · Data Integration Challenge</span>
            </div>
            <nav className="hidden md:flex items-center gap-3 text-xs opacity-80">
              <span className="opacity-75">1 Upload</span>
              <span>›</span>
              <span className="opacity-40">2 Map</span>
              <span>›</span>
              <span className="opacity-40">3 Merge</span>
              <span>›</span>
              <span className="opacity-40">4 Export</span>
            </nav>
          </div>
        </div>
      </div>

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

          {/* Advanced Settings card */}
          <div className="mt-10 bg-white rounded-2xl shadow-sm p-6 border border-black/5">
            <h3 className="text-lg font-semibold mb-3">Advanced Settings</h3>
            <AdvancedSettings
              overrides={overrides}
              sampling={sampling}
              open={advancedOpen}
              setOverrides={setOverrides}
              setSampling={setSampling}
              setOpen={setAdvancedOpen}
            />
          </div>

          {/* Desktop continue bar */}
          <div className="hidden md:flex mt-10 justify-end border-t border-black/10 pt-6">
            <div className={justContinued ? "animate-pulse" : ""}>
              <ContinueButton disabled={!canContinue} onClick={handleContinue}>
                {justContinued ? "Ready to Merge ✅" : "Continue"}
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
            <ContinueButton disabled={!canContinue} onClick={handleContinue}>
              {justContinued ? "Ready ✅" : "Continue"}
            </ContinueButton>
          </div>
        </div>
      </div>
    </div>
  );
}
