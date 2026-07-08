import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import type { KathakQuote } from "@/lib/db/types";
import { QuoteFavoriteButton } from "./_components/QuoteFavoriteButton";

export const metadata = {
  title: "Words of the Masters | Kathak Journal",
};

const CATEGORIES: { key: string; label: string }[] = [
  { key: "philosophy", label: "Philosophy" },
  { key: "discipline", label: "Discipline" },
  { key: "performance", label: "Performance" },
  { key: "masters", label: "Masters" },
];

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "favorites" ? "favorites" : "all";
  const category = params.category;
  const q = params.q?.trim();

  const { userId } = await auth();
  const supabase = await createClient();

  let quotes: KathakQuote[] = [];
  let favoriteIds = new Set<string>();

  if (userId) {
    const { data: favs } = await supabase
      .from("quote_favorites")
      .select("quote_id")
      .eq("user_id", userId);
    favoriteIds = new Set(
      (favs ?? []).map((f) => (f as { quote_id: string }).quote_id)
    );
  }

  let query = supabase.from("kathak_quotes").select("*");
  if (category) query = query.eq("category", category);
  if (q) query = query.ilike("quote", `%${q}%`);
  if (tab === "favorites" && favoriteIds.size > 0) {
    query = query.in("id", Array.from(favoriteIds));
  } else if (tab === "favorites") {
    quotes = [];
  }

  if (!(tab === "favorites" && favoriteIds.size === 0)) {
    const { data } = await query.order("created_at", { ascending: true });
    quotes = (data ?? []) as KathakQuote[];
  }

  const featured = quotes[0];

  function buildHref(next: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (next.tab && next.tab !== "all") p.set("tab", next.tab);
    if (next.category) p.set("category", next.category);
    if (next.q) p.set("q", next.q);
    const s = p.toString();
    return s ? `/quotes?${s}` : "/quotes";
  }

  return (
    <main className="mx-auto max-w-7xl px-margin-mobile py-12 md:px-margin-page">
      <header className="mx-auto mb-12 max-w-4xl text-center">
        <h1 className="mb-2 font-display text-display-lg-mobile text-primary md:text-display-lg">
          Words of the Masters
        </h1>
        <p className="font-serif text-body-lg italic text-secondary">
          A library of wisdom — curated, never invented.
        </p>

        <div className="mt-8 flex justify-center gap-8 border-b border-outline-variant">
          <Link
            href={buildHref({ tab: "all", category, q })}
            className={
              tab === "all"
                ? "border-b-2 border-primary pb-2 font-serif text-label-lg uppercase tracking-widest text-primary"
                : "border-b-2 border-transparent pb-2 font-serif text-label-lg uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
            }
          >
            All Quotes
          </Link>
          <Link
            href={buildHref({ tab: "favorites", category, q })}
            className={
              tab === "favorites"
                ? "border-b-2 border-primary pb-2 font-serif text-label-lg uppercase tracking-widest text-primary"
                : "border-b-2 border-transparent pb-2 font-serif text-label-lg uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
            }
          >
            Favorites ({favoriteIds.size})
          </Link>
        </div>

        <form
          action="/quotes"
          method="get"
          className="relative mx-auto mt-8 max-w-xl"
        >
          {tab !== "all" ? <input type="hidden" name="tab" value={tab} /> : null}
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
            placeholder="Seek a word…"
            className="w-full bg-transparent py-3 pl-10 pr-4 font-serif text-body-md text-on-surface placeholder:italic placeholder:text-on-surface-variant/50 focus:outline-none"
            style={{ borderBottom: "1px solid #4e0616" }}
          />
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={buildHref({ tab, q })}
            className={
              !category
                ? "border-b-2 border-primary px-2 pb-1 font-serif text-label-md uppercase tracking-widest text-primary"
                : "border-b-2 border-transparent px-2 pb-1 font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
            }
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={buildHref({ tab, q, category: c.key })}
              className={
                category === c.key
                  ? "border-b-2 border-primary px-2 pb-1 font-serif text-label-md uppercase tracking-widest text-primary"
                  : "border-b-2 border-transparent px-2 pb-1 font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
              }
            >
              {c.label}
            </Link>
          ))}
        </div>
      </header>

      {quotes.length === 0 ? (
        <p className="text-center font-serif text-body-md italic text-on-surface-variant">
          {tab === "favorites"
            ? "No saved quotes yet. Bookmark wisdom on the All tab."
            : "No quotes match your search."}
        </p>
      ) : (
        <>
          {featured ? (
            <section className="mx-auto mb-section-gap max-w-3xl">
              <div
                className="relative bg-surface p-2"
                style={{ border: "1px solid #7e570d" }}
              >
                <div
                  className="pointer-events-none absolute"
                  style={{
                    top: "4px",
                    left: "4px",
                    right: "4px",
                    bottom: "4px",
                    border: "0.5px solid #4e0616",
                  }}
                  aria-hidden
                />
                <div className="relative p-8 text-center md:p-12">
                  <p className="mb-6 font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
                    Featured
                  </p>
                  <blockquote
                    className="font-display italic leading-snug text-primary"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
                  >
                    &ldquo;{featured.quote}&rdquo;
                  </blockquote>
                  <p className="mt-6 font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
                    — {featured.attribution}
                    {featured.source ? `, ${featured.source}` : ""}
                  </p>
                  <div className="mt-6 flex justify-center">
                    <QuoteFavoriteButton
                      quoteId={featured.id}
                      initialFavorite={favoriteIds.has(featured.id)}
                    />
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {quotes.length > 1 ? (
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-gutter md:grid-cols-2">
              {quotes.slice(1).map((qt) => (
                <article
                  key={qt.id}
                  className="border border-outline-variant bg-surface p-6 transition-all hover:border-secondary md:p-8"
                >
                  <blockquote className="text-center font-display italic leading-snug text-primary">
                    &ldquo;{qt.quote}&rdquo;
                  </blockquote>
                  <p className="mt-4 text-center font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
                    — {qt.attribution}
                    {qt.source ? `, ${qt.source}` : ""}
                  </p>
                  {qt.tags.length > 0 ? (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {qt.tags.map((t) => (
                        <span
                          key={t}
                          className="bg-secondary-fixed/30 px-3 py-0.5 font-serif text-label-md uppercase tracking-wider text-primary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-4 flex justify-center">
                    <QuoteFavoriteButton
                      quoteId={qt.id}
                      initialFavorite={favoriteIds.has(qt.id)}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
