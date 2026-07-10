"use client";

import { useEffect, useRef, useState } from "react";
import { TALAS, vibhagStarts, type Tala } from "@/lib/talas";
import { Icon } from "@/components/manuscript/Icons";

type Accent = "sam" | "vibhag" | "normal";

export function Metronome() {
  const [talaId, setTalaId] = useState<string>("teentaal");
  const [bpm, setBpm] = useState(120);
  const [playing, setPlaying] = useState(false);
  const [activeMatra, setActiveMatra] = useState(-1);

  const tala = TALAS.find((t) => t.id === talaId) ?? TALAS[0];
  const starts = vibhagStarts(tala);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentMatraRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bpmRef = useRef(bpm);
  const talaRef = useRef<Tala>(tala);

  bpmRef.current = bpm;
  talaRef.current = tala;

  function accentFor(matra: number): Accent {
    if (matra === 0) return "sam";
    if (starts.has(matra)) return "vibhag";
    return "normal";
  }

  function playClick(time: number, accent: Accent) {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Tabla-ish pitched click; sam highest, vibhag mid, normal low
    const freq = accent === "sam" ? 880 : accent === "vibhag" ? 620 : 440;
    const peak = accent === "sam" ? 0.6 : accent === "vibhag" ? 0.4 : 0.25;
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, time + 0.05);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

    osc.start(time);
    osc.stop(time + 0.14);
  }

  function scheduler() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const secondsPerMatra = 60 / bpmRef.current;
    // Schedule ~100ms ahead
    while (nextNoteTimeRef.current < ctx.currentTime + 0.1) {
      const matra = currentMatraRef.current;
      playClick(nextNoteTimeRef.current, accentFor(matra));

      const scheduledMatra = matra;
      const delay = (nextNoteTimeRef.current - ctx.currentTime) * 1000;
      setTimeout(
        () => setActiveMatra(scheduledMatra),
        Math.max(0, delay)
      );

      nextNoteTimeRef.current += secondsPerMatra;
      currentMatraRef.current =
        (currentMatraRef.current + 1) % talaRef.current.matras;
    }
  }

  function start() {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = audioCtxRef.current ?? new Ctx();
    audioCtxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();

    currentMatraRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.06;
    timerRef.current = setInterval(scheduler, 25);
    setPlaying(true);
  }

  function stop() {
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = null;
    setPlaying(false);
    setActiveMatra(-1);
  }

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  // Restart cleanly if tala changes mid-play
  useEffect(() => {
    if (playing) {
      stop();
      const id = setTimeout(start, 60);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talaId]);

  return (
    <div
      className="relative border border-secondary bg-surface p-2"
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
      <div className="relative p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-serif text-label-lg uppercase tracking-[0.2em] text-secondary">
            Tala Clock
          </h3>
          <span className="text-secondary opacity-50">
            <Icon.Tabla size={22} />
          </span>
        </div>

        {/* Matra dots */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {Array.from({ length: tala.matras }).map((_, i) => {
            const accent = accentFor(i);
            const active = i === activeMatra;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="flex items-center justify-center transition-all duration-100"
                  style={{
                    width: accent === "sam" ? 26 : 22,
                    height: accent === "sam" ? 26 : 22,
                    borderRadius: "9999px",
                    border: `1.5px solid ${accent === "normal" ? "#dac0c1" : "#7e570d"}`,
                    background: active
                      ? accent === "sam"
                        ? "#6B1E2A"
                        : "#B8893E"
                      : "transparent",
                    transform: active ? "scale(1.25)" : "scale(1)",
                  }}
                >
                  <span
                    className="font-serif text-[10px]"
                    style={{ color: active ? "#FAF6EC" : "#877273" }}
                  >
                    {i + 1}
                  </span>
                </div>
                {tala.bols ? (
                  <span
                    className="font-serif text-[9px] italic"
                    style={{
                      color: active ? "#6B1E2A" : "#877273",
                      fontWeight: accent === "sam" ? 700 : 400,
                    }}
                  >
                    {tala.bols[i]}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
              Tala
            </label>
            <select
              value={talaId}
              onChange={(e) => setTalaId(e.target.value)}
              className="flex-grow border-0 border-b border-primary bg-transparent py-1 font-serif text-body-md text-primary focus:outline-none"
            >
              {TALAS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.matras} matras
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
              Laya
            </label>
            <input
              type="range"
              min={40}
              max={280}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="flex-grow accent-primary"
            />
            <span className="w-20 text-right font-serif text-body-md tabular-nums text-primary">
              {bpm} bpm
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-serif text-label-md italic text-on-surface-variant">
              {bpm < 80 ? "Vilambit" : bpm < 160 ? "Madhya" : "Drut"}
            </span>
            <button
              type="button"
              onClick={playing ? stop : start}
              className="flex items-center gap-2 border border-primary bg-primary px-8 py-3 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container"
            >
              {playing ? <Icon.Stop size={18} /> : <Icon.Play size={18} />}
              {playing ? "Stop" : "Sound the Tala"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
