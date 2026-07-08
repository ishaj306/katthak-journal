import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  WISDOM_CATEGORIES,
  WISDOM_CATEGORY_LABELS,
  type GuruWisdom,
  type WisdomCategory,
} from "@/lib/db/types";
import { WisdomCard } from "./_components/WisdomCard";
import { WisdomCreator } from "./_components/WisdomCreator";

export const metadata = {
  title: "Guru Wisdom | Kathak Journal",
};

function isCategory(v: string | undefined): v is WisdomCategory {
  return !!v && (WISDOM_CATEGORIES as readonly string[]).includes(v);
}

export default async function WisdomPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const category = isCategory(params.category) ? params.category : undefined;
  const q = params.q?.trim();

  const supabase = await createClient();
  let query = supabase
    .from("guru_wisdom")
    .select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);
  if (q) query = query.ilike("quote", `%${q}%`);

  const { data, error } = await query;
  const items = (data ?? []) as GuruWisdom[];

  return (
    <main className="mx-auto max-w-7xl px-margin-mobile py-12 md:px-margin-page">
      <header className="mx-auto mb-section-gap max-w-4xl text-center">
        <h1 className="mb-2 font-display text-display-lg-mobile text-primary md:text-display-lg">
          Guru Wisdom
        </h1>
        <p className="mb-stack-md font-serif text-body-lg italic text-secondary">
          Whispers of the ancients, preserved for the modern seeker.
        </p>

        <form
          action="/wisdom"
          method="get"
          className="relative mx-auto mt-stack-md max-w-xl"
        >
          {category ? (
            <input type="hidden" name="category" value={category} />
          ) : null}
          <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-secondary">
            search
          </span>
          <input
            name="q"
            type="text"
            defaultValue={q ?? ""}
            placeholder="Seek guidance in the archives..."
            className="w-full bg-transparent py-3 pl-10 pr-4 font-serif text-body-md text-on-surface placeholder:italic placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
            style={{ borderBottom: "1px solid #4e0616" }}
          />
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/wisdom"
            className={
              !category
                ? "border-b-2 border-primary px-2 pb-1 font-serif text-label-md uppercase tracking-widest text-primary"
                : "border-b-2 border-transparent px-2 pb-1 font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
            }
          >
            All
          </Link>
          {WISDOM_CATEGORIES.filter((c) => c !== "other").map((c) => (
            <Link
              key={c}
              href={`/wisdom?category=${c}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={
                category === c
                  ? "border-b-2 border-primary px-2 pb-1 font-serif text-label-md uppercase tracking-widest text-primary"
                  : "border-b-2 border-transparent px-2 pb-1 font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
              }
            >
              {WISDOM_CATEGORY_LABELS[c]}
            </Link>
          ))}
        </div>
      </header>

      <div className="mb-section-gap">
        <WisdomCreator />
      </div>

      {error ? (
        <div className="mx-auto max-w-xl border border-error/40 bg-error-container p-6 text-center">
          <p className="font-serif text-body-md text-on-error-container">
            {error.message}
          </p>
          <p className="mt-2 font-serif text-label-md italic text-on-error-container">
            If this mentions a missing table, paste{" "}
            <code>supabase/migrations/0003_memory.sql</code> into your Supabase
            SQL Editor.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="mx-auto max-w-xl border border-outline-variant bg-surface-container-low p-12 text-center">
          <span
            className="material-symbols-outlined text-6xl text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            format_quote
          </span>
          <h2 className="mt-4 font-display text-headline-md text-primary">
            No wisdom captured yet
          </h2>
          <p className="mt-4 font-serif text-body-md italic text-on-surface-variant">
            Every correction, every metaphor, every philosophy spoken by your
            guru — preserve it here so it never fades.
          </p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-3">
          {items.map((w, i) => (
            <WisdomCard key={w.id} wisdom={w} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
