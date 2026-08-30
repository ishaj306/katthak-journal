import { describe, it, expect } from "vitest";
import { sanitizeHtml, isBlankHtml } from "./sanitize";

describe("sanitizeHtml", () => {
  it("keeps allowed Tiptap tags", () => {
    expect(sanitizeHtml("<p>Hello <strong>world</strong></p>")).toBe(
      "<p>Hello <strong>world</strong></p>"
    );
  });

  it("strips script tags and their content", () => {
    const out = sanitizeHtml("<p>ok</p><script>alert(1)</script>");
    expect(out).toContain("<p>ok</p>");
    expect(out).not.toContain("script");
  });

  it("removes event-handler attributes", () => {
    expect(sanitizeHtml('<p onclick="steal()">x</p>')).toBe("<p>x</p>");
  });

  it("drops javascript: links", () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain("javascript:");
  });

  it("keeps safe links and forces safe rel", () => {
    const out = sanitizeHtml('<a href="https://example.com">x</a>');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain("noopener");
  });
});

describe("isBlankHtml", () => {
  it("treats empty markup as blank", () => {
    expect(isBlankHtml("<p></p>")).toBe(true);
    expect(isBlankHtml("<p>&nbsp;</p>")).toBe(true);
    expect(isBlankHtml(null)).toBe(true);
  });
  it("treats real text as non-blank", () => {
    expect(isBlankHtml("<p>hi</p>")).toBe(false);
  });
});
