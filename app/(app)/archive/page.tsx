import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  MEDIA_KINDS,
  type CompositionMedia,
  type MediaKind,
} from "@/lib/db/types";
import { MEDIA_CONFIG, formatBytes, formatDuration } from "@/lib/media-config";
import { AudioPlayer } from "../compositions/_components/AudioPlayer";
import { VideoPlayer } from "../compositions/_components/VideoPlayer";
import { MediaDeleteButton } from "../compositions/_components/MediaDeleteButton";
import { ArchiveTabs } from "./_components/ArchiveTabs";
import { Icon } from "@/components/manuscript/Icons";

export const metadata = {
  title: "Memory Vault | Kathak Journal",
};

function isMediaKind(v: string | undefined): v is MediaKind {
  return !!v && (MEDIA_KINDS as readonly string[]).includes(v);
}

type ArchiveMediaRow = CompositionMedia & {
  url: string;
  composition: { id: string; title: string } | null;
};

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const params = await searchParams;
  const activeKind = isMediaKind(params.kind) ? params.kind : undefined;

  const supabase = await createClient();
  const { data: mediaRows } = await supabase
    .from("composition_media")
    .select("*, composition:compositions(id, title)")
    .order("created_at", { ascending: false });

  const all = (mediaRows ?? []) as (CompositionMedia & {
    composition: { id: string; title: string } | null;
  })[];

  const totalBytes = all.reduce((acc, m) => acc + (m.file_size ?? 0), 0);
  const counts: Record<MediaKind, number> = {
    image: 0,
    audio: 0,
    video: 0,
    pdf: 0,
  };
  for (const m of all) counts[m.kind] += 1;

  const filtered = activeKind ? all.filter((m) => m.kind === activeKind) : all;

  const urlMap = new Map<string, string>();
  if (filtered.length > 0) {
    const { data: signed } = await supabase.storage
      .from("composition-media")
      .createSignedUrls(
        filtered.map((m) => m.storage_path),
        60 * 60
      );
    for (const row of signed ?? []) {
      if (row.signedUrl) urlMap.set(row.path ?? "", row.signedUrl);
    }
  }

  const enriched: ArchiveMediaRow[] = filtered
    .map((m) => ({ ...m, url: urlMap.get(m.storage_path) ?? "" }))
    .filter((m) => m.url !== "");

  return (
    <main className="mx-auto max-w-7xl px-margin-mobile py-12 md:px-margin-page">
      <header className="mb-12 text-center">
        <h1 className="font-display text-display-lg-mobile text-primary md:text-display-lg">
          Memory Vault
        </h1>
        <p className="mt-4 font-serif text-body-lg italic text-secondary">
          A sacred repository of every recording, every folio.
        </p>
        <div
          className="relative mx-auto mt-8 h-px max-w-md"
          style={{
            background:
              "linear-gradient(90deg, transparent, #4e0616 50%, transparent)",
          }}
        >
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-secondary"
            style={{ fontSize: "1.2rem" }}
          >
            ⬥
          </span>
        </div>
      </header>

      <section className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="border border-outline-variant bg-surface-container-low p-4 text-center">
          <p className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
            Total
          </p>
          <p className="mt-1 font-display text-headline-md text-primary">
            {all.length}
          </p>
        </div>
        {MEDIA_KINDS.map((k) => (
          <div
            key={k}
            className="border border-outline-variant bg-surface-container-low p-4 text-center"
          >
            <p className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
              {MEDIA_CONFIG[k].label.split(" ")[0]}
            </p>
            <p className="mt-1 font-display text-headline-md text-primary">
              {counts[k]}
            </p>
          </div>
        ))}
      </section>

      <div className="mb-8 flex items-center justify-between border-b border-outline-variant">
        <ArchiveTabs activeKind={activeKind} />
        <div className="hidden font-serif text-label-md italic text-on-surface-variant md:block">
          {formatBytes(totalBytes)} preserved
        </div>
      </div>

      {enriched.length === 0 ? (
        <div className="mx-auto max-w-xl border border-outline-variant bg-surface-container-low p-12 text-center">
          <span className="mx-auto flex w-fit text-secondary">
            <Icon.Archive size={56} />
          </span>
          <h2 className="mt-4 font-display text-headline-md text-primary">
            The vault is silent
          </h2>
          <p className="mt-4 font-serif text-body-md italic text-on-surface-variant">
            Audio, video, and image recordings attach to specific
            compositions. Open a composition to add media.
          </p>
          <Link
            href="/compositions"
            className="mt-6 inline-flex items-center gap-2 border border-primary px-8 py-3 font-serif text-label-md uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-on-primary"
          >
            Browse Compositions
          </Link>
        </div>
      ) : (
        <ArchiveGrid items={enriched} />
      )}
    </main>
  );
}

