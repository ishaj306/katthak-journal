"use client";

import { useState, useTransition } from "react";
import { deletePerformance } from "@/app/actions/performances";

export function DeletePerformanceButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-full px-12 py-3 font-serif text-label-lg uppercase tracking-[0.2em] text-error transition-colors hover:bg-error-container/20 md:w-auto"
      >
        Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="font-serif text-body-md italic text-on-surface-variant">
        Erase this performance forever?
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => deletePerformance(id))}
        className="border border-error bg-error px-4 py-2 font-serif text-label-md uppercase tracking-widest text-on-error disabled:opacity-60"
      >
        {pending ? "Erasing" : "Yes, delete"}
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
