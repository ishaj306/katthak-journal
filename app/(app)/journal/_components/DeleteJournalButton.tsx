"use client";

import { useState, useTransition } from "react";
import { deleteJournalEntry } from "@/app/actions/journal";

export function DeleteJournalButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-error"
      >
        Erase this page
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="font-serif text-body-md italic text-on-surface-variant">
        Erase this page forever?
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => deleteJournalEntry(id))}
        className="border border-error bg-error px-4 py-2 font-serif text-label-md uppercase tracking-widest text-on-error disabled:opacity-60"
      >
        {pending ? "Erasing" : "Yes, erase"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant"
      >
        Keep
      </button>
    </div>
  );
}
