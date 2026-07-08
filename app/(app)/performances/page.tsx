import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Performance } from "@/lib/db/types";
import { PERFORMANCE_TYPE_LABELS } from "@/lib/db/types";
import {
  formatPerformanceDate,
  groupPerformancesByYear,
} from "@/lib/memory";
import { EmptyState } from "@/components/manuscript/EmptyState";

export const metadata = {
  title: "Stage Journal | Kathak Journal",
};

export default async function PerformancesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("performances")
    .select("*")
    .order("performed_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  const performances = (data ?? []) as Performance[];
  const grouped = groupPerformancesByYear(performances);
  const years = Array.from(grouped.keys());

  return (
    <main className="mx-auto max-w-5xl px-margin-mobile py-12 md:px-margin-page">
      <header className="mb-section-gap flex flex-col items-end justify-between border-b border-primary/20 pb-8 md:flex-row">
        <div>
          <h1 className="font-display text-display-lg-mobile text-primary md:text-display-lg">
            Stage Journal
          </h1>
          <p className="mt-2 font-serif text-body-lg italic text-on-surface-variant opacity-80">
            Chronicles of the dancing soul across sacred stages.
          </p>
        </div>
        <Link
          href="/performances/new"
          className="mt-6 inline-flex items-center gap-2 border border-primary px-6 py-2 font-serif text-label-md uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-on-primary md:mt-0"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Performance
        </Link>
      </header>

      {error ? (
        <div className="mx-auto max-w-xl border border-error/40 bg-error-container p-6 text-center">
          <p className="font-serif text-body-md text-on-error-container">
            {error.message}
          </p>
          <p className="mt-2 font-serif text-label-md italic text-on-error-container">
            If this mentions a missing table, paste{" "}
            <code>supabase/migrations/0003_memory.sql</code> into your Supabase
            SQL Editor.
          </p>
        </div>
      ) : performances.length === 0 ? (
        <EmptyState
          art="dancer"
          title="The stage awaits its first chronicle"
          body="Every recital, every festival, every classroom showing — preserve them with photos, videos, and reflections."
          actionHref="/performances/new"
          actionLabel="Add First Performance"
          actionIcon="add"
        />
      ) : (
        <div className="relative" id="journalContainer">
          <div
            className="absolute left-1/2 top-0 bottom-0 hidden w-px md:block"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, #B8893E 5%, #B8893E 95%, transparent 100%)",
              transform: "translateX(-50%)",
            }}
          />
          <div className="space-y-gutter relative">
            {years.flatMap((year) =>
              grouped.get(year)!.map((p, idx) => {
                const leftAligned = idx % 2 === 0;
                return (
                  <TimelineEntry
                    key={p.id}
                    performance={p}
                    yearTag={year !== "Undated" ? `'${year.slice(-2)}` : "—"}
                    leftAligned={leftAligned}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function TimelineEntry({
  performance: p,
  yearTag,
  leftAligned,
}: {
  performance: Performance;
  yearTag: string;
  leftAligned: boolean;
}) {
  const card = (
    <Link
      href={`/performances/${p.id}`}
      className="relative block bg-surface p-2 transition-all duration-500 hover:-translate-y-1"
      style={{
        border: "1px solid #7e570d",
      }}
    >
      <div
        className="pointer-events-none absolute"
        style={{
          top: "4px",
          left: "4px",
          right: "4px",
          bottom: "4px",
          border: "0.5px solid #4e0616",
        }}
        aria-hidden
      />
      <div className="relative p-6 text-center md:text-left">
        <span className="mb-2 block font-serif text-label-md uppercase tracking-widest text-secondary">
          {formatPerformanceDate(p.performed_on)}
        </span>
        <h3 className="mb-1 font-display text-headline-md text-primary">
          {p.event_name}
        </h3>
        <p className="mb-3 font-serif text-body-md italic text-on-surface-variant">
          {p.venue ?? "Venue unspecified"} ·{" "}
          {PERFORMANCE_TYPE_LABELS[p.type]}
        </p>
        {p.reflection_well || p.reflection_learned ? (
          <p className="mt-3 line-clamp-3 font-serif text-body-md text-on-surface-variant">
            {p.reflection_well ?? p.reflection_learned}
          </p>
        ) : null}
      </div>
    </Link>
  );

  const dot = (
    <div className="absolute left-1/2 z-10 hidden h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-secondary bg-surface md:flex">
      <div className="h-2 w-2 rounded-full bg-secondary" />
    </div>
  );

  const yearTagEl = (
    <span
      className={`pointer-events-none select-none font-display text-primary opacity-10 ${leftAligned ? "" : "text-right"}`}
      style={{ fontSize: "5rem", lineHeight: 1 }}
    >
      {yearTag}
    </span>
  );

  if (leftAligned) {
    return (
      <div className="group relative flex w-full flex-col items-center md:flex-row">
        <div className="order-2 w-full md:order-1 md:w-1/2 md:pr-16">{card}</div>
        {dot}
        <div className="order-1 mb-4 w-full md:order-2 md:mb-0 md:w-1/2 md:pl-16">
          {yearTagEl}
        </div>
      </div>
    );
  }
  return (
    <div className="group relative flex w-full flex-col items-center md:flex-row">
      <div className="order-1 mb-4 w-full text-right md:order-1 md:mb-0 md:w-1/2 md:pr-16">
        {yearTagEl}
      </div>
      {dot}
      <div className="order-2 w-full md:order-2 md:w-1/2 md:pl-16">{card}</div>
    </div>
  );
}
