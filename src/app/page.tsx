"use client";
import React, { useState } from "react";
// @ts-ignore
import '@fontsource/inter';

// Icon imports
import { FiUpload, FiFileText, FiTrash2, FiChevronDown, FiHelpCircle } from "react-icons/fi";
import Header from "@/components/Header";
import UploadDropzone from "@/components/UploadDropzone";
import UploadedList from "@/components/UploadedList";
import AdvancedSettings from "@/components/AdvancedSettings";
import ContinueButton from "@/components/ContinueButton";

export default function Page() {
  // Dummy state for file uploads, error, advanced settings
  const [bundleAFiles, setBundleAFiles] = useState([
    { name: "customer_data_q1.csv", size: "2.4 MB", icon: "description" },
    { name: "sales_records.parquet", size: "15.1 MB", icon: "backup_table" },
  ]);
  const [bundleBFiles, setBundleBFiles] = useState([]);
  const [uploadError, setUploadError] = useState("Upload failed for \"invalid_file.txt\". Unsupported file type.");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [overrides, setOverrides] = useState("");
  const [sampling, setSampling] = useState("");

  return (
  <div className="font-display bg-[#f6f7f8] flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow container mx-auto px-4 py-8">
  <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-black">Upload Data Bundles</h2>
            <p className="mt-2 text-black/60">
              Drag and drop your data files or select them from your computer. Ensure both Bundle A and Bundle B have at least one file for merging.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <UploadDropzone title="Bundle A" />
            <UploadDropzone title="Bundle B" />
          </div>
          {/* Uploaded Files (Bundle A) */}
          <UploadedList files={bundleAFiles} title="Uploaded Files (Bundle A)" onRemove={(idx) => {
            const copy = [...bundleAFiles];
            copy.splice(idx, 1);
            setBundleAFiles(copy);
          }} />
          {/* Upload Error */}
          {uploadError && (
            <div className="mt-8 p-4 rounded-lg bg-red-500/10 text-red-700 flex items-center gap-3">
              <FiHelpCircle className="text-red-700" />
              <p className="text-sm font-medium">{uploadError}</p>
              <button className="ml-auto text-sm font-bold text-[#137fec] hover:underline">Fix</button>
            </div>
          )}
          {/* Advanced Settings */}
          <div className="mt-12">
            <AdvancedSettings
              overrides={overrides}
              sampling={sampling}
              open={advancedOpen}
              setOverrides={setOverrides}
              setSampling={setSampling}
              setOpen={setAdvancedOpen}
            />
          </div>
          {/* Continue Button */}
          <div className="mt-12 flex justify-end border-t border-black/10 pt-6">
            <ContinueButton disabled={bundleAFiles.length === 0 && bundleBFiles.length === 0}>Continue</ContinueButton>
          </div>
        </div>
      </main>
    </div>
  );
}
