import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PerformanceForm } from "../../_components/PerformanceForm";
import type { Performance } from "@/lib/db/types";

export const metadata = {
  title: "Edit Performance | Kathak Journal",
};

export default async function EditPerformancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("performances")
    .select("*")
    .eq("id", id)
    .maybeSingle<Performance>();
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-section-gap md:px-margin-page">
      <header className="mb-12 text-center">
        <h1 className="font-display text-display-lg-mobile text-primary md:text-display-lg">
          Refine the chronicle
        </h1>
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
          <PerformanceForm existing={data} />
        </div>
      </div>
    </main>
  );
}
