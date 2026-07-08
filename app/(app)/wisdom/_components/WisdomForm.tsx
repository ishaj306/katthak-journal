"use client";

import { useActionState, useState } from "react";
import {
  createWisdom,
  updateWisdom,
  type WisdomFormState,
} from "@/app/actions/wisdom";
import {
  WISDOM_CATEGORIES,
  WISDOM_CATEGORY_LABELS,
  type GuruWisdom,
} from "@/lib/db/types";

const initial: WisdomFormState = {};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block font-serif italic text-[14px] text-primary">
      {children}
    </label>
  );
}

const inputClass =
  "w-full border-0 border-b border-primary bg-transparent py-2 px-0 font-serif text-primary focus:outline-none";

export function WisdomForm({
  existing,
  onDone,
}: {
  existing?: GuruWisdom;
  onDone?: () => void;
}) {
  const action = existing
    ? updateWisdom.bind(null, existing.id)
    : createWisdom;
  const [state, formAction, pending] = useActionState(action, initial);
  const [pinned, setPinned] = useState(existing?.pinned ?? false);

  return (
    <form
      action={async (fd) => {
        await formAction(fd);
        onDone?.();
      }}
      className="space-y-6"
    >
      <div>
        <Label>The Wisdom</Label>
        <textarea
          name="quote"
          rows={4}
          required
          defaultValue={existing?.quote ?? ""}
          placeholder={`"The rhythm is not in the feet, it is in the soul's tremor before the beat begins."`}
          className="w-full border border-outline-variant bg-transparent p-4 font-serif italic text-on-surface focus:border-primary focus:outline-none focus:ring-0"
          style={{ fontSize: "18px", lineHeight: "1.6" }}
        />
        {state.fieldErrors?.quote ? (
          <p className="mt-1 font-serif text-[12px] italic text-error">
            {state.fieldErrors.quote}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <Label>Attribution</Label>
          <input
            name="attribution"
            defaultValue={existing?.attribution ?? ""}
            placeholder="Pandit Birju Maharaj"
            className={inputClass + " text-body-md"}
          />
        </div>
        <div>
          <Label>Category</Label>
          <select
            name="category"
            defaultValue={existing?.category ?? "advice"}
            className={inputClass + " text-body-md"}
          >
            {WISDOM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {WISDOM_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Captured On</Label>
          <input
            type="date"
            name="captured_at"
            defaultValue={existing?.captured_at ?? ""}
            className={inputClass + " text-body-md"}
          />
        </div>
      </div>

      <div>
        <Label>Tags (comma-separated)</Label>
        <input
          name="tags"
          defaultValue={existing?.tags.join(", ") ?? ""}
          placeholder="laya, soul, mudra"
          className={inputClass + " text-body-md"}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 font-serif text-body-md text-on-surface-variant">
        <input
          type="checkbox"
          name="pinned"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        Pin this wisdom to the top
      </label>

      {state.error ? (
        <p className="border border-error/40 bg-error-container p-3 font-serif text-body-md italic text-on-error-container">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={pending}
          className="border border-primary bg-primary px-8 py-2 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container disabled:opacity-60"
        >
          {pending ? "Inscribing" : existing ? "Save" : "Preserve"}
        </button>
        {onDone ? (
          <button
            type="button"
            onClick={onDone}
            className="border border-outline px-8 py-2 font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-all hover:bg-surface-container-high"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
