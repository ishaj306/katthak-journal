"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/supabase/client";
import { MEDIA_CONFIG, formatBytes } from "@/lib/media-config";
import { UploadProgress } from "@/components/manuscript/UploadProgress";
import { Icon, MediaIcon } from "@/components/manuscript/Icons";
import type { MediaKind } from "@/lib/db/types";

type UploadState = {
  name: string;
  size: number;
  done: number;
  total: number;
} | null;

async function probeDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const el = file.type.startsWith("video")
        ? document.createElement("video")
        : document.createElement("audio");
      el.preload = "metadata";
      el.src = url;
      el.onloadedmetadata = () => {
        const d = Number.isFinite(el.duration) ? Math.round(el.duration) : null;
        URL.revokeObjectURL(url);
        resolve(d);
      };
      el.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

export function MediaUploader({
  compositionId,
  userId,
  kind,
}: {
  compositionId: string;
  userId: string;
  kind: MediaKind;
}) {
  const router = useRouter();
  const supabase = useSupabase();
  const inputRef = useRef<HTMLInputElement>(null);
  const cfg = MEDIA_CONFIG[kind];
  const KindIcon = MediaIcon[kind];
  const [busy, setBusy] = useState(false);
  const [upload, setUpload] = useState<UploadState>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);

    try {
      const total = files.length;
      let done = 0;

      for (const file of Array.from(files)) {
        done += 1;
        setUpload({ name: file.name, size: file.size, done, total });

        if (file.size > cfg.maxBytes) {
          throw new Error(
            `${file.name} is ${formatBytes(file.size)} — limit is ${formatBytes(cfg.maxBytes)}`
          );
        }
        if (file.type && !cfg.acceptMimes.includes(file.type)) {
          throw new Error(
            `${file.name}: unsupported file type "${file.type}" for ${kind}`
          );
        }

        let duration: number | null = null;
        if (kind === "audio" || kind === "video") {
          duration = await probeDuration(file);
        }

        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${userId}/${compositionId}/${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("composition-media")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;

        const { error: insErr } = await supabase
          .from("composition_media")
          .insert({
            composition_id: compositionId,
            user_id: userId,
            kind,
            storage_path: path,
            title: file.name,
            mime_type: file.type || null,
            file_size: file.size,
            duration_sec: duration,
          });
        if (insErr) {
          // Roll back the just-uploaded object so a failed insert can't orphan.
          await supabase.storage.from("composition-media").remove([path]);
          throw insErr;
        }
      }

      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
    } finally {
      setBusy(false);
      setUpload(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={cfg.accept}
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="group block w-full cursor-pointer border-2 border-dashed border-outline-variant p-8 text-center transition-colors hover:border-secondary disabled:opacity-60 md:p-10"
      >
        <span className="mb-2 flex justify-center text-outline-variant group-hover:text-secondary">
          {busy ? <Icon.Ghungroo size={34} /> : <KindIcon size={34} />}
        </span>
        <p className="font-serif text-label-lg uppercase tracking-widest text-on-surface-variant group-hover:text-primary">
          {busy ? "Inscribing…" : cfg.uploaderLabel}
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-outline">
          Max {formatBytes(cfg.maxBytes)} per file
        </p>
      </button>
      {busy && upload ? (
        <UploadProgress
          fileName={upload.name}
          fileSize={upload.size}
          done={upload.done}
          total={upload.total}
        />
      ) : null}
      {error ? (
        <p className="mt-3 font-serif text-body-md italic text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
