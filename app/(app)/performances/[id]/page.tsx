import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import {
  PERFORMANCE_TYPE_LABELS,
  MEDIA_KINDS,
  type Performance,
  type PerformanceMedia,
  type MediaKind,
} from "@/lib/db/types";
import { formatPerformanceDate } from "@/lib/memory";
import { MEDIA_CONFIG, formatBytes, formatDuration } from "@/lib/media-config";
import { AudioPlayer } from "../../compositions/_components/AudioPlayer";
import { VideoPlayer } from "../../compositions/_components/VideoPlayer";
import { PerformanceMediaUploader } from "../_components/PerformanceMediaUploader";
import { PerformanceMediaDeleteButton } from "../_components/PerformanceMediaDeleteButton";
import { DeletePerformanceButton } from "../_components/DeletePerformanceButton";

export const metadata = {
  title: "Performance Folio | Kathak Journal",
};

const REFLECTION_PROMPTS: Array<{
  field: keyof Performance;
  label: string;
}> = [
  { field: "reflection_well", label: "What went well?" },
  { field: "reflection_mistakes", label: "Mistakes & Slips" },
  { field: "reflection_learned", label: "Learnings" },
  { field: "reflection_improve", label: "Next Steps" },
];

export default async function PerformanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const supabase = await createClient();
  const { data: performance } = await supabase
    .from("performances")
    .select("*")
    .eq("id", id)
    .maybeSingle<Performance>();
  if (!performance) notFound();

  const { data: mediaRows } = await supabase
    .from("performance_media")
    .select("*")
    .eq("performance_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const media = (mediaRows ?? []) as PerformanceMedia[];

  const urlMap = new Map<string, string>();
  if (media.length > 0) {
    const { data: signed } = await supabase.storage
      .from("performance-media")
      .createSignedUrls(
        media.map((m) => m.storage_path),
        60 * 60
      );
    for (const row of signed ?? []) {
      if (row.signedUrl) urlMap.set(row.path ?? "", row.signedUrl);
    }
  }

  const grouped: Record<MediaKind, (PerformanceMedia & { url: string })[]> = {
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

  const heroImage = grouped.image[0];

  return (
    <main className="mx-auto max-w-5xl px-margin-mobile py-section-gap md:px-margin-page">
      <Link
        href="/performances"
        className="inline-flex items-center gap-2 font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:text-primary"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to the timeline
      </Link>

      <section className="mt-8 flex flex-col items-center space-y-stack-md text-center">
        {heroImage ? (
          <div
            className="relative aspect-[16/9] w-full max-w-5xl overflow-hidden p-2"
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
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={heroImage.url}
                alt={heroImage.title ?? performance.event_name}
                fill
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        ) : null}

        <div className="pt-stack-md">
          <h1 className="font-display text-display-lg-mobile italic text-primary md:text-display-lg">
            {performance.event_name}
          </h1>
          <div className="mt-stack-sm flex flex-wrap justify-center gap-3">
            {performance.venue ? (
              <span
                className="font-serif text-label-md text-secondary"
                style={{
                  backgroundColor: "rgba(255, 221, 176, 0.3)",
                  border: "1px solid #7e570d",
                  padding: "2px 16px",
                  borderRadius: "9999px",
                }}
              >
                {performance.venue}
              </span>
            ) : null}
            <span
              className="font-serif text-label-md text-secondary"
              style={{
                backgroundColor: "rgba(255, 221, 176, 0.3)",
                border: "1px solid #7e570d",
                padding: "2px 16px",
                borderRadius: "9999px",
              }}
            >
              {formatPerformanceDate(performance.performed_on)}
            </span>
            <span
              className="font-serif text-label-md text-secondary"
              style={{
                backgroundColor: "rgba(255, 221, 176, 0.3)",
                border: "1px solid #7e570d",
                padding: "2px 16px",
                borderRadius: "9999px",
              }}
            >
              {PERFORMANCE_TYPE_LABELS[performance.type]}
            </span>
          </div>
        </div>
      </section>

      <Divider />

      {performance.costume_notes || performance.makeup_notes ? (
        <>
          <section className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {performance.costume_notes ? (
              <div>
                <h3 className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
                  Costume &amp; Shringar
                </h3>
                <p className="mt-4 whitespace-pre-line font-serif text-body-md leading-relaxed text-on-surface">
                  {performance.costume_notes}
                </p>
              </div>
            ) : null}
            {performance.makeup_notes ? (
              <div>
                <h3 className="font-serif text-label-md uppercase tracking-[0.3em] text-secondary">
                  Makeup Notes
                </h3>
                <p className="mt-4 whitespace-pre-line font-serif text-body-md leading-relaxed text-on-surface">
                  {performance.makeup_notes}
                </p>
              </div>
            ) : null}
          </section>
          <Divider />
        </>
      ) : null}

      <section className="mx-auto max-w-4xl">
        <h2 className="mb-12 text-center font-display text-headline-lg italic text-primary">
          Post-Performance Reflections
        </h2>
        <div className="grid grid-cols-1 gap-x-gutter gap-y-stack-md md:grid-cols-2">
          {REFLECTION_PROMPTS.map(({ field, label }) => {
            const value = performance[field] as string | null;
            return (
              <div key={field} className="space-y-2">
                <label className="block font-serif text-label-lg italic text-secondary">
                  {label}
                </label>
                <div
                  className="min-h-[120px] py-4 font-serif text-body-md text-on-surface"
                  style={{ borderBottom: "1px solid #4e0616" }}
                >
                  {value ? (
                    <p className="whitespace-pre-line">{value}</p>
                  ) : (
                    <p className="italic opacity-40">
                      No reflection recorded.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Divider />

      <section className="space-y-12">
        {(MEDIA_KINDS as readonly MediaKind[]).map((kind) => {
          const cfg = MEDIA_CONFIG[kind];
          const items = grouped[kind];
          return (
            <div key={kind}>
              <div className="mb-6 flex items-end justify-between border-b border-outline-variant pb-2">
                <h3 className="flex items-center gap-3 font-display text-headline-md text-primary">
                  <span className="material-symbols-outlined text-secondary">
                    {cfg.icon}
                  </span>
                  {cfg.label}
                </h3>
                <span className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
                  {items.length}
                </span>
              </div>

              {items.length > 0 ? (
                kind === "image" ? (
                  <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {items.map((m) => (
                      <figure
                        key={m.id}
                        className="group relative border border-secondary p-[2px]"
                      >
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          className="relative block aspect-square overflow-hidden"
                        >
                          <Image
                            src={m.url}
                            alt={m.title ?? "Performance image"}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            unoptimized
                          />
                        </a>
                        <figcaption className="flex items-center justify-between border-t border-secondary/30 bg-surface px-2 py-1 font-serif text-label-md">
                          <span
                            className="truncate text-on-surface-variant"
                            title={m.title ?? ""}
                          >
                            {m.title}
                          </span>
                          <PerformanceMediaDeleteButton id={m.id} />
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : kind === "audio" ? (
                  <div className="mb-6 space-y-4">
                    {items.map((m) => (
                      <article
                        key={m.id}
                        className="border border-secondary bg-surface-container-low p-4"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <p className="font-serif text-body-md text-on-surface">
                              {m.title ?? "Audio"}
                            </p>
                            <p className="font-serif text-label-md italic text-on-surface-variant">
                              {formatDuration(m.duration_sec)} ·{" "}
                              {formatBytes(m.file_size)}
                            </p>
                          </div>
                          <PerformanceMediaDeleteButton id={m.id} />
                        </div>
                        <AudioPlayer url={m.url} />
                      </article>
                    ))}
                  </div>
                ) : kind === "video" ? (
                  <div className="mb-6 grid grid-cols-1 gap-gutter md:grid-cols-2">
                    {items.map((m) => (
                      <article key={m.id} className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-serif text-body-md text-on-surface">
                              {m.title ?? "Video"}
                            </p>
                            <p className="font-serif text-label-md italic text-on-surface-variant">
                              {formatDuration(m.duration_sec)} ·{" "}
                              {formatBytes(m.file_size)}
                            </p>
                          </div>
                          <PerformanceMediaDeleteButton id={m.id} />
                        </div>
                        <VideoPlayer url={m.url} mime={m.mime_type} />
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mb-6 grid grid-cols-1 gap-stack-sm md:grid-cols-2">
                    {items.map((m) => (
                      <a
                        key={m.id}
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-4 border border-secondary bg-surface-container-low p-4 transition-colors hover:bg-tertiary-fixed/30"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="material-symbols-outlined text-secondary">
                            picture_as_pdf
                          </span>
                          <p className="truncate font-serif text-body-md text-on-surface">
                            {m.title ?? "Document"}
                          </p>
                        </div>
                        <PerformanceMediaDeleteButton id={m.id} />
                      </a>
                    ))}
                  </div>
                )
              ) : (
                <p className="mb-4 font-serif text-body-md italic text-on-surface-variant">
                  {cfg.emptyMessage}
                </p>
              )}

              <PerformanceMediaUploader
                performanceId={performance.id}
                userId={userId}
                kind={kind}
              />
            </div>
          );
        })}
      </section>

      <section className="mt-section-gap flex flex-col items-center justify-center gap-gutter md:flex-row">
        <Link
          href={`/performances/${performance.id}/edit`}
          className="w-full px-12 py-3 text-center font-serif text-label-lg uppercase tracking-[0.2em] text-on-primary md:w-auto"
          style={{ backgroundColor: "#4e0616" }}
        >
          Edit Entry
        </Link>
        <DeletePerformanceButton id={performance.id} />
      </section>
    </main>
  );
}

function Divider() {
  return (
    <div className="relative my-section-gap h-px w-full">
      <div
        className="absolute inset-x-0 top-1/2 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, #7e570d, transparent)",
        }}
      />
      <span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-secondary"
        style={{ fontSize: "1.2rem" }}
      >
        ❦
      </span>
    </div>
  );
}
