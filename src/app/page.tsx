"use client";
"use client";
import React, { useState } from "react";
// @ts-ignore
import '@fontsource/inter';

// Icon imports
import { FiUpload, FiFileText, FiTrash2, FiAlertCircle, FiChevronDown } from "react-icons/fi";

export default function Page() {
  // Dummy state for file uploads, error, advanced settings
  const [bundleAFiles, setBundleAFiles] = useState([
    { name: "customer_data_q1.csv", size: "2.4 MB", icon: "description" },
    { name: "sales_records.parquet", size: "15.1 MB", icon: "backup_table" },
  ]);
  const [uploadError, setUploadError] = useState("Upload failed for \"invalid_file.txt\". Unsupported file type.");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [overrides, setOverrides] = useState("");
  const [sampling, setSampling] = useState("");

  return (
  <div className="font-display bg-blue-50 flex flex-col min-h-screen">
  <header className="flex-shrink-0 border-b border-blue-200">
  <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <svg className="text-primary h-8 w-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
            </svg>
            <h1 className="text-lg font-bold text-blue-900">DataMerge Pro</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-sm font-medium text-blue-700 hover:text-blue-500 transition-colors" href="#">Home</a>
            <a className="text-sm font-medium text-blue-700 hover:text-blue-500 transition-colors" href="#">Documentation</a>
            <a className="text-sm font-medium text-blue-700 hover:text-blue-500 transition-colors" href="#">Support</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 text-blue-700 hover:bg-blue-100">
              <FiAlertCircle />
            </button>
            <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDEizFk45gt7IoZPRpnoujq-Es7qE7EjOQe6nRCJXOTRrqqw7xwd0qyH0OZWwmTxgRJxWwAIgGLLLTMIHzxB4QjVsTav7wbBVzNoDGOE8KlZ8uIGAKofA60JOTponrmIg1_-2fggCBR_UEKkQ4mIkCgCzKIwY1EgchHgxehYARp4Ecb1CmFY9MHaKMhKpKL1zlaWJEZKa94xzUeP35vi870bu9AgWlpSnyc_eie2LBWkm_Ehs-A5QahgNn74dRnAeGgslPEXUpE_nLF")' }} />
          </div>
        </div>
      </header>
  <main className="flex-grow container mx-auto px-4 py-8">
  <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-blue-900">Upload Data Bundles</h2>
            <p className="mt-2 text-blue-700">
              Drag and drop your data files or select them from your computer. Ensure both Bundle A and Bundle B have at least one file for merging.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Bundle A */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-background-dark dark:text-background-light">Bundle A</h3>
              <div className="flex flex-col gap-4 rounded-xl border border-dashed border-blue-200 p-6 text-center bg-blue-100 hover:border-blue-400 transition-all duration-300">
                <div className="flex flex-col items-center justify-center gap-4 p-8">
                  <FiUpload className="text-5xl text-blue-400" />
                  <p className="font-semibold text-blue-900">Drop files here or</p>
                  <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Select files</button>
                  <p className="text-xs text-blue-500 mt-2">Accepted: CSV, XLSX, Parquet</p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:underline">Attach schema (JSON, YAML, Excel)</button>
              </div>
            </div>
            {/* Bundle B */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-background-dark">Bundle B</h3>
              <div className="flex flex-col gap-4 rounded-xl border border-dashed border-blue-200 p-6 text-center bg-blue-100 hover:border-blue-400 transition-all duration-300">
                <div className="flex flex-col items-center justify-center gap-4 p-8">
                  <FiUpload className="text-5xl text-blue-400" />
                  <p className="font-semibold text-blue-900">Drop files here or</p>
                  <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Select files</button>
                  <p className="text-xs text-blue-500 mt-2">Accepted: CSV, XLSX, Parquet</p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:underline">Attach schema (JSON, YAML, Excel)</button>
              </div>
            </div>
          </div>
          {/* Uploaded Files (Bundle A) */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Uploaded Files (Bundle A)</h3>
            <ul className="space-y-3">
              {bundleAFiles.map((file, idx) => (
                <li key={file.name} className="flex items-center justify-between p-3 rounded-lg bg-blue-100">
                  <div className="flex items-center gap-3">
                    <FiFileText className="text-blue-600" />
                    <span className="font-medium text-sm text-blue-900">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-blue-700">{file.size}</span>
                    <button className="text-blue-400 hover:text-red-500">
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Upload Error */}
          {uploadError && (
            <div className="mt-8 p-4 rounded-lg bg-blue-100 text-blue-700 flex items-center gap-3 border border-blue-200">
              <FiAlertCircle />
              <p className="text-sm font-medium">{uploadError}</p>
              <button className="ml-auto text-sm font-bold text-blue-600 hover:underline">Fix</button>
            </div>
          )}
          {/* Advanced Settings */}
          <div className="mt-12">
            <details className="group" open={advancedOpen} onClick={() => setAdvancedOpen(!advancedOpen)}>
              <summary className="list-none flex items-center justify-between cursor-pointer">
                <h3 className="text-lg font-bold text-blue-900">Advanced Settings</h3>
                <FiChevronDown className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2" htmlFor="overrides">Per-file Parsing Overrides</label>
                  <textarea
                    className="w-full rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 focus:ring-blue-400 focus:border-blue-400 transition"
                    id="overrides"
                    name="overrides"
                    placeholder="{ 'file1.csv': { 'delimiter': ';' } }"
                    rows={4}
                    value={overrides}
                    onChange={e => setOverrides(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2" htmlFor="sampling">Sampling Size for Profiling</label>
                  <input
                    className="w-full rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 focus:ring-blue-400 focus:border-blue-400 transition"
                    id="sampling"
                    name="sampling"
                    placeholder="e.g., 10000"
                    type="text"
                    value={sampling}
                    onChange={e => setSampling(e.target.value)}
                  />
                </div>
              </div>
            </details>
          </div>
          {/* Continue Button */}
          <div className="mt-12 flex justify-end border-t border-blue-200 pt-6">
            <button className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-200 disabled:cursor-not-allowed" disabled>
              Continue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
