"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addPerformanceComposition,
  removePerformanceComposition,
} from "@/app/actions/performances";
import { Icon } from "@/components/manuscript/Icons";

export type ProgrammeEntry = {
  id: string;
  compositionId: string;
  title: string;
  talaLabel: string | null;
};

export type ProgrammeOption = { id: string; title: string };

/**
 * The compositions being performed — drawn from the dancer's own composition
 * records so a piece's taal and detail carry through without retyping. Inline
 * add/remove, no separate page.
 */
export function PerformanceProgramme({
  performanceId,
  entries,
  options,
}: {
  performanceId: string;
  entries: ProgrammeEntry[];
  options: ProgrammeOption[];
}) {
  const router = useRouter();
  const [choice, setChoice] = useState("");
  const [pending, start] = useTransition();

  const chosenIds = new Set(entries.map((e) => e.compositionId));
  const available = options.filter((o) => !chosenIds.has(o.id));

  return (
    <div>
      <h3 className="mb-4 font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
        Programme
      </h3>

      {entries.length > 0 ? (
        <ul className="mb-4 space-y-2">
          {entries.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 border-l-2 border-secondary pl-3"
            >
              <Link
                href={`/compositions/${e.compositionId}`}
                className="group min-w-0"
              >
                <span className="font-display text-headline-md text-primary transition-colors group-hover:text-secondary">
                  {e.title}
                </span>
                {e.talaLabel ? (
                  <span className="ml-2 font-serif text-label-md italic text-on-surface-variant">
                    {e.talaLabel}
                  </span>
                ) : null}
              </Link>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await removePerformanceComposition(e.id, performanceId);
                    router.refresh();
                  })
                }
                className="flex-none font-serif text-label-md uppercase tracking-widest text-outline transition-colors hover:text-error disabled:opacity-60"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 font-serif text-body-md italic text-on-surface-variant">
          Add the compositions you performed, and each carries its own taal and
          detail.
        </p>
      )}

      {available.length > 0 ? (
        <div className="flex items-center gap-3">
          <select
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            className="flex-grow border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary focus:outline-none"
          >
            <option value="">— choose a composition —</option>
            {available.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!choice || pending}
            onClick={() =>
              start(async () => {
                await addPerformanceComposition(performanceId, choice);
                setChoice("");
                router.refresh();
              })
            }
            className="flex-none border border-primary px-5 py-2 font-serif text-label-md uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-40"
          >
            <span className="flex items-center gap-1">
              <Icon.Plus size={14} /> Add
            </span>
          </button>
        </div>
      ) : entries.length > 0 ? (
        <p className="font-serif text-label-md italic text-on-surface-variant">
          Every composition is on the programme.
        </p>
      ) : (
        <p className="font-serif text-label-md italic text-on-surface-variant">
          Add compositions in your archive first, then place them here.
        </p>
      )}
    </div>
  );
}
