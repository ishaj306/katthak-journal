import { describe, it, expect } from "vitest";
import { buildIlikeOrFilter } from "./search";

describe("buildIlikeOrFilter", () => {
  it("wraps a plain term as a quoted ILIKE substring per column", () => {
    expect(buildIlikeOrFilter(["title", "bols"], "tatkar")).toBe(
      'title.ilike."%tatkar%",bols.ilike."%tatkar%"'
    );
  });

  it("escapes commas so they can't split the PostgREST or() filter", () => {
    // A raw comma would otherwise be read as a new condition.
    const out = buildIlikeOrFilter(["title"], "a,b");
    expect(out).toBe('title.ilike."%a,b%"');
    // The value is quoted, so the comma is inside the quotes, not a separator.
    expect(out.match(/"/g)?.length).toBe(2);
  });

  it("escapes double quotes and backslashes in the value", () => {
    const out = buildIlikeOrFilter(["title"], 'a"b\\c');
    // Value stays wrapped in double quotes...
    expect(out.startsWith('title.ilike."')).toBe(true);
    expect(out.endsWith('%"')).toBe(true);
    // ...and the embedded quote is backslash-escaped so it can't close early.
    expect(out).toContain('\\"');
  });

  it("escapes SQL LIKE wildcards so they match literally", () => {
    const out = buildIlikeOrFilter(["title"], "100%_x");
    // A backslash precedes each wildcard so % and _ match literally.
    expect(out).toMatch(/\\+%/);
    expect(out).toMatch(/\\+_/);
  });

  it("handles parentheses without breaking the filter grammar", () => {
    expect(buildIlikeOrFilter(["title"], "gat(nikas)")).toBe(
      'title.ilike."%gat(nikas)%"'
    );
  });
});
