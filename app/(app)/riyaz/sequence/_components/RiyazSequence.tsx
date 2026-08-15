"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/manuscript/Icons";
import { TALAS, talaById } from "@/lib/talas";
import { TalaClock } from "@/lib/talaClock";
import { formatDuration } from "@/lib/media-config";
import {
  type Recording,
  type QueueItem,
  type LoopMode,
  type SavedMix,
  LOOP_LABELS,
  recordingToItem,
  talaToItem,
  talaItemSeconds,
  resolveGap,
  itemSubtitle,
  loadMix,
  saveMix as saveDraft,
  toPersistedItems,
  hydrateMix,
} from "@/lib/riyaz-queue";
import { GapSelect } from "./GapSelect";
import { RiyazRecorder, type CapturedRecording } from "./RiyazRecorder";
import { AudioPlayer } from "@/app/(app)/compositions/_components/AudioPlayer";
import { deleteRiyazRecording } from "@/app/actions/riyaz-recordings";
import { saveMix, deleteMix } from "@/app/actions/riyaz-mixes";

type Phase = "playing" | "gap";

/** localStorage key for the in-progress session position. */
const SESSION_KEY = "kj.riyaz.session.v1";

export function RiyazSequence({
  recordings,
  userId,
  savedMixes,
}: {
  recordings: Recording[];
  userId: string;
  savedMixes: SavedMix[];
}) {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [defaultGap, setDefaultGap] = useState(10);
  const [loop, setLoop] = useState<LoopMode>("off");
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  const [sessionActive, setSessionActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  // Set when playback can't proceed on its own (autoplay blocked, media error),
  // so the UI can offer an explicit tap-to-resume rather than stalling silently.
  const [stalled, setStalled] = useState(false);
  const [resumeIndex, setResumeIndex] = useState<number | null>(null);

  // Display state.
  const [recTime, setRecTime] = useState(0);
  const [recDuration, setRecDuration] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);
  const [totalSec, setTotalSec] = useState(0);

  // Takes recorded during this session (object URLs stay alive until removed).
  const [captures, setCaptures] = useState<CapturedRecording[]>([]);

  // Saved-mix controls.
  const [mixName, setMixName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savePending, startSave] = useTransition();

  function persistMix() {
    setSaveError(null);
    startSave(async () => {
      const res = await saveMix({
        name: mixName,
        defaultGap,
        loop,
        items: toPersistedItems(queue),
      });
      if (res.error) {
        setSaveError(res.error);
        return;
      }
      setMixName("");
      router.refresh();
    });
  }

  function loadSavedMix(mix: SavedMix) {
    setQueue(hydrateMix(mix.items, recordings));
    setDefaultGap(mix.defaultGap);
    setLoop(mix.loop);
  }

  function removeSavedMix(id: string) {
    startSave(async () => {
      await deleteMix(id);
      router.refresh();
    });
  }

  // Refs the transport reads so effects don't churn on every edit.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clockRef = useRef<TalaClock | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingMsRef = useRef(0);
  const lastTickRef = useRef(0);
  const playingRef = useRef(false);
  const talaStartedRef = useRef(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const indexRef = useRef(0);
  const queueRef = useRef<QueueItem[]>([]);
  const defaultGapRef = useRef(10);
  const loopRef = useRef<LoopMode>("off");

  playingRef.current = playing;
  indexRef.current = index;
  queueRef.current = queue;
  defaultGapRef.current = defaultGap;
  loopRef.current = loop;

  // ---- persistence -------------------------------------------------------
  useEffect(() => {
    const saved = loadMix();
    if (saved) {
      setQueue(saved.queue);
      setDefaultGap(saved.defaultGap);
      setLoop(saved.loop);
    }
    // Offer to resume an interrupted session (page was refreshed/closed).
    try {
      const s = window.localStorage.getItem(SESSION_KEY);
      const i = s ? Number(s) : NaN;
      if (Number.isFinite(i) && i > 0) setResumeIndex(i);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    saveDraft({ queue, defaultGap, loop });
  }, [queue, defaultGap, loop]);

  // Remember how far into the session we are, so a refresh can resume.
  useEffect(() => {
    if (!sessionActive) return;
    try {
      window.localStorage.setItem(SESSION_KEY, String(index));
    } catch {
      /* ignore */
    }
  }, [sessionActive, index]);

  // Keep the screen awake during a session (best-effort; ignored where absent).
  useEffect(() => {
    if (!sessionActive || !playing) return;
    let released = false;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinel> };
    };
    nav.wakeLock
      ?.request("screen")
      .then((lock) => {
        if (released) lock.release().catch(() => {});
        else wakeLockRef.current = lock;
      })
      .catch(() => {});
    return () => {
      released = true;
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [sessionActive, playing]);

  // ---- countdown (shared by tala items and breathing gaps) ---------------
  const stopCountdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
  }, []);

  const startCountdown = useCallback(
    (totalMs: number, onDone: () => void) => {
      stopCountdown();
      remainingMsRef.current = totalMs;
      lastTickRef.current = performance.now();
      setTotalSec(Math.ceil(totalMs / 1000));
      setRemainingSec(Math.ceil(totalMs / 1000));
      countdownRef.current = setInterval(() => {
        const now = performance.now();
        const dt = now - lastTickRef.current;
        lastTickRef.current = now;
        if (playingRef.current) remainingMsRef.current -= dt;
        setRemainingSec(Math.max(0, Math.ceil(remainingMsRef.current / 1000)));
        if (remainingMsRef.current <= 0) {
          stopCountdown();
          onDone();
        }
      }, 200);
    },
    [stopCountdown]
  );

  // ---- transport ---------------------------------------------------------
  const endSession = useCallback(() => {
    stopCountdown();
    clockRef.current?.dispose();
    clockRef.current = null;
    audioRef.current?.pause();
    setSessionActive(false);
    setPlaying(false);
    setStalled(false);
    setPhase("playing");
    setResumeIndex(null);
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, [stopCountdown]);

  const advance = useCallback(() => {
    const len = queueRef.current.length;
    const i = indexRef.current;
    let next: number;
    if (loopRef.current === "one") next = i;
    else if (loopRef.current === "all") next = (i + 1) % len;
    else {
      next = i + 1;
      if (next >= len) {
        endSession();
        return;
      }
    }
    setIndex(next);
    setPhase("playing");
  }, [endSession]);

  const handleItemEnd = useCallback(() => {
    setPhase("gap");
  }, []);

  // Engine: set up whatever the current (index, phase) needs to sound.
  useEffect(() => {
    if (!sessionActive) return;
    const item = queueRef.current[index];
    if (!item) {
      endSession();
      return;
    }

    if (phase === "gap") {
      const gap = resolveGap(item, defaultGapRef.current);
      if (gap <= 0) {
        advance();
        return;
      }
      audioRef.current?.pause();
      startCountdown(gap * 1000, advance);
      return () => stopCountdown();
    }

    // phase === "playing"
    setRecTime(0);
    setStalled(false);
    if (item.kind === "tala") {
      const tala = talaById(item.talaId);
      if (tala) {
        // Created here but started by the play/pause effect, so the clock is
        // only ever started once per entry (no leaked scheduler).
        clockRef.current = new TalaClock(tala, item.bpm);
        talaStartedRef.current = false;
      }
      startCountdown(talaItemSeconds(item) * 1000, handleItemEnd);
      return () => {
        clockRef.current?.dispose();
        clockRef.current = null;
        stopCountdown();
      };
    }

    // recording — restart from the top; the play/pause effect starts it.
    if (audioRef.current) audioRef.current.currentTime = 0;
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionActive, index, phase]);

  // Play/pause the current engine when the transport toggles.
  useEffect(() => {
    if (!sessionActive) return;
    const item = queueRef.current[index];
    if (!item || phase !== "playing") return;
    if (item.kind === "recording") {
      const a = audioRef.current;
      if (!a) return;
      if (playing) {
        // A rejected play() is almost always the browser's autoplay policy
        // blocking a track that started without a fresh gesture — surface it
        // instead of stalling silently.
        a.play()
          .then(() => setStalled(false))
          .catch(() => {
            setStalled(true);
            setPlaying(false);
          });
      } else {
        a.pause();
      }
    } else {
      const c = clockRef.current;
      if (!c) return;
      if (playing) {
        if (!talaStartedRef.current) {
          c.start();
          talaStartedRef.current = true;
        } else {
          c.resume();
        }
      } else if (talaStartedRef.current) {
        c.pause();
      }
    }
  }, [playing, sessionActive, index, phase]);

  // Keep the audio element's volume in sync.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume, index, phase]);

  useEffect(() => {
    return () => {
      stopCountdown();
      clockRef.current?.dispose();
    };
  }, [stopCountdown]);

  // ---- queue editing -----------------------------------------------------
  const addRecording = (r: Recording) =>
    setQueue((q) => [...q, recordingToItem(r)]);
  const addTala = (talaId: string) => {
    const item = talaToItem(talaId);
    if (item) setQueue((q) => [...q, item]);
  };
  const removeItem = (uid: string) =>
    setQueue((q) => q.filter((it) => it.uid !== uid));
  const moveItem = (uid: string, dir: -1 | 1) =>
    setQueue((q) => {
      const i = q.findIndex((it) => it.uid === uid);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= q.length) return q;
      const copy = [...q];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  const setItemGap = (uid: string, gap: number | null) =>
    setQueue((q) =>
      q.map((it) => (it.uid === uid ? { ...it, gapAfter: gap } : it))
    );
  const setTalaBpm = (uid: string, bpm: number) =>
    setQueue((q) =>
      q.map((it) =>
        it.uid === uid && it.kind === "tala" ? { ...it, bpm } : it
      )
    );
  const setTalaCycles = (uid: string, cycles: number) =>
    setQueue((q) =>
      q.map((it) =>
        it.uid === uid && it.kind === "tala" ? { ...it, cycles } : it
      )
    );

  const startSession = (startIndex = 0) => {
    if (queue.length === 0) return;
    const i = Math.max(0, Math.min(queue.length - 1, startIndex));
    setResumeIndex(null);
    setIndex(i);
    setPhase("playing");
    setStalled(false);
    setSessionActive(true);
    setPlaying(true);
  };

  // Clear a pause/autoplay stall with an explicit user gesture.
  const resumeFromStall = () => {
    setStalled(false);
    setPlaying(true);
  };

  // ---- derived picker data ----------------------------------------------
  const levels = useMemo(
    () => Array.from(new Set(recordings.flatMap((r) => r.levels))).sort(),
    [recordings]
  );

  const groupsByTaal = useMemo(() => {
    const filtered = levelFilter
      ? recordings.filter((r) => r.levels.includes(levelFilter))
      : recordings;
    const map = new Map<string, Recording[]>();
    for (const r of filtered) {
      const label =
        talaById(r.talaId)?.name ?? r.talaName?.trim() ?? "No taal recorded";
      const list = map.get(label) ?? [];
      list.push(r);
      map.set(label, list);
    }
    return Array.from(map.entries());
  }, [recordings, levelFilter]);

  const current = sessionActive ? queue[index] : null;

  const progress =
    phase === "gap"
      ? totalSec > 0
        ? 1 - remainingSec / totalSec
        : 0
      : current?.kind === "recording"
        ? recDuration > 0
          ? recTime / recDuration
          : 0
        : totalSec > 0
          ? 1 - remainingSec / totalSec
          : 0;

  return (
    <div className="space-y-section-gap">
      {/* hidden/inline audio element for the current recording */}
      {current?.kind === "recording" ? (
        <audio
          key={current.uid}
          ref={audioRef}
          src={current.url}
          onLoadedMetadata={(e) => setRecDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setRecTime(e.currentTarget.currentTime)}
          onEnded={handleItemEnd}
          onError={() => {
            setStalled(true);
            setPlaying(false);
          }}
          className="hidden"
        />
      ) : null}

      {/* ---------------- Stage (active session) ---------------- */}
      {sessionActive && current ? (
        <SessionStage
          item={current}
          phase={phase}
          playing={playing}
          progress={progress}
          remainingSec={remainingSec}
          recTime={recTime}
          recDuration={recDuration}
          index={index}
          total={queue.length}
          stalled={stalled}
          onResume={resumeFromStall}
          onToggle={() => setPlaying((p) => !p)}
          onPrev={() => {
            setIndex((i) => Math.max(0, i - 1));
            setPhase("playing");
          }}
          onNext={() => {
            setIndex((i) => Math.min(queue.length - 1, i + 1));
            setPhase("playing");
          }}
          onStop={endSession}
          volume={volume}
          onVolume={setVolume}
        />
      ) : null}

      {/* ---------------- Record during Riyaaz ---------------- */}
      {sessionActive ? (
        <section className="space-y-4">
          <RiyazRecorder
            userId={userId}
            compositionId={
              current?.kind === "recording" ? current.compositionId : null
            }
            compositionTitle={
              current?.kind === "recording" ? current.compositionTitle : null
            }
            onSaved={(rec) => setCaptures((c) => [rec, ...c])}
          />

          {captures.length > 0 ? (
            <div className="border border-outline-variant bg-surface-container-lowest p-4">
              <h3 className="mb-3 font-serif text-label-md uppercase tracking-widest text-secondary">
                Captured this session
              </h3>
              <ul className="space-y-4">
                {captures.map((cap) => (
                  <li key={cap.id}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <p className="truncate font-serif text-body-md text-on-surface">
                        {cap.title}
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteRiyazRecording(cap.id);
                          setCaptures((c) =>
                            c.filter((x) => x.id !== cap.id)
                          );
                          URL.revokeObjectURL(cap.url);
                        }}
                        className="flex-none font-serif text-label-md uppercase tracking-widest text-outline transition-colors hover:text-error"
                      >
                        Remove
                      </button>
                    </div>
                    <AudioPlayer url={cap.url} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Keep the fixed now-playing bar from covering the last content. */}
      {sessionActive ? <div className="h-24" aria-hidden /> : null}

      {/* ---------------- Saved mixes ---------------- */}
      {!sessionActive && savedMixes.length > 0 ? (
        <section className="border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="mb-4 font-serif text-label-md uppercase tracking-widest text-secondary">
            Saved mixes
          </h2>
          <ul className="flex flex-wrap gap-3">
            {savedMixes.map((mix) => (
              <li
                key={mix.id}
                className="flex items-center gap-3 border border-outline-variant bg-surface px-4 py-2"
              >
                <button
                  type="button"
                  onClick={() => loadSavedMix(mix)}
                  className="font-serif text-body-md text-primary transition-colors hover:text-secondary"
                >
                  {mix.name}
                  <span className="ml-2 font-serif text-label-md italic text-on-surface-variant">
                    {mix.items.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete the mix "${mix.name}"?`))
                      removeSavedMix(mix.id);
                  }}
                  disabled={savePending}
                  className="text-outline transition-colors hover:text-error disabled:opacity-40"
                  aria-label={`Delete ${mix.name}`}
                >
                  <Icon.Close size={15} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-serif text-label-md italic text-on-surface-variant">
            Loading a mix replaces what&rsquo;s below.
          </p>
        </section>
      ) : null}

      {/* ---------------- Builder ---------------- */}
      {!sessionActive ? (
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
          {/* Picker */}
          <section className="border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="mb-4 font-display text-headline-md text-primary">
              Your recordings
            </h2>

            {levels.length > 0 ? (
              <div className="mb-5 flex flex-wrap gap-2">
                <LevelChip
                  label="All levels"
                  active={levelFilter === null}
                  onClick={() => setLevelFilter(null)}
                />
                {levels.map((lv) => (
                  <LevelChip
                    key={lv}
                    label={lv}
                    active={levelFilter === lv}
                    onClick={() => setLevelFilter(lv)}
                  />
                ))}
              </div>
            ) : null}

            {recordings.length === 0 ? (
              <p className="font-serif text-body-md italic text-on-surface-variant">
                No audio recordings yet. Record or upload audio on a composition,
                and it will appear here to add to your Riyaaz.
              </p>
            ) : (
              <div className="space-y-6">
                {groupsByTaal.map(([taal, list]) => (
                  <div key={taal}>
                    <h3 className="mb-2 border-b border-outline-variant pb-1 font-serif text-label-md uppercase tracking-widest text-secondary">
                      {taal}
                    </h3>
                    <ul className="space-y-1">
                      {list.map((r) => (
                        <li
                          key={r.id}
                          className="flex items-center justify-between gap-3 py-1"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-serif text-body-md text-on-surface">
                              {r.title ?? r.compositionTitle ?? "Recording"}
                            </p>
                            {r.compositionTitle ? (
                              <p className="truncate font-serif text-label-md italic text-on-surface-variant">
                                {r.compositionTitle}
                                {r.levels.length > 0
                                  ? ` · ${r.levels.join(", ")}`
                                  : ""}
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => addRecording(r)}
                            className="flex-none font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:text-primary"
                          >
                            + Add
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <h3 className="mb-2 mt-8 border-b border-outline-variant pb-1 font-serif text-label-md uppercase tracking-widest text-secondary">
              Talas
            </h3>
            <ul className="grid grid-cols-2 gap-1">
              {TALAS.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => addTala(t.id)}
                    className="flex w-full items-center justify-between gap-2 py-1 text-left font-serif text-body-md text-on-surface transition-colors hover:text-primary"
                  >
                    <span>{t.name}</span>
                    <span className="font-serif text-label-md uppercase tracking-widest text-secondary">
                      + Add
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Queue */}
          <section className="border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="mb-4 font-display text-headline-md text-primary">
              The mix
            </h2>

            {queue.length === 0 ? (
              <p className="font-serif text-body-md italic text-on-surface-variant">
                Add recordings and talas from the left to build your Riyaaz
                sequence.
              </p>
            ) : (
              <ol className="space-y-2">
                {queue.map((it, i) => (
                  <li key={it.uid}>
                    <div className="flex items-start gap-3 border border-outline-variant bg-surface p-3">
                      <span className="mt-0.5 font-serif text-label-md tabular-nums text-secondary">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-grow">
                        <p className="flex items-center gap-2 truncate font-serif text-body-md text-on-surface">
                          {it.kind === "tala" ? (
                            <Icon.Tabla size={15} />
                          ) : (
                            <Icon.Ghungroo size={15} />
                          )}
                          {it.kind === "tala" ? it.talaName : it.title}
                        </p>
                        {it.kind === "tala" ? (
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-serif text-label-md text-on-surface-variant">
                            <label className="flex items-center gap-1">
                              bpm
                              <input
                                type="number"
                                min={30}
                                max={300}
                                value={it.bpm}
                                onChange={(e) =>
                                  setTalaBpm(it.uid, Number(e.target.value))
                                }
                                className="w-14 border-0 border-b border-outline-variant bg-transparent py-0.5 tabular-nums text-primary focus:outline-none"
                              />
                            </label>
                            <label className="flex items-center gap-1">
                              cycles
                              <input
                                type="number"
                                min={1}
                                max={64}
                                value={it.cycles}
                                onChange={(e) =>
                                  setTalaCycles(it.uid, Number(e.target.value))
                                }
                                className="w-14 border-0 border-b border-outline-variant bg-transparent py-0.5 tabular-nums text-primary focus:outline-none"
                              />
                            </label>
                          </div>
                        ) : itemSubtitle(it) ? (
                          <p className="truncate font-serif text-label-md italic text-on-surface-variant">
                            {itemSubtitle(it)}
                          </p>
                        ) : null}
                        <div className="mt-2 flex items-center gap-2 font-serif text-label-md text-on-surface-variant">
                          <span className="uppercase tracking-widest">
                            Gap after
                          </span>
                          <GapSelect
                            value={it.gapAfter}
                            onChange={(v) => setItemGap(it.uid, v)}
                            allowDefault
                            compact
                          />
                        </div>
                      </div>
                      <div className="flex flex-none flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveItem(it.uid, -1)}
                          disabled={i === 0}
                          className="text-secondary transition-colors hover:text-primary disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <Icon.ChevronDown
                            size={16}
                            className="rotate-180"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(it.uid, 1)}
                          disabled={i === queue.length - 1}
                          className="text-secondary transition-colors hover:text-primary disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <Icon.ChevronDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(it.uid)}
                          className="text-outline transition-colors hover:text-error"
                          aria-label="Remove"
                        >
                          <Icon.Close size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {/* Mix controls */}
            <div className="mt-6 space-y-4 border-t border-outline-variant pt-6">
              <div className="flex items-center justify-between gap-4">
                <span className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
                  Default breathing gap
                </span>
                <GapSelect
                  value={defaultGap}
                  onChange={(v) => setDefaultGap(v ?? 0)}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant">
                  Repeat
                </span>
                <div className="flex gap-2">
                  {(["off", "all", "one"] as LoopMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setLoop(m)}
                      className={
                        loop === m
                          ? "bg-primary px-3 py-1 font-serif text-label-md uppercase tracking-widest text-on-primary"
                          : "border border-outline-variant bg-surface px-3 py-1 font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:border-secondary"
                      }
                    >
                      {LOOP_LABELS[m]}
                    </button>
                  ))}
                </div>
              </div>

              {resumeIndex != null && resumeIndex < queue.length ? (
                <button
                  type="button"
                  onClick={() => startSession(resumeIndex)}
                  className="flex w-full items-center justify-center gap-3 border border-secondary bg-secondary-fixed-dim px-8 py-3 font-serif text-label-md uppercase tracking-widest text-primary transition-all hover:bg-secondary hover:text-on-secondary"
                >
                  <Icon.Play size={18} />
                  Resume from item {resumeIndex + 1}
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => startSession(0)}
                disabled={queue.length === 0}
                className="flex w-full items-center justify-center gap-3 border border-primary bg-primary px-8 py-3 font-serif text-label-lg uppercase tracking-[0.2em] text-on-primary transition-all hover:bg-primary-container disabled:opacity-40"
              >
                <Icon.Play size={20} />
                {resumeIndex != null ? "Start over" : "Begin Riyaaz"}
              </button>
              {queue.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Clear the entire mix?")) setQueue([]);
                  }}
                  className="w-full font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-error"
                >
                  Clear the mix
                </button>
              ) : null}

              {/* Save as a named mix */}
              {queue.length > 0 ? (
                <div className="border-t border-outline-variant pt-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={mixName}
                      onChange={(e) => setMixName(e.target.value)}
                      placeholder="Name this mix…"
                      className="flex-grow border-0 border-b border-primary bg-transparent py-1 font-serif text-body-md text-primary placeholder:italic placeholder:text-outline-variant focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={persistMix}
                      disabled={savePending || mixName.trim().length === 0}
                      className="flex-none border border-secondary px-5 py-1.5 font-serif text-label-md uppercase tracking-widest text-secondary transition-colors hover:bg-secondary hover:text-on-secondary disabled:opacity-40"
                    >
                      {savePending ? "Saving" : "Save mix"}
                    </button>
                  </div>
                  {saveError ? (
                    <p className="mt-2 font-serif text-label-md italic text-error">
                      {saveError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {/* ---------------- Now-playing disk (fixed) ---------------- */}
      {sessionActive && current ? (
        <NowPlayingBar
          item={current}
          phase={phase}
          playing={playing}
          stalled={stalled}
          remainingSec={remainingSec}
          onToggle={() => (stalled ? resumeFromStall() : setPlaying((p) => !p))}
          onPrev={() => {
            setIndex((i) => Math.max(0, i - 1));
            setPhase("playing");
          }}
          onNext={() => {
            setIndex((i) => Math.min(queue.length - 1, i + 1));
            setPhase("playing");
          }}
          onStop={endSession}
        />
      ) : null}
    </div>
  );
}

function LevelChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "bg-primary px-3 py-0.5 font-serif text-label-md uppercase tracking-widest text-on-primary"
          : "border border-outline-variant bg-surface px-3 py-0.5 font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:border-secondary"
      }
    >
      {label}
    </button>
  );
}

function SessionStage({
  item,
  phase,
  playing,
  progress,
  remainingSec,
  recTime,
  recDuration,
  index,
  total,
  stalled,
  onResume,
  onToggle,
  onPrev,
  onNext,
  onStop,
  volume,
  onVolume,
}: {
  item: QueueItem;
  phase: Phase;
  playing: boolean;
  progress: number;
  remainingSec: number;
  recTime: number;
  recDuration: number;
  index: number;
  total: number;
  stalled: boolean;
  onResume: () => void;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onStop: () => void;
  volume: number;
  onVolume: (v: number) => void;
}) {
  const title = item.kind === "tala" ? item.talaName : item.title;
  const subtitle = itemSubtitle(item);

  return (
    <section className="relative border border-secondary bg-surface p-2">
      <div
        className="pointer-events-none absolute"
        style={{ top: 4, left: 4, right: 4, bottom: 4, border: "1px solid #4e0616" }}
        aria-hidden
      />
      <div className="relative p-6 md:p-8">
        <div className="flex items-center justify-between">
          <span className="font-serif text-label-md uppercase tracking-widest text-secondary">
            {phase === "gap" ? "Breathe" : `Item ${index + 1} of ${total}`}
          </span>
          <button
            type="button"
            onClick={onStop}
            className="font-serif text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-error"
          >
            End
          </button>
        </div>

        {phase === "gap" ? (
          <div className="py-10 text-center">
            <p className="font-display text-display-lg-mobile text-primary">
              {remainingSec}
            </p>
            <p className="mt-2 font-serif text-body-md italic text-on-surface-variant">
              Next: {title}
            </p>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="font-display text-headline-lg text-primary">{title}</p>
            {subtitle ? (
              <p className="mt-1 font-serif text-body-md italic text-on-surface-variant">
                {subtitle}
              </p>
            ) : null}
          </div>
        )}

        {/* stalled — playback needs a tap to continue */}
        {stalled ? (
          <div className="mt-2 flex flex-col items-center gap-3 border border-secondary bg-secondary-fixed-dim/40 p-4 text-center">
            <p className="font-serif text-body-md italic text-primary">
              Playback paused — your browser needs a tap to continue.
            </p>
            <button
              type="button"
              onClick={onResume}
              className="flex items-center gap-2 border border-primary bg-primary px-6 py-2 font-serif text-label-md uppercase tracking-widest text-on-primary transition-all hover:bg-primary-container"
            >
              <Icon.Play size={16} /> Tap to resume
            </button>
          </div>
        ) : null}

        {/* progress */}
        <div className="mt-2 h-1 w-full bg-outline-variant">
          <div
            className="h-full bg-primary transition-[width] duration-200"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between font-serif text-label-md tabular-nums text-on-surface-variant">
          <span>
            {phase === "gap"
              ? "Breathing"
              : item.kind === "recording"
                ? formatDuration(recTime)
                : `${remainingSec}s left`}
          </span>
          <span>
            {phase === "gap"
              ? `${remainingSec}s`
              : item.kind === "recording"
                ? formatDuration(recDuration)
                : ""}
          </span>
        </div>

        {/* transport */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onPrev}
            disabled={index === 0}
            className="flex h-11 w-11 items-center justify-center border border-secondary bg-surface text-primary transition-colors hover:bg-secondary-fixed-dim disabled:opacity-30"
            aria-label="Previous"
          >
            <Icon.SkipPrevious size={20} />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="flex h-16 w-16 items-center justify-center border border-primary bg-primary text-on-primary transition-colors hover:bg-primary-container"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Icon.Pause size={28} /> : <Icon.Play size={28} />}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={index === total - 1}
            className="flex h-11 w-11 items-center justify-center border border-secondary bg-surface text-primary transition-colors hover:bg-secondary-fixed-dim disabled:opacity-30"
            aria-label="Next"
          >
            <Icon.SkipNext size={20} />
          </button>
        </div>

        {/* volume (recordings) */}
        {item.kind === "recording" ? (
          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="text-secondary">
              {volume === 0 ? (
                <Icon.VolumeMute size={16} />
              ) : (
                <Icon.Volume size={16} />
              )}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => onVolume(Number(e.target.value))}
              className="h-1 w-40 accent-primary"
              aria-label="Volume"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function NowPlayingBar({
  item,
  phase,
  playing,
  stalled,
  remainingSec,
  onToggle,
  onPrev,
  onNext,
  onStop,
}: {
  item: QueueItem;
  phase: Phase;
  playing: boolean;
  stalled: boolean;
  remainingSec: number;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onStop: () => void;
}) {
  const title = item.kind === "tala" ? item.talaName : item.title;
  const subtitle =
    phase === "gap" ? `Breathing · ${remainingSec}s` : itemSubtitle(item);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-secondary bg-surface-container-high/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        {/* spinning disk */}
        <div
          className="relative flex h-12 w-12 flex-none items-center justify-center rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, #4e0616 0 18%, #6B1E2A 19% 55%, #B8893E 56% 100%)",
            animation: "spin 4s linear infinite",
            animationPlayState: playing && phase !== "gap" ? "running" : "paused",
          }}
          aria-hidden
        >
          <span className="h-2 w-2 rounded-full bg-surface" />
        </div>

        <div className="min-w-0 flex-grow">
          <p className="truncate font-serif text-body-md text-on-surface">
            {stalled ? "Tap to resume" : phase === "gap" ? "Breathe…" : title}
          </p>
          {subtitle && !stalled ? (
            <p className="truncate font-serif text-label-md italic text-on-surface-variant">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex flex-none items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            className="text-primary transition-colors hover:text-secondary"
            aria-label="Previous"
          >
            <Icon.SkipPrevious size={20} />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="flex h-10 w-10 items-center justify-center border border-primary bg-primary text-on-primary transition-colors hover:bg-primary-container"
            aria-label={stalled ? "Resume" : playing ? "Pause" : "Play"}
          >
            {playing && !stalled ? (
              <Icon.Pause size={18} />
            ) : (
              <Icon.Play size={18} />
            )}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="text-primary transition-colors hover:text-secondary"
            aria-label="Next"
          >
            <Icon.SkipNext size={20} />
          </button>
          <button
            type="button"
            onClick={onStop}
            className="ml-1 text-on-surface-variant transition-colors hover:text-error"
            aria-label="End Riyaaz"
          >
            <Icon.Close size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
