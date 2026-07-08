import Link from "next/link";
import { MEDIA_KINDS, type MediaKind } from "@/lib/db/types";
import { MEDIA_CONFIG } from "@/lib/media-config";

const tabLabels: Record<MediaKind | "all", string> = {
  all: "All",
  audio: "Audio",
  video: "Video",
  image: "Images",
  pdf: "PDFs",
};

export function ArchiveTabs({
  activeKind,
}: {
  activeKind: MediaKind | undefined;
}) {
  return (
    <nav className="-mb-px flex gap-8 overflow-x-auto pb-2">
      <Link
        href="/archive"
        className={
          !activeKind
            ? "border-b-2 border-primary pb-2 font-serif text-label-lg uppercase tracking-widest text-primary"
            : "border-b-2 border-transparent pb-2 font-serif text-label-lg uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
        }
      >
        {tabLabels.all}
      </Link>
      {MEDIA_KINDS.map((k) => {
        const cfg = MEDIA_CONFIG[k];
        const active = activeKind === k;
        return (
          <Link
            key={k}
            href={`/archive?kind=${k}`}
            className={
              active
                ? "flex items-center gap-2 border-b-2 border-primary pb-2 font-serif text-label-lg uppercase tracking-widest text-primary"
                : "flex items-center gap-2 border-b-2 border-transparent pb-2 font-serif text-label-lg uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
            }
          >
            <span className="material-symbols-outlined text-base">
              {cfg.icon}
            </span>
            {tabLabels[k]}
          </Link>
        );
      })}
    </nav>
  );
}
