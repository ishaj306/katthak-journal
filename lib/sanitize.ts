import sanitizeHtmlLib from "sanitize-html";

/**
 * Sanitises user-authored rich text before it is rendered with
 * dangerouslySetInnerHTML. Uses `sanitize-html` (a parser-based allow-list built
 * on htmlparser2) rather than hand-rolled regex, which is reliably bypassable.
 *
 * `sanitize-html` is server-friendly and lightweight — unlike a jsdom/DOMPurify
 * setup, which added a ~40s cold-start import and could time out serverless
 * functions. Restricted to the tag/attribute set Tiptap's StarterKit emits.
 */
const OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
    "blockquote", "code", "pre", "h1", "h2", "h3", "h4", "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  // Only safe URL schemes on links (no javascript:/data:).
  allowedSchemes: ["http", "https", "mailto", "tel"],
  // Force links opened in a new tab to be safe against tab-nabbing.
  transformTags: {
    a: sanitizeHtmlLib.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtmlLib(html, OPTIONS);
}

/** True when the HTML has no visible text (used to decide "empty" states). */
export function isBlankHtml(html: string | null | undefined): boolean {
  if (!html) return true;
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length === 0;
}
