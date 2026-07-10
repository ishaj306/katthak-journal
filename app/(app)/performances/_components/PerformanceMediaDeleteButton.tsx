"use client";

import { useState, useTransition } from "react";
import { deletePerformanceMedia } from "@/app/actions/performances";
import { Icon } from "@/components/manuscript/Icons";

export function PerformanceMediaDeleteButton({ id }: { id: string }) {
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
        <Icon.Trash size={18} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => deletePerformanceMedia(id))}
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
