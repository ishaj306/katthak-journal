import { vibhagStarts, type Tala } from "@/lib/talas";

/**
 * Web-Audio tala clock, extracted so both the Riyaz metronome and the Riyaaz
 * sequence player can sound a theka without duplicating the scheduling maths.
 *
 * (The Metronome component still holds its own copy of this logic; it is left
 * untouched so its working UI can't regress. This class is the shared engine
 * for new code and the place to converge on later.)
 *
 * Timing uses the standard look-ahead pattern: a 25ms interval schedules clicks
 * ~100ms into the AudioContext's own clock, which stays rock-steady even when
 * the main thread is busy — important when a dancer is mid-phrase.
 */
type Accent = "sam" | "vibhag" | "normal";

export class TalaClock {
  private ctx: AudioContext | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextNoteTime = 0;
  private currentMatra = 0;
  private bpm: number;
  private tala: Tala;
  private starts: Set<number>;
  private onMatra?: (matra: number) => void;

  constructor(tala: Tala, bpm = 120, onMatra?: (matra: number) => void) {
    this.tala = tala;
    this.bpm = bpm;
    this.starts = vibhagStarts(tala);
    this.onMatra = onMatra;
  }

  private accentFor(matra: number): Accent {
    if (matra === 0) return "sam";
    if (this.starts.has(matra)) return "vibhag";
    return "normal";
  }

  private playClick(time: number, accent: Accent) {
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

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

  private scheduler = () => {
    const ctx = this.ctx;
    if (!ctx) return;
    const secondsPerMatra = 60 / this.bpm;
    while (this.nextNoteTime < ctx.currentTime + 0.1) {
      const matra = this.currentMatra;
      this.playClick(this.nextNoteTime, this.accentFor(matra));

      const delay = (this.nextNoteTime - ctx.currentTime) * 1000;
      const scheduled = matra;
      setTimeout(() => this.onMatra?.(scheduled), Math.max(0, delay));

      this.nextNoteTime += secondsPerMatra;
      this.currentMatra = (this.currentMatra + 1) % this.tala.matras;
    }
  };

  /** Seconds one full cycle of the tala takes at the current tempo. */
  cycleSeconds(): number {
    return (this.tala.matras * 60) / this.bpm;
  }

  start() {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = this.ctx ?? new Ctx();
    this.ctx = ctx;
    if (ctx.state === "suspended") ctx.resume();

    this.currentMatra = 0;
    this.nextNoteTime = ctx.currentTime + 0.06;
    this.timer = setInterval(this.scheduler, 25);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /**
   * Pause without losing the beat: suspending the AudioContext freezes its
   * clock, so `nextNoteTime` stays valid and `resume()` continues from the same
   * point in the cycle rather than restarting the theka from sam.
   */
  pause() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.ctx?.suspend();
  }

  resume() {
    const ctx = this.ctx;
    if (!ctx) {
      this.start();
      return;
    }
    ctx.resume();
    if (!this.timer) this.timer = setInterval(this.scheduler, 25);
  }

  setBpm(bpm: number) {
    this.bpm = bpm;
  }

  dispose() {
    this.stop();
    this.ctx?.close();
    this.ctx = null;
  }
}
