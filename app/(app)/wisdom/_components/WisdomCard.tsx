"use client";

import { useState, useTransition } from "react";
import { deleteWisdom, togglePin } from "@/app/actions/wisdom";
import { WISDOM_CATEGORY_LABELS, type GuruWisdom } from "@/lib/db/types";
import { WisdomForm } from "./WisdomForm";
import { Icon } from "@/components/manuscript/Icons";

const TILTS = ["rotate-1", "-rotate-1", "rotate-2", "-rotate-2", "rotate-0"];

export function WisdomCard({
  wisdom,
  index,
}: {
  wisdom: GuruWisdom;
  index: number;
}) {
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();
  const tilt = TILTS[index % TILTS.length];

  if (editing) {
    return (
      <article className="border border-secondary bg-surface p-6">
        <WisdomForm existing={wisdom} onDone={() => setEditing(false)} />
      </article>
    );
  }

  return (
    <article
      className={`relative ${tilt} border border-primary/10 bg-surface p-6 shadow-sm transition-all hover:rotate-0 hover:border-secondary md:p-8`}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <span className="font-serif text-label-md italic text-on-surface-variant">
          {wisdom.attribution || "Anonymous"}
          {wisdom.captured_at ? `, ${wisdom.captured_at.slice(0, 4)}` : ""}
        </span>
        <button
          type="button"
          onClick={() =>
            startTransition(() => togglePin(wisdom.id, !wisdom.pinned))
          }
          className={`transition-colors ${wisdom.pinned ? "text-primary" : "text-secondary/30 hover:text-secondary"}`}
          aria-label={wisdom.pinned ? "Unpin" : "Pin"}
          title={wisdom.pinned ? "Unpin" : "Pin"}
        >
          <Icon.Pin size={18} strokeWidth={wisdom.pinned ? 1.8 : 1.2} />
        </button>
      </div>

      <blockquote
        className="px-4 py-6 text-center font-display italic leading-snug text-primary"
        style={{ fontSize: "1.5rem", lineHeight: "1.4" }}
      >
        &ldquo;{wisdom.quote}&rdquo;
      </blockquote>

      <div
        className="relative mx-auto my-4 h-px w-4/5 opacity-30"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #7e570d 50%, transparent 100%)",
        }}
      >
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-2 text-[14px] text-secondary"
        >
          ⬥
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span
            className="bg-secondary-fixed/30 px-3 py-1 font-serif text-label-md uppercase tracking-wider text-primary"
          >
            {WISDOM_CATEGORY_LABELS[wisdom.category]}
          </span>
          {wisdom.tags.map((t) => (
            <span
              key={t}
              className="bg-secondary-fixed/30 px-3 py-1 font-serif text-label-md uppercase tracking-wider text-primary"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Erase this wisdom?")) {
                startTransition(() => deleteWisdom(wisdom.id));
              }
            }}
            className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-error"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
