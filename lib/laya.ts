/**
 * The arithmetic of laya — the rhythmic mathematics a Kathak dancer works out
 * on paper before every tihai and layakari passage. Pure functions, no UI.
 */

export type Laya = {
  id: string;
  name: string;
  deva: string;
  ratio: number; // counts (bols) per matra
};

/** The common layakari, slowest to fastest. */
export const LAYAS: Laya[] = [
  { id: "thaah", name: "Thaah", deva: "ठाह", ratio: 1 },
  { id: "aad", name: "Aad", deva: "आड़", ratio: 1.5 },
  { id: "dugun", name: "Dugun", deva: "दुगुन", ratio: 2 },
  { id: "tigun", name: "Tigun", deva: "तिगुन", ratio: 3 },
  { id: "chaugun", name: "Chaugun", deva: "चौगुन", ratio: 4 },
  { id: "chhagun", name: "Chhagun", deva: "छगुन", ratio: 6 },
  { id: "athgun", name: "Athgun", deva: "अठगुन", ratio: 8 },
];

/**
 * A tihai: one phrase spoken three times to resolve on sam.
 *  - dumdar   → equal rests (dum) between the repetitions
 *  - bedumdar → the three phrases run continuously, no rest
 *
 * total = 3·phrase + 2·gap  (in counts). Landing on sam means total counts
 * exactly fill the span you have.
 */
export type TihaiResult = {
  gap: number;
  totalUsed: number;
  landsOnSam: boolean;
  reason: string;
};

export function computeTihai(
  spanCounts: number,
  phraseCounts: number,
  kind: "dumdar" | "bedumdar"
): TihaiResult {
  if (phraseCounts <= 0) {
    return { gap: 0, totalUsed: 0, landsOnSam: false, reason: "Enter a phrase length." };
  }

  if (kind === "bedumdar") {
    const total = 3 * phraseCounts;
    const lands = total === spanCounts;
    return {
      gap: 0,
      totalUsed: total,
      landsOnSam: lands,
      reason: lands
        ? "Three continuous repetitions land exactly on sam."
        : `A bedumdar tihai of this phrase needs a span of ${total} counts — a phrase of ${
            spanCounts / 3
          } counts would fit your span.`,
    };
  }

  const gap = (spanCounts - 3 * phraseCounts) / 2;
  if (gap < 0) {
    return {
      gap,
      totalUsed: 3 * phraseCounts,
      landsOnSam: false,
      reason: "The phrase is too long — three repetitions overflow the span.",
    };
  }
  if (!Number.isInteger(gap)) {
    return {
      gap,
      totalUsed: spanCounts,
      landsOnSam: false,
      reason: `The rest works out to ${gap} counts — not a whole count. Adjust the phrase or span by one.`,
    };
  }
  return {
    gap,
    totalUsed: spanCounts,
    landsOnSam: true,
    reason:
      gap === 0
        ? "The rest is zero — this is effectively a bedumdar tihai."
        : `A rest of ${gap} count${gap === 1 ? "" : "s"} between each repetition lands the third on sam.`,
  };
}

/** The state of each count across the span, for drawing the tihai. */
export type CountKind = "phrase" | "gap";

export function tihaiCells(
  spanCounts: number,
  phraseCounts: number,
  gap: number
): CountKind[] {
  const cells: CountKind[] = [];
  const push = (kind: CountKind, n: number) => {
    for (let i = 0; i < n; i++) cells.push(kind);
  };
  for (let rep = 0; rep < 3; rep++) {
    push("phrase", phraseCounts);
    if (rep < 2) push("gap", Math.max(0, gap));
  }
  return cells.slice(0, spanCounts);
}
