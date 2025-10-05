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

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-black/70 hover:text-[#137fec] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/DataMerger"
            className="text-sm font-medium text-black/70 hover:text-[#137fec] transition-colors"
          >
            Analyse
          </Link>
          <Link
            href="/Align"
            className="text-sm font-medium text-black/70 hover:text-[#137fec] transition-colors"
          >
            Align
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium text-black/70 hover:text-[#137fec] transition-colors"
          >
            Documentation
          </Link>
        </nav>

        {/* Help + Avatar */}
        <div className="flex items-center gap-4">
          <button
            className="rounded-full p-2 text-black/70 hover:bg-black/5"
            aria-label="Help"
          >
            <FiHelpCircle />
          </button>
          <div
            className="h-10 w-10 rounded-full bg-cover bg-center border border-black/10"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDEizFk45gt7IoZPRpnoujq-Es7qE7EjOQe6nRCJXOTRrqqw7xwd0qyH0OZWwmTxgRJxWwAIgGLLLTMIHzxB4QjVsTav7wbBVzNoDGOE8KlZ8uIGAKofA60JOTponrmIg1_-2fggCBR_UEKkQ4mIkCgCzKIwY1EgchHgxehYARp4Ecb1CmFY9MHaKMhKpKL1zlaWJEZKa94xzUeP35vi870bu9AgWlpSnyc_eie2LBWkm_Ehs-A5QahgNn74dRnAeGgslPEXUpE_nLF")',
            }}
          />
        </div>
      </div>
    </header>
  );
}
