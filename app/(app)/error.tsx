"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route error boundary for the whole app section. Turns a thrown Server
 * Component / data-fetch error into a readable page with a retry, instead of
 * the default Next error screen or a blank.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for logging; a real deployment would send this to Sentry etc.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-margin-mobile text-center md:px-margin-page">
      <p className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
        Something interrupted the folio
      </p>
      <h1 className="mt-4 font-display text-display-lg-mobile text-primary">
        A page could not be inscribed
      </h1>
      <p className="mt-4 font-serif text-body-md italic text-on-surface-variant">
        The archive is still safe. This is usually a passing connection issue —
        try again, or return to the Daily Folio.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="border border-primary bg-primary px-8 py-3 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="border border-outline px-8 py-3 font-serif text-label-md uppercase tracking-widest text-primary transition-all hover:bg-surface-container-high"
        >
          The Daily Folio
        </Link>
      </div>
    </main>
  );
}
