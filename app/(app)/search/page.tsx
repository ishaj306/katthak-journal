import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type {
  Composition,
  Performance,
  GuruWisdom,
  JournalEntry,
} from "@/lib/db/types";
import {
  COMPOSITION_TYPE_LABELS,
  PERFORMANCE_TYPE_LABELS,
} from "@/lib/db/types";
import { excerpt, formatPerformanceDate, formatJournalDate } from "@/lib/memory";

export const metadata = {
  title: "Search | Kathak Journal",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";

  let comps: Composition[] = [];
  let perfs: Performance[] = [];
  let wisdom: GuruWisdom[] = [];
  let journal: JournalEntry[] = [];

  if (q.length > 0) {
    const supabase = await createClient();
    const term = `%${q}%`;

    const [c, p, w, j] = await Promise.all([
      supabase
        .from("compositions")
        .select("*")
        .or(`title.ilike.${term},bols.ilike.${term},meaning.ilike.${term}`)
        .limit(20),
      supabase
        .from("performances")
        .select("*")
        .or(`event_name.ilike.${term},venue.ilike.${term},reflection_learned.ilike.${term}`)
        .limit(20),
      supabase
        .from("guru_wisdom")
        .select("*")
        .or(`quote.ilike.${term},attribution.ilike.${term}`)
        .limit(20),
      supabase
        .from("journal_entries")
        .select("*")
        .or(`title.ilike.${term},body.ilike.${term}`)
        .limit(20),
    ]);

    comps = (c.data ?? []) as Composition[];
    perfs = (p.data ?? []) as Performance[];
    wisdom = (w.data ?? []) as GuruWisdom[];
    journal = (j.data ?? []) as JournalEntry[];
  }

  const total = comps.length + perfs.length + wisdom.length + journal.length;

  return (
    <main className="mx-auto max-w-5xl px-margin-mobile py-12 md:px-margin-page">
      <header className="mb-12 text-center">
        <h1 className="font-display text-display-lg-mobile text-primary md:text-display-lg">
          Seek
        </h1>
        <p className="mt-4 font-serif text-body-lg italic text-on-surface-variant">
          Search every folio, performance, wisdom and page.
        </p>
        <form
          action="/search"
          method="get"
          className="relative mx-auto mt-8 max-w-2xl"
        >
          <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-secondary">
            search
          </span>
          <input
            name="q"
            type="text"
            defaultValue={q}
            placeholder="Search the archives…"
            autoFocus
            className="w-full bg-transparent py-3 pl-10 pr-4 font-serif text-body-md text-on-surface placeholder:italic placeholder:text-on-surface-variant/50 focus:outline-none"
            style={{ borderBottom: "1px solid #4e0616" }}
          />
        </form>
      </header>

      {q.length === 0 ? (
        <p className="text-center font-serif text-body-md italic text-on-surface-variant">
          Enter a word above to begin seeking.
        </p>
      ) : total === 0 ? (
        <p className="text-center font-serif text-body-md italic text-on-surface-variant">
          No results for &ldquo;{q}&rdquo;.
        </p>
      ) : (
        <div className="space-y-section-gap">
          {comps.length > 0 ? (
            <Section title="Compositions" count={comps.length}>
              <ul className="grid grid-cols-1 gap-stack-sm md:grid-cols-2">
                {comps.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/compositions/${c.id}`}
                      className="block border border-outline-variant bg-surface p-4 transition-colors hover:border-secondary"
                    >
                      <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
                        {COMPOSITION_TYPE_LABELS[c.type]}
                      </p>
                      <h3 className="mt-1 font-display text-headline-md text-primary">
                        {c.title}
                      </h3>
                      <p className="mt-2 font-serif text-body-md italic text-on-surface-variant">
                        {excerpt(c.bols ?? c.meaning, 140)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {perfs.length > 0 ? (
            <Section title="Performances" count={perfs.length}>
              <ul className="grid grid-cols-1 gap-stack-sm md:grid-cols-2">
                {perfs.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/performances/${p.id}`}
                      className="block border border-outline-variant bg-surface p-4 transition-colors hover:border-secondary"
                    >
                      <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
                        {PERFORMANCE_TYPE_LABELS[p.type]} ·{" "}
                        {formatPerformanceDate(p.performed_on)}
                      </p>
                      <h3 className="mt-1 font-display text-headline-md text-primary">
                        {p.event_name}
                      </h3>
                      {p.venue ? (
                        <p className="mt-1 font-serif text-body-md italic text-on-surface-variant">
                          {p.venue}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {wisdom.length > 0 ? (
            <Section title="Guru Wisdom" count={wisdom.length}>
              <ul className="space-y-stack-sm">
                {wisdom.map((w) => (
                  <li
                    key={w.id}
                    className="border border-outline-variant bg-surface p-4"
                  >
                    <blockquote className="font-display italic text-primary">
                      &ldquo;{w.quote}&rdquo;
                    </blockquote>
                    <p className="mt-2 font-serif text-label-md italic text-on-surface-variant">
                      — {w.attribution || "Anonymous"}
                    </p>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {journal.length > 0 ? (
            <Section title="Private Pages" count={journal.length}>
              <ul className="space-y-stack-sm">
                {journal.map((j) => (
                  <li key={j.id}>
                    <Link
                      href={`/journal/${j.id}`}
                      className="block border border-outline-variant bg-surface p-4 transition-colors hover:border-secondary"
                    >
                      <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
                        {formatJournalDate(j.entry_date)}
                      </p>
                      {j.title ? (
                        <h3 className="mt-1 font-display text-headline-md text-primary">
                          {j.title}
                        </h3>
                      ) : null}
                      <p className="mt-2 font-serif text-body-md italic text-on-surface-variant">
                        {excerpt(j.body, 160)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>
      )}
    </main>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between border-b border-outline-variant pb-2">
        <h2 className="font-display text-headline-md text-primary">{title}</h2>
        <span className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
          {count}
        </span>
      </div>
      {children}
    </section>
  );
}
