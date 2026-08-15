import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitises user-authored rich text before it is rendered with
 * dangerouslySetInnerHTML. Uses DOMPurify (isomorphic — runs under Node during
 * SSR and in the browser) rather than hand-rolled regex, which is reliably
 * bypassable. Restricted to the tag/attribute set Tiptap's StarterKit emits.
 */
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
  "blockquote", "code", "pre", "h1", "h2", "h3", "h4", "span",
];
const ALLOWED_ATTR = ["href", "target", "rel"];

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Never allow javascript:/data: URIs on links.
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):/i,
  });
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
