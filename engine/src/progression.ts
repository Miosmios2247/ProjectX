// Progressions: pick a template from the style, adapt it to the key,
// add the style's chord colors, inversions and 8-bar variations.

import {
  Chord,
  ColorToken,
  Key,
  Mode,
  buildChord,
  chordRoles,
  mod12,
  romanToRelative,
  withBass,
} from "./theory";
import { Rng } from "./rng";

export const STEPS_PER_BAR = 16;

export interface ProgressionTemplate {
  mode: Mode;
  degrees: string[];
  /** Length of each chord in bars (default 1). */
  durations?: number[];
  weight: number;
}

export interface HarmonyProfile {
  modes: Partial<Record<Mode, number>>;
  progressions: ProgressionTemplate[];
  colors: Partial<Record<ColorToken, number>>;
  /** Chance that all chords share one color (more coherent sound). */
  colorConsistency?: number;
  /** Chance per chord to use an inversion that smooths the bass line. */
  inversions?: number;
  /** Chance per chord to swap in a chord with the same function. */
  substitution?: number;
  /** Chance that bars 5-8 end on a different chord (8-bar loops). */
  lift?: number;
  /** Chance to stretch a 4-bar template to 8 bars (2 bars per chord). */
  stretch?: number;
  /** Replacement options for the last chord in a lifted 8-bar loop. */
  liftMap?: Record<string, string[]>;
  /** Keep major chords free of dominant 7ths (maj7/m7 colors only). */
  noDominant7?: boolean;
}

export interface ChordSlot {
  chord: Chord;
  /** Start and length in 16th steps. */
  start: number;
  length: number;
}

const SUBSTITUTES: Record<Mode, Record<string, string[]>> = {
  major: { IV: ["ii"], ii: ["IV"], V: ["bVII"], vi: ["IV"] },
  minor: { VI: ["iv"], iv: ["VI"], VII: ["v"], v: ["VII"] },
};

const DEFAULT_LIFT: Record<Mode, Record<string, string[]>> = {
  major: { IV: ["iv"], V: ["IV", "bVII"], vi: ["IV"], I: ["IV"], iii: ["IV"] },
  minor: { VII: ["V", "VI"], VI: ["iv", "VII"], v: ["V"], i: ["VI"], III: ["VII"] },
};

function templatesFor(harmony: HarmonyProfile, mode: Mode): ProgressionTemplate[] {
  const own = harmony.progressions.filter((p) => p.mode === mode);
  const other = harmony.progressions
    .filter((p) => p.mode !== mode)
    .map((p) => ({
      ...p,
      mode,
      degrees: p.degrees.map((d) => romanToRelative(d, p.mode)),
      // Templates written for the other mode count a little less.
      weight: p.weight * (own.length ? 0.5 : 1),
    }));
  return [...own, ...other];
}

function pickColor(harmony: HarmonyProfile, rng: Rng): ColorToken {
  const entries = Object.entries(harmony.colors) as [ColorToken, number][];
  if (!entries.length) return "triad";
  return rng.weighted(entries, ([, w]) => w)[0];
}

export function chooseMode(harmony: HarmonyProfile, rng: Rng): Mode {
  const entries = Object.entries(harmony.modes) as [Mode, number][];
  if (!entries.length) return "minor";
  return rng.weighted(entries, ([, w]) => w)[0];
}

