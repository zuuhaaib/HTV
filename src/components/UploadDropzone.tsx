// components/UploadDropzone.tsx
"use client";
import React, { useCallback, useRef, useState } from "react";
import { FiUpload } from "react-icons/fi";

export interface UploadDropzoneProps {
  /** Label shown inside the dropzone */
  title?: string;
  /** Array of extensions like [".csv", ".xlsx", ".xls", ".parquet"] */
  accept?: string[];
  /** Max size in MB for UI hinting (validation can also be done by caller) */
  maxSizeMB?: number;
  /** Callback with the files that were dropped/selected */
  onFilesAdded?: (files: File[]) => void;
  /** Extra classes applied when user drags over (for your yellow/blue highlight) */
  highlightClass?: string;
  /** Optional: allow multiple files (default true) */
  multiple?: boolean;
}

export default function UploadDropzone({
  title = "Drop files here",
  accept = [],
  maxSizeMB = 100,
  onFilesAdded,
  highlightClass = "",
  multiple = true,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const acceptAttr = accept.length ? accept.join(",") : undefined;

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || !onFilesAdded) return;
      const files = Array.from(fileList);
      onFilesAdded(files);
    },
    [onFilesAdded]
  );

  const onBrowse = () => inputRef.current?.click();

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // reset so same file can be selected again if needed
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={[
        "rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center transition-colors",
        isDragging ? highlightClass || "bg-slate-50 border-slate-400" : "",
      ].join(" ")}
      role="region"
      aria-label="Upload files"
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={acceptAttr}
        multiple={multiple}
        onChange={onChange}
      />

      <div className="flex flex-col items-center gap-2">
        <FiUpload className="text-3xl text-slate-500" />
        <p className="text-sm text-slate-600">
          {title} <span className="text-slate-400">(max {maxSizeMB} MB each)</span>
        </p>
        <div className="mt-2">
          <button
            type="button"
            onClick={onBrowse}
            className="inline-flex items-center justify-center rounded-lg h-9 px-4 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Browse files
          </button>
        </div>
      </div>
    </div>
  );
}
