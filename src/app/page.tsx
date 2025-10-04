"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaDatabase } from "react-icons/fa";

export default function LandingPage() {
  const router = useRouter();
  const [files, setFiles] = useState<{ a?: File; b?: File }>({});

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "a" | "b"
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [key]: e.target.files[0] });
    }
  };

  const handleContinue = () => {
    if (files.a && files.b) {
      router.push("/mapping");
    } else {
      alert("Upload both datasets first!");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-indigo-900 to-black text-gray-200 px-6">
      <motion.h1
        className="text-5xl font-extrabold mb-8 text-white drop-shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Data Integration
      </motion.h1>

      <p className="text-gray-400 mb-10 text-center max-w-2xl">
        Upload two datasets
      </p>

      <div className="flex space-x-8">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-500/50 rounded-lg p-6 w-56 h-40 cursor-pointer hover:bg-cyan-500/10 transition hover:shadow-[0_0_15px_#22d3ee]">
          <FaDatabase className="text-3xl mb-2 text-cyan-400" />
          <span className="text-sm">Upload Dataset A</span>
          <input
            type="file"
            hidden
            onChange={(e) => handleFileChange(e, "a")}
          />
        </label>

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-fuchsia-500/50 rounded-lg p-6 w-56 h-40 cursor-pointer hover:bg-fuchsia-500/10 transition hover:shadow-[0_0_15px_#d946ef]">
          <FaDatabase className="text-3xl mb-2 text-fuchsia-400" />
          <span className="text-sm">Upload Dataset B</span>
          <input
            type="file"
            hidden
            onChange={(e) => handleFileChange(e, "b")}
          />
        </label>
      </div>

      <motion.button
        className="mt-10 px-8 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-lg font-bold text-white shadow-lg hover:shadow-[0_0_20px_#22d3ee] transition"
        onClick={handleContinue}
        whileHover={{ scale: 1.05 }}
      >
        Continue →
      </motion.button>
    </div>
  );
}
