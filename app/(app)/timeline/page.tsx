import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type {
  Composition,
  Performance,
  GuruWisdom,
  JournalEntry,
  RiyazSession,
} from "@/lib/db/types";
import {
  COMPOSITION_TYPE_LABELS,
  PERFORMANCE_TYPE_LABELS,
} from "@/lib/db/types";
import {
  buildTimeline,
  computeYearStats,
  eventIconAndLabel,
  groupByYear,
  type TimelineEvent,
} from "@/lib/lineage";
import { excerpt, formatPerformanceDate } from "@/lib/memory";
import { formatHours } from "@/lib/riyaz";
import { Icon } from "@/components/manuscript/Icons";

export const metadata = {
  title: "Your Journey | Kathak Journal",
};

const KIND_ICON: Record<TimelineEvent["kind"], typeof Icon.Scroll> = {
  composition: Icon.Scroll,
  performance: Icon.Mask,
  wisdom: Icon.Quote,
  journal: Icon.Quill,
};

export default async function TimelinePage() {
  const supabase = await createClient();

  const [comp, perf, wis, jrn, ses] = await Promise.all([
    supabase.from("compositions").select("*"),
    supabase.from("performances").select("*"),
    supabase.from("guru_wisdom").select("*"),
    supabase.from("journal_entries").select("*"),
    supabase
      .from("riyaz_sessions")
      .select("started_at, duration_seconds")
      .not("duration_seconds", "is", null),
  ]);

  const events = buildTimeline({
    compositions: (comp.data ?? []) as Composition[],
    performances: (perf.data ?? []) as Performance[],
    wisdom: (wis.data ?? []) as GuruWisdom[],
    journal: (jrn.data ?? []) as JournalEntry[],
  });

  const sessions = (ses.data ?? []) as Pick<
    RiyazSession,
    "started_at" | "duration_seconds"
  >[];

  const grouped = groupByYear(events);
  const years = Array.from(grouped.keys()).sort((a, b) => (a > b ? -1 : 1));
  const yearStats = computeYearStats(events, sessions);

  return (
    <main className="mx-auto max-w-5xl px-margin-mobile py-12 md:px-margin-page">
      <header className="mb-section-gap text-center">
        <h1 className="font-display text-display-lg-mobile text-primary md:text-display-lg">
          Your Journey
        </h1>
        <p className="mt-4 font-serif text-body-lg italic text-on-surface-variant">
          The chapters of your artistic life, unfurled.
        </p>
      </header>

      {events.length === 0 ? (
        <div className="mx-auto max-w-xl border border-outline-variant bg-surface-container-low p-12 text-center">
          <span className="mx-auto flex w-fit text-secondary">
            <Icon.Calendar size={56} />
          </span>
          <h2 className="mt-4 font-display text-headline-md text-primary">
            The first chapter awaits
          </h2>
          <p className="mt-4 font-serif text-body-md italic text-on-surface-variant">
            Add a composition, log a performance, or write a journal page — your
            timeline begins with the first entry.
          </p>
          <Link
            href="/compositions/new"
            className="mt-8 inline-flex items-center gap-2 bg-primary px-8 py-3 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container"
          >
            Add First Composition
          </Link>
        </div>
      ) : (
        <div className="relative">
          <div
            className="absolute left-1/2 top-0 bottom-0 hidden w-px md:block"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, #B8893E 5%, #B8893E 95%, transparent 100%)",
              transform: "translateX(-50%)",
            }}
          />

          <div className="space-y-section-gap">
            {years.map((year) => (
              <section key={year}>
                <YearHeader year={year} stats={yearStats.get(year)!} />
                <div className="mt-12 space-y-stack-md">
                  {grouped.get(year)!.map((ev, idx) => (
                    <TimelineRow
                      key={`${ev.kind}-${idx}-${ev.date}`}
                      event={ev}
                      leftAligned={idx % 2 === 0}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function YearHeader({
  year,
  stats,
}: {
  year: string;
  stats: {
    compositions: number;
    performances: number;
    wisdom: number;
    journal: number;
    practiceSeconds: number;
  };
}) {
  const parts: string[] = [];
  if (stats.compositions > 0)
    parts.push(
      `${stats.compositions} ${stats.compositions === 1 ? "composition" : "compositions"} learned`
    );
  if (stats.performances > 0)
    parts.push(
      `${stats.performances} ${stats.performances === 1 ? "performance" : "performances"}`
    );
  if (stats.wisdom > 0)
    parts.push(
      `${stats.wisdom} wisdom ${stats.wisdom === 1 ? "note" : "notes"}`
    );
  if (stats.journal > 0)
    parts.push(
      `${stats.journal} journal ${stats.journal === 1 ? "page" : "pages"}`
    );
  if (stats.practiceSeconds > 0)
    parts.push(`${formatHours(stats.practiceSeconds, 0)} of riyaz`);

  return (
    <div className="relative z-10 mx-auto max-w-2xl">
      <div
        className="relative border border-secondary bg-surface p-2 text-center"
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
        <div className="relative px-6 py-6 md:px-12">
          <h2 className="font-display text-headline-lg text-primary">{year}</h2>
          {parts.length > 0 ? (
            <p className="mt-2 font-serif text-body-md italic text-on-surface-variant">
              {parts.join(" · ")}
            </p>
          ) : (
            <p className="mt-2 font-serif text-body-md italic text-on-surface-variant">
              The year was quiet in the archive.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineRow({
  event,
  leftAligned,
}: {
  event: TimelineEvent;
  leftAligned: boolean;
}) {
  const meta = eventIconAndLabel(event.kind);
  const DotIcon = KIND_ICON[event.kind];
  const card = <EventCard event={event} />;

  const dot = (
    <div className="absolute left-1/2 z-10 hidden h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-secondary bg-surface md:flex">
      <span style={{ color: meta.color }}>
        <DotIcon size={15} />
      </span>
    </div>
  );

  const spacer = <div className="hidden w-full md:block md:w-1/2" />;

  return (
    <div className="group relative flex w-full flex-col items-center md:flex-row">
      {leftAligned ? (
        <>
          <div className="order-2 w-full md:order-1 md:w-1/2 md:pr-16">
            {card}
          </div>
          {dot}
          {spacer}
        </>
      ) : (
        <>
          {spacer}
          {dot}
          <div className="order-2 w-full md:order-2 md:w-1/2 md:pl-16">
            {card}
          </div>
        </>
      )}
    </div>
  );
}

function EventCard({ event }: { event: TimelineEvent }) {
  const meta = eventIconAndLabel(event.kind);
  const CardIcon = KIND_ICON[event.kind];
  const dateLabel = formatPerformanceDate(event.date);

  let title = "";
  let body: string | null = null;
  let href = "";
  let badge: string | null = null;

  switch (event.kind) {
    case "composition":
      title = event.data.title;
      body = excerpt(event.data.bols ?? event.data.meaning, 100);
      href = `/compositions/${event.data.id}`;
      badge = COMPOSITION_TYPE_LABELS[event.data.type];
      break;
    case "performance":
      title = event.data.event_name;
      body =
        event.data.venue ??
        excerpt(event.data.reflection_learned, 100) ??
        null;
      href = `/performances/${event.data.id}`;
      badge = PERFORMANCE_TYPE_LABELS[event.data.type];
      break;
    case "wisdom":
      title = `“${excerpt(event.data.quote, 90)}”`;
      body = event.data.attribution ?? null;
      href = "/wisdom";
      badge = "Wisdom";
      break;
    case "journal":
      title = event.data.title ?? "Journal entry";
      body = excerpt(event.data.body, 120);
      href = `/journal/${event.data.id}`;
      badge = "Private";
      break;
  }

  return (
    <Link
      href={href}
      className="relative block bg-surface p-2 transition-colors duration-500 hover:bg-surface-container"
      style={{ border: "1px solid #7e570d" }}
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
      <div className="relative p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <span
            className="flex items-center gap-2 font-serif text-label-md uppercase tracking-widest"
            style={{ color: meta.color }}
          >
            <CardIcon size={16} />
            {meta.label}
          </span>
          <span className="font-serif text-label-md italic text-on-surface-variant">
            {dateLabel}
          </span>
        </div>
        <h3 className="mt-3 font-display text-headline-md text-primary">
          {title}
        </h3>
        {body ? (
          <p className="mt-2 font-serif text-body-md italic text-on-surface-variant">
            {body}
          </p>
        ) : null}
        {badge && event.kind !== "wisdom" ? (
          <span className="mt-3 inline-block bg-tertiary-fixed px-3 py-0.5 font-serif text-label-md uppercase tracking-wider text-on-tertiary-fixed">
            {badge}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
