"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/manuscript/Toast";
import { formatDuration } from "@/lib/media-config";
import { Icon } from "@/components/manuscript/Icons";

type RecorderState = "idle" | "recording" | "preview" | "saving";

export function AudioRecorder({
  bucket,
  table,
  parentColumn,
  parentId,
  userId,
  extraInsert,
}: {
  bucket: string;
  table: string;
  parentColumn: string;
  parentId: string;
  userId: string;
  /** Extra columns merged into the inserted row (e.g. a performance stage). */
  extraInsert?: Record<string, unknown>;
}) {
  const router = useRouter();
  const supabase = useSupabase();
  const { toast } = useToast();

  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setState("preview");
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setSeconds(0);
      setState("recording");
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microphone access was denied. Check your browser permissions.");
    }
  }

  function stopRecording() {
    timerRef.current && clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }

  function discard() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    blobRef.current = null;
    setState("idle");
    setSeconds(0);
    setName("");
  }

  async function save() {
    if (!blobRef.current) return;
    setState("saving");
    setError(null);
    try {
      const ext = blobRef.current.type.includes("mp4") ? "m4a" : "webm";
      const stamp = new Date()
        .toISOString()
        .slice(0, 16)
        .replace(/[:T]/g, "-");
      // The dancer's own name is the title — that's what shows up when picking
      // this take in the Riyaaz sequence. Fall back to a timestamp if blank.
      const title = name.trim() || `Recording ${stamp}`;
      const path = `${userId}/${parentId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, blobRef.current, {
          cacheControl: "3600",
          contentType: blobRef.current.type,
        });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from(table).insert({
        [parentColumn]: parentId,
        user_id: userId,
        kind: "audio",
        storage_path: path,
        title,
        mime_type: blobRef.current.type,
        file_size: blobRef.current.size,
        duration_sec: seconds,
        ...extraInsert,
      });
      if (insErr) {
        await supabase.storage.from(bucket).remove([path]);
        throw insErr;
      }

      toast("Recording preserved in your vault");
      discard();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save recording");
      setState("preview");
    }
  }

  return (
    <div className="border border-dashed border-secondary/60 bg-[rgba(232,217,184,0.06)] p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-secondary">
          <Icon.Mic size={20} />
        </span>
        <span className="font-serif text-label-md uppercase tracking-widest text-secondary">
          Record here
        </span>
      </div>

      {state === "idle" ? (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-3 border border-primary bg-surface px-6 py-3 font-serif text-label-md uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-on-primary"
        >
          <span className="inline-block h-3 w-3 rounded-full bg-error" />
          Begin Recording
        </button>
      ) : null}

      {state === "recording" ? (
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-2 font-serif text-body-md text-primary">
            <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-error" />
            Recording — {formatDuration(seconds)}
          </span>
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 border border-primary bg-primary px-6 py-3 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container"
          >
            <Icon.Stop size={18} />
            Stop
          </button>
        </div>
      ) : null}

      {state === "preview" || state === "saving" ? (
        <div className="space-y-4">
          {previewUrl ? (
            <audio controls src={previewUrl} className="w-full" />
          ) : null}
          <div>
            <label
              htmlFor="recording-name"
              className="mb-1 block font-serif text-label-md uppercase tracking-widest text-secondary"
            >
              Name this recording
            </label>
            <input
              id="recording-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={state === "saving"}
              placeholder="e.g. Paran — slow tempo"
              className="w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary placeholder:italic placeholder:text-outline-variant focus:outline-none focus:border-b-2"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={state === "saving"}
              className="border border-primary bg-primary px-6 py-2 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container disabled:opacity-60"
            >
              {state === "saving" ? "Preserving…" : "Save to Vault"}
            </button>
            <button
              type="button"
              onClick={discard}
              disabled={state === "saving"}
              className="border border-outline px-6 py-2 font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-all hover:bg-surface-container-high disabled:opacity-60"
            >
              Discard
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 font-serif text-body-md italic text-error">{error}</p>
      ) : null}
    </div>
  );
}
