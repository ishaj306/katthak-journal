import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { JournalEntry } from "@/lib/db/types";
import { excerpt, formatJournalDate } from "@/lib/memory";
import { CalendarStrip } from "./_components/CalendarStrip";
import { EmptyState } from "@/components/manuscript/EmptyState";
import { Icon } from "@/components/manuscript/Icons";

export const metadata = {
  title: "Private Pages | Kathak Journal",
};

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const params = await searchParams;
  const dateFilter = params.d?.match(/^\d{4}-\d{2}-\d{2}$/) ? params.d : null;

  const supabase = await createClient();
  let query = supabase
    .from("journal_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (dateFilter) query = query.eq("entry_date", dateFilter);

  const { data, error } = await query;
  const entries = (data ?? []) as JournalEntry[];

  // Build set of dates with entries for the calendar strip (independent of filter)
  const { data: allDates } = await supabase
    .from("journal_entries")
    .select("entry_date");
  const dateSet = new Set(
    (allDates ?? []).map((r) => (r as { entry_date: string }).entry_date)
  );

  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-12 md:px-margin-page">
      <header className="mb-12 text-center">
        <span className="inline-flex items-center gap-2 font-serif text-label-md uppercase tracking-widest text-secondary">
          <Icon.Lock size={15} />
          Private Pages
        </span>
        <h1 className="mt-2 font-display text-display-lg-mobile text-primary md:text-display-lg">
          Personal Journal
        </h1>
        <p className="mt-4 font-serif text-body-lg italic text-on-surface-variant">
          For your eyes alone. Like writing in a leather diary by candlelight.
        </p>
      </header>

      <div
        className="relative mb-12 border border-secondary bg-surface-container-low p-1"
        style={{ padding: "8px" }}
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
        <div className="relative p-4">
          <CalendarStrip entryDates={dateSet} />
        </div>
      </div>

      <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
        <div>
          {dateFilter ? (
            <p className="font-serif text-body-md italic text-on-surface-variant">
              Filtered to {formatJournalDate(dateFilter)} ·{" "}
              <Link
                href="/journal"
                className="text-secondary underline hover:text-primary"
              >
                Show all
              </Link>
            </p>
          ) : (
            <p className="font-serif text-body-md italic text-on-surface-variant">
              {entries.length}{" "}
              {entries.length === 1 ? "page" : "pages"} of reflection
            </p>
          )}
        </div>
        <Link
          href="/journal/new"
          className="inline-flex items-center gap-2 bg-primary px-6 py-2 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container"
        >
          <Icon.Quill size={16} />
          Write New Page
        </Link>
      </div>

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
      ) : entries.length === 0 ? (
        <EmptyState
          art="mandala"
          title="The page is blank"
          body="What did the riyaz teach you today? What did the stage reveal? Write it before it slips away."
          actionHref="/journal/new"
          actionLabel="Write First Page"
        />
      ) : (
        <ul className="space-y-stack-md">
          {entries.map((e) => (
            <li key={e.id}>
              <Link
                href={`/journal/${e.id}`}
                className="block border border-outline-variant bg-surface p-6 transition-colors hover:border-secondary hover:bg-surface-container"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
                    {formatJournalDate(e.entry_date)}
                  </p>
                  {e.is_private ? (
                    <span className="text-secondary" title="Private">
                      <Icon.Lock size={15} />
                    </span>
                  ) : null}
                </div>
                {e.title ? (
                  <h3 className="mt-2 font-display text-headline-md text-primary">
                    {e.title}
                  </h3>
                ) : null}
                <p className="mt-3 font-serif text-body-md italic text-on-surface-variant">
                  {excerpt(e.body, 200) || "(no body yet)"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
