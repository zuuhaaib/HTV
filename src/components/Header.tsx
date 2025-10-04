"use client";
import React from "react";
import { FiHelpCircle } from "react-icons/fi";

export default function Header() {
  return (
    <header className="flex-shrink-0 border-b border-black/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <svg className="text-[#137fec] h-8 w-8" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" />
          </svg>
          <h1 className="text-lg font-bold text-black">DataMerge Pro</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a className="text-sm font-medium text-black/70 hover:text-[#137fec] transition-colors" href="#">Home</a>
          <a className="text-sm font-medium text-black/70 hover:text-[#137fec] transition-colors" href="#">Documentation</a>
          <a className="text-sm font-medium text-black/70 hover:text-[#137fec] transition-colors" href="#">Support</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 text-black/70 hover:bg-black/5">
            <FiHelpCircle />
          </button>
          <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDEizFk45gt7IoZPRpnoujq-Es7qE7EjOQe6nRCJXOTRrqqw7xwd0qyH0OZWwmTxgRJxWwAIgGLLLTMIHzxB4QjVsTav7wbBVzNoDGOE8KlZ8uIGAKofA60JOTponrmIg1_-2fggCBR_UEKkQ4mIkCgCzKIwY1EgchHgxehYARp4Ecb1CmFY9MHaKMhKpKL1zlaWJEZKa94xzUeP35vi870bu9AgWlpSnyc_eie2LBWkm_Ehs-A5QahgNn74dRnAeGgslPEXUpE_nLF")' }} />
        </div>
      </div>
    </header>
  );
}
