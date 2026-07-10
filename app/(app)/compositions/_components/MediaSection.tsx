import Image from "next/image";
import { AudioPlayer } from "./AudioPlayer";
import { VideoPlayer } from "./VideoPlayer";
import { MediaUploader } from "./MediaUploader";
import { MediaDeleteButton } from "./MediaDeleteButton";
import { AudioRecorder } from "@/components/manuscript/AudioRecorder";
import { Icon, MediaIcon } from "@/components/manuscript/Icons";
import { MEDIA_CONFIG, formatBytes, formatDuration } from "@/lib/media-config";
import type { CompositionMedia, MediaKind } from "@/lib/db/types";

type MediaWithUrl = CompositionMedia & { url: string };

function MediaItem({ m }: { m: MediaWithUrl }) {
  if (m.kind === "image") {
    return (
      <figure className="group relative block border border-secondary p-[2px]">
        <a
          href={m.url}
          target="_blank"
          rel="noreferrer"
          className="relative block aspect-square"
        >
          <Image
            src={m.url}
            alt={m.title ?? "Composition image"}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        </a>
        <figcaption className="flex items-center justify-between gap-2 border-t border-secondary/30 bg-surface px-2 py-1 font-serif text-label-md">
          <span className="truncate text-on-surface-variant" title={m.title ?? ""}>
            {m.title}
          </span>
          <MediaDeleteButton id={m.id} />
        </figcaption>
      </figure>
    );
  }

  if (m.kind === "audio") {
    return (
      <article className="border border-secondary bg-surface-container-low p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <p className="font-serif text-body-md text-on-surface">
              {m.title ?? "Audio recording"}
            </p>
            <p className="font-serif text-label-md italic text-on-surface-variant">
              {formatDuration(m.duration_sec)} ·{" "}
              {formatBytes(m.file_size)}
            </p>
          </div>
          <MediaDeleteButton id={m.id} />
        </div>
        <AudioPlayer url={m.url} />
      </article>
    );
  }

  if (m.kind === "video") {
    return (
      <article className="space-y-3">
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
          <MediaDeleteButton id={m.id} />
        </div>
        <VideoPlayer url={m.url} mime={m.mime_type} />
      </article>
    );
  }

  return (
    <a
      href={m.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-4 border border-secondary bg-surface-container-low p-4 transition-colors hover:bg-tertiary-fixed/30"
    >
      <div className="flex items-center gap-3">
        <span className="flex-none text-secondary">
          <Icon.Document size={22} />
        </span>
        <div>
          <p className="font-serif text-body-md text-on-surface">
            {m.title ?? "Document"}
          </p>
          <p className="font-serif text-label-md italic text-on-surface-variant">
            {formatBytes(m.file_size)}
          </p>
        </div>
      </div>
      <MediaDeleteButton id={m.id} />
    </a>
  );
}

export function MediaSection({
  kind,
  items,
  compositionId,
  userId,
}: {
  kind: MediaKind;
  items: MediaWithUrl[];
  compositionId: string;
  userId: string;
}) {
  const cfg = MEDIA_CONFIG[kind];
  const KindIcon = MediaIcon[kind];
  const isImage = kind === "image";

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-end justify-between border-b border-outline-variant pb-2">
        <h3 className="flex items-center gap-3 font-display text-headline-md text-primary">
          <span className="flex-none text-secondary">
            <KindIcon size={24} />
          </span>
          {cfg.label}
        </h3>
        <span className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
          {items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <div
          className={
            isImage
              ? "mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
              : "mb-8 space-y-4"
          }
        >
          {items.map((m) => (
            <MediaItem key={m.id} m={m} />
          ))}
        </div>
      ) : (
        <p className="mb-6 font-serif text-body-md italic text-on-surface-variant">
          {cfg.emptyMessage}
        </p>
      )}

      <div className="space-y-4">
        <MediaUploader
          compositionId={compositionId}
          userId={userId}
          kind={kind}
        />
        {kind === "audio" ? (
          <AudioRecorder
            bucket="composition-media"
            table="composition_media"
            parentColumn="composition_id"
            parentId={compositionId}
            userId={userId}
          />
        ) : null}
      </div>
    </section>
  );
}
