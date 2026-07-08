import Link from "next/link";
import {
  COMPOSITION_TYPES,
  COMPOSITION_TYPE_LABELS,
  type CompositionType,
} from "@/lib/db/types";

function buildQuery(
  type: CompositionType | undefined,
  q: string | undefined,
  sort: string
) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (q) params.set("q", q);
  if (sort && sort !== "recent") params.set("sort", sort);
  const s = params.toString();
  return s ? `/compositions?${s}` : "/compositions";
}

export function CompositionTypeFilter({
  active,
  q,
  sort,
}: {
  active: CompositionType | undefined;
  q: string | undefined;
  sort: string;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      <Link
        href={buildQuery(undefined, q, sort)}
        className={
          !active
            ? "whitespace-nowrap bg-primary px-6 py-1 font-serif text-label-md uppercase tracking-widest text-on-primary"
            : "whitespace-nowrap border border-outline-variant bg-surface-container px-6 py-1 font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-all hover:border-secondary"
        }
      >
        All
      </Link>
      {COMPOSITION_TYPES.filter((t) => t !== "other").map((t) => (
        <Link
          key={t}
          href={buildQuery(t, q, sort)}
          className={
            active === t
              ? "whitespace-nowrap bg-primary px-6 py-1 font-serif text-label-md uppercase tracking-widest text-on-primary"
              : "whitespace-nowrap border border-outline-variant bg-surface-container px-6 py-1 font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-all hover:border-secondary"
          }
        >
          {COMPOSITION_TYPE_LABELS[t]}
        </Link>
      ))}
    </div>
  );
}
