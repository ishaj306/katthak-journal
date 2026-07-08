import type { RiyazSession } from "@/lib/db/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

/** Total seconds practiced for each local date. Only counts ended sessions. */
export function bucketByDay(sessions: RiyazSession[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const s of sessions) {
    if (!s.ended_at || !s.duration_seconds) continue;
    const key = localDateKey(new Date(s.started_at));
    out.set(key, (out.get(key) ?? 0) + s.duration_seconds);
  }
  return out;
}

/**
 * Counts consecutive days ending today (or yesterday if today is empty)
 * with at least one logged session.
 */
export function computeStreak(buckets: Map<string, number>, now: Date): number {
  const today = startOfDay(now);
  let cursor = today;
  let streak = 0;

  if ((buckets.get(localDateKey(cursor)) ?? 0) === 0) {
    cursor = addDays(cursor, -1);
  }

  while ((buckets.get(localDateKey(cursor)) ?? 0) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export type RiyazStats = {
  today: number;
  week: number;
  month: number;
  year: number;
  lifetime: number;
  longestSessionSec: number;
  longestSessionDate: string | null;
};

export function computeStats(
  sessions: RiyazSession[],
  now: Date
): RiyazStats {
  const today = startOfDay(now);
  const weekStart = addDays(today, -6); // last 7 days incl today
  const monthStart = addDays(today, -29); // last 30 days incl today
  const yearStart = addDays(today, -364); // last 365 days incl today

  let todaySec = 0;
  let weekSec = 0;
  let monthSec = 0;
  let yearSec = 0;
  let lifetimeSec = 0;
  let longest = 0;
  let longestDate: string | null = null;

  for (const s of sessions) {
    if (!s.duration_seconds) continue;
    const sd = new Date(s.started_at);
    lifetimeSec += s.duration_seconds;

    if (sd >= yearStart) yearSec += s.duration_seconds;
    if (sd >= monthStart) monthSec += s.duration_seconds;
    if (sd >= weekStart) weekSec += s.duration_seconds;
    if (localDateKey(sd) === localDateKey(today))
      todaySec += s.duration_seconds;

    if (s.duration_seconds > longest) {
      longest = s.duration_seconds;
      longestDate = s.started_at;
    }
  }

  return {
    today: todaySec,
    week: weekSec,
    month: monthSec,
    year: yearSec,
    lifetime: lifetimeSec,
    longestSessionSec: longest,
    longestSessionDate: longestDate,
  };
}

export function formatHours(seconds: number, decimals = 1): string {
  if (seconds <= 0) return "0h";
  const h = seconds / 3600;
  if (h < 0.1) return `${Math.round(seconds / 60)}m`;
  if (h < 1) return `${(h * 60).toFixed(0)}m`;
  return `${h.toFixed(decimals)}h`;
}

export function formatHourCount(seconds: number): string {
  return Math.floor(seconds / 3600).toLocaleString();
}

export function formatTimer(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s]
    .map((v) => v.toString().padStart(2, "0"))
    .join(":");
}

export type HeatmapCell = {
  date: string;
  seconds: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  inFuture: boolean;
};

export function buildHeatmap(
  buckets: Map<string, number>,
  now: Date,
  weeks = 53
): HeatmapCell[][] {
  const today = startOfDay(now);
  // Align the rightmost column to a full week ending on Saturday
  const endOfWeek = addDays(today, 6 - today.getDay());
  const start = addDays(endOfWeek, -(weeks * 7 - 1));

  // Column-major: weeks[col][row(day 0-6 Sun..Sat)]
  const grid: HeatmapCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      const key = localDateKey(date);
      const seconds = buckets.get(key) ?? 0;
      let intensity: HeatmapCell["intensity"] = 0;
      if (seconds > 0 && seconds < 15 * 60) intensity = 1;
      else if (seconds < 30 * 60) intensity = 2;
      else if (seconds < 60 * 60) intensity = 3;
      else if (seconds >= 60 * 60) intensity = 4;
      col.push({
        date: key,
        seconds,
        intensity,
        inFuture: date > today,
      });
    }
    grid.push(col);
  }
  return grid;
}

export const HEATMAP_COLORS: Record<HeatmapCell["intensity"], string> = {
  0: "#e6e2d8", // surface-variant
  1: "#f3bd6d", // secondary-fixed-dim (light gold)
  2: "#B8893E", // antique gold
  3: "#7e570d", // deeper gold
  4: "#6B1E2A", // maroon
};

export type Milestone = {
  hours: number;
  label: string;
  icon: string;
};

export const MILESTONES: Milestone[] = [
  { hours: 10, label: "Novice Folio", icon: "verified" },
  { hours: 50, label: "Steady Rhythm", icon: "workspace_premium" },
  { hours: 100, label: "The Disciple", icon: "military_tech" },
  { hours: 500, label: "Resonant Spirit", icon: "stars" },
  { hours: 1000, label: "The Artisan", icon: "auto_awesome" },
  { hours: 5000, label: "Eternal Resonance", icon: "diamond" },
  { hours: 10000, label: "The Grand Archivist", icon: "temple_hindu" },
];

export type MilestoneState = {
  current: Milestone | null;
  next: Milestone | null;
  progressToNext: number; // 0..1
};

export function milestoneState(lifetimeSeconds: number): MilestoneState {
  const hours = lifetimeSeconds / 3600;
  let current: Milestone | null = null;
  let next: Milestone | null = null;
  for (const m of MILESTONES) {
    if (hours >= m.hours) current = m;
    else {
      next = m;
      break;
    }
  }
  const previousHours = current?.hours ?? 0;
  const nextHours = next?.hours ?? hours;
  const span = nextHours - previousHours;
  const progressToNext =
    next && span > 0 ? Math.min(1, (hours - previousHours) / span) : 1;
  return { current, next, progressToNext };
}
