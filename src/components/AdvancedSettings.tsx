"use client";
import React from "react";
import { FiChevronDown } from "react-icons/fi";

type Props = {
  overrides: string;
  sampling: string;
  open: boolean;
  setOverrides: (v: string) => void;
  setSampling: (v: string) => void;
  setOpen: (v: boolean) => void;
};

export default function AdvancedSettings({ overrides, sampling, open, setOverrides, setSampling, setOpen }: Props) {
  return (
    <details className="group" open={open} onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary className="list-none flex items-center justify-between cursor-pointer">
        <h3 className="text-lg font-bold text-black">Advanced Settings</h3>
        <FiChevronDown className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-black mb-2" htmlFor="overrides">Per-file Parsing Overrides</label>
          <textarea
            className="w-full rounded-lg border border-black/20 bg-[#f6f7f8] p-3 text-sm text-black focus:ring-[#137fec] focus:border-[#137fec] transition"
            id="overrides"
            name="overrides"
            placeholder="{ 'file1.csv': { 'delimiter': ';' } }"
            rows={4}
            value={overrides}
            onChange={e => setOverrides(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-2" htmlFor="sampling">Sampling Size for Profiling</label>
          <input
            className="w-full rounded-lg border border-black/20 bg-[#f6f7f8] p-3 text-sm text-black focus:ring-[#137fec] focus:border-[#137fec] transition"
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
  );
}
