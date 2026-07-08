"use client";

import { useTransition } from "react";
import { deleteSession } from "@/app/actions/riyaz";
import { formatHours } from "@/lib/riyaz";
import type { RiyazSession } from "@/lib/db/types";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SessionList({ sessions }: { sessions: RiyazSession[] }) {
  const [pending, startTransition] = useTransition();
  const closed = sessions.filter((s) => s.ended_at);

  if (closed.length === 0) {
    return (
      <p className="text-center font-serif text-body-md italic text-on-surface-variant">
        No completed sessions yet. Start your first practice above.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {closed.slice(0, 10).map((s) => (
        <li
          key={s.id}
          className="flex items-center justify-between gap-4 border border-outline-variant bg-surface px-4 py-3"
        >
          <div className="min-w-0 flex-grow">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-serif text-body-md text-on-surface">
                {formatDateTime(s.started_at)}
              </span>
              <span className="font-serif text-label-md text-secondary">
                {formatHours(s.duration_seconds ?? 0)}
              </span>
            </div>
            {s.notes ? (
              <p className="mt-1 truncate font-serif text-body-md italic text-on-surface-variant">
                {s.notes}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => deleteSession(s.id))}
            className="text-on-surface-variant transition-colors hover:text-error disabled:opacity-50"
            aria-label="Delete session"
            title="Delete session"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
