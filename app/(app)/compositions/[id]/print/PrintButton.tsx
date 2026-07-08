"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-2 border border-primary bg-primary px-4 py-2 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container"
    >
      <span className="material-symbols-outlined text-base">print</span>
      Print / Save PDF
    </button>
  );
}
