// Hook-Summer: the rater hums the hook of a reference song; the lab finds the
// notes and keeps only statistics (range, steps, repeats, rhythm), never the
// melody itself. Pure functions, tested in lab/test.

import { yinFrame } from "./voice-analysis";

export interface HummedNote {
  /** Rounded MIDI pitch. */
  midi: number;
  /** Seconds. */
  start: number;
  end: number;
}

export interface HumStats {
  notes: number;
  pitches: number;
  /** Semitones from the lowest to the highest note. */
  range: number;
  /** Share of moves of at most 2 semitones (repeats included). */
  steps: number;
  /** Share of repeated notes. */
  repeats: number;
  /** Share of onsets on off-beat 16ths. */
  sync: number;
  notesPerBar: number;
  /** Count of each interval from -12 to +12 semitones (index 0 = -12). */
  intervals: number[];
  /** Count of onsets per 16th position in the bar. */
  positions: number[];
}

const RATE = 16000;
const HOP = 0.01;

function resampleTo16k(x: Float32Array, rate: number): Float32Array {
  if (rate === RATE) return x;
  const ratio = rate / RATE;
  const k = Math.max(1, Math.round(ratio));
  const out = new Float32Array(Math.floor(x.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const p = Math.floor(i * ratio);
    let s = 0;
    let n = 0;
    for (let j = p; j < p + k && j < x.length; j++) {
      s += x[j];
      n++;
    }
    out[i] = n ? s / n : 0;
  }
  return out;
}

function median(v: number[]): number {
  const s = [...v].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}

/** Notes of a hummed or sung line: voiced stretches, split at rests, pitch jumps and re-attacks. */
export function transcribe(data: Float32Array, rate: number): HummedNote[] {
  const x = resampleTo16k(data, rate);
  const hop = Math.round(HOP * RATE);
  const frames = Math.max(0, Math.floor((x.length - 2 * 230) / hop));
  const pitch: number[] = [];
  const level: number[] = [];
  let top = -120;
  for (let f = 0; f < frames; f++) {
    const at = f * hop;
    let s = 0;
    for (let i = at; i < at + hop; i++) s += x[i] * x[i];
    const db = 10 * Math.log10(s / hop + 1e-12);
    level.push(db);
    top = Math.max(top, db);
    const { f0 } = yinFrame(x, at, RATE);
    pitch.push(f0 > 0 ? 69 + 12 * Math.log2(f0 / 440) : NaN);
  }
  const voiced = pitch.map((p, i) => Number.isFinite(p) && level[i] > top - 30);
  // Median-smoothed pitch over 5 frames removes single-frame octave slips.
  const smooth = pitch.map((_, i) => {
    const w = pitch.slice(Math.max(0, i - 2), i + 3).filter((p, k) => Number.isFinite(p) && voiced[Math.max(0, i - 2) + k]);
    return w.length ? median(w) : NaN;
  });
  const notes: HummedNote[] = [];
  let start = -1;
  let gap = 0;
  const close = (end: number) => {
    if (start < 0) return;
    const seg = smooth.slice(start, end).filter((p) => Number.isFinite(p));
    if (end - start >= 6 && seg.length) notes.push({ midi: Math.round(median(seg)), start: start * HOP, end: end * HOP });
    start = -1;
  };
  for (let i = 0; i < frames; i++) {
    if (!voiced[i] || !Number.isFinite(smooth[i])) {
      gap++;
      if (gap >= 4) close(i - gap + 1);
      continue;
    }
    gap = 0;
    if (start < 0) {
      start = i;
      continue;
    }
    const cur = median(smooth.slice(start, i).filter((p) => Number.isFinite(p)));
    // A new note: the pitch has moved by more than ~0.7 semitone for 4 frames, or the level jumps up (re-attack).
    const moved = [0, 1, 2, 3].every((k) => i + k < frames && Number.isFinite(smooth[i + k]) && Math.abs(smooth[i + k] - cur) > 0.7);
    const attack = i >= 3 && level[i] - level[i - 3] > 8 && i - start >= 8;
    if (moved || attack) {
      close(i);
      start = i;
    }
  }
  close(frames - gap);
  return notes;
}

/** Statistics of the hummed notes on the 16th grid of `bpm`, counted from `t0` seconds. */
export function humStats(notes: readonly HummedNote[], bpm: number, t0 = 0): HumStats {
  const step = 60 / bpm / 4;
  const onsets = notes.map((n) => Math.round((n.start - t0) / step));
  const midis = notes.map((n) => n.midi);
  const intervals = new Array(25).fill(0);
  let stepMoves = 0;
  let repeats = 0;
  for (let i = 1; i < midis.length; i++) {
    const d = midis[i] - midis[i - 1];
    if (Math.abs(d) <= 2) stepMoves++;
    if (d === 0) repeats++;
    intervals[Math.max(-12, Math.min(12, d)) + 12]++;
  }
  const positions = new Array(16).fill(0);
  for (const o of onsets) positions[((o % 16) + 16) % 16]++;
  const moves = Math.max(1, midis.length - 1);
  const span = onsets.length ? Math.max(1, onsets[onsets.length - 1] - onsets[0] + 1) : 1;
  return {
    notes: notes.length,
    pitches: new Set(midis).size,
    range: midis.length ? Math.max(...midis) - Math.min(...midis) : 0,
    steps: stepMoves / moves,
    repeats: repeats / moves,
    sync: onsets.length ? onsets.filter((o) => ((o % 2) + 2) % 2 === 1).length / onsets.length : 0,
    notesPerBar: notes.length / Math.max(1, span / 16),
    intervals,
    positions,
  };
}
