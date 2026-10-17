// Voicing: turn a chord into concrete keys, with smooth voice leading
// from the previous chord and a pleasant top note.

import { Chord, chordRoles, mod12 } from "./theory";
import { Rng } from "./rng";

export type Spread = "close" | "open" | "piano";

export interface VoicingOptions {
  low: number;
  high: number;
  voices: [number, number];
  spread: Spread;
  /** Bonus for a color tone (7th/9th/6th) as the top note. */
  colorTop?: number;
  /** Bonus for the chord's bass note as the lowest note. */
  rootBottom?: number;
  /** Preferred range for the top note. */
  topRange?: [number, number];
}

// Lowest sensible pitch for the lower note of each interval (in semitones).
// Below these, intervals get muddy ("low interval limits").
const LOW_LIMIT: Record<number, number> = {
  1: 52, 2: 51, 3: 48, 4: 46, 5: 45, 6: 46, 7: 34, 8: 41, 9: 41, 10: 41, 11: 41,
};

const MAX_SPAN: Record<Spread, number> = { close: 16, piano: 24, open: 27 };

function lowIntervalOk(lower: number, upper: number): boolean {
  const iv = upper - lower;
  if (iv <= 0) return false;
  if (iv >= 12) return true;
  return lower >= LOW_LIMIT[iv];
}

/** Sum of voice movements, matching voices by order (or nearest when counts differ). */
export function movement(prev: readonly number[], next: readonly number[]): number {
  if (prev.length === 0) return 0;
  if (prev.length === next.length) {
    let sum = 0;
    for (let i = 0; i < next.length; i++) sum += Math.abs(next[i] - prev[i]);
    return sum;
  }
  let sum = 0;
  for (const n of next) {
    let best = Infinity;
    for (const p of prev) best = Math.min(best, Math.abs(n - p));
    sum += best;
  }
  return sum * (prev.length / next.length);
}

interface Candidate {
  notes: number[];
  score: number;
}

export function voiceChord(
  chord: Chord,
  prev: readonly number[] | null,
  opts: VoicingOptions,
  rng: Rng,
): number[] {
  const roles = chordRoles(chord);
  const pcs = [...new Set(chord.intervals.map((i) => mod12(chord.root + i)))];
  const required = new Set<number>();
  if (roles.third !== null) required.add(roles.third);
  for (const c of roles.colors) required.add(c);
  required.add(chord.root);
  const pool: number[] = [];
  for (let n = opts.low; n <= opts.high; n++) if (pcs.includes(mod12(n))) pool.push(n);

  const [vMin, vMax] = opts.voices;
  const maxSpan = MAX_SPAN[opts.spread];
  const candidates: Candidate[] = [];
  const current: number[] = [];

  const evaluate = (notes: number[]) => {
    const present = new Set(notes.map(mod12));
    // With many colors and few voices, the root may be left to the bass.
    const mustRoot = !(required.size > notes.length);
    for (const r of required) {
      if (r === chord.root && !mustRoot) continue;
      if (!present.has(r)) return;
    }
    if (opts.spread === "piano" && notes.length >= 2 && notes[1] - notes[0] < 3) return;
    candidates.push({ notes: [...notes], score: score(notes) });
  };

  const score = (notes: number[]): number => {
    let s = 0;
    const low = notes[0];
    const top = notes[notes.length - 1];
    const span = top - low;
    if (prev && prev.length) {
      s += movement(prev, notes) * 1.0;
      const prevTop = prev[prev.length - 1];
      const topMove = Math.abs(top - prevTop);
      s += topMove * 0.8 + (topMove > 4 ? 3 : 0);
    } else {
      const center = (opts.low + opts.high) / 2;
      const mean = notes.reduce((a, b) => a + b, 0) / notes.length;
      s += Math.abs(mean - center) * 0.3;
    }
    if (opts.topRange) {
      const [a, b] = opts.topRange;
      if (top < a) s += (a - top) * 1.2;
      if (top > b) s += (top - b) * 1.2;
    }
    // Doublings
    const counts = new Map<number, number>();
    for (const n of notes) counts.set(mod12(n), (counts.get(mod12(n)) ?? 0) + 1);
    for (const [pc, c] of counts) {
      if (c < 2) continue;
      if (pc === roles.third) s += 3 * (c - 1);
      else if (roles.colors.includes(pc)) s += 4 * (c - 1);
      else s += 0.5 * (c - 1);
    }
    if (mod12(low) === chord.bass) s -= opts.rootBottom ?? 1.5;
    if (roles.colors.includes(mod12(top))) s -= opts.colorTop ?? 0;
    if (opts.spread === "close") s += Math.max(0, span - 12) * 0.6;
    if (opts.spread === "open" && span < 12) s += (12 - span) * 0.5;
    if (opts.spread === "piano") {
      // Wide at the bottom, close at the top.
      if (notes.length >= 3) {
        const lowGap = notes[1] - notes[0];
        const upperGaps = notes.slice(2).map((n, i) => n - notes[i + 1]);
        const maxUpper = Math.max(...upperGaps);
        if (lowGap < maxUpper) s += (maxUpper - lowGap) * 0.4;
      }
    }
    // Avoid seconds in the inner low register.
    for (let i = 1; i < notes.length; i++) {
      if (notes[i] - notes[i - 1] <= 2 && notes[i - 1] < 57) s += 1.5;
    }
    return s;
  };

  const search = (start: number) => {
    if (current.length >= vMin) evaluate(current);
    if (current.length === vMax) return;
    for (let i = start; i < pool.length; i++) {
      const n = pool[i];
      if (current.length) {
        const last = current[current.length - 1];
        if (!lowIntervalOk(last, n)) continue;
        if (n - current[0] > maxSpan) break;
        const gap = n - last;
        const isLowGap = current.length === 1;
        if (gap > (isLowGap ? 19 : 9)) continue;
      }
      current.push(n);
      search(i + 1);
      current.pop();
    }
  };
  search(0);

  if (candidates.length === 0) {
    // Fallback: simple close voicing from the root upwards.
    const base = Math.max(opts.low, 48);
    let r = base;
    while (mod12(r) !== chord.root) r++;
    return chord.intervals.filter((i) => i < 12 || i === 14).map((i) => r + i).sort((a, b) => a - b);
  }
  candidates.sort((a, b) => a.score - b.score);
  const top = candidates.slice(0, 3);
  // Without a previous chord, pick more freely for variety.
  const weights = prev ? [0.7, 0.2, 0.1] : [0.45, 0.35, 0.2];
  const chosen = rng.weighted(
    top.map((c, i) => ({ c, w: weights[i] ?? 0 })),
    (x) => x.w,
  ).c;
  return chosen.notes;
}

export function voiceProgression(
  chords: readonly Chord[],
  opts: VoicingOptions,
  rng: Rng,
): number[][] {
  const out: number[][] = [];
  let prev: number[] | null = null;
  for (const chord of chords) {
    const v = voiceChord(chord, prev, opts, rng);
    out.push(v);
    prev = v;
  }
  return out;
}
