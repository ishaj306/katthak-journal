import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompositionForm } from "../../_components/CompositionForm";
import type { Composition } from "@/lib/db/types";

export const metadata = {
  title: "Edit Composition | Kathak Journal",
};

export default async function EditCompositionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("compositions")
    .select("*")
    .eq("id", id)
    .maybeSingle<Composition>();

  if (!data) notFound();

  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-section-gap md:px-margin-page">
      <header className="mb-12 text-center">
        <h1 className="font-display text-display-lg-mobile text-primary md:text-display-lg">
          Refine your folio
        </h1>
        <p className="mt-4 font-serif text-body-md italic text-on-surface-variant">
          Every correction sharpens the rhythm.
        </p>
      </header>

      <div className="relative border border-secondary bg-surface p-[2px] shadow-sm">
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
          <CompositionForm existing={data} />
        </div>
      </div>
    </main>
  );
}
