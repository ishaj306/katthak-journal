"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  createJournalEntry,
  updateJournalEntry,
  type JournalFormState,
} from "@/app/actions/journal";
import { todayIso } from "@/lib/memory";
import type { JournalEntry } from "@/lib/db/types";

const initial: JournalFormState = {};

export function JournalForm({ existing }: { existing?: JournalEntry }) {
  const action = existing
    ? updateJournalEntry.bind(null, existing.id)
    : createJournalEntry;
  const [state, formAction, pending] = useActionState(action, initial);
  const [isPrivate, setIsPrivate] = useState(existing?.is_private ?? true);

  return (
    <form action={formAction} className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex-grow">
          <label className="mb-1 block font-serif italic text-[14px] text-primary">
            Date
          </label>
          <input
            type="date"
            name="entry_date"
            required
            defaultValue={existing?.entry_date ?? todayIso()}
            className="border-0 border-b border-primary bg-transparent py-2 px-0 font-serif text-body-md text-primary focus:outline-none"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-3 font-serif text-body-md text-on-surface-variant">
          <input
            type="checkbox"
            name="is_private"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-secondary">
              {isPrivate ? "lock" : "lock_open"}
            </span>
            {isPrivate ? "Private to you" : "Visible to you only (placeholder)"}
          </span>
        </label>
      </div>

      <div>
        <label className="mb-1 block font-serif italic text-[14px] text-primary">
          Title (optional)
        </label>
        <input
          type="text"
          name="title"
          defaultValue={existing?.title ?? ""}
          placeholder="A title for today's reflection…"
          className="w-full border-0 border-b border-primary bg-transparent py-2 px-0 font-serif text-headline-md text-primary placeholder:italic placeholder:text-on-surface-variant/30 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block font-serif italic text-[14px] text-primary">
          What did today&rsquo;s riyaz teach you?
        </label>
        <textarea
          name="body"
          rows={16}
          defaultValue={existing?.body ?? ""}
          placeholder="The leather page is open. Begin…"
          className="w-full bg-transparent p-4 font-serif italic text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
          style={{
            fontSize: "18px",
            lineHeight: "1.8",
            border: "1px solid #7e570d",
            background: "rgba(232,217,184,0.05)",
          }}
        />
      </div>

      {state.error ? (
        <p className="border border-error/40 bg-error-container p-4 font-serif text-body-md italic text-on-error-container">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col items-center justify-center gap-6 pt-4 md:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="border border-primary bg-primary px-12 py-3 font-serif text-label-lg uppercase tracking-[0.2em] text-on-primary transition-all hover:bg-primary-container disabled:opacity-60"
        >
          {pending ? "Inscribing" : existing ? "Save Page" : "Inscribe Page"}
        </button>
        <Link
          href={existing ? `/journal/${existing.id}` : "/journal"}
          className="border border-outline px-12 py-3 font-serif text-label-lg uppercase tracking-[0.2em] text-primary transition-all hover:bg-surface-container-high"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
