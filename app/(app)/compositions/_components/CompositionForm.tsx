"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createComposition,
  updateComposition,
  type CompositionFormState,
} from "@/app/actions/compositions";
import {
  COMPOSITION_TYPES,
  COMPOSITION_TYPE_LABELS,
  GHARANAS,
  GHARANA_LABELS,
  type Composition,
} from "@/lib/db/types";
import { GhungrooRating } from "./GhungrooRating";
import { TaalFields } from "./TaalFields";
import { CustomLabel, inputClass, FieldError } from "./formPrimitives";
import { ManuscriptEditor } from "@/components/manuscript/ManuscriptEditor";

const initial: CompositionFormState = {};

export function CompositionForm({
  existing,
}: {
  existing?: Composition;
}) {
  const action = existing
    ? updateComposition.bind(null, existing.id)
    : createComposition;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-12">
      <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
        <div>
          <CustomLabel htmlFor="title">Title of Composition</CustomLabel>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={existing?.title ?? ""}
            placeholder="e.g. Shiva Vandana"
            className={inputClass + " text-headline-md"}
          />
          <FieldError message={state.fieldErrors?.title} />
        </div>

        <div>
          <CustomLabel htmlFor="type">Composition Type</CustomLabel>
          <select
            id="type"
            name="type"
            defaultValue={existing?.type ?? "vandana"}
            className={inputClass + " text-body-md"}
          >
            {COMPOSITION_TYPES.map((t) => (
              <option key={t} value={t}>
                {COMPOSITION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors?.type} />
        </div>

        <TaalFields
          existing={existing}
          errors={{
            tala_id: state.fieldErrors?.tala_id,
            tala_name: state.fieldErrors?.tala_name,
            matras: state.fieldErrors?.matras,
          }}
        />

        <div>
          <CustomLabel htmlFor="date_learned">Date Learned</CustomLabel>
          <input
            id="date_learned"
            name="date_learned"
            type="date"
            defaultValue={existing?.date_learned ?? ""}
            className={inputClass + " text-body-md"}
          />
          <FieldError message={state.fieldErrors?.date_learned} />
        </div>

        <div>
          <CustomLabel htmlFor="guru_name">Guru Name</CustomLabel>
          <input
            id="guru_name"
            name="guru_name"
            type="text"
            defaultValue={existing?.guru_name ?? ""}
            placeholder="The master who passed this down..."
            className={inputClass + " text-body-md"}
          />
        </div>

        <div>
          <CustomLabel htmlFor="gharana">Gharana</CustomLabel>
          <select
            id="gharana"
            name="gharana"
            defaultValue={existing?.gharana ?? ""}
            className={inputClass + " text-body-md"}
          >
            <option value="">—</option>
            {GHARANAS.map((g) => (
              <option key={g} value={g}>
                {GHARANA_LABELS[g]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <CustomLabel>Difficulty (Technical Depth)</CustomLabel>
          <GhungrooRating defaultValue={existing?.difficulty ?? 0} />
        </div>
      </div>

      <div
        className="relative h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, #7e570d 50%, transparent)",
        }}
      >
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-4 text-secondary"
          style={{ fontSize: "1.2rem" }}
        >
          ❦
        </span>
      </div>

      <div>
        <CustomLabel htmlFor="bols">The Bols (Rhythmic Syllables)</CustomLabel>
        <textarea
          id="bols"
          name="bols"
          rows={6}
          defaultValue={existing?.bols ?? ""}
          placeholder="Dha Ta ka Thun ga..."
          className="w-full border border-dashed border-secondary bg-[rgba(232,217,184,0.1)] p-6 text-center font-serif italic text-on-surface placeholder:text-outline-variant focus:border-secondary focus:outline-none"
          style={{
            fontSize: "20px",
            lineHeight: "2",
            letterSpacing: "0.05em",
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <CustomLabel>Meaning &amp; Poetry</CustomLabel>
          <ManuscriptEditor
            name="meaning"
            defaultHTML={existing?.meaning ?? ""}
            placeholder="The spiritual significance behind each movement..."
          />
        </div>

        <div>
          <CustomLabel>Performance Instructions</CustomLabel>
          <ManuscriptEditor
            name="instructions"
            defaultHTML={existing?.instructions ?? ""}
            placeholder="Specific focus on footwork weight or hand placement..."
          />
        </div>
      </div>

      <div className="border-l-4 border-secondary bg-surface-container-low p-6">
        <CustomLabel>Corrections from Guru</CustomLabel>
        <ManuscriptEditor
          name="corrections"
          defaultHTML={existing?.corrections ?? ""}
          placeholder="Words of wisdom to refine the practice..."
        />
      </div>

      {state.error ? (
        <div
          role="alert"
          className="border border-error/40 bg-error-container p-4 font-serif text-body-md italic text-on-error-container"
        >
          <p>{state.error}</p>
          {/* The taal columns arrive in 0010; a missing-column error means the
              migration has not been run against this Supabase project yet. */}
          {/(column|schema cache)/i.test(state.error) ? (
            <p className="mt-2 text-label-md">
              If this mentions an unknown column such as{" "}
              <code>tala_id</code>, paste{" "}
              <code>supabase/migrations/0010_composition_taal.sql</code> into
              your Supabase SQL Editor and run it.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col items-center justify-center gap-6 pt-6 md:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="border border-primary bg-primary px-12 py-3 font-serif text-label-lg uppercase tracking-[0.2em] text-on-primary transition-all hover:bg-primary-container disabled:opacity-60"
        >
          {pending
            ? existing
              ? "Saving"
              : "Inscribing"
            : existing
              ? "Save Composition"
              : "Add to Manuscript"}
        </button>
        <Link
          href={existing ? `/compositions/${existing.id}` : "/compositions"}
          className="border border-outline px-12 py-3 font-serif text-label-lg uppercase tracking-[0.2em] text-primary transition-all hover:bg-surface-container-high"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
