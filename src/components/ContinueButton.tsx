"use client";
import React from "react";

type Props = {
  disabled: boolean;
  children?: React.ReactNode;
};

export default function ContinueButton({ disabled, children }: Props) {
  return (
    <button className={`bg-[#137fec] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#137fec]/90 transition-colors ${disabled ? 'disabled:bg-black/20 disabled:cursor-not-allowed' : ''}`} disabled={disabled}>
      {children}
    </button>
  );
}
