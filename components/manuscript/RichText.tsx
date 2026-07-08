import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

/** Renders stored Tiptap HTML in the manuscript prose voice. */
export function RichText({
  html,
  className,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  const clean = sanitizeHtml(html);
  if (!clean) return null;
  return (
    <div
      className={cn("manuscript-prose", className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
