"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startRiyaz, stopRiyaz, cancelRiyaz } from "@/app/actions/riyaz";
import { formatTimer } from "@/lib/riyaz";
import { Icon } from "@/components/manuscript/Icons";

export function RiyazTimer({
  openSessionStartedAt,
}: {
  openSessionStartedAt: string | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const startedAtMs = openSessionStartedAt
    ? new Date(openSessionStartedAt).getTime()
    : null;
  const running = startedAtMs !== null;
  const elapsedSec = startedAtMs ? Math.floor((now - startedAtMs) / 1000) : 0;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  async function onStart() {
    setBusy(true);
    setError(null);
    const res = await startRiyaz();
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setNow(Date.now());
    startTransition(() => router.refresh());
  }

  async function onStop() {
    setBusy(true);
    setError(null);
    const res = await stopRiyaz(notes);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setNotes("");
    startTransition(() => router.refresh());
  }

  async function onCancel() {
    if (!confirm("Discard this session entirely?")) return;
    setBusy(true);
    await cancelRiyaz();
    setBusy(false);
    setNotes("");
    startTransition(() => router.refresh());
  }

  return (
    <section
      className="relative border border-secondary bg-surface-container-low p-2 md:p-2"
      style={{ padding: "8px" }}
    >
      <div
        className="pointer-events-none absolute"
        style={{
          top: "4px",
          left: "4px",
          right: "4px",
          bottom: "4px",
          border: "2px solid #4e0616",
        }}
        aria-hidden
      />
      <div className="relative p-8 md:p-12">
        <div className="mb-12 flex items-start justify-between">
          <div>
            <h2 className="mb-4 font-serif text-label-lg uppercase tracking-[0.2em] text-secondary">
              {running ? "In Practice" : "Current Session"}
            </h2>
            <div
              className="font-display tabular-nums text-primary"
              style={{ fontSize: "5rem", lineHeight: "1" }}
            >
              {formatTimer(elapsedSec)}
            </div>
          </div>
          <span className="text-secondary opacity-50">
            <Icon.Scroll size={44} />
          </span>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <label
              htmlFor="riyaz-notes"
              className="mb-2 block font-serif text-label-md italic text-primary"
            >
              Reflections &amp; Notes
            </label>
            <textarea
              id="riyaz-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your observations on the bols, the breath, or the movement..."
              className="min-h-[120px] w-full resize-none border-0 border-b border-outline bg-transparent py-4 font-serif text-body-md placeholder:text-on-surface-variant/30 focus:border-primary focus:outline-none focus:ring-0"
            />
          </div>

          {error ? (
            <p className="font-serif text-body-md italic text-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            {running ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={onStop}
                  className="bg-primary px-12 py-4 font-serif text-label-lg uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container disabled:opacity-60"
                >
                  {busy ? "Closing" : "Cease Riyaz"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={onCancel}
                  className="border border-outline-variant bg-transparent px-8 py-4 font-serif text-label-lg uppercase tracking-widest text-on-surface-variant transition-all hover:bg-surface-container-high"
                >
                  Discard
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={onStart}
                className="border border-primary bg-surface px-12 py-4 font-serif text-label-lg uppercase tracking-widest text-primary transition-all hover:bg-primary-fixed disabled:opacity-60"
              >
                {busy ? "Beginning" : "Begin Practice"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
