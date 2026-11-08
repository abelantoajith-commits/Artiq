"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { DemoProfileSetupModal } from "@/components/artiq/DemoProfileSetupModal";

interface TryDemoButtonProps {
  className?: string;
  label?: string;
}

export function TryDemoButton({
  className = "btn-hard w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-[10px] bg-sand hover:bg-sand/90 text-ink font-bold text-sm min-h-[48px] cursor-pointer",
  label = "Try demo (Quick Setup)",
}: TryDemoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Sparkles className="w-4 h-4" />
        <span>{label}</span>
      </button>

      <DemoProfileSetupModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

