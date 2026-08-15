export type Tala = {
  id: string;
  name: string;
  matras: number;
  vibhags: number[]; // grouping of matras; sum === matras
  bols?: string[]; // optional theka syllables, length === matras
};

export const TALAS: Tala[] = [
  {
    id: "teentaal",
    name: "Teentaal",
    matras: 16,
    vibhags: [4, 4, 4, 4],
    bols: [
      "Dha", "Dhin", "Dhin", "Dha",
      "Dha", "Dhin", "Dhin", "Dha",
      "Dha", "Tin", "Tin", "Ta",
      "Ta", "Dhin", "Dhin", "Dha",
    ],
  },
  {
    id: "ektaal",
    name: "Ektaal",
    matras: 12,
    vibhags: [2, 2, 2, 2, 2, 2],
    bols: [
      "Dhin", "Dhin", "Dha", "Trka",
      "Tu", "Na", "Kt", "Ta",
      "Dha", "Trka", "Dhi", "Na",
    ],
  },
  {
    id: "jhaptaal",
    name: "Jhaptaal",
    matras: 10,
    vibhags: [2, 3, 2, 3],
    bols: ["Dhi", "Na", "Dhi", "Dhi", "Na", "Ti", "Na", "Dhi", "Dhi", "Na"],
  },
  {
    id: "rupak",
    name: "Rupak",
    matras: 7,
    vibhags: [3, 2, 2],
    bols: ["Tin", "Tin", "Na", "Dhin", "Na", "Dhin", "Na"],
  },
  {
    id: "dhamar",
    name: "Dhamar",
    matras: 14,
    vibhags: [5, 2, 3, 4],
  },
  {
    id: "dadra",
    name: "Dadra",
    matras: 6,
    vibhags: [3, 3],
    bols: ["Dha", "Dhin", "Na", "Dha", "Tin", "Na"],
  },
  {
    id: "kaharwa",
    name: "Kaharwa",
    matras: 8,
    vibhags: [4, 4],
    bols: ["Dha", "Ge", "Na", "Ti", "Na", "Ka", "Dhi", "Na"],
  },
];

export const LAYA_VALUES = ["vilambit", "madhya", "drut"] as const;
export type Laya = (typeof LAYA_VALUES)[number];

export const LAYA_LABELS: Record<Laya, string> = {
  vilambit: "Vilambit",
  madhya: "Madhya",
  drut: "Drut",
};

/** Looks up a built-in tala by id. */
export function talaById(id: string | null | undefined): Tala | null {
  if (!id) return null;
  return TALAS.find((t) => t.id === id) ?? null;
}

/**
 * The name to show for a composition's taal — the built-in name when it has a
 * known tala_id, otherwise whatever free text the dancer typed. Null when the
 * composition has no taal set at all.
 */
export function talaLabel(
  talaId: string | null | undefined,
  talaName: string | null | undefined
): string | null {
  const builtIn = talaById(talaId);
  if (builtIn) return builtIn.name;
  const custom = talaName?.trim();
  return custom && custom.length > 0 ? custom : null;
}

/** Indices (0-based) where each vibhag begins — these get an accent. */
export function vibhagStarts(tala: Tala): Set<number> {
  const starts = new Set<number>();
  let acc = 0;
  for (const v of tala.vibhags) {
    starts.add(acc);
    acc += v;
  }
  return starts;
}
