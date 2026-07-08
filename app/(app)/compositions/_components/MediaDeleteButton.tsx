"use client";

import { useState, useTransition } from "react";
import { deleteMedia } from "@/app/actions/media";

export function MediaDeleteButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex h-8 w-8 items-center justify-center text-on-surface-variant transition-colors hover:text-error"
        aria-label="Remove"
        title="Remove"
      >
        <span className="material-symbols-outlined text-lg">delete</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => deleteMedia(id))}
        className="border border-error bg-error px-3 py-1 font-serif text-label-md uppercase tracking-widest text-on-error disabled:opacity-60"
      >
        {pending ? "Erasing" : "Erase"}
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
