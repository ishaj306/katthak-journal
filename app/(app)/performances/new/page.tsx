import { createClient } from "@/lib/supabase/server";
import { PerformanceForm, type CostumeOption } from "../_components/PerformanceForm";

export const metadata = {
  title: "Add Performance | Kathak Journal",
};

export default async function NewPerformancePage() {
  const supabase = await createClient();
  const { data: costumeRows } = await supabase
    .from("costumes")
    .select("id, name, context")
    .order("created_at", { ascending: false });
  const costumes = (costumeRows ?? []) as CostumeOption[];

  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-section-gap md:px-margin-page">
      <header className="mb-12 text-center">
        <h1 className="font-display text-display-lg-mobile text-primary md:text-display-lg">
          Chronicle a new stage
        </h1>
        <p className="mt-4 font-serif text-body-md italic text-on-surface-variant">
          The performance ends, but the memory begins here.
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
          <PerformanceForm costumes={costumes} />
        </div>
      </div>
    </main>
  );
}
