"use client";
import React from "react";
import { FiUpload } from "react-icons/fi";

type Props = {
  title: string;
  cta?: string;
};

export default function UploadDropzone({ title, cta = "Select files" }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-black">{title}</h3>
      <div className="flex flex-col gap-4 rounded-xl border border-dashed border-black/20 p-6 text-center bg-[#f6f7f8] hover:border-[#137fec] transition-all duration-300">
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <FiUpload className="text-5xl text-black/40 animate-bounce" />
          <p className="font-semibold text-black">Drop files here or</p>
          <button className="bg-[#137fec] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#137fec]/90 transition-colors">
            {cta}
          </button>
          <p className="text-xs text-black/50 mt-2">
            Accepted: CSV, XLSX, Parquet
          </p>
        </div>
        <button className="text-sm font-medium text-[#137fec] hover:underline">
          Attach schema (JSON, YAML, Excel)
        </button>
      </div>
    </div>
  );
}
