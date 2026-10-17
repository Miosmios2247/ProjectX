// Rhythms: "when, how long, how loud". The lane decides which notes.

import { Rng } from "./rng";
import { STEPS_PER_BAR } from "./progression";

export type LaneId = "chords" | "bass" | "lead" | "pluck";
export const LANES: LaneId[] = ["chords", "bass", "lead", "pluck"];

export interface RhythmHit {
  /** 16th step inside the pattern. Negative = counted from the chord end (perChord). */
  step: number;
  /** Length in 16ths. Negative (perChord) = until the chord end plus len+1. */
  len: number;
  vel?: number;
  /** Lane-specific hint: bass "R" "O" "5" "3" "A"; chords "top" "low" "down" "up". */
  role?: string;
}

export interface Rhythm {
  id: string;
  name: string;
  lane: LaneId;
  tags: string[];
  bars: number;
  /** Hits repeat per chord instead of per bar. */
  perChord?: boolean;
  hits: RhythmHit[];
}

export type DrumInst =
  | "kick"
  | "snare"
  | "clap"
  | "hatC"
  | "hatO"
  | "shaker"
  | "percHi"
  | "percLo"
  | "rim"
  | "tamb";

export const DRUM_INSTS: DrumInst[] = [
  "kick", "snare", "clap", "rim", "hatC", "hatO", "shaker", "tamb", "percHi", "percLo",
];

/** One drum track: steps, or [step, velocity] pairs. */
export type DrumTrack = (number | [number, number])[];

export interface DrumPattern {
  id: string;
  name: string;
  kit: string;
  tags: string[];
  bars: number;
  tracks: Partial<Record<DrumInst, DrumTrack>>;
  /** Extra hits added on every 4th bar. */
  fill?: Partial<Record<DrumInst, DrumTrack>>;
  /** Default velocity per instrument. */
  vel?: Partial<Record<DrumInst, number>>;
}

export interface WeightedRef {
  id: string;
  weight: number;
}

export function pickRef(refs: readonly (WeightedRef | string)[], rng: Rng): string {
  const list = refs.map((r) => (typeof r === "string" ? { id: r, weight: 1 } : r));
  return rng.weighted(list, (r) => r.weight).id;
}

/** Absolute hits for a bar-based rhythm over the whole loop. */
export function expandBarRhythm(rhythm: Rhythm, totalSteps: number): RhythmHit[] {
  const span = rhythm.bars * STEPS_PER_BAR;
  const out: RhythmHit[] = [];
  for (let offset = 0; offset < totalSteps; offset += span) {
    for (const h of rhythm.hits) {
      const step = offset + h.step;
      if (step < totalSteps) out.push({ ...h, step });
    }
  }
  return out.sort((a, b) => a.step - b.step);
}

/** Absolute hits for a per-chord rhythm inside one chord slot. */
export function expandChordRhythm(
  rhythm: Rhythm,
  slotStart: number,
  slotLength: number,
): RhythmHit[] {
  const end = slotStart + slotLength;
  const out: RhythmHit[] = [];
  for (const h of rhythm.hits) {
    const step = h.step >= 0 ? slotStart + h.step : end + h.step;
    if (step < slotStart || step >= end) continue;
    const len = h.len >= 0 ? h.len : end + h.len + 1 - step;
    if (len <= 0) continue;
    out.push({ ...h, step, len });
  }
  return out.sort((a, b) => a.step - b.step);
}

/** Notes per bar, used to balance busy and calm lanes. */
export function rhythmDensity(rhythm: Rhythm): number {
  if (rhythm.perChord) return rhythm.hits.length;
  return rhythm.hits.length / rhythm.bars;
}
