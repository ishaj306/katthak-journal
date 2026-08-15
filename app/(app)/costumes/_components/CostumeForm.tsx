"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCostume, type CostumeFormState } from "@/app/actions/costumes";
import {
  COSTUME_KINDS,
  COSTUME_KIND_LABELS,
  COSTUME_CONTEXTS,
  COSTUME_CONTEXT_LABELS,
} from "@/lib/db/types";

const initial: CostumeFormState = {};

export function CostumeForm() {
  const [state, formAction, pending] = useActionState(addCostume, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  const inputCls =
    "w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary focus:outline-none";

  return (
    <details className="border border-outline-variant bg-surface-container-low p-6">
      <summary className="cursor-pointer font-serif text-label-md uppercase tracking-widest text-secondary">
        Add to the wardrobe
      </summary>
      <form ref={formRef} action={formAction} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              Name
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Maroon anarkali"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              Kind
            </label>
            <select name="kind" defaultValue="costume" className={inputCls}>
              {COSTUME_KINDS.map((k) => (
                <option key={k} value={k}>
                  {COSTUME_KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              Context (optional)
            </label>
            <select name="context" defaultValue="" className={inputCls}>
              <option value="">—</option>
              {COSTUME_CONTEXTS.map((c) => (
                <option key={c} value={c}>
                  {COSTUME_CONTEXT_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              Colour (optional)
            </label>
            <input name="color" type="text" placeholder="e.g. deep maroon & gold" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              Fabric (optional)
            </label>
            <input name="fabric" type="text" placeholder="e.g. silk, georgette" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              Occasion (optional)
            </label>
            <input name="occasion" type="text" placeholder="e.g. first solo recital" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block font-serif text-label-md italic text-primary">
              First worn (optional)
            </label>
            <input name="worn_on" type="date" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-serif text-label-md italic text-primary">
            Notes (optional)
          </label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Where it was tailored, who gifted it, the stages it has seen…"
            className="w-full border border-outline-variant bg-transparent p-3 font-serif text-body-md text-primary focus:border-primary focus:outline-none"
          />
        </div>

        {state.error ? (
          <p className="font-serif text-body-md italic text-error">{state.error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="border border-primary px-8 py-3 font-serif text-label-md uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-on-primary disabled:opacity-60"
        >
          {pending ? "Inscribing" : "Add"}
        </button>
      </form>
    </details>
  );
}
