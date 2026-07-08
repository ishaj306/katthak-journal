"use client";

import { useState } from "react";
import { WisdomForm } from "./WisdomForm";

export function WisdomCreator() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto flex items-center gap-2 border border-primary px-6 py-2 font-serif text-label-md uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-on-primary"
      >
        <span className="material-symbols-outlined text-base">edit_note</span>
        Capture New Wisdom
      </button>
    );
  }

  return (
    <div className="mx-auto max-w-3xl border border-secondary bg-surface p-8">
      <h3 className="mb-6 text-center font-display text-headline-md italic text-primary">
        Capture the master&rsquo;s words
      </h3>
      <WisdomForm onDone={() => setOpen(false)} />
    </div>
  );
}
