import { describe, it, expect } from "vitest";
import { buildTimeline, groupByYear, pickQuoteOfDay } from "./lineage";
import type { KathakQuote } from "./db/types";

describe("buildTimeline", () => {
  const base = {
    compositions: [
      { id: "c1", date_learned: "2024-03-01", created_at: "2024-01-01" },
      { id: "c2", date_learned: null, created_at: "2023-05-01" },
    ],
    performances: [
      { id: "p1", performed_on: "2025-01-10", created_at: "2025-01-01" },
    ],
    wisdom: [{ id: "w1", captured_at: null, created_at: "2022-06-01" }],
    journal: [
      { id: "j1", entry_date: "2025-06-01" },
      { id: "j2", entry_date: "not-a-date" },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  it("sorts events newest-first", () => {
    const events = buildTimeline(base);
    const dates = events.map((e) => e.date);
    expect(dates).toEqual([...dates].sort((a, b) => (a < b ? 1 : -1)));
  });

  it("drops events with no usable date", () => {
    const events = buildTimeline(base);
    // j2 has an unparseable entry_date and must be excluded.
    expect(events.find((e) => e.kind === "journal" && e.data.id === "j2")).toBe(
      undefined
    );
  });

  it("falls back to created_at when the primary date is missing", () => {
    const events = buildTimeline(base);
    const c2 = events.find((e) => e.kind === "composition" && e.data.id === "c2");
    expect(c2?.date).toBe("2023-05-01");
  });
});

describe("groupByYear", () => {
  it("buckets events by their year", () => {
    const grouped = groupByYear([
      { date: "2024-03-01" },
      { date: "2024-11-02" },
      { date: "2025-01-01" },
    ]);
    expect(grouped.get("2024")).toHaveLength(2);
    expect(grouped.get("2025")).toHaveLength(1);
  });
});

describe("pickQuoteOfDay", () => {
  const quotes = [
    { id: "a" },
    { id: "b" },
    { id: "c" },
  ] as KathakQuote[];

  it("is deterministic for a given day", () => {
    const day = new Date("2025-08-15T09:00:00Z");
    expect(pickQuoteOfDay(quotes, day)?.id).toBe(
      pickQuoteOfDay(quotes, day)?.id
    );
  });

  it("returns null for an empty set", () => {
    expect(pickQuoteOfDay([], new Date())).toBeNull();
  });
});
