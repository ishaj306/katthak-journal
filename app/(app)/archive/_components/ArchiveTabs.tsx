import Link from "next/link";
import { MEDIA_KINDS, type MediaKind } from "@/lib/db/types";
import { MediaIcon } from "@/components/manuscript/Icons";

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
        const KindIcon = MediaIcon[k];
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
            <span className="flex-none">
              <KindIcon size={16} />
            </span>
            {tabLabels[k]}
          </Link>
        );
      })}
    </nav>
  );
}
