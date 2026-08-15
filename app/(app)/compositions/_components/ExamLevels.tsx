"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addExamLevel,
  deleteExamLevel,
  type ExamLevelFormState,
} from "@/app/actions/compositions";
import {
  EXAM_RELATIONS,
  EXAM_RELATION_LABELS,
  EXAM_LEVEL_SUGGESTIONS,
  type CompositionExamLevel,
} from "@/lib/db/types";
import { Icon } from "@/components/manuscript/Icons";

const initial: ExamLevelFormState = {};

function formatNotedOn(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
  } catch {
    return iso;
  }
}

/**
 * The exam-level history for one composition — the same Paran "learned for
 * Level 2, revisited for Level 3". Lives inline on the composition page, not as
 * a separate module: a lightweight list plus a small add form.
 */
export function ExamLevels({
  compositionId,
  entries,
}: {
  compositionId: string;
  entries: CompositionExamLevel[];
}) {
  const action = addExamLevel.bind(null, compositionId);
  const [state, formAction, pending] = useActionState(action, initial);
  const [adding, setAdding] = useState(false);

  return (
    <section className="border border-outline-variant bg-surface-container-lowest p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-3 font-display text-headline-md text-primary">
          <span className="text-secondary">
            <Icon.Scroll size={22} />
          </span>
          Exam Levels
        </h2>
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:text-primary"
          >
            + Add
          </button>
        ) : null}
      </div>

      {entries.length === 0 && !adding ? (
        <p className="font-serif text-body-md italic text-on-surface-variant">
          Note the exam or syllabus level this composition was learned for — and
          any level you revisited it at later.
        </p>
      ) : null}

      {entries.length > 0 ? (
        <ul className="space-y-4">
          {entries.map((e) => (
            <ExamLevelRow key={e.id} entry={e} compositionId={compositionId} />
          ))}
        </ul>
      ) : null}

      {adding ? (
        <form
          action={formAction}
          className="mt-6 border-t border-outline-variant pt-6"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="relation"
                className="mb-1 block font-serif italic text-[14px] text-primary"
              >
                Relationship
              </label>
              <select
                id="relation"
                name="relation"
                defaultValue="learned_for"
                className="w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary outline-none focus:border-b-2"
              >
                {EXAM_RELATIONS.map((r) => (
                  <option key={r} value={r}>
                    {EXAM_RELATION_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="level"
                className="mb-1 block font-serif italic text-[14px] text-primary"
              >
                Level
              </label>
              <input
                id="level"
                name="level"
                type="text"
                required
                list="exam-level-suggestions"
                placeholder="e.g. Level 2"
                className="w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary outline-none focus:border-b-2"
              />
              <datalist id="exam-level-suggestions">
                {EXAM_LEVEL_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div>
              <label
                htmlFor="noted_on"
                className="mb-1 block font-serif italic text-[14px] text-primary"
              >
                Date (optional)
              </label>
              <input
                id="noted_on"
                name="noted_on"
                type="date"
                className="w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary outline-none focus:border-b-2"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-1 block font-serif italic text-[14px] text-primary"
              >
                Notes (optional)
              </label>
              <input
                id="notes"
                name="notes"
                type="text"
                placeholder="A phrase to remember it by…"
                className="w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary outline-none focus:border-b-2"
              />
            </div>
          </div>

          {state.error ? (
            <p className="mt-3 font-serif text-body-md italic text-error">
              {state.error}
            </p>
          ) : null}

          <div className="mt-6 flex items-center gap-4">
            <button
              type="submit"
              disabled={pending}
              className="border border-primary bg-primary px-8 py-2 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container disabled:opacity-60"
            >
              {pending ? "Adding" : "Add Level"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function ExamLevelRow({
  entry,
  compositionId,
}: {
  entry: CompositionExamLevel;
  compositionId: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const dateLabel = formatNotedOn(entry.noted_on);

  return (
    <li className="flex items-start justify-between gap-4 border-l-2 border-secondary pl-4">
      <div>
        <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
          {EXAM_RELATION_LABELS[entry.relation]}
        </p>
        <p className="mt-0.5 font-display text-headline-md text-primary">
          {entry.level}
          {dateLabel ? (
            <span className="ml-3 font-serif text-body-md italic text-on-surface-variant">
              · {dateLabel}
            </span>
          ) : null}
        </p>
        {entry.notes ? (
          <p className="mt-1 font-serif text-body-md italic text-on-surface-variant">
            {entry.notes}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await deleteExamLevel(entry.id, compositionId);
            router.refresh();
          })
        }
        className="mt-1 flex-none font-serif text-label-md uppercase tracking-widest text-outline transition-colors hover:text-error disabled:opacity-60"
        aria-label="Remove level"
      >
        {pending ? "…" : "Remove"}
      </button>
    </li>
  );
}
