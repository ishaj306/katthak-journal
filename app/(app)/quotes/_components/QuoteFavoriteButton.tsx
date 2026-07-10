"use client";

import { useTransition, useState } from "react";
import { toggleQuoteFavorite } from "@/app/actions/quotes";
import { Icon } from "@/components/manuscript/Icons";

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
      <Icon.Star size={18} strokeWidth={favorite ? 1.8 : 1.2} />
      {favorite ? "Saved" : "Save"}
    </button>
  );
}
