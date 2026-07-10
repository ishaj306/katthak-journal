"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TALAS } from "@/lib/talas";
import { LAYAS, computeTihai, tihaiCells } from "@/lib/laya";
import { EASE_SETTLE } from "@/lib/motion";

const LAYA_CHOICES = LAYAS.filter((l) =>
  ["thaah", "dugun", "tigun", "chaugun"].includes(l.id)
);

export function TihaiBuilder() {
  const [talaId, setTalaId] = useState("teentaal");
  const [layaRatio, setLayaRatio] = useState(1);
  const [spanMatras, setSpanMatras] = useState(16);
  const [phrase, setPhrase] = useState(7);
  const [kind, setKind] = useState<"dumdar" | "bedumdar">("dumdar");

  const tala = TALAS.find((t) => t.id === talaId) ?? TALAS[0];
  const spanCounts = spanMatras * layaRatio;

  const result = useMemo(
    () => computeTihai(spanCounts, phrase, kind),
    [spanCounts, phrase, kind]
  );

  const cells = useMemo(
    () =>
      result.landsOnSam
        ? tihaiCells(spanCounts, phrase, result.gap)
        : [],
    [result, spanCounts, phrase]
  );

  return (
    <div className="space-y-10">
      {/* Inputs */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Field label="Tala">
          <div className="flex flex-wrap gap-2">
            {TALAS.map((t) => (
              <Choice
                key={t.id}
                active={t.id === talaId}
                onClick={() => {
                  setTalaId(t.id);
                  setSpanMatras(t.matras);
                }}
              >
                {t.name}
                <span className="ml-1 text-[10px] opacity-70">{t.matras}</span>
              </Choice>
            ))}
          </div>
        </Field>

        <Field label="Speed · layakari">
          <div className="flex flex-wrap gap-2">
            {LAYA_CHOICES.map((l) => (
              <Choice
                key={l.id}
                active={l.ratio === layaRatio}
                onClick={() => setLayaRatio(l.ratio)}
              >
                <span className="font-deva">{l.deva}</span>
                <span className="ml-1 opacity-80">{l.name}</span>
              </Choice>
            ))}
          </div>
        </Field>

        <Field label={`Span · matras until sam (${spanCounts} counts)`}>
          <Stepper value={spanMatras} min={1} max={64} onChange={setSpanMatras} />
        </Field>

        <Field label="Phrase length · counts">
          <Stepper value={phrase} min={1} max={spanCounts} onChange={setPhrase} />
        </Field>

        <Field label="Kind">
          <div className="flex gap-2">
            <Choice active={kind === "dumdar"} onClick={() => setKind("dumdar")}>
              Dumdar · with rest
            </Choice>
            <Choice
              active={kind === "bedumdar"}
              onClick={() => setKind("bedumdar")}
            >
              Bedumdar · continuous
            </Choice>
          </div>
        </Field>
      </div>

      {/* Result */}
      <div
        className={`border p-6 md:p-8 ${
          result.landsOnSam
            ? "border-secondary bg-tertiary-fixed/30"
            : "border-outline-variant bg-surface-container-lowest"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              result.landsOnSam ? "bg-secondary" : "bg-outline"
            }`}
          />
          <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
            {result.landsOnSam ? "Lands on sam" : "Does not resolve"}
          </p>
        </div>
        <p className="mt-3 font-display text-headline-md italic leading-snug text-primary">
          {result.reason}
        </p>
        {result.landsOnSam ? (
          <p className="mt-2 font-serif text-body-md text-on-surface-variant">
            Phrase <b>{phrase}</b> · rest <b>{result.gap}</b> · phrase{" "}
            <b>{phrase}</b> · rest <b>{result.gap}</b> · phrase <b>{phrase}</b> —{" "}
            {result.totalUsed} counts, ending on sam.
          </p>
        ) : null}
      </div>

      {/* Visualisation */}
      {cells.length > 0 ? (
        <div>
          <p className="mb-3 font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
            The tihai across the span
          </p>
          <div className="flex flex-wrap gap-1">
            {cells.map((c, i) => {
              const isSam = i === cells.length - 1;
              const matraBoundary = i % layaRatio === 0;
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.25,
                    ease: EASE_SETTLE,
                    delay: Math.min(i * 0.012, 0.6),
                  }}
                  title={`Count ${i + 1}`}
                  className={`inline-block h-6 w-6 ${
                    matraBoundary ? "ml-1" : ""
                  }`}
                  style={{
                    background: isSam
                      ? "#A9802F"
                      : c === "phrase"
                        ? "#6B1E2A"
                        : "transparent",
                    border:
                      c === "gap" && !isSam
                        ? "1px dashed #dac0c1"
                        : "1px solid #4e0616",
                  }}
                />
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-5 font-serif text-label-md text-on-surface-variant">
            <Legend swatch="#6B1E2A">Phrase</Legend>
            <Legend swatch="transparent" dashed>
              Rest
            </Legend>
            <Legend swatch="#A9802F">Sam</Legend>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 font-serif text-label-md uppercase tracking-widest text-secondary">
        {label}
      </p>
      {children}
    </div>
  );
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1.5 font-serif text-label-md transition-colors ${
        active
          ? "border-primary bg-primary text-on-primary"
          : "border-outline-variant text-on-surface-variant hover:border-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, n)));
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => set(value - 1)}
        className="h-9 w-9 border border-outline-variant font-display text-headline-md leading-none text-primary transition-colors hover:border-secondary"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="w-12 text-center font-display text-headline-lg tabular-nums text-primary">
        {value}
      </span>
      <button
        type="button"
        onClick={() => set(value + 1)}
        className="h-9 w-9 border border-outline-variant font-display text-headline-md leading-none text-primary transition-colors hover:border-secondary"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}

function Legend({
  swatch,
  dashed,
  children,
}: {
  swatch: string;
  dashed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="inline-block h-3 w-3"
        style={{
          background: swatch,
          border: dashed ? "1px dashed #dac0c1" : "1px solid #4e0616",
        }}
      />
      {children}
    </span>
  );
}
