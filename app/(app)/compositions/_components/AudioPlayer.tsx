"use client";

import { useEffect, useRef, useState } from "react";
import type WaveSurferType from "wavesurfer.js";
import { formatDuration } from "@/lib/media-config";

export function AudioPlayer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurferType | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let alive = true;

    (async () => {
      try {
        const { default: WaveSurfer } = await import("wavesurfer.js");
        if (!alive || !containerRef.current) return;

        const ws = WaveSurfer.create({
          container: containerRef.current,
          waveColor: "#dac0c1",
          progressColor: "#6B1E2A",
          cursorColor: "#B8893E",
          cursorWidth: 2,
          barWidth: 2,
          barGap: 2,
          barRadius: 0,
          height: 60,
          normalize: true,
          url,
        });

        ws.on("ready", () => {
          if (!alive) return;
          setReady(true);
          setDuration(ws.getDuration());
        });
        ws.on("play", () => alive && setPlaying(true));
        ws.on("pause", () => alive && setPlaying(false));
        ws.on("finish", () => alive && setPlaying(false));
        ws.on("audioprocess", () => alive && setCurrent(ws.getCurrentTime()));
        ws.on("seeking", () => alive && setCurrent(ws.getCurrentTime()));
        ws.on("error", (e) => {
          if (!alive) return;
          const msg = e instanceof Error ? e.message : String(e);
          setError(msg);
        });

        wsRef.current = ws;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load player";
        if (alive) setError(msg);
      }
    })();

    return () => {
      alive = false;
      wsRef.current?.destroy();
      wsRef.current = null;
    };
  }, [url]);

  if (error) {
    return (
      <p className="font-serif text-body-md italic text-error">
        Audio could not load: {error}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => wsRef.current?.playPause()}
        disabled={!ready}
        className="flex h-12 w-12 flex-none items-center justify-center border border-secondary bg-surface text-primary transition-colors hover:bg-secondary-fixed-dim disabled:opacity-50"
        aria-label={playing ? "Pause" : "Play"}
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {playing ? "pause" : "play_arrow"}
        </span>
      </button>
      <div className="flex-grow">
        <div ref={containerRef} className="w-full" />
      </div>
      <div className="flex-none font-serif text-label-md tabular-nums text-on-surface-variant">
        {ready ? `${formatDuration(current)} / ${formatDuration(duration)}` : "…"}
      </div>
    </div>
  );
}
