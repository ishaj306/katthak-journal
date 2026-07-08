"use client";

import { useActionState } from "react";
import { addManualSession, type RiyazFormState } from "@/app/actions/riyaz";

const initial: RiyazFormState = {};

function nowLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function ManualSessionForm() {
  const [state, formAction, pending] = useActionState(addManualSession, initial);

  return (
    <details className="border border-outline-variant bg-surface-container-low p-6">
      <summary className="cursor-pointer font-serif text-label-md uppercase tracking-widest text-secondary">
        Log a past session
      </summary>
      <form action={formAction} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              Started at
            </label>
            <input
              name="started_at"
              type="datetime-local"
              defaultValue={nowLocal()}
              required
              className="w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              Duration (minutes)
            </label>
            <input
              name="duration_minutes"
              type="number"
              min={1}
              max={1440}
              required
              placeholder="e.g. 45"
              className="w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-serif text-label-md italic text-primary">
            Notes (optional)
          </label>
          <input
            name="notes"
            type="text"
            placeholder="What did you practice?"
            className="w-full border-0 border-b border-outline-variant bg-transparent py-2 font-serif text-body-md focus:border-primary focus:outline-none"
          />
        </div>

        {state.error ? (
          <p className="font-serif text-body-md italic text-error">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="border border-primary px-8 py-3 font-serif text-label-md uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-on-primary disabled:opacity-60"
        >
          {pending ? "Inscribing" : "Add Session"}
        </button>
      </form>
    </details>
  );
}
