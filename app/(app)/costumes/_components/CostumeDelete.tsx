"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCostume } from "@/app/actions/costumes";

export function CostumeDelete({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="font-serif text-label-md uppercase tracking-widest text-outline transition-colors hover:text-error"
        aria-label="Remove costume"
      >
        Remove
      </button>
    );
  }

  return (
    <span className="flex items-center gap-3 font-serif text-label-md">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await deleteCostume(id);
            router.refresh();
          })
        }
        className="uppercase tracking-widest text-error disabled:opacity-60"
      >
        {pending ? "Removing" : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="uppercase tracking-widest text-on-surface-variant"
      >
        Keep
      </button>
    </span>
  );
}
