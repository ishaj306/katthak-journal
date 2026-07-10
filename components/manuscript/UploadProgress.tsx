import { formatBytes } from "@/lib/media-config";

/**
 * Feedback shown while media uploads to Supabase Storage. The Supabase JS
 * client doesn't surface byte-level progress, so rather than fake a percentage
 * we show an honest indeterminate bar plus the file currently being saved and,
 * for batches, how many of the total are done.
 */
export function UploadProgress({
  fileName,
  fileSize,
  done,
  total,
}: {
  fileName: string;
  fileSize?: number;
  done: number;
  total: number;
}) {
  return (
    <div className="mt-4" aria-live="polite">
      <div className="mb-2 flex items-center justify-between gap-3 font-serif text-label-md text-on-surface-variant">
        <span className="min-w-0 truncate italic">
          Inscribing “{fileName}”
          {fileSize ? ` · ${formatBytes(fileSize)}` : ""}
        </span>
        {total > 1 ? (
          <span className="flex-none tabular-nums">
            {done} / {total}
          </span>
        ) : null}
      </div>
      <div className="h-1.5 w-full overflow-hidden bg-tertiary-fixed">
        <div className="h-full w-1/4 animate-indeterminate bg-primary" />
      </div>
    </div>
  );
}
