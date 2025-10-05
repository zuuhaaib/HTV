"use client";
import React from "react";
import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;      // <-- add this
  className?: string;
  type?: "button" | "submit" | "reset";
};

export default function ContinueButton({
  children,
  disabled = false,
  onClick,
  className,
  type = "button",
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}                       // <-- wire it up
      className={clsx(
        "inline-flex items-center justify-center rounded-lg h-12 px-6",
        "text-base font-bold text-white",
        "bg-[#137fec] hover:bg-[#0f6dc9]",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#137fec]/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
