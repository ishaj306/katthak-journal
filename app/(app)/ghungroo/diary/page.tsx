import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/manuscript/Icons";
import { GhungrooDiaryForm } from "../_components/GhungrooDiaryForm";
import { GhungrooEntryDelete } from "../_components/GhungrooEntryDelete";
import {
  GHUNGROO_KIND_LABELS,
  type GhungrooEntry,
} from "@/lib/db/types";

export const metadata = {
  title: "Ghungroo Diary | Kathak Journal",
};

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function GhungrooDiaryPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ghungroo_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  const entries = (data ?? []) as GhungrooEntry[];
  const currentBells = entries.find((e) => e.bell_count != null)?.bell_count ?? null;

  return (
    <main className="mx-auto max-w-3xl px-margin-mobile py-12 md:px-margin-page">
      <Link
        href="/ghungroo"
        className="font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:text-primary"
      >
        ← Ghungroo
      </Link>

      <header className="mb-10 mt-6 text-center">
        <div className="mb-3 flex justify-center text-secondary">
          <Icon.Ghungroo size={44} />
        </div>
        <p className="font-deva text-headline-md text-secondary">घुंघरू</p>
        <h1 className="mt-1 font-display text-display-lg-mobile text-primary md:text-display-lg">
          Ghungroo Diary
        </h1>
        <p className="mt-4 font-serif text-body-lg italic text-on-surface-variant">
          The story of your bells — every string, every added weight, every
          sound they have carried.
        </p>
        {currentBells != null ? (
          <p className="mt-4 font-serif text-body-md text-on-surface-variant">
            Your ghungroo now carries{" "}
            <span className="font-display text-headline-md text-primary">
              {currentBells}
            </span>{" "}
            bells.
          </p>
        ) : null}
      </header>

      {error ? (
        <div className="mx-auto mb-10 max-w-xl border border-error/40 bg-error-container p-6 text-center">
          <p className="font-serif text-body-md text-on-error-container">
            {error.message}
          </p>
          <p className="mt-2 font-serif text-label-md italic text-on-error-container">
            If this mentions a missing table, paste{" "}
            <code>supabase/migrations/0007_ghungroo.sql</code> into your Supabase
            SQL Editor and run it.
          </p>
        </div>
      ) : null}

      <div className="mb-12">
        <GhungrooDiaryForm />
      </div>

      {entries.length === 0 && !error ? (
        <div className="mx-auto max-w-xl border border-outline-variant bg-surface-container-lowest p-10 text-center">
          <div className="mb-3 flex justify-center text-secondary opacity-70">
            <Icon.Ghungroo size={40} />
          </div>
          <h2 className="font-display text-headline-md text-primary">
            The bells are silent, for now
          </h2>
          <p className="mt-3 font-serif text-body-md italic text-on-surface-variant">
            Record the day you first tied them on, and every string since.
          </p>
        </div>
      ) : (
        <ol className="relative space-y-8 border-l border-outline-variant pl-8">
          {entries.map((e) => (
            <li key={e.id} className="relative">
              <span
                className="absolute -left-[37px] top-1.5 h-3 w-3 rounded-full border border-secondary bg-background"
                aria-hidden
              />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
                    {formatDate(e.entry_date)} · {GHUNGROO_KIND_LABELS[e.kind]}
                  </p>
                  {e.title ? (
                    <h3 className="mt-1 font-display text-headline-md text-primary">
                      {e.title}
                    </h3>
                  ) : null}
                  <p className="mt-1 font-serif text-body-md text-on-surface-variant">
                    {e.bell_count != null ? `${e.bell_count} bells` : ""}
                    {e.bell_count != null && e.string_material ? " · " : ""}
                    {e.string_material ?? ""}
                  </p>
                  {e.notes ? (
                    <p className="mt-2 font-serif text-body-md italic leading-relaxed text-on-surface">
                      {e.notes}
                    </p>
                  ) : null}
                </div>
                <GhungrooEntryDelete id={e.id} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
