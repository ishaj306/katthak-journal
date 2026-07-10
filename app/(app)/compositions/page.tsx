import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CompositionTypeFilter } from "./_components/CompositionTypeFilter";
import { CompositionCard } from "./_components/CompositionCard";
import { EmptyState } from "@/components/manuscript/EmptyState";
import { Icon } from "@/components/manuscript/Icons";
import {
  COMPOSITION_TYPES,
  type CompositionType,
  type Composition,
} from "@/lib/db/types";

export const metadata = {
  title: "My Compositions | Kathak Journal",
};

function isCompositionType(v: string | undefined): v is CompositionType {
  return !!v && (COMPOSITION_TYPES as readonly string[]).includes(v);
}

export default async function CompositionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const type = isCompositionType(params.type) ? params.type : undefined;
  const q = params.q?.trim();
  const sort = params.sort ?? "recent";

  const supabase = await createClient();
  let query = supabase.from("compositions").select("*");

  if (type) query = query.eq("type", type);
  if (q) query = query.ilike("title", `%${q}%`);

  switch (sort) {
    case "date_learned":
      query = query.order("date_learned", { ascending: false, nullsFirst: false });
      break;
    case "guru":
      query = query.order("guru_name", { ascending: true, nullsFirst: false });
      break;
    case "difficulty":
      query = query.order("difficulty", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  const compositions = (data ?? []) as Composition[];

  return (
    <main className="mx-auto max-w-7xl px-margin-mobile pt-12 md:px-margin-page">
      <div className="mb-16 text-center">
        <h1 className="relative inline-block font-display text-display-lg-mobile text-primary md:text-display-lg">
          My Compositions
          <span className="absolute -bottom-2 left-0 h-1 w-full bg-[linear-gradient(90deg,transparent,#B8893E,transparent)]" />
        </h1>
        <p className="mt-6 font-serif text-body-lg italic text-on-surface-variant opacity-80">
          The archival record of your movement lineage.
        </p>
      </div>

      <div className="mb-12 space-y-8">
        <form
          action="/compositions"
          method="get"
          className="flex flex-col items-end justify-between gap-6 border-b border-outline-variant pb-4 md:flex-row"
        >
          {type ? <input type="hidden" name="type" value={type} /> : null}
          <div className="relative w-full md:w-1/2">
            <span className="absolute bottom-2 left-0 text-secondary">
              <Icon.Search size={20} />
            </span>
            <input
              name="q"
              defaultValue={q ?? ""}
              type="text"
              placeholder="Search the archives..."
              className="w-full border-0 border-b border-primary bg-transparent pb-2 pl-8 font-serif text-headline-md italic text-primary placeholder:text-outline-variant focus:outline-none focus:ring-0"
            />
          </div>
          <div className="flex w-full items-center gap-4 md:w-auto">
            <label className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
              Sort By:
            </label>
            <select
              name="sort"
              defaultValue={sort}
              className="cursor-pointer border-0 bg-transparent font-serif text-body-md text-primary focus:outline-none focus:ring-0"
            >
              <option value="recent">Recently Added</option>
              <option value="date_learned">Date Learned</option>
              <option value="guru">Guru</option>
              <option value="difficulty">Difficulty</option>
            </select>
            <button
              type="submit"
              className="border border-primary px-4 py-1 font-serif text-label-md uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-on-primary"
            >
              Apply
            </button>
          </div>
        </form>

        <CompositionTypeFilter active={type} q={q} sort={sort} />
      </div>

      {error ? (
        <div className="mx-auto max-w-xl border border-error/40 bg-error-container p-6 text-center">
          <p className="font-serif text-body-md text-on-error-container">
            {error.message}
          </p>
          <p className="mt-2 font-serif text-label-md italic text-on-error-container">
            If this mentions a missing table, paste{" "}
            <code>supabase/migrations/0001_init.sql</code> into your Supabase
            SQL Editor.
          </p>
        </div>
      ) : compositions.length === 0 ? (
        <EmptyState
          art="lotus"
          title="Your manuscript awaits its first folio"
          body="Begin by inscribing your first composition. Every bol, every correction, every memory will be preserved here."
          actionHref="/compositions/new"
          actionLabel="Add Your First Composition"
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {compositions.map((c) => (
            <CompositionCard key={c.id} composition={c} />
          ))}
        </div>
      )}

      {compositions.length > 0 ? (
        <Link
          href="/compositions/new"
          className="fixed bottom-8 right-8 z-30 flex items-center gap-3 bg-primary px-6 py-4 font-serif text-label-md uppercase tracking-[0.2em] text-on-primary shadow-lg transition-all hover:bg-primary-container"
        >
          <Icon.Quill size={20} />
          New Composition
        </Link>
      ) : null}
    </main>
  );
}
