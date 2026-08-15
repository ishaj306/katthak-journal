import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import {
  COMPOSITION_TYPE_LABELS,
  GHARANA_LABELS,
  MEDIA_KINDS,
  type Composition,
  type CompositionMedia,
  type CompositionExamLevel,
  type MediaKind,
} from "@/lib/db/types";
import { LAYA_LABELS, talaById, talaLabel } from "@/lib/talas";
import { Icon } from "@/components/manuscript/Icons";
import { MediaSection } from "../_components/MediaSection";
import { ExamLevels } from "../_components/ExamLevels";
import {
  CompositionRiyazTakes,
  type RiyazTake,
} from "../_components/CompositionRiyazTakes";
import { DeleteCompositionButton } from "../_components/DeleteCompositionButton";
import { RichText } from "@/components/manuscript/RichText";
import { isBlankHtml } from "@/lib/sanitize";

export const metadata = {
  title: "Composition | Kathak Journal",
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

export default async function CompositionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const supabase = await createClient();
  const { data: composition } = await supabase
    .from("compositions")
    .select("*")
    .eq("id", id)
    .maybeSingle<Composition>();

  if (!composition) notFound();

  const [{ data: mediaRows }, { data: examRows }, { data: takeRows }] =
    await Promise.all([
      supabase
        .from("composition_media")
        .select("*")
        .eq("composition_id", id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("composition_exam_levels")
        .select("*")
        .eq("composition_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("riyaz_recordings")
        .select("id, storage_path, title, duration_sec, notes, recorded_at")
        .eq("composition_id", id)
        .order("recorded_at", { ascending: false }),
    ]);

  const media = (mediaRows ?? []) as CompositionMedia[];
  const examLevels = (examRows ?? []) as CompositionExamLevel[];
  const takeRowsTyped = (takeRows ?? []) as {
    id: string;
    storage_path: string;
    title: string;
    duration_sec: number | null;
    notes: string | null;
    recorded_at: string;
  }[];

  // Sign the Riyaaz takes' audio (same bucket as composition media).
  const takeUrlMap = new Map<string, string>();
  if (takeRowsTyped.length > 0) {
    const { data: signed } = await supabase.storage
      .from("composition-media")
      .createSignedUrls(
        takeRowsTyped.map((t) => t.storage_path),
        60 * 60
      );
    for (const row of signed ?? []) {
      if (row.signedUrl) takeUrlMap.set(row.path ?? "", row.signedUrl);
    }
  }

  const riyazTakes: RiyazTake[] = takeRowsTyped
    .map((t) => {
      const url = takeUrlMap.get(t.storage_path);
      if (!url) return null;
      return {
        id: t.id,
        url,
        title: t.title,
        durationSec: t.duration_sec,
        notes: t.notes,
        recordedOn: formatDate(t.recorded_at),
      } satisfies RiyazTake;
    })
    .filter((t): t is RiyazTake => t !== null);

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

  const grouped: Record<MediaKind, (CompositionMedia & { url: string })[]> = {
    image: [],
    audio: [],
    video: [],
    pdf: [],
  };
  for (const m of media) {
    const url = urlMap.get(m.storage_path);
    if (!url) continue;
    grouped[m.kind].push({ ...m, url });
  }

  const dateLabel = formatDate(composition.date_learned);
  const taal = talaLabel(composition.tala_id, composition.tala_name);
  const matras = talaById(composition.tala_id)?.matras ?? composition.matras;
  // Matches the section ids on /compositions so the taal links back to the
  // rest of the repertoire set in it.
  const taalAnchor =
    composition.tala_id ?? `custom:${(taal ?? "").toLowerCase()}`;

  return (
    <main className="mx-auto max-w-5xl px-margin-mobile py-section-gap md:px-margin-page">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/compositions"
          className="inline-flex items-center gap-2 font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:text-primary"
        >
          <Icon.ArrowLeft size={16} />
          Back to the archive
        </Link>
        <Link
          href={`/compositions/${composition.id}/edit`}
          className="inline-flex items-center gap-2 border border-secondary px-4 py-1.5 font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:bg-primary hover:text-on-primary"
        >
          <Icon.Edit size={15} />
          Edit
        </Link>
      </div>

      <header className="mt-8 border-b border-outline-variant pb-12 text-center">
        <span className="bg-tertiary-fixed px-3 py-1 font-serif text-label-md uppercase tracking-widest text-on-tertiary-fixed">
          {COMPOSITION_TYPE_LABELS[composition.type]}
        </span>
        <h1 className="mt-6 font-display text-display-lg-mobile text-primary md:text-display-lg">
          {composition.title}
        </h1>

        {taal ? (
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-serif text-body-lg text-secondary">
            <Link
              href={`/compositions#${taalAnchor}`}
              className="italic underline decoration-secondary/30 underline-offset-4 transition-colors hover:text-primary"
            >
              {taal}
            </Link>
            {matras ? (
              <span className="text-on-surface-variant">
                <span className="opacity-50">·</span> {matras} matras
              </span>
            ) : null}
            {composition.lay ? (
              <span className="text-on-surface-variant">
                <span className="opacity-50">·</span>{" "}
                {LAYA_LABELS[composition.lay]}
              </span>
            ) : null}
          </p>
        ) : null}

        <p className="mt-4 font-serif text-body-md italic text-on-surface-variant">
          {[
            composition.guru_name ? `Guru ${composition.guru_name}` : null,
            composition.gharana ? GHARANA_LABELS[composition.gharana] : null,
            dateLabel ? `Learned on ${dateLabel}` : null,
          ]
            .filter(Boolean)
            .join("  ·  ") || "Self-Composition"}
        </p>
        {composition.difficulty ? (
          <div className="mt-6 flex justify-center gap-1 text-secondary">
            {Array.from({ length: 5 }).map((_, i) => {
              const on = i < (composition.difficulty ?? 0);
              return (
                <span key={i} style={{ opacity: on ? 1 : 0.3 }}>
                  <Icon.Ghungroo size={22} strokeWidth={on ? 1.7 : 1.1} />
                </span>
              );
            })}
          </div>
        ) : null}
      </header>

      <section className="mt-16">
        <h2 className="text-center font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
          The Bols
        </h2>
        <div
          className="mt-4 border border-dashed border-secondary bg-[rgba(232,217,184,0.1)] p-8 text-center md:p-12"
          style={{
            fontSize: "22px",
            lineHeight: "2",
            letterSpacing: "0.05em",
          }}
        >
          {composition.bols ? (
            <p className="whitespace-pre-line font-serif italic text-on-surface">
              {composition.bols}
            </p>
          ) : (
            <p className="font-serif italic text-outline-variant">
              No bols inscribed yet.{" "}
              <Link
                href={`/compositions/${composition.id}/edit`}
                className="text-secondary underline"
              >
                Add them now
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2">
        {!isBlankHtml(composition.meaning) ? (
          <section>
            <h3 className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
              Meaning &amp; Poetry
            </h3>
            <RichText html={composition.meaning} className="mt-4" />
          </section>
        ) : null}
        {!isBlankHtml(composition.instructions) ? (
          <section>
            <h3 className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
              Performance Instructions
            </h3>
            <RichText html={composition.instructions} className="mt-4" />
          </section>
        ) : null}
      </div>

      {!isBlankHtml(composition.corrections) ? (
        <section className="mt-12 border-l-4 border-secondary bg-surface-container-low p-6 md:p-8">
          <h3 className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
            Corrections from Guru
          </h3>
          <RichText html={composition.corrections} className="mt-3" />
        </section>
      ) : null}

      <div className="mt-12">
        <ExamLevels compositionId={composition.id} entries={examLevels} />
      </div>

      <CompositionRiyazTakes takes={riyazTakes} />

      {MEDIA_KINDS.map((kind) => (
        <MediaSection
          key={kind}
          kind={kind}
          items={grouped[kind]}
          compositionId={composition.id}
          userId={userId}
        />
      ))}

      <footer className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-outline-variant pt-8 md:flex-row">
        <DeleteCompositionButton id={composition.id} />
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/compositions/${composition.id}/print`}
            className="inline-flex items-center gap-2 border border-secondary px-6 py-3 font-serif text-label-lg uppercase tracking-[0.2em] text-secondary transition-all hover:bg-secondary-fixed-dim"
          >
            <Icon.Printer size={16} />
            Export PDF
          </Link>
          <Link
            href={`/compositions/${composition.id}/edit`}
            className="border border-primary bg-primary px-10 py-3 font-serif text-label-lg uppercase tracking-[0.2em] text-on-primary transition-all hover:bg-primary-container"
          >
            Edit Composition
          </Link>
        </div>
      </footer>
    </main>
  );
}
