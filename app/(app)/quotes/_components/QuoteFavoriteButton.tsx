"use client";

import { useTransition, useState } from "react";
import { toggleQuoteFavorite } from "@/app/actions/quotes";

export function QuoteFavoriteButton({
  quoteId,
  initialFavorite,
}: {
  quoteId: string;
  initialFavorite: boolean;
}) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        const next = !favorite;
        setFavorite(next);
        startTransition(() => toggleQuoteFavorite(quoteId, favorite));
      }}
      className={`flex items-center gap-2 font-serif text-label-md uppercase tracking-widest transition-colors ${favorite ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
      aria-pressed={favorite}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
    >
      <span
        className="material-symbols-outlined text-lg"
        style={{ fontVariationSettings: favorite ? "'FILL' 1" : "'FILL' 0" }}
      >
        bookmark
      </span>
      {favorite ? "Saved" : "Save"}
    </button>
  );
}
