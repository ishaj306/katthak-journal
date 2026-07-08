import type { Performance, JournalEntry } from "@/lib/db/types";

export function groupPerformancesByYear(
  performances: Performance[]
): Map<string, Performance[]> {
  const out = new Map<string, Performance[]>();
  for (const p of performances) {
    const year = p.performed_on
      ? new Date(p.performed_on).getFullYear().toString()
      : "Undated";
    if (!out.has(year)) out.set(year, []);
    out.get(year)!.push(p);
  }
  return out;
}

export function formatPerformanceDate(iso: string | null): string {
  if (!iso) return "Date unknown";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatJournalDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function lastNDates(n: number, now: Date): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push(
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
        .getDate()
        .toString()
        .padStart(2, "0")}`
    );
  }
  return out;
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")}`;
}

export function excerpt(text: string | null, n = 140): string {
  if (!text) return "";
  // Strip any HTML tags (journal/notes may hold Tiptap markup) then collapse.
  const clean = text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > n ? clean.slice(0, n - 1) + "…" : clean;
}

export function entriesByDate(
  entries: JournalEntry[]
): Map<string, JournalEntry[]> {
  const out = new Map<string, JournalEntry[]>();
  for (const e of entries) {
    const key = e.entry_date;
    if (!out.has(key)) out.set(key, []);
    out.get(key)!.push(e);
  }
  return out;
}
