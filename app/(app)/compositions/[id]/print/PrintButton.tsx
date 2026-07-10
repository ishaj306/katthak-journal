"use client";

import { Icon } from "@/components/manuscript/Icons";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-2 border border-primary bg-primary px-4 py-2 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container"
    >
      <Icon.Printer size={16} />
      Print / Save PDF
    </button>
  );
}
