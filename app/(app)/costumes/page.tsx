import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/manuscript/Icons";
import { CostumeForm } from "./_components/CostumeForm";
import { CostumeDelete } from "./_components/CostumeDelete";
import {
  COSTUME_KIND_LABELS,
  type Costume,
  type CostumeKind,
} from "@/lib/db/types";

export const metadata = {
  title: "Wardrobe | Kathak Journal",
};

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function CostumesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("costumes")
    .select("*")
    .order("created_at", { ascending: false });

  const costumes = (data ?? []) as Costume[];
  const groups = new Map<CostumeKind, Costume[]>();
  for (const c of costumes) {
    const list = groups.get(c.kind) ?? [];
    list.push(c);
    groups.set(c.kind, list);
  }

  return (
    <main className="mx-auto max-w-4xl px-margin-mobile py-12 md:px-margin-page">
      <header className="mb-10 text-center">
        <div className="mb-3 flex justify-center text-secondary">
          <Icon.Peacock size={44} />
        </div>
        <p className="font-deva text-headline-md text-secondary">वेशभूषा</p>
        <h1 className="mt-1 font-display text-display-lg-mobile text-primary md:text-display-lg">
          The Wardrobe
        </h1>
        <p className="mt-4 font-serif text-body-lg italic text-on-surface-variant">
          Every poshak, every ornament — and the stages they have graced.
        </p>
      </header>

      {error ? (
        <div className="mx-auto mb-10 max-w-xl border border-error/40 bg-error-container p-6 text-center">
          <p className="font-serif text-body-md text-on-error-container">
            {error.message}
          </p>
          <p className="mt-2 font-serif text-label-md italic text-on-error-container">
            If this mentions a missing table, paste{" "}
            <code>supabase/migrations/0008_costumes.sql</code> into your Supabase
            SQL Editor and run it.
          </p>
        </div>
      ) : null}

      <div className="mb-12">
        <CostumeForm />
      </div>

      {costumes.length === 0 && !error ? (
        <div className="mx-auto max-w-xl border border-outline-variant bg-surface-container-lowest p-10 text-center">
          <div className="mb-3 flex justify-center text-secondary opacity-70">
            <Icon.Peacock size={40} />
          </div>
          <h2 className="font-display text-headline-md text-primary">
            The wardrobe stands empty
          </h2>
          <p className="mt-3 font-serif text-body-md italic text-on-surface-variant">
            Record your first poshak — the colour, the fabric, the stage it first saw.
          </p>
        </div>
      ) : (
        <div className="space-y-section-gap">
          {Array.from(groups.entries()).map(([kind, list]) => (
            <section key={kind}>
              <h2 className="mb-6 font-display text-headline-md tracking-wide text-primary">
                {COSTUME_KIND_LABELS[kind]}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {list.map((c) => (
                  <article
                    key={c.id}
                    className="relative border border-outline-variant bg-surface-container-lowest p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-headline-md text-primary">
                        {c.name}
                      </h3>
                      <CostumeDelete id={c.id} />
                    </div>
                    <dl className="mt-3 space-y-1 font-serif text-body-md text-on-surface-variant">
                      {c.color ? (
                        <div>
                          <span className="text-secondary">Colour · </span>
                          {c.color}
                        </div>
                      ) : null}
                      {c.fabric ? (
                        <div>
                          <span className="text-secondary">Fabric · </span>
                          {c.fabric}
                        </div>
                      ) : null}
                      {c.occasion ? (
                        <div>
                          <span className="text-secondary">Occasion · </span>
                          {c.occasion}
                        </div>
                      ) : null}
                      {c.worn_on ? (
                        <div>
                          <span className="text-secondary">First worn · </span>
                          {formatDate(c.worn_on)}
                        </div>
                      ) : null}
                    </dl>
                    {c.notes ? (
                      <p className="mt-3 font-serif text-body-md italic leading-relaxed text-on-surface">
                        {c.notes}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
