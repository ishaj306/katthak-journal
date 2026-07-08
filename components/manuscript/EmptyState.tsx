import Link from "next/link";
import type { ReactNode } from "react";
import {
  GhungrooMandala,
  LotusMotif,
  DancerSilhouette,
  Shamsa,
  CypressTree,
} from "./Ornaments";

type Art = "mandala" | "lotus" | "dancer" | "shamsa" | "cypress";

const ART: Record<Art, ReactNode> = {
  mandala: <GhungrooMandala className="text-secondary" size={130} />,
  lotus: <LotusMotif className="text-secondary" size={130} />,
  dancer: <DancerSilhouette className="text-secondary" size={150} />,
  shamsa: <Shamsa className="text-secondary" size={170} />,
  cypress: <CypressTree className="text-secondary" size={120} />,
};

export function EmptyState({
  art = "mandala",
  title,
  body,
  actionHref,
  actionLabel,
  actionIcon = "edit_note",
}: {
  art?: Art;
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  actionIcon?: string;
}) {
  return (
    <div className="mx-auto max-w-xl border border-outline-variant bg-surface-container-low p-12 text-center">
      <div className="mb-6 flex justify-center opacity-80">{ART[art]}</div>
      <h2 className="font-display text-headline-lg text-primary">{title}</h2>
      <p className="mt-4 font-serif text-body-md italic leading-relaxed text-on-surface-variant">
        {body}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-8 inline-flex items-center justify-center gap-3 bg-primary px-8 py-3 font-serif text-label-lg uppercase tracking-[0.2em] text-on-primary transition-all hover:bg-primary-container"
        >
          <span className="material-symbols-outlined text-[20px]">
            {actionIcon}
          </span>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
