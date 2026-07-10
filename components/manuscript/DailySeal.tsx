"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { seal as sealSpring } from "@/lib/motion";
import { sealDay } from "@/app/actions/riyaz";

const PRESETS = [15, 30, 45, 60, 90];

/** A single ghungroo, synthesized — a cluster of decaying bells. */
function playGhungroo() {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AC();
    const now = ctx.currentTime;
    [784, 1176, 1568, 2352].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f * (1 + (Math.random() - 0.5) * 0.012);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.13 / (i + 1), now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.3 + i * 0.12);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.012);
      o.stop(now + 1.8);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch {
    /* sound is a grace note, never required */
  }
}

export function DailySeal({
  recentSessionIso,
}: {
  recentSessionIso: string[];
}) {
  const router = useRouter();
  const reduce = useReducedMotion();

  const alreadySealed = useMemo(() => {
    const today = new Date().toDateString();
    return recentSessionIso.some(
      (iso) => new Date(iso).toDateString() === today
    );
  }, [recentSessionIso]);

  const [status, setStatus] = useState<"idle" | "sealing" | "sealed">(
    alreadySealed ? "sealed" : "idle"
  );
  const [minutes, setMinutes] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const flecks = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        angle: (i / 14) * Math.PI * 2 + Math.random() * 0.4,
        dist: 46 + Math.random() * 34,
        delay: Math.random() * 0.1,
      })),
    []
  );

  async function press() {
    if (status !== "idle") return;
    setStatus("sealing");
    setError(null);
    if (!reduce) playGhungroo();
    const res = await sealDay(minutes);
    if (res.error) {
      setError(res.error);
      setStatus("idle");
      return;
    }
    setStatus("sealed");
    router.refresh();
  }

  const sealed = status === "sealed";

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-44 w-44 items-center justify-center">
        {/* ink bloom */}
        <AnimatePresence>
          {status !== "idle" && !reduce ? (
            <motion.span
              key="bloom"
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 3.2, opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="pointer-events-none absolute h-24 w-24 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(78,6,22,0.5) 0%, rgba(78,6,22,0) 70%)",
              }}
            />
          ) : null}
        </AnimatePresence>

        {/* gold flecks */}
        {status !== "idle" && !reduce
          ? flecks.map((f, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: Math.cos(f.angle) * f.dist,
                  y: Math.sin(f.angle) * f.dist,
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 1, ease: "easeOut", delay: f.delay }}
                className="pointer-events-none absolute h-1 w-1 rounded-full bg-gold-leaf"
              />
            ))
          : null}

        {/* the seal itself */}
        <motion.button
          type="button"
          onClick={press}
          disabled={status !== "idle"}
          whileTap={status === "idle" ? { scale: 0.9 } : undefined}
          transition={sealSpring}
          aria-label={sealed ? "Today's riyaz is witnessed" : "Press to witness today's riyaz"}
          className="group relative flex h-32 w-32 items-center justify-center rounded-full disabled:cursor-default"
          style={{
            background: sealed
              ? "radial-gradient(circle at 50% 40%, #7C2B36, #4E0616)"
              : "radial-gradient(circle at 50% 40%, #f7f0df, #ece2c8)",
            boxShadow: sealed
              ? "0 2px 10px rgba(78,6,22,0.35), inset 0 0 0 2px #A9802F"
              : "0 1px 6px rgba(78,6,22,0.12), inset 0 0 0 2px #A9802F",
            transition: "background 0.6s ease, box-shadow 0.6s ease",
          }}
        >
          <span
            className="pointer-events-none absolute inset-1.5 rounded-full"
            style={{ border: "1px solid rgba(169,128,47,0.6)" }}
          />
          <span
            className="font-deva text-4xl leading-none"
            style={{ color: sealed ? "#E8D9B8" : "#6B1E2A" }}
          >
            {sealed ? "✓" : "आज"}
          </span>
        </motion.button>
      </div>

      {sealed ? (
        <p className="mt-4 text-center font-serif text-body-md italic text-on-surface-variant">
          The manuscript has held today&rsquo;s practice.
        </p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-3">
          <p className="font-serif text-label-md uppercase tracking-widest text-secondary">
            Witness today&rsquo;s riyaz
          </p>
          <div className="flex items-center gap-1">
            {PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                className={`border px-2.5 py-1 font-serif text-label-md tabular-nums transition-colors ${
                  minutes === m
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant text-on-surface-variant hover:border-secondary"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-3 font-serif text-body-md italic text-error">{error}</p>
      ) : null}
    </div>
  );
}
