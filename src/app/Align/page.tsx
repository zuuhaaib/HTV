"use client";
import React, { useMemo, useState } from "react";
import "@fontsource/inter";
import Header from "@/components/Header";

type Confidence = "High" | "Medium" | "Low";
type Row = {
  aColumn: string;
  suggested: string | "Unmapped";
  confidence: Confidence;
  preview: string;
  status?: "accepted" | "cleared"; // demo-only
};

const initialRows: Row[] = [
  { aColumn: "Customer ID", suggested: "Customer ID", confidence: "High", preview: "A: 12345, B: 12345" },
  { aColumn: "First Name", suggested: "First Name", confidence: "High", preview: "A: Alex, B: Alex" },
  { aColumn: "Last Name", suggested: "Last Name", confidence: "High", preview: "A: Harper, B: Harper" },
  {
    aColumn: "Email",
    suggested: "Email Address",
    confidence: "Medium",
    preview: "A: alex.harper@email.com, B: alex.harper@email.com",
  },
  { aColumn: "Phone", suggested: "Unmapped", confidence: "Low", preview: "A: 555-123-4567, B: (Not found)" },
];

export default function AlignPage() {
  const [activeTab, setActiveTab] = useState<"Customers" | "Accounts" | "Transactions">("Customers");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Unmapped" | "Low confidence">("All");
  const [enableOneToMany, setEnableOneToMany] = useState(false);
  const [rows, setRows] = useState<Row[]>(initialRows);

  const filteredRows = useMemo(() => {
    let r = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (row) =>
          row.aColumn.toLowerCase().includes(q) ||
          (typeof row.suggested === "string" && row.suggested.toLowerCase().includes(q)) ||
          row.preview.toLowerCase().includes(q)
      );
    }
    if (filter === "Unmapped") r = r.filter((row) => row.suggested === "Unmapped");
    else if (filter === "Low confidence") r = r.filter((row) => row.confidence === "Low");
    return r;
  }, [rows, search, filter]);

  const onAccept = (i: number) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: "accepted" } : r)));
  };
  const onClear = (i: number) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: "cleared" } : r)));
  };
  const onAcceptAllHigh = () => {
    setRows((prev) => prev.map((r) => (r.confidence === "High" ? { ...r, status: "accepted" } : r)));
  };

  return (
    <div className="bg-[#f6f7f8] font-display text-gray-800 min-h-screen">
      {/* EY accent + breadcrumb bar (consistent across pages) */}
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

      {/* Your shared product header (keeps same logo/nav everywhere) */}
      <Header />

      <div className="relative flex min-h-[calc(100vh-6rem)] w-full flex-col overflow-x-hidden">
        {/* Main */}
        <main className="flex flex-1 justify-center py-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-7xl flex flex-col gap-6">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-gray-900">Align Data Bundles</h1>
              <p className="text-sm text-gray-600">
                Map columns from Bundle A to Bundle B to ensure accurate data merging. Use the suggested mappings or
                customize them as needed.
              </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {(["Customers", "Accounts", "Transactions"] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={
                        (isActive
                          ? "border-[#137fec] text-[#137fec] "
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 ") +
                        "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                      }
                      aria-current={isActive ? "page" : undefined}
                    >
                      {tab}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="relative md:col-span-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-gray-400"></span>
                </div>
                <input
                  id="search"
                  name="search"
                  type="text"
                  placeholder="Search columns"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full rounded-lg border-0 bg-white py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#137fec] text-sm"
                />
              </div>

              <div className="flex gap-2 items-center md:col-span-2 justify-start md:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Filter by:</span>
                  <select
                    id="filter"
                    name="filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                    className="rounded-lg border-0 bg-white py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#137fec] text-sm"
                  >
                    <option>All</option>
                    <option>Unmapped</option>
                    <option>Low confidence</option>
                  </select>
                </div>
                <button
                  onClick={onAcceptAllHigh}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#137fec]/10 h-10 px-4 text-[#137fec] text-sm font-bold hover:bg-[#137fec]/20"
                >
                  <span className="material-symbols-outlined text-base">done_all</span>
                  <span>Accept all High</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["A Column", "Suggested B Column", "Confidence", "Preview", "Action"].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRows.map((row, i) => {
                    const bg =
                      row.aColumn === "Email"
                        ? "bg-blue-50"
                        : row.aColumn === "Phone"
                        ? "bg-red-50"
                        : undefined;

                    const confPill =
                      row.confidence === "High"
                        ? "bg-green-100 text-green-700"
                        : row.confidence === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700";

                    return (
                      <tr key={row.aColumn + i} className={bg}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.aColumn}
                          {row.status === "accepted" && (
                            <span className="ml-2 text-xs rounded px-2 py-0.5 bg-green-100 text-green-700">Accepted</span>
                          )}
                          {row.status === "cleared" && (
                            <span className="ml-2 text-xs rounded px-2 py-0.5 bg-gray-100 text-gray-600">Cleared</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {row.aColumn === "Email" ? (
                            <select className="rounded-lg border-0 bg-white py-2 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#137fec] text-sm w-full">
                              <option>Email Address</option>
                              <option>Work Email</option>
                              <option>Personal Email</option>
                            </select>
                          ) : (
                            <span className={row.suggested === "Unmapped" ? "text-red-600 font-medium" : ""}>
                              {row.suggested}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${confPill}`}>
                            <svg aria-hidden="true" className="h-1.5 w-1.5 fill-current" viewBox="0 0 6 6">
                              <circle cx="3" cy="3" r="3"></circle>
                            </svg>
                            {row.confidence}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.preview}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {row.suggested === "Unmapped" ? (
                            <button onClick={() => onClear(i)} className="text-gray-500 hover:text-gray-700">
                              Clear
                            </button>
                          ) : row.aColumn === "Email" ? (
                            <div className="flex items-center gap-4">
                              <button onClick={() => onAccept(i)} className="text-[#137fec] hover:underline">
                                Accept
                              </button>
                              <button className="rounded-lg px-2 py-1 text-xs bg-[#137fec]/10 text-[#137fec] hover:bg-[#137fec]/20">
                                + Add transform
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => onAccept(i)} className="text-[#137fec] hover:underline">
                              Accept
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom panel */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Explanation</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Review the suggested mappings and adjust as necessary. High confidence mappings are generally accurate,
                  while medium and low confidence mappings may require closer inspection. Use the preview to compare
                  sample values from both bundles.
                </p>
              </div>

              <div className="border-top border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900">Advanced Options</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium text-gray-700">Enable 1-to-many mapping</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={enableOneToMany}
                      onChange={(e) => setEnableOneToMany(e.target.checked)}
                    />
                    <div
                      className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:outline-none
                                 peer-checked:after:translate-x-full peer-checked:after:border-white
                                 after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                 after:bg-white after:border-gray-300 after:border after:rounded-full
                                 after:h-5 after:w-5 after:transition-all
                                 peer-checked:bg-[#137fec] relative"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="flex min-w-[84px] items-center justify-center rounded-lg h-12 px-6 bg-[#137fec] text-white text-sm font-bold shadow-sm hover:bg-[#0f6dc9] disabled:bg-gray-300 disabled:cursor-not-allowed">
                <span>Continue</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
