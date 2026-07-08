import type { MediaKind } from "@/lib/db/types";

type Config = {
  label: string;
  uploaderLabel: string;
  accept: string;
  acceptMimes: string[];
  maxBytes: number;
  icon: string;
  emptyMessage: string;
};

const MB = 1024 * 1024;

export const MEDIA_CONFIG: Record<MediaKind, Config> = {
  image: {
    label: "Reference Images",
    uploaderLabel: "Attach reference images",
    accept: "image/png,image/jpeg,image/webp,image/gif",
    acceptMimes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    maxBytes: 10 * MB,
    icon: "image",
    emptyMessage: "No images attached yet.",
  },
  audio: {
    label: "Audio Recordings",
    uploaderLabel: "Upload guru audio, bols, or voice notes",
    accept: "audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm,audio/x-m4a",
    acceptMimes: [
      "audio/mpeg",
      "audio/mp4",
      "audio/wav",
      "audio/ogg",
      "audio/webm",
      "audio/x-m4a",
    ],
    maxBytes: 50 * MB,
    icon: "graphic_eq",
    emptyMessage: "No audio recordings yet.",
  },
  video: {
    label: "Video Recordings",
    uploaderLabel: "Upload performance or class video",
    accept: "video/mp4,video/webm,video/quicktime",
    acceptMimes: ["video/mp4", "video/webm", "video/quicktime"],
    maxBytes: 50 * MB,
    icon: "movie",
    emptyMessage: "No videos yet.",
  },
  pdf: {
    label: "Documents",
    uploaderLabel: "Attach PDFs of notation or notes",
    accept: "application/pdf",
    acceptMimes: ["application/pdf"],
    maxBytes: 25 * MB,
    icon: "picture_as_pdf",
    emptyMessage: "No documents yet.",
  },
};

export function formatBytes(n: number | null | undefined): string {
  if (!n || n <= 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < MB) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * MB) return `${(n / MB).toFixed(1)} MB`;
  return `${(n / (1024 * MB)).toFixed(2)} GB`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "—";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