/** Degrees with lengths (in bars) filling exactly `bars` bars. */
export function planDegrees(
  harmony: HarmonyProfile,
  mode: Mode,
  bars: number,
  rng: Rng,
): { degrees: string[]; lengths: number[]; template: ProgressionTemplate } {
  const pool = templatesFor(harmony, mode).filter((t) => {
    const total = (t.durations ?? t.degrees.map(() => 1)).reduce((a, b) => a + b, 0);
    return total <= bars && bars % total === 0;
  });
  if (!pool.length) throw new Error("Keine passende Akkordfolge im Stil-Profil");
  const template = rng.weighted(pool, (t) => t.weight);
  let degrees = [...template.degrees];
  let lengths = template.durations ? [...template.durations] : degrees.map(() => 1);

  // Substitutions (never the first chord, never creating a repeat).
  const subs = SUBSTITUTES[mode];
  for (let i = 1; i < degrees.length; i++) {
    if (!rng.chance(harmony.substitution ?? 0)) continue;
    const options = subs[degrees[i]];
    if (!options) continue;
    const alt = rng.pick(options);
    if (alt === degrees[i - 1] || alt === degrees[(i + 1) % degrees.length]) continue;
    degrees[i] = alt;
  }

  let total = lengths.reduce((a, b) => a + b, 0);
  if (total * 2 === bars && rng.chance(harmony.stretch ?? 0)) {
    lengths = lengths.map((l) => l * 2);
    total *= 2;
  }
  // Repeat to fill the loop; the last repeat may "lift" its final chord.
  const reps = bars / total;
  const outDeg: string[] = [];
  const outLen: number[] = [];
  for (let r = 0; r < reps; r++) {
    const deg = [...degrees];
    if (r === reps - 1 && reps > 1 && rng.chance(harmony.lift ?? 0)) {
      const map = harmony.liftMap ?? DEFAULT_LIFT[mode];
      const last = deg[deg.length - 1];
      const options = map[last];
      if (options?.length) deg[deg.length - 1] = rng.pick(options);
    }
    outDeg.push(...deg);
    outLen.push(...lengths);
  }
  return { degrees: outDeg, lengths: outLen, template };
}

export function buildProgression(
  harmony: HarmonyProfile,
  key: Key,
  bars: number,
  rng: Rng,
): { slots: ChordSlot[]; template: ProgressionTemplate } {
  const plan = planDegrees(harmony, key.mode, bars, rng.fork("plan"));
  const colorRng = rng.fork("color");
  const consistent = colorRng.chance(harmony.colorConsistency ?? 0.5);
  const sharedColor = pickColor(harmony, colorRng);
  // One color per distinct degree keeps repeats identical.
  const colorByDegree = new Map<string, ColorToken>();
  const chords: Chord[] = plan.degrees.map((deg) => {
    if (!colorByDegree.has(deg)) {
      colorByDegree.set(deg, consistent ? sharedColor : pickColor(harmony, colorRng));
    }
    return buildChord(deg, key, colorByDegree.get(deg)!, { noDominant7: harmony.noDominant7 });
  });

  // Inversions that make the bass line move by step.
  const invRng = rng.fork("inv");
  for (let i = 1; i < chords.length; i++) {
    if (!invRng.chance(harmony.inversions ?? 0)) continue;
    const prevBass = chords[i - 1].bass;
    const roles = chordRoles(chords[i]);
    const options = [roles.third, roles.fifth].filter((x): x is number => x !== null);
    let best = chords[i].bass;
    let bestDist = stepDistance(prevBass, best);
    for (const o of options) {
      const d = stepDistance(prevBass, o);
      if (d > 0 && d < bestDist) {
        best = o;
        bestDist = d;
      }
    }
    if (best !== chords[i].bass && bestDist <= 2) chords[i] = withBass(chords[i], best, key);
  }

  const slots: ChordSlot[] = [];
  let pos = 0;
  chords.forEach((chord, i) => {
    const length = Math.round(plan.lengths[i] * STEPS_PER_BAR);
    slots.push({ chord, start: pos, length });
    pos += length;
  });
  return { slots, template: plan.template };
}

function stepDistance(a: number, b: number): number {
  const d = mod12(a - b);
  return Math.min(d, 12 - d);
}

export function slotAt(slots: readonly ChordSlot[], step: number): ChordSlot {
  for (const s of slots) if (step >= s.start && step < s.start + s.length) return s;
  return slots[slots.length - 1];
}

export function slotIndexAt(slots: readonly ChordSlot[], step: number): number {
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (step >= s.start && step < s.start + s.length) return i;
  }
  return slots.length - 1;
}
