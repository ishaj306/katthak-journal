"use client";

import { useEffect, useRef } from "react";

export function VideoPlayer({ url, mime }: { url: string; mime?: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<{ destroy?: () => void } | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    let alive = true;

    (async () => {
      try {
        const Plyr = (await import("plyr")).default;
        if (!alive || !videoRef.current) return;

        const player = new Plyr(videoRef.current, {
          controls: [
            "play-large",
            "play",
            "progress",
            "current-time",
            "mute",
            "volume",
            "fullscreen",
          ],
          ratio: "16:9",
          settings: ["speed"],
        });
        playerRef.current = player as unknown as { destroy?: () => void };
      } catch {
        // Falls back to the native <video> tag
      }
    })();

    return () => {
      alive = false;
      try {
        playerRef.current?.destroy?.();
      } catch {
        // ignore destroy errors
      }
      playerRef.current = null;
    };
  }, [url]);

  return (
    <div className="border border-secondary p-[2px]">
      <div className="border border-primary p-1">
        <video
          ref={videoRef}
          className="w-full bg-black"
          controls
          playsInline
          preload="metadata"
        >
          <source src={url} type={mime ?? undefined} />
        </video>
      </div>
    </div>
  );
}
