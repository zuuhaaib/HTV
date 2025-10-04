"use client";
import React from "react";
import { FiFileText, FiTrash2 } from "react-icons/fi";

type FileItem = {
  name: string;
  size: string;
};

type Props = {
  files: FileItem[];
  onRemove?: (index: number) => void;
  title?: string;
};

export default function UploadedList({ files, onRemove, title }: Props) {
  if (!files || files.length === 0) return null;

  return (
    <div className="mt-8">
      {title && <h3 className="text-lg font-bold text-black mb-4">{title}</h3>}
      <ul className="space-y-3">
        {files.map((file, idx) => (
          <li key={idx} className="flex items-center justify-between p-3 rounded-lg bg-black/5">
            <div className="flex items-center gap-3">
              <FiFileText className="text-[#137fec]" />
              <span className="font-medium text-sm text-black">{file.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-black/60">{file.size}</span>
              <button className="text-black/50 hover:text-red-500" onClick={() => onRemove && onRemove(idx)}>
                <FiTrash2 className="text-lg" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
