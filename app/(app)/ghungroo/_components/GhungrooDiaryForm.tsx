"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addGhungrooEntry,
  type GhungrooFormState,
} from "@/app/actions/ghungroo";
import { GHUNGROO_KINDS, GHUNGROO_KIND_LABELS } from "@/lib/db/types";

const initial: GhungrooFormState = {};

function todayLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function GhungrooDiaryForm() {
  const [state, formAction, pending] = useActionState(
    addGhungrooEntry,
    initial
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  const inputCls =
    "w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary focus:outline-none";

  return (
    <details className="border border-outline-variant bg-surface-container-low p-6">
      <summary className="cursor-pointer font-serif text-label-md uppercase tracking-widest text-secondary">
        Record an entry
      </summary>
      <form ref={formRef} action={formAction} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              Date
            </label>
            <input
              name="entry_date"
              type="date"
              defaultValue={todayLocal()}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              Moment
            </label>
            <select name="kind" defaultValue="acquired" className={inputCls}>
              {GHUNGROO_KINDS.map((k) => (
                <option key={k} value={k}>
                  {GHUNGROO_KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              Bells on the string
            </label>
            <input
              name="bell_count"
              type="number"
              min={0}
              max={2000}
              placeholder="e.g. 100"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              Title (optional)
            </label>
            <input
              name="title"
              type="text"
              placeholder="e.g. My first ghungroo"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              String material (optional)
            </label>
            <input
              name="string_material"
              type="text"
              placeholder="e.g. cotton, silk cord"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-serif text-label-md italic text-primary">
            Notes (optional)
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="The occasion, the sound, who strung them…"
            className="w-full border border-outline-variant bg-transparent p-3 font-serif text-body-md text-primary focus:border-primary focus:outline-none"
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
          {pending ? "Inscribing" : "Record"}
        </button>
      </form>
    </details>
  );
}
