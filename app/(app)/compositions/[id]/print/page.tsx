import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  COMPOSITION_TYPE_LABELS,
  GHARANA_LABELS,
  type Composition,
  type CompositionMedia,
} from "@/lib/db/types";
import { PrintButton } from "./PrintButton";

export const metadata = {
  title: "Print | Kathak Journal",
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function PrintCompositionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: composition } = await supabase
    .from("compositions")
    .select("*")
    .eq("id", id)
    .maybeSingle<Composition>();
  if (!composition) notFound();

  const { data: mediaRows } = await supabase
    .from("composition_media")
    .select("*")
    .eq("composition_id", id)
    .eq("kind", "image")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const media = (mediaRows ?? []) as CompositionMedia[];

  const urlMap = new Map<string, string>();
  if (media.length > 0) {
    const { data: signed } = await supabase.storage
      .from("composition-media")
      .createSignedUrls(
        media.map((m) => m.storage_path),
        60 * 60
      );
    for (const row of signed ?? []) {
      if (row.signedUrl) urlMap.set(row.path ?? "", row.signedUrl);
    }
  }
  const images = media
    .map((m) => ({ ...m, url: urlMap.get(m.storage_path) ?? "" }))
    .filter((m) => m.url);

  const dateLabel = formatDate(composition.date_learned);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 18mm; size: A4; }
        }
        .print-page {
          background: #FAF6EC;
          color: #1c1c16;
        }
      `}</style>

      <div className="no-print fixed left-0 right-0 top-0 z-50 flex items-center justify-between gap-4 border-b border-outline-variant bg-surface px-6 py-3">
        <p className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
          Print Preview — use your browser&rsquo;s &ldquo;Save as PDF&rdquo;
        </p>
        <PrintButton />
      </div>

      <main className="print-page mx-auto max-w-[800px] px-8 pt-24 pb-12 print:pt-0">
        <header className="border-b-2 border-double border-secondary pb-6 text-center">
          <p className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
            Kathak Journal · {COMPOSITION_TYPE_LABELS[composition.type]}
          </p>
          <h1 className="mt-4 font-display text-[40px] leading-tight text-primary">
            {composition.title}
          </h1>
          <p className="mt-3 font-serif text-body-md italic text-on-surface-variant">
            {[
              composition.guru_name ? `Guru ${composition.guru_name}` : null,
              composition.gharana ? GHARANA_LABELS[composition.gharana] : null,
              dateLabel ? `Learned on ${dateLabel}` : null,
            ]
              .filter(Boolean)
              .join("  ·  ") || "Self-Composition"}
          </p>
          {composition.difficulty ? (
            <p className="mt-2 font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
              Difficulty: {composition.difficulty} / 5
            </p>
          ) : null}
        </header>

        <section className="mt-10">
          <h2 className="text-center font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
            The Bols
          </h2>
          <div
            className="mt-4 p-8 text-center"
            style={{
              fontSize: "20px",
              lineHeight: "2",
              letterSpacing: "0.05em",
              border: "1px dashed #B8893E",
              background: "rgba(232,217,184,0.1)",
            }}
          >
            {composition.bols ? (
              <p className="whitespace-pre-line font-serif italic">
                {composition.bols}
              </p>
            ) : (
              <p className="font-serif italic opacity-50">No bols recorded</p>
            )}
          </div>
        </section>

        {composition.meaning ? (
          <section className="mt-10">
            <h3 className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
              Meaning &amp; Poetry
            </h3>
            <p className="mt-3 whitespace-pre-line font-serif text-body-md leading-relaxed">
              {composition.meaning}
            </p>
          </section>
        ) : null}

        {composition.instructions ? (
          <section className="mt-8">
            <h3 className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
              Performance Instructions
            </h3>
            <p className="mt-3 whitespace-pre-line font-serif text-body-md leading-relaxed">
              {composition.instructions}
            </p>
          </section>
        ) : null}

        {composition.corrections ? (
          <section
            className="mt-8 p-5 italic"
            style={{
              borderLeft: "4px solid #B8893E",
              background: "rgba(232,217,184,0.15)",
            }}
          >
            <h3 className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
              Corrections from Guru
            </h3>
            <p className="mt-2 whitespace-pre-line font-serif text-body-md leading-relaxed">
              {composition.corrections}
            </p>
          </section>
        ) : null}

        {images.length > 0 ? (
          <section className="mt-10">
            <h3 className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
              Reference Folios
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {images.map((m) => (
                <div
                  key={m.id}
                  className="relative aspect-square overflow-hidden"
                  style={{ border: "1px solid #B8893E" }}
                >
                  <Image
                    src={m.url}
                    alt={m.title ?? "Image"}
                    fill
                    sizes="400px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="mt-section-gap border-t border-outline-variant pt-6 text-center font-serif text-label-md italic text-on-surface-variant opacity-70">
          Preserved in Kathak Journal — {new Date().toLocaleDateString()}
        </footer>
      </main>
    </>
  );
}
