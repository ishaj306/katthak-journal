"use client";

import { useEffect, useRef, useState } from "react";
import type WaveSurferType from "wavesurfer.js";
import { formatDuration } from "@/lib/media-config";
import { Icon } from "@/components/manuscript/Icons";

/**
 * The manuscript's audio player, built on wavesurfer.
 *
 * The base call — `<AudioPlayer url={...} />` — is unchanged, so every existing
 * use keeps working. The optional props turn it into a queue-aware player:
 *  - `onNext` / `onPrevious` render skip controls (a Riyaaz sequence drives
 *    these), only shown when provided.
 *  - `autoPlay` starts as soon as the waveform is ready — used when the queue
 *    advances to this track.
 *  - `onEnded` fires when playback finishes, so the queue can move on.
 *  - `volume` seeds the initial level; the control is otherwise self-managed and
 *    remembered across tracks by the parent when it passes the value back.
 */
export function AudioPlayer({
  url,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  autoPlay = false,
  onEnded,
  volume: initialVolume = 1,
  onVolumeChange,
  fileSize,
}: {
  url: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
  volume?: number;
  onVolumeChange?: (v: number) => void;
  /** When known and large, skip the waveform (which decodes the whole file). */
  fileSize?: number | null;
}) {
  // Waveform rendering decodes the entire file — punishing on mobile for a big
  // recording. For large *standalone* players (no queue callbacks), fall back
  // to the browser's native audio element instead.
  const useNative =
    fileSize != null &&
    fileSize > 15 * 1024 * 1024 &&
    !autoPlay &&
    !onNext &&
    !onPrevious &&
    !onEnded;
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurferType | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(initialVolume);
  const [muted, setMuted] = useState(false);

  // Latest callbacks/flags kept in refs so the wavesurfer effect can read them
  // without tearing down and rebuilding the waveform on every render.
  const onEndedRef = useRef(onEnded);
  const autoPlayRef = useRef(autoPlay);
  const volumeRef = useRef(initialVolume);
  onEndedRef.current = onEnded;
  autoPlayRef.current = autoPlay;

  useEffect(() => {
    if (useNative) return;
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
          ws.setVolume(volumeRef.current);
          if (autoPlayRef.current) {
            // Browsers may block autoplay without a gesture; ignore the reject.
            ws.play().catch(() => {});
          }
        });
        ws.on("play", () => alive && setPlaying(true));
        ws.on("pause", () => alive && setPlaying(false));
        ws.on("finish", () => {
          if (!alive) return;
          setPlaying(false);
          onEndedRef.current?.();
        });
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
      setReady(false);
      setPlaying(false);
      setCurrent(0);
    };
  }, [url, useNative]);

  if (useNative) {
    return (
      <audio
        controls
        src={url}
        preload="metadata"
        className="w-full"
      />
    );
  }

  function applyVolume(v: number) {
    setVolume(v);
    volumeRef.current = v;
    if (muted && v > 0) setMuted(false);
    wsRef.current?.setVolume(muted ? 0 : v);
    onVolumeChange?.(v);
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    wsRef.current?.setVolume(next ? 0 : volume);
  }

  const showSkip = !!onPrevious || !!onNext;

  if (error) {
    return (
      <p className="font-serif text-body-md italic text-error">
        Audio could not load: {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {showSkip ? (
          <button
            type="button"
            onClick={onPrevious}
            disabled={!onPrevious || hasPrevious === false}
            className="flex h-10 w-10 flex-none items-center justify-center border border-secondary bg-surface text-primary transition-colors hover:bg-secondary-fixed-dim disabled:opacity-30"
            aria-label="Previous"
          >
            <Icon.SkipPrevious size={18} />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => wsRef.current?.playPause()}
          disabled={!ready}
          className="flex h-12 w-12 flex-none items-center justify-center border border-secondary bg-surface text-primary transition-colors hover:bg-secondary-fixed-dim disabled:opacity-50"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Icon.Pause size={22} /> : <Icon.Play size={22} />}
        </button>

        {showSkip ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!onNext || hasNext === false}
            className="flex h-10 w-10 flex-none items-center justify-center border border-secondary bg-surface text-primary transition-colors hover:bg-secondary-fixed-dim disabled:opacity-30"
            aria-label="Next"
          >
            <Icon.SkipNext size={18} />
          </button>
        ) : null}

        <div className="flex-grow">
          <div ref={containerRef} className="w-full" />
        </div>

        <div className="flex-none font-serif text-label-md tabular-nums text-on-surface-variant">
          {ready
            ? `${formatDuration(current)} / ${formatDuration(duration)}`
            : "…"}
        </div>
      </div>

      <div className="flex items-center gap-2 pl-1">
        <button
          type="button"
          onClick={toggleMute}
          disabled={!ready}
          className="flex-none text-secondary transition-colors hover:text-primary disabled:opacity-40"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted || volume === 0 ? (
            <Icon.VolumeMute size={18} />
          ) : (
            <Icon.Volume size={18} />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => applyVolume(Number(e.target.value))}
          disabled={!ready}
          aria-label="Volume"
          className="h-1 w-28 max-w-[40%] accent-primary"
        />
      </div>
    </div>
  );
}
