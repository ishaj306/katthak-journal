"use client";

import { useActionState, useState } from "react";
import { completeOnboarding, type ProfileFormState } from "@/app/actions/profile";
import { GHARANAS, GHARANA_LABELS } from "@/lib/db/types";
import { GhungrooMandala, LotusMotif, CypressTree } from "@/components/manuscript/Ornaments";
import { Icon } from "@/components/manuscript/Icons";

const initial: ProfileFormState = {};

const STEPS = ["Welcome", "Lineage", "Guru", "Journey"] as const;

export function OnboardingWizard() {
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initial
  );
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const thisYear = new Date().getFullYear();

  return (
    <form action={formAction} className="space-y-10">
      {/* Progress bells */}
      <div className="flex items-center justify-center gap-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <span style={{ color: i <= step ? "#7e570d" : "#dac0c1" }}>
                <Icon.Ghungroo size={22} strokeWidth={i <= step ? 1.7 : 1.1} />
              </span>
              <span
                className={`font-serif text-[10px] uppercase tracking-widest ${i === step ? "text-primary" : "text-on-surface-variant opacity-50"}`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <span
                className="h-px w-8"
                style={{ background: i < step ? "#B8893E" : "#dac0c1" }}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Step 0 — Welcome */}
      <section className={step === 0 ? "block" : "hidden"}>
        <div className="mb-6 flex justify-center opacity-80">
          <GhungrooMandala className="text-secondary" size={120} />
        </div>
        <h2 className="text-center font-display text-headline-lg text-primary">
          Welcome to your manuscript
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center font-serif text-body-md italic text-on-surface-variant">
          Before we open the first folio, let us learn a little about the
          dancer whose journey this will hold.
        </p>
        <div className="mx-auto mt-8 max-w-sm">
          <label className="mb-1 block font-serif italic text-[14px] text-primary">
            What shall we call you?
          </label>
          <input
            name="display_name"
            type="text"
            placeholder="Your name"
            className="w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-headline-md text-primary focus:outline-none"
          />
        </div>
      </section>

      {/* Step 1 — Gharana */}
      <section className={step === 1 ? "block" : "hidden"}>
        <div className="mb-6 flex justify-center opacity-80">
          <LotusMotif className="text-secondary" size={110} />
        </div>
        <h2 className="text-center font-display text-headline-lg text-primary">
          Your lineage
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center font-serif text-body-md italic text-on-surface-variant">
          Every gharana carries its own grammar of movement. Which tradition
          flows through your feet?
        </p>
        <div className="mx-auto mt-8 max-w-sm">
          <label className="mb-1 block font-serif italic text-[14px] text-primary">
            Gharana
          </label>
          <select
            name="gharana"
            defaultValue=""
            className="w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary focus:outline-none"
          >
            <option value="">— Choose, or skip —</option>
            {GHARANAS.map((g) => (
              <option key={g} value={g}>
                {GHARANA_LABELS[g]}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Step 2 — Guru */}
      <section className={step === 2 ? "block" : "hidden"}>
        <div className="mb-6 flex justify-center opacity-80">
          <CypressTree className="text-secondary" size={110} />
        </div>
        <h2 className="text-center font-display text-headline-lg text-primary">
          Your guru
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center font-serif text-body-md italic text-on-surface-variant">
          The one whose corrections shaped you. You can add more gurus later.
        </p>
        <div className="mx-auto mt-8 max-w-sm">
          <label className="mb-1 block font-serif italic text-[14px] text-primary">
            Primary guru
          </label>
          <input
            name="primary_guru"
            type="text"
            placeholder="Guru's name"
            className="w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary focus:outline-none"
          />
        </div>
      </section>

      {/* Step 3 — Journey */}
      <section className={step === 3 ? "block" : "hidden"}>
        <div className="mb-6 flex justify-center opacity-80">
          <GhungrooMandala className="text-secondary" size={120} />
        </div>
        <h2 className="text-center font-display text-headline-lg text-primary">
          When did it begin?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center font-serif text-body-md italic text-on-surface-variant">
          The year you first tied your ghungroos. This anchors your timeline.
        </p>
        <div className="mx-auto mt-8 flex max-w-sm gap-6">
          <div className="flex-1">
            <label className="mb-1 block font-serif italic text-[14px] text-primary">
              Dance journey began
            </label>
            <input
              name="start_year"
              type="number"
              min={1930}
              max={thisYear}
              placeholder={`e.g. ${thisYear - 10}`}
              className="w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary focus:outline-none"
            />
          </div>
        </div>
      </section>

      {state.error ? (
        <p className="text-center font-serif text-body-md italic text-error">
          {state.error}
        </p>
      ) : null}

      {/* Controls */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={back}
          className={`font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary ${step === 0 ? "invisible" : ""}`}
        >
          ← Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="border border-primary bg-primary px-10 py-3 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container"
          >
            Continue →
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending}
            className="border border-primary bg-primary px-10 py-3 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container disabled:opacity-60"
          >
            {pending ? "Opening…" : "Open My Manuscript"}
          </button>
        )}
      </div>

      <p className="text-center">
        <button
          type="submit"
          disabled={pending}
          className="font-serif text-label-md italic text-on-surface-variant underline transition-colors hover:text-primary"
        >
          Skip for now
        </button>
      </p>
    </form>
  );
}
