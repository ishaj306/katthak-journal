import type {
  Composition,
  Performance,
  GuruWisdom,
  JournalEntry,
  KathakQuote,
} from "@/lib/db/types";

export type TimelineEvent =
  | { kind: "composition"; date: string; data: Composition }
  | { kind: "performance"; date: string; data: Performance }
  | { kind: "wisdom"; date: string; data: GuruWisdom }
  | { kind: "journal"; date: string; data: JournalEntry };

function safeDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function buildTimeline({
  compositions,
  performances,
  wisdom,
  journal,
}: {
  compositions: Composition[];
  performances: Performance[];
  wisdom: GuruWisdom[];
  journal: JournalEntry[];
}): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const c of compositions) {
    const date = safeDate(c.date_learned) ?? safeDate(c.created_at);
    if (date) events.push({ kind: "composition", date, data: c });
  }
  for (const p of performances) {
    const date = safeDate(p.performed_on) ?? safeDate(p.created_at);
    if (date) events.push({ kind: "performance", date, data: p });
  }
  for (const w of wisdom) {
    const date = safeDate(w.captured_at) ?? safeDate(w.created_at);
    if (date) events.push({ kind: "wisdom", date, data: w });
  }
  for (const j of journal) {
    const date = safeDate(j.entry_date);
    if (date) events.push({ kind: "journal", date, data: j });
  }

  events.sort((a, b) => (a.date < b.date ? 1 : -1));
  return events;
}

export function groupByYear<T extends { date: string }>(
  events: T[]
): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const e of events) {
    const year = e.date.slice(0, 4);
    if (!out.has(year)) out.set(year, []);
    out.get(year)!.push(e);
  }
  return out;
}

export type YearStats = {
  compositions: number;
  performances: number;
  wisdom: number;
  journal: number;
  practiceSeconds: number;
};

export function computeYearStats(
  events: TimelineEvent[],
  sessions: { started_at: string; duration_seconds: number | null }[]
): Map<string, YearStats> {
  const out = new Map<string, YearStats>();

  function ensure(year: string): YearStats {
    if (!out.has(year)) {
      out.set(year, {
        compositions: 0,
        performances: 0,
        wisdom: 0,
        journal: 0,
        practiceSeconds: 0,
      });
    }
    return out.get(year)!;
  }

  for (const ev of events) {
    const year = ev.date.slice(0, 4);
    const s = ensure(year);
    if (ev.kind === "composition") s.compositions += 1;
    else if (ev.kind === "performance") s.performances += 1;
    else if (ev.kind === "wisdom") s.wisdom += 1;
    else s.journal += 1;
  }

  for (const ses of sessions) {
    if (!ses.duration_seconds) continue;
    const year = ses.started_at.slice(0, 4);
    const s = ensure(year);
    s.practiceSeconds += ses.duration_seconds;
  }

  return out;
}

export function pickQuoteOfDay(
  quotes: KathakQuote[],
  now: Date = new Date()
): KathakQuote | null {
  if (quotes.length === 0) return null;
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  const idx =
    ((dayOfYear % quotes.length) + quotes.length) % quotes.length;
  return quotes[idx];
}

export function eventIconAndLabel(kind: TimelineEvent["kind"]): {
  icon: string;
  label: string;
  color: string;
} {
  switch (kind) {
    case "composition":
      return { icon: "auto_stories", label: "Composition", color: "#6B1E2A" };
    case "performance":
      return {
        icon: "theater_comedy",
        label: "Performance",
        color: "#7e570d",
      };
    case "wisdom":
      return { icon: "format_quote", label: "Wisdom", color: "#B8893E" };
    case "journal":
      return { icon: "menu_book", label: "Journal", color: "#9a424c" };
  }
}
