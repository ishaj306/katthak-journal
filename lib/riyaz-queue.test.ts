import { describe, it, expect } from "vitest";
import {
  talaItemSeconds,
  saveMixInputSchema,
  MAX_MIX_ITEMS,
  resolveGap,
  recordingToItem,
  talaToItem,
  toPersistedItems,
  hydrateMix,
  type Recording,
  type QueueItem,
} from "./riyaz-queue";

const recording: Recording = {
  id: "rec-1",
  url: "https://signed/rec-1",
  title: "Paran — slow",
  durationSec: 42,
  compositionId: "comp-1",
  compositionTitle: "Shiva Paran",
  talaId: "teentaal",
  talaName: null,
  levels: ["Level 2"],
};

describe("talaItemSeconds", () => {
  it("computes cycles × matras at the given tempo", () => {
    // Teentaal, 16 matras, 4 cycles at 120bpm = 64 beats × 0.5s = 32s
    const item = talaToItem("teentaal", 120, 4)!;
    expect(item.kind).toBe("tala");
    if (item.kind === "tala") expect(talaItemSeconds(item)).toBe(32);
  });
});

describe("resolveGap", () => {
  it("uses the item gap when set, else the mix default", () => {
    const base = recordingToItem(recording);
    expect(resolveGap({ ...base, gapAfter: 5 }, 10)).toBe(5);
    expect(resolveGap({ ...base, gapAfter: 0 }, 10)).toBe(0); // explicit zero
    expect(resolveGap({ ...base, gapAfter: null }, 10)).toBe(10);
  });
});

describe("persist / hydrate round-trip", () => {
  it("strips url+uid on persist and re-resolves url on hydrate", () => {
    const queue: QueueItem[] = [
      recordingToItem(recording),
      talaToItem("ektaal", 100, 2)!,
    ];
    const persisted = toPersistedItems(queue);
    // No signed URL is stored (it would expire).
    expect(JSON.stringify(persisted)).not.toContain("https://signed");

    const rebuilt = hydrateMix(persisted, [recording]);
    expect(rebuilt).toHaveLength(2);
    expect(rebuilt[0].kind).toBe("recording");
    if (rebuilt[0].kind === "recording") {
      expect(rebuilt[0].url).toBe(recording.url); // freshly resolved
    }
  });

  it("drops recordings that no longer exist rather than leaving them unplayable", () => {
    const persisted = toPersistedItems([recordingToItem(recording)]);
    const rebuilt = hydrateMix(persisted, []); // recording was deleted
    expect(rebuilt).toHaveLength(0);
  });
});

describe("saveMixInputSchema", () => {
  const tala = {
    kind: "tala" as const,
    talaId: "teentaal",
    talaName: "Teentaal",
    matras: 16,
    bpm: 80,
    cycles: 4,
    gapAfter: null,
  };
  const valid = { name: " Morning ", defaultGap: 5, loop: "all" as const, items: [tala] };

  it("accepts a well-formed mix and trims the name", () => {
    const r = saveMixInputSchema.safeParse(valid);
    expect(r.success).toBe(true);
    expect(r.success && r.data.name).toBe("Morning");
  });

  it("rejects empty mixes, unknown loop modes and unknown item kinds", () => {
    expect(saveMixInputSchema.safeParse({ ...valid, items: [] }).success).toBe(false);
    expect(saveMixInputSchema.safeParse({ ...valid, loop: "forever" }).success).toBe(false);
    expect(
      saveMixInputSchema.safeParse({ ...valid, items: [{ ...tala, kind: "video" }] }).success
    ).toBe(false);
  });

  it("rejects non-finite and out-of-range numbers", () => {
    expect(saveMixInputSchema.safeParse({ ...valid, defaultGap: NaN }).success).toBe(false);
    expect(saveMixInputSchema.safeParse({ ...valid, defaultGap: Infinity }).success).toBe(false);
    expect(
      saveMixInputSchema.safeParse({ ...valid, items: [{ ...tala, bpm: 1e9 }] }).success
    ).toBe(false);
  });

  it("caps the number of items", () => {
    const items = Array.from({ length: MAX_MIX_ITEMS + 1 }, () => tala);
    expect(saveMixInputSchema.safeParse({ ...valid, items }).success).toBe(false);
  });
});
