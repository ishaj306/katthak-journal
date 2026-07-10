"use client";

import { useEffect, useState } from "react";

/** The date in the reader's own timezone. Roman numerals only, by request. */
export function FolioDate() {
  const [roman, setRoman] = useState<string>(" ");
  useEffect(() => {
    setRoman(
      new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);
  return (
    <p
      className="font-serif text-label-md uppercase tracking-[0.25em] text-on-surface-variant"
      suppressHydrationWarning
    >
      {roman}
    </p>
  );
}
