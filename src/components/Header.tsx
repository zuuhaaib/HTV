"use client";
import React from "react";
import Link from "next/link";
import { FiHelpCircle } from "react-icons/fi";

export default function Header() {
  return (
    <header className="flex-shrink-0 border-b border-black/10 bg-white">
    <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
      {/* Left Logo + Title */}
      <div className="flex items-center gap-3">
        <svg
        className="text-[#137fec] h-8 w-8"
        fill="currentColor"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        >
        <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" />
        </svg>
        <h1 className="text-lg font-bold text-black">DataMerge Pro</h1>
      </div>

      {/* Help + Avatar */}
      <div className="flex items-center gap-4">
        <button
        className="rounded-full p-2 text-black/70 hover:bg-black/5"
        aria-label="Help"
        >
        <FiHelpCircle />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold">
        S
        </div>
      </div>
    </div>
    </header>
  );
}
