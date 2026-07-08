"use client";

import { useState, useTransition } from "react";
import { deleteComposition } from "@/app/actions/compositions";

export function DeleteCompositionButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="font-serif text-label-md uppercase tracking-widest text-error transition-colors hover:text-on-error-container"
      >
        Delete folio
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="font-serif text-body-md italic text-on-surface-variant">
        Erase this composition forever?
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => deleteComposition(id))}
        className="border border-error bg-error px-4 py-1 font-serif text-label-md uppercase tracking-widest text-on-error transition-colors hover:bg-on-error-container disabled:opacity-60"
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
