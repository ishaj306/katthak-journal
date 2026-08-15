"use client";

import { useState } from "react";
import { AudioPlayer } from "./AudioPlayer";
import { MediaDeleteButton } from "./MediaDeleteButton";
import { Icon } from "@/components/manuscript/Icons";
import { formatDuration, formatBytes } from "@/lib/media-config";

export type AudioTrack = {
  id: string;
  url: string;
  title: string | null;
  duration_sec: number | null;
  file_size: number | null;
};

/**
 * A composition's recordings as one small queue: a single player at the top and
 * a track list below. Selecting a track loads it; when one finishes the next
 * begins on its own, so a dancer can play through all their takes of a paran
 * without touching the screen. This is the same play/skip/auto-advance pattern
 * the Riyaaz sequence builds on — kept deliberately self-contained here.
 */
export function AudioPlaylist({ tracks }: { tracks: AudioTrack[] }) {
  const [index, setIndex] = useState(0);
  // Volume is remembered across tracks so skipping doesn't reset it.
  const [volume, setVolume] = useState(1);
  // Bumped whenever we want the *same* index to autoplay again (e.g. the queue
  // advancing onto the next track); part of the player key so it remounts.
  const [autoNonce, setAutoNonce] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const current = tracks[index];
  if (!current) return null;

  function goTo(i: number, auto: boolean) {
    if (i < 0 || i >= tracks.length) return;
    setIndex(i);
    setAutoPlay(auto);
    setAutoNonce((n) => n + 1);
  }

  return (
    <div className="border border-secondary bg-surface-container-low p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="font-serif text-body-md text-on-surface">
          {current.title ?? "Audio recording"}
        </p>
        <span className="font-serif text-label-md italic text-on-surface-variant">
          {index + 1} / {tracks.length}
        </span>
      </div>

      <AudioPlayer
        key={`${current.id}-${autoNonce}`}
        url={current.url}
        volume={volume}
        onVolumeChange={setVolume}
        autoPlay={autoPlay}
        onPrevious={() => goTo(index - 1, true)}
        onNext={() => goTo(index + 1, true)}
        hasPrevious={index > 0}
        hasNext={index < tracks.length - 1}
        onEnded={() => {
          if (index < tracks.length - 1) goTo(index + 1, true);
        }}
      />

      {tracks.length > 1 ? (
        <ul className="mt-4 divide-y divide-outline-variant border-t border-outline-variant">
          {tracks.map((t, i) => {
            const active = i === index;
            return (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => goTo(i, true)}
                  className="flex min-w-0 flex-grow items-center gap-3 text-left"
                >
                  <span
                    className={
                      active
                        ? "flex-none text-primary"
                        : "flex-none text-outline"
                    }
                  >
                    <Icon.Play size={14} />
                  </span>
                  <span
                    className={
                      active
                        ? "truncate font-serif text-body-md text-primary"
                        : "truncate font-serif text-body-md text-on-surface-variant transition-colors hover:text-primary"
                    }
                  >
                    {t.title ?? `Recording ${i + 1}`}
                  </span>
                  <span className="flex-none font-serif text-label-md italic text-on-surface-variant">
                    {formatDuration(t.duration_sec)}
                  </span>
                </button>
                <MediaDeleteButton id={t.id} />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="font-serif text-label-md italic text-on-surface-variant">
            {formatDuration(current.duration_sec)} ·{" "}
            {formatBytes(current.file_size)}
          </p>
          <MediaDeleteButton id={current.id} />
        </div>
      )}
    </div>
  );
}
