import { describe, it, expect } from "vitest";
import { talaById, talaLabel, vibhagStarts, TALAS } from "./talas";

describe("talaById", () => {
  it("finds a built-in tala", () => {
    expect(talaById("teentaal")?.matras).toBe(16);
  });
  it("returns null for unknown or empty ids", () => {
    expect(talaById("nope")).toBeNull();
    expect(talaById(null)).toBeNull();
    expect(talaById(undefined)).toBeNull();
  });
});

describe("talaLabel", () => {
  it("prefers the built-in name", () => {
    expect(talaLabel("teentaal", "ignored")).toBe("Teentaal");
  });
  it("falls back to free-text name for custom talas", () => {
    expect(talaLabel(null, "Pancham Sawari")).toBe("Pancham Sawari");
  });
  it("is null when nothing is set", () => {
    expect(talaLabel(null, null)).toBeNull();
    expect(talaLabel(null, "   ")).toBeNull();
  });
});

describe("vibhagStarts", () => {
  it("marks the start index of each vibhag, summing to the cycle", () => {
    const teentaal = TALAS.find((t) => t.id === "teentaal")!;
    expect([...vibhagStarts(teentaal)].sort((a, b) => a - b)).toEqual([
      0, 4, 8, 12,
    ]);
  });

  it("every built-in tala's vibhags sum to its matra count", () => {
    for (const t of TALAS) {
      const sum = t.vibhags.reduce((a, b) => a + b, 0);
      expect(sum).toBe(t.matras);
    }
  });
});
