"use client";
import React from "react";
import "@fontsource/inter";
import Header from "@/components/Header";

/* ---------- Small presentational card ---------- */
function DatasetCard({
  title,
  rows,
  cols,
  candidateKeyStatus = "ok",
  keyNullPct = 0,
}: {
  title: string;
  rows: number;
  cols: number;
  candidateKeyStatus?: "ok" | "warn";
  keyNullPct?: number;
}) {
  const badge =
    candidateKeyStatus === "ok"
      ? { wrap: "bg-green-100 text-green-700", icon: "check_circle", text: "Candidate key" }
      : { wrap: "bg-orange-100 text-orange-700", icon: "warning", text: "Candidate key" };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">
          {rows} rows, {cols} columns
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            Rows: {rows}
          </div>
          <div className="flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            Columns: {cols}
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${badge.wrap}`}>
            <span className="material-symbols-outlined text-base">{badge.icon}</span>
            {badge.text}
          </div>
          <div className="flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            Nulls in key: {keyNullPct}%
          </div>
        </div>

        <div className="mt-6">
          <button className="inline-flex items-center justify-center rounded-lg h-10 px-4 text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            View details
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function DataMergerPage() {
  return (
    <div className="bg-[#f6f7f8] font-display text-slate-800 min-h-screen flex flex-col">
      {/* EY-style top bar accent (same as upload page) */}
      <div className="h-1 w-full bg-[#ffd200]" />
      <div className="bg-[#0b2343] text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-[#ffd200] rotate-12" />
              <span className="text-sm opacity-90">EY Canada · Data Integration Challenge</span>
            </div>
            <nav className="hidden md:flex items-center gap-3 text-xs opacity-80" aria-label="Progress">
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

      {/* Your shared product header to keep the same logo/nav everywhere */}
      <Header />

      {/* Main */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-8">
            Understand Your Data
          </h1>

          {/* Bundle A */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-3">Bundle A</h2>
            <div className="grid grid-cols-1 gap-8">
              <DatasetCard title="Customers" rows={200} cols={10} />
              <DatasetCard title="Accounts" rows={150} cols={8} />
              <DatasetCard title="Transactions" rows={500} cols={12} candidateKeyStatus="warn" keyNullPct={5} />
            </div>
          </div>

          {/* Bundle B */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-3">Bundle B</h2>
            <div className="grid grid-cols-1 gap-8">
              <DatasetCard title="Customers" rows={180} cols={9} />
              <DatasetCard title="Accounts" rows={160} cols={7} />
              <DatasetCard title="Transactions" rows={480} cols={11} />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="mb-10">
            <details className="bg-white border border-slate-200 rounded-xl group">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <div className="font-semibold text-slate-900">Advanced Options</div>
                <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">
                  expand_more
                </span>
              </summary>
              <div className="px-4 pb-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-4">
                  Download auto-generated schema files or increase the sample size for analysis.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg h-10 px-4 text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                    <span className="material-symbols-outlined text-base">download</span>
                    <span>Download Schemas</span>
                  </button>
                  <div className="flex-1">
                    <label htmlFor="sample-size" className="block text-sm font-medium text-slate-700 mb-1">
                      Increase Sample Size
                    </label>
                    <input
                      id="sample-size"
                      type="range"
                      min={100}
                      max={1000}
                      defaultValue={200}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#137fec]"
                    />
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* Continue */}
          <div className="flex justify-end">
            <button className="inline-flex items-center justify-center rounded-lg h-12 px-6 text-base font-bold bg-[#137fec] text-white hover:bg-[#0f6dc9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#137fec]/50 transition-all">
              Continue
              <span className="material-symbols-outlined ml-2">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
