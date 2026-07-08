"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createPerformance,
  updatePerformance,
  type PerformanceFormState,
} from "@/app/actions/performances";
import {
  PERFORMANCE_TYPES,
  PERFORMANCE_TYPE_LABELS,
  type Performance,
} from "@/lib/db/types";

const initial: PerformanceFormState = {};

const inputClass =
  "w-full border-0 border-b border-primary bg-transparent py-2 px-0 font-serif text-primary focus:outline-none";

const textareaClass =
  "h-32 w-full border border-outline-variant bg-transparent p-3 font-serif text-body-md text-primary focus:border-primary focus:outline-none focus:ring-0";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block font-serif italic text-[14px] text-primary">
      {children}
    </label>
  );
}

export function PerformanceForm({ existing }: { existing?: Performance }) {
  const action = existing
    ? updatePerformance.bind(null, existing.id)
    : createPerformance;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-12">
      <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
        <div>
          <Label>Event Name</Label>
          <input
            name="event_name"
            required
            defaultValue={existing?.event_name ?? ""}
            placeholder="e.g. Vasant Utsav: The Spring Recital"
            className={inputClass + " text-headline-md"}
          />
          {state.fieldErrors?.event_name ? (
            <p className="mt-1 font-serif text-[12px] italic text-error">
              {state.fieldErrors.event_name}
            </p>
          ) : null}
        </div>
        <div>
          <Label>Venue</Label>
          <input
            name="venue"
            defaultValue={existing?.venue ?? ""}
            placeholder="e.g. Kamani Auditorium, Delhi"
            className={inputClass + " text-body-md"}
          />
        </div>
        <div>
          <Label>Date</Label>
          <input
            type="date"
            name="performed_on"
            defaultValue={existing?.performed_on ?? ""}
            className={inputClass + " text-body-md"}
          />
        </div>
        <div>
          <Label>Type</Label>
          <select
            name="type"
            defaultValue={existing?.type ?? "solo"}
            className={inputClass + " text-body-md"}
          >
            {PERFORMANCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {PERFORMANCE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <Label>Costume &amp; Shringar</Label>
          <textarea
            name="costume_notes"
            defaultValue={existing?.costume_notes ?? ""}
            placeholder="Anarkha colour, fabric, jewellery, ghungroo count…"
            className={textareaClass}
          />
        </div>
        <div>
          <Label>Makeup Notes</Label>
          <textarea
            name="makeup_notes"
            defaultValue={existing?.makeup_notes ?? ""}
            placeholder="Kohl heavy, bindi style, alta colour…"
            className={textareaClass}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-center font-serif text-label-lg uppercase tracking-[0.3em] text-secondary">
          Post-Performance Reflections
        </h3>
        <div className="grid grid-cols-1 gap-x-gutter gap-y-stack-md md:grid-cols-2">
          <div>
            <Label>What went well?</Label>
            <textarea
              name="reflection_well"
              defaultValue={existing?.reflection_well ?? ""}
              className={textareaClass}
            />
          </div>
          <div>
            <Label>Mistakes &amp; Slips</Label>
            <textarea
              name="reflection_mistakes"
              defaultValue={existing?.reflection_mistakes ?? ""}
              className={textareaClass}
            />
          </div>
          <div>
            <Label>Learnings</Label>
            <textarea
              name="reflection_learned"
              defaultValue={existing?.reflection_learned ?? ""}
              className={textareaClass}
            />
          </div>
          <div>
            <Label>Next Steps</Label>
            <textarea
              name="reflection_improve"
              defaultValue={existing?.reflection_improve ?? ""}
              className={textareaClass}
            />
          </div>
        </div>
      </div>

      {state.error ? (
        <p className="border border-error/40 bg-error-container p-4 font-serif text-body-md italic text-on-error-container">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col items-center justify-center gap-6 pt-6 md:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="border border-primary bg-primary px-12 py-3 font-serif text-label-lg uppercase tracking-[0.2em] text-on-primary transition-all hover:bg-primary-container disabled:opacity-60"
        >
          {pending ? "Saving" : existing ? "Save Folio" : "Add to Stage Journal"}
        </button>
        <Link
          href={existing ? `/performances/${existing.id}` : "/performances"}
          className="border border-outline px-12 py-3 font-serif text-label-lg uppercase tracking-[0.2em] text-primary transition-all hover:bg-surface-container-high"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