function ArchiveGrid({ items }: { items: ArchiveMediaRow[] }) {
  const sections: Record<MediaKind, ArchiveMediaRow[]> = {
    audio: [],
    video: [],
    image: [],
    pdf: [],
  };
  for (const m of items) sections[m.kind].push(m);

  const sectionTitles: Record<MediaKind, string> = {
    audio: "Audio Chronicles",
    video: "Visual Testimonies",
    image: "Reference Folios",
    pdf: "Documents",
  };

  return (
    <div className="space-y-section-gap">
      {(MEDIA_KINDS as readonly MediaKind[]).map((kind) => {
        const list = sections[kind];
        if (list.length === 0) return null;
        return (
          <section key={kind}>
            <h2 className="mb-8 font-display text-headline-md tracking-wide text-primary">
              {sectionTitles[kind]}
            </h2>

            {kind === "audio" ? (
              <div className="grid grid-cols-1 gap-stack-md lg:grid-cols-2">
                {list.map((m) => (
                  <ArchiveAudioCard key={m.id} m={m} />
                ))}
              </div>
            ) : kind === "video" ? (
              <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
                {list.map((m) => (
                  <ArchiveVideoCard key={m.id} m={m} />
                ))}
              </div>
            ) : kind === "image" ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                {list.map((m) => (
                  <ArchiveImageCard key={m.id} m={m} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-stack-sm md:grid-cols-2">
                {list.map((m) => (
                  <ArchivePdfCard key={m.id} m={m} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function CompositionTag({ comp }: { comp: ArchiveMediaRow["composition"] }) {
  if (!comp) return null;
  return (
    <Link
      href={`/compositions/${comp.id}`}
      className="font-serif text-label-md italic text-secondary underline decoration-secondary/30 underline-offset-2 transition-colors hover:text-primary"
    >
      from {comp.title}
    </Link>
  );
}

function ArchiveAudioCard({ m }: { m: ArchiveMediaRow }) {
  return (
    <article
      className="relative border border-secondary bg-surface-container-low p-2"
      style={{ padding: "8px" }}
    >
      <div
        className="pointer-events-none absolute"
        style={{
          top: "4px",
          left: "4px",
          right: "4px",
          bottom: "4px",
          border: "2px solid #4e0616",
        }}
        aria-hidden
      />
      <div className="relative p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-serif text-label-lg text-primary">
              {m.title ?? "Audio recording"}
            </h3>
            <CompositionTag comp={m.composition} />
          </div>
          <span className="flex-none font-serif text-label-md tabular-nums text-on-surface-variant">
            {formatDuration(m.duration_sec)}
          </span>
          <MediaDeleteButton id={m.id} />
        </div>
        <AudioPlayer url={m.url} />
      </div>
    </article>
  );
}

function ArchiveVideoCard({ m }: { m: ArchiveMediaRow }) {
  return (
    <article className="flex flex-col">
      <VideoPlayer url={m.url} mime={m.mime_type} />
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="truncate font-serif text-label-lg text-primary">
            {m.title ?? "Video"}
          </h4>
          <p className="font-serif text-label-md italic text-on-surface-variant">
            {formatDuration(m.duration_sec)} · {formatBytes(m.file_size)}
          </p>
          <CompositionTag comp={m.composition} />
        </div>
        <MediaDeleteButton id={m.id} />
      </div>
    </article>
  );
}

function ArchiveImageCard({ m }: { m: ArchiveMediaRow }) {
  return (
    <figure className="group relative border border-secondary p-[2px]">
      <a
        href={m.url}
        target="_blank"
        rel="noreferrer"
        className="relative block aspect-square overflow-hidden"
      >
        <Image
          src={m.url}
          alt={m.title ?? "Image"}
          fill
          sizes="(max-width: 768px) 50vw, 16vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
      </a>
      <figcaption className="flex items-center justify-between border-t border-secondary/30 bg-surface px-2 py-1">
        <CompositionTag comp={m.composition} />
        <MediaDeleteButton id={m.id} />
      </figcaption>
    </figure>
  );
}

function ArchivePdfCard({ m }: { m: ArchiveMediaRow }) {
  return (
    <a
      href={m.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-4 border border-secondary bg-surface-container-low p-4 transition-colors hover:bg-tertiary-fixed/30"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex-none text-secondary">
          <Icon.Document size={22} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-serif text-body-md text-on-surface">
            {m.title ?? "Document"}
          </p>
          <CompositionTag comp={m.composition} />
        </div>
      </div>
      <MediaDeleteButton id={m.id} />
    </a>
  );
}
