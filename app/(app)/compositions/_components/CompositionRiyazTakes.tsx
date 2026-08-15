"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AudioPlayer } from "./AudioPlayer";
import { Icon } from "@/components/manuscript/Icons";
import { formatDuration } from "@/lib/media-config";
import {
  deleteRiyazRecording,
  updateRiyazRecordingNotes,
} from "@/app/actions/riyaz-recordings";

export type RiyazTake = {
  id: string;
  url: string;
  title: string;
  durationSec: number | null;
  notes: string | null;
  recordedOn: string | null;
};

/**
 * Takes recorded against this composition during a Riyaaz session — practice
 * turned into documentation. Notes can be added here after the fact.
 */
export function CompositionRiyazTakes({ takes }: { takes: RiyazTake[] }) {
  if (takes.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="mb-6 flex items-end justify-between border-b border-outline-variant pb-2">
        <h3 className="flex items-center gap-3 font-display text-headline-md text-primary">
          <span className="flex-none text-secondary">
            <Icon.Ghungroo size={24} />
          </span>
          Riyaaz Takes
        </h3>
        <span className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
          {takes.length}
        </span>
      </div>
      <ul className="space-y-4">
        {takes.map((t) => (
          <TakeRow key={t.id} take={t} />
        ))}
      </ul>
    </section>
  );
}

function TakeRow({ take }: { take: RiyazTake }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [notes, setNotes] = useState(take.notes ?? "");
  const [savedNotes, setSavedNotes] = useState(take.notes ?? "");

  return (
    <li className="border border-secondary bg-surface-container-low p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-serif text-body-md text-on-surface">
            {take.title}
          </p>
          <p className="font-serif text-label-md italic text-on-surface-variant">
            {formatDuration(take.durationSec)}
            {take.recordedOn ? ` · ${take.recordedOn}` : ""}
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await deleteRiyazRecording(take.id);
              router.refresh();
            })
          }
          className="flex-none font-serif text-label-md uppercase tracking-widest text-outline transition-colors hover:text-error disabled:opacity-60"
        >
          {pending ? "…" : "Remove"}
        </button>
      </div>

      <AudioPlayer url={take.url} />

      <div className="mt-3">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes === savedNotes) return;
            const next = notes;
            start(async () => {
              await updateRiyazRecordingNotes(take.id, next);
              setSavedNotes(next);
            });
          }}
          placeholder="Add a note…"
          className="w-full border-0 border-b border-outline-variant bg-transparent py-1 font-serif text-label-md italic text-on-surface-variant placeholder:text-outline-variant focus:border-primary focus:outline-none"
        />
      </div>
    </li>
  );
}
