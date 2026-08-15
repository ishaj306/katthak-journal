"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/manuscript/Toast";
import { formatDuration } from "@/lib/media-config";
import { Icon } from "@/components/manuscript/Icons";

export type CapturedRecording = {
  id: string;
  title: string;
  url: string;
  durationSec: number;
};

type RecorderState = "idle" | "recording" | "preview" | "saving";

/**
 * Record yourself mid-Riyaaz. Kept compact so it can sit in the practice stage
 * without stealing focus from the dance. On save it writes to riyaz_recordings,
 * auto-linking the composition currently playing when there is one; the local
 * object URL is handed back for immediate playback in the session list.
 */
export function RiyazRecorder({
  userId,
  compositionId,
  compositionTitle,
  onSaved,
}: {
  userId: string;
  compositionId: string | null;
  compositionTitle: string | null;
  onSaved: (rec: CapturedRecording) => void;
}) {
  const supabase = useSupabase();
  const { toast } = useToast();

  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      // Note: object URLs handed to onSaved stay alive for the session list;
      // only an un-saved preview is revoked here.
      if (previewUrl && state !== "saving") URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        blobRef.current = blob;
        setPreviewUrl(URL.createObjectURL(blob));
        setState("preview");
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recorderRef.current = rec;
      setSeconds(0);
      setState("recording");
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Microphone access was denied.");
    }
  }

  function stop() {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
  }

  function discard() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    blobRef.current = null;
    setName("");
    setNotes("");
    setSeconds(0);
    setState("idle");
  }

  async function save() {
    const blob = blobRef.current;
    const url = previewUrl;
    if (!blob || !url) return;
    setState("saving");
    setError(null);
    try {
      const ext = blob.type.includes("mp4") ? "m4a" : "webm";
      const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
      const title = name.trim() || `Riyaaz take ${stamp}`;
      const path = `${userId}/riyaz/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("composition-media")
        .upload(path, blob, { cacheControl: "3600", contentType: blob.type });
      if (upErr) throw upErr;

      const { data, error: insErr } = await supabase
        .from("riyaz_recordings")
        .insert({
          user_id: userId,
          composition_id: compositionId,
          storage_path: path,
          title,
          mime_type: blob.type,
          file_size: blob.size,
          duration_sec: seconds,
          notes: notes.trim() || null,
        })
        .select("id")
        .single();
      if (insErr) {
        await supabase.storage.from("composition-media").remove([path]);
        throw insErr;
      }

      toast("Take saved to your Riyaaz");
      onSaved({ id: data.id as string, title, url, durationSec: seconds });
      // Keep the object URL alive for playback; reset the form only.
      setPreviewUrl(null);
      blobRef.current = null;
      setName("");
      setNotes("");
      setSeconds(0);
      setState("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the take");
      setState("preview");
    }
  }

  return (
    <div className="border border-dashed border-secondary/60 bg-[rgba(232,217,184,0.06)] p-4">
      {state === "idle" ? (
        <button
          type="button"
          onClick={start}
          className="flex items-center gap-3 font-serif text-label-md uppercase tracking-widest text-primary transition-colors hover:text-secondary"
        >
          <span className="inline-block h-3 w-3 rounded-full bg-error" />
          Record yourself
          {compositionTitle ? (
            <span className="normal-case tracking-normal text-on-surface-variant">
              · will link to {compositionTitle}
            </span>
          ) : null}
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
            onClick={stop}
            className="flex items-center gap-2 border border-primary bg-primary px-5 py-2 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container"
          >
            <Icon.Stop size={16} />
            Stop
          </button>
        </div>
      ) : null}

      {state === "preview" || state === "saving" ? (
        <div className="space-y-3">
          {previewUrl ? (
            <audio controls src={previewUrl} className="w-full" />
          ) : null}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={state === "saving"}
            placeholder="Name this take…"
            className="w-full border-0 border-b border-primary bg-transparent py-2 font-serif text-body-md text-primary placeholder:italic placeholder:text-outline-variant focus:outline-none"
          />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={state === "saving"}
            placeholder="A note, if you like…"
            className="w-full border-0 border-b border-outline-variant bg-transparent py-1 font-serif text-label-md italic text-on-surface-variant placeholder:text-outline-variant focus:outline-none"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={state === "saving"}
              className="border border-primary bg-primary px-5 py-2 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container disabled:opacity-60"
            >
              {state === "saving" ? "Saving…" : "Save take"}
            </button>
            <button
              type="button"
              onClick={discard}
              disabled={state === "saving"}
              className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-error disabled:opacity-60"
            >
              Discard
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-2 font-serif text-body-md italic text-error">{error}</p>
      ) : null}
    </div>
  );
}
