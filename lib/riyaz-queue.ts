import { talaById } from "@/lib/talas";

/**
 * The Riyaaz sequence model — a queue the dancer assembles from their own
 * content (recordings + talas) and plays hands-free, with a configurable
 * "breathing gap" between items and loop modes for repetition.
 *
 * Kept entirely client-side for now: the queue lives in the browser (and
 * localStorage) so a mix survives a reload. Named, DB-backed mixes are a later
 * addition and would slot in behind this same shape.
 */

/** Breathing-gap presets, in seconds. Custom values are also allowed. */
export const GAP_PRESETS = [0, 5, 10, 15, 20, 30] as const;

export type LoopMode = "off" | "all" | "one";

export const LOOP_LABELS: Record<LoopMode, string> = {
  off: "Play through",
  all: "Loop the mix",
  one: "Loop one",
};

/** A playable recording surfaced from the dancer's composition media. */
export type Recording = {
  id: string;
  url: string;
  title: string | null;
  durationSec: number | null;
  compositionId: string | null;
  compositionTitle: string | null;
  talaId: string | null;
  talaName: string | null;
  /** Distinct exam levels this recording's composition is tagged with. */
  levels: string[];
};

export type QueueItem =
  | {
      uid: string;
      kind: "recording";
      recordingId: string;
      title: string;
      url: string;
      compositionId: string | null;
      compositionTitle: string | null;
      talaLabel: string | null;
      durationSec: number | null;
      /** null → use the mix's default gap. */
      gapAfter: number | null;
    }
  | {
      uid: string;
      kind: "tala";
      talaId: string;
      talaName: string;
      matras: number;
      bpm: number;
      cycles: number;
      gapAfter: number | null;
    };

/** A short unique id for queue rows (stable across reorders). */
export function makeUid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function recordingToItem(r: Recording): QueueItem {
  const talaLabel =
    talaById(r.talaId)?.name ?? (r.talaName?.trim() || null);
  return {
    uid: makeUid(),
    kind: "recording",
    recordingId: r.id,
    title: r.title ?? r.compositionTitle ?? "Recording",
    url: r.url,
    compositionId: r.compositionId,
    compositionTitle: r.compositionTitle,
    talaLabel,
    durationSec: r.durationSec,
    gapAfter: null,
  };
}

export function talaToItem(
  talaId: string,
  bpm = 120,
  cycles = 4
): QueueItem | null {
  const tala = talaById(talaId);
  if (!tala) return null;
  return {
    uid: makeUid(),
    kind: "tala",
    talaId: tala.id,
    talaName: tala.name,
    matras: tala.matras,
    bpm,
    cycles,
    gapAfter: null,
  };
}

/** How long a tala item runs, in seconds. */
export function talaItemSeconds(item: Extract<QueueItem, { kind: "tala" }>) {
  return (item.matras * item.cycles * 60) / item.bpm;
}

/** The gap after an item, resolving null to the mix default. */
export function resolveGap(item: QueueItem, defaultGap: number): number {
  return item.gapAfter == null ? defaultGap : item.gapAfter;
}

/** A one-line description of a queue item for the now-playing display. */
export function itemSubtitle(item: QueueItem): string | null {
  if (item.kind === "tala") {
    return `Tala · ${item.cycles} cycles · ${item.bpm} bpm`;
  }
  return [item.compositionTitle, item.talaLabel].filter(Boolean).join(" · ") ||
    null;
}

// ---- saved (DB-backed) mixes ------------------------------------------

/**
 * A queue item as stored in a saved mix — no `uid` (regenerated on load) and no
 * signed `url` (expires; refreshed from the current recordings on load).
 */
export type PersistedMixItem =
  | {
      kind: "recording";
      recordingId: string;
      title: string;
      compositionId: string | null;
      compositionTitle: string | null;
      talaLabel: string | null;
      durationSec: number | null;
      gapAfter: number | null;
    }
  | {
      kind: "tala";
      talaId: string;
      talaName: string;
      matras: number;
      bpm: number;
      cycles: number;
      gapAfter: number | null;
    };

export type SavedMix = {
  id: string;
  name: string;
  defaultGap: number;
  loop: LoopMode;
  items: PersistedMixItem[];
};

/** Strips a live queue down to what's stored in the database. */
export function toPersistedItems(queue: QueueItem[]): PersistedMixItem[] {
  return queue.map((it) =>
    it.kind === "tala"
      ? {
          kind: "tala",
          talaId: it.talaId,
          talaName: it.talaName,
          matras: it.matras,
          bpm: it.bpm,
          cycles: it.cycles,
          gapAfter: it.gapAfter,
        }
      : {
          kind: "recording",
          recordingId: it.recordingId,
          title: it.title,
          compositionId: it.compositionId,
          compositionTitle: it.compositionTitle,
          talaLabel: it.talaLabel,
          durationSec: it.durationSec,
          gapAfter: it.gapAfter,
        }
  );
}

/**
 * Rebuilds a playable queue from a saved mix, resolving each recording to a
 * freshly signed URL. Recordings that no longer exist are dropped rather than
 * left unplayable.
 */
export function hydrateMix(
  items: PersistedMixItem[],
  recordings: Recording[]
): QueueItem[] {
  const byId = new Map(recordings.map((r) => [r.id, r]));
  const out: QueueItem[] = [];
  for (const it of items) {
    if (it.kind === "tala") {
      out.push({ uid: makeUid(), ...it });
      continue;
    }
    const rec = byId.get(it.recordingId);
    if (!rec) continue; // recording was deleted
    out.push({
      uid: makeUid(),
      kind: "recording",
      recordingId: it.recordingId,
      title: it.title,
      url: rec.url,
      compositionId: it.compositionId,
      compositionTitle: it.compositionTitle,
      talaLabel: it.talaLabel,
      durationSec: it.durationSec,
      gapAfter: it.gapAfter,
    });
  }
  return out;
}

const STORAGE_KEY = "kj.riyaz.mix.v1";

type PersistedMix = {
  queue: QueueItem[];
  defaultGap: number;
  loop: LoopMode;
};

export function loadMix(): PersistedMix | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedMix;
    if (!Array.isArray(parsed.queue)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveMix(mix: PersistedMix): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mix));
  } catch {
    // storage full or unavailable — the mix simply won't persist
  }
}
