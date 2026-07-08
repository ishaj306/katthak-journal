import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JournalForm } from "../_components/JournalForm";
import { DeleteJournalButton } from "../_components/DeleteJournalButton";
import type { JournalEntry } from "@/lib/db/types";

export const metadata = {
  title: "Journal | Kathak Journal",
};

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .maybeSingle<JournalEntry>();
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-section-gap md:px-margin-page">
      <Link
        href="/journal"
        className="inline-flex items-center gap-2 font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:text-primary"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to private pages
      </Link>

      <div className="relative mt-8 border border-secondary bg-surface p-[2px] shadow-sm">
        <div
          className="pointer-events-none absolute"
          style={{
            top: "4px",
            left: "4px",
            right: "4px",
            bottom: "4px",
            border: "1px solid #4e0616",
          }}
          aria-hidden
        />
        <div className="relative p-7 md:p-11">
          <JournalForm existing={data} />
        </div>
      </div>

      <footer className="mt-12 flex justify-center">
        <DeleteJournalButton id={data.id} />
      </footer>
    </main>
  );
}
