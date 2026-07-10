import Link from "next/link";
import { Icon } from "@/components/manuscript/Icons";
import {
  COMPOSITION_TYPE_LABELS,
  GHARANA_LABELS,
  type Composition,
} from "@/lib/db/types";

function firstLines(text: string | null, n = 2): string {
  if (!text) return "";
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(0, n)
    .join("\n");
}

export function CompositionCard({
  composition: c,
}: {
  composition: Composition;
}) {
  const bolsPreview = firstLines(c.bols, 2);
  const subline = [
    c.guru_name ? `Guru ${c.guru_name}` : null,
    c.gharana ? GHARANA_LABELS[c.gharana] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/compositions/${c.id}`}
      className="group relative flex h-full flex-col overflow-hidden border border-secondary bg-surface-container-lowest p-8 transition-colors duration-300 hover:bg-surface-container"
      style={{ boxShadow: "inset 0 0 40px rgba(184, 137, 62, 0.05)" }}
    >
      <div className="pointer-events-none absolute right-2 top-2 text-primary opacity-[0.06]">
        <Icon.Lotus size={64} />
      </div>

      <div className="mb-6 flex items-start justify-between">
        <span className="bg-tertiary-fixed px-3 py-0.5 font-serif text-label-md uppercase tracking-wider text-on-tertiary-fixed">
          {COMPOSITION_TYPE_LABELS[c.type]}
        </span>
        {c.difficulty ? (
          <div
            className="flex gap-1 text-secondary"
            aria-label={`Difficulty ${c.difficulty} of 5`}
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const on = i < (c.difficulty ?? 0);
              return (
                <span key={i} style={{ opacity: on ? 1 : 0.25 }}>
                  <Icon.Ghungroo size={16} strokeWidth={on ? 1.7 : 1.1} />
                </span>
              );
            })}
          </div>
        ) : null}
      </div>

      <h3 className="mb-4 font-display text-headline-md text-primary">
        {c.title}
      </h3>

      <div className="flex-grow">
        {bolsPreview ? (
          <p
            className="whitespace-pre-line border-l-2 border-outline-variant py-2 pl-4 font-serif italic leading-relaxed text-on-surface-variant"
            style={{ fontSize: "18px", lineHeight: "28px" }}
          >
            {bolsPreview}
          </p>
        ) : (
          <p className="font-serif text-body-md italic text-outline-variant">
            No bols written yet
          </p>
        )}
      </div>

      <div
        className="relative my-4 h-px opacity-30"
        style={{
          background:
            "linear-gradient(90deg, transparent, #dac0c1, transparent)",
        }}
      />

      <footer className="font-serif text-body-md italic text-on-surface-variant opacity-80">
        {subline || "Self-Composition"}
      </footer>
    </Link>
  );
}
