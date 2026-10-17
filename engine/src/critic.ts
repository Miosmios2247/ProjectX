// "Musik-Kritiker": scores a melody against what a style wants (range, number
// of pitches, steps vs leaps, syncopation, repetition, chord tones on strong
// beats). Lanes generate several candidates and keep the best one.

import { ChordSlot, STEPS_PER_BAR, chordSlotForNote } from "./progression";
import { chordPcs, chordRoles, isAvoidNote, mod12 } from "./theory";
import { Note } from "./types";

export interface MelodyTargets {
  /** Distinct pitches in the hook (min, max). */
  pitches: [number, number];
  /** Largest span in semitones. */
  range: number;
  /** Smallest span worth having (a hook that never moves gets dull). */
  rangeMin?: number;
  /** Share of moves that are repeats or steps (≤ 2 semitones). */
  steps: number;
  /** Share of onsets on off-beat 16ths. */
  sync: number;
  /** How much later phrases repeat the first one (0..1). */
  repeat: number;
  /** Share of strong-beat notes on chord tones. */
  chordTones: number;
  /**
   * Band for the share of ALL notes on chord tones. Fred again..'s hooks keep a
   * fixed pitch set that the chords recolour: only 35–55 % chord tones.
   */
  chordShare?: [number, number];
  /**
   * A held pedal (BUNT.'s vowel) may end the loop on a colour such as the 9th
   * over VII: it is a chord tone again when the loop starts over.
   */
  pedalEnd?: boolean;
}

export interface MelodyReport {
  penalty: number;
  pitches: number;
  range: number;
  steps: number;
  sync: number;
  repeat: number;
  chordTones: number;
  chordShare: number;
}

const isStrongStep = (start: number) => Math.abs(start - Math.round(start)) < 0.01 && Math.round(start) % 4 === 0;
const isOffbeat16 = (start: number) => Math.abs(start - Math.round(start)) < 0.01 && Math.round(start) % 2 === 1;

/** Similarity (0..1) of two phrases: onset rhythm and up/down contour. */
function phraseSimilarity(a: readonly Note[], b: readonly Note[], offsetA: number, offsetB: number): number {
  if (!a.length || !b.length) return 0;
  const onA = new Set(a.map((n) => Math.round((n.start - offsetA) * 2)));
  const onB = new Set(b.map((n) => Math.round((n.start - offsetB) * 2)));
  let inter = 0;
  for (const x of onA) if (onB.has(x)) inter++;
  const rhythm = inter / (onA.size + onB.size - inter);
  const dir = (ns: readonly Note[]) => ns.slice(1).map((n, i) => Math.sign(n.pitch - ns[i].pitch));
  const da = dir(a);
  const db = dir(b);
  const len = Math.min(da.length, db.length);
  let same = 0;
  for (let i = 0; i < len; i++) if (da[i] === db[i]) same++;
  const contour = len ? same / Math.max(da.length, db.length) : rhythm;
  return 0.5 * rhythm + 0.5 * contour;
}

export function scoreMelody(
  notes: readonly Note[],
  slots: readonly ChordSlot[],
  targets: MelodyTargets,
  phraseSteps: number,
  totalSteps: number,
): MelodyReport {
  const sorted = [...notes].sort((a, b) => a.start - b.start);
  if (!sorted.length) {
    return { penalty: 1000, pitches: 0, range: 0, steps: 0, sync: 0, repeat: 0, chordTones: 0, chordShare: 0 };
  }
  const pitches = new Set(sorted.map((n) => n.pitch)).size;
  const lo = Math.min(...sorted.map((n) => n.pitch));
  const hi = Math.max(...sorted.map((n) => n.pitch));
  const range = hi - lo;

  let stepMoves = 0;
  let moves = 0;
  let bigLeaps = 0;
  let unrecovered = 0;
  for (let i = 1; i < sorted.length; i++) {
    const iv = sorted[i].pitch - sorted[i - 1].pitch;
    if (sorted[i].start - sorted[i - 1].start > 8) continue; // a new phrase may jump
    moves++;
    if (Math.abs(iv) <= 2) stepMoves++;
    if (Math.abs(iv) > 7 && Math.abs(iv) !== 12) bigLeaps++;
    // A leap of a 4th or more should turn back by step.
    const next = sorted[i + 1];
    if (Math.abs(iv) >= 5 && next) {
      const back = next.pitch - sorted[i].pitch;
      if (Math.sign(back) === Math.sign(iv) || Math.abs(back) > 4) unrecovered++;
    }
  }
  const steps = moves ? stepMoves / moves : 1;
  const sync = sorted.filter((n) => isOffbeat16(n.start)).length / sorted.length;

  let strong = 0;
  let strongChord = 0;
  let rubs = 0;
  let inChord = 0;
  for (const n of sorted) {
    const slot = chordSlotForNote(slots, n.start, n.len);
    const pcs = chordPcs(slot.chord);
    const pc = mod12(n.pitch);
    if (pcs.includes(pc)) inChord++;
    if (isStrongStep(n.start) || n.len >= 4) {
      strong++;
      const roles = chordRoles(slot.chord);
      const core = [roles.root, roles.third, roles.fifth, ...roles.colors].filter((x) => x !== null);
      if (core.includes(pc)) strongChord++;
    }
    if (n.len >= 2 && isAvoidNote(pc, pcs)) rubs++;
  }
  const chordTones = strong ? strongChord / strong : 1;
  const chordShare = inChord / sorted.length;

  // Repetition: compare every phrase with the first one.
  const phrases: Note[][] = [];
  for (let off = 0; off < totalSteps; off += phraseSteps) {
    phrases.push(sorted.filter((n) => n.start >= off && n.start < off + phraseSteps));
  }
  let repeat = 1;
  if (phrases.length > 1) {
    let sum = 0;
    for (let k = 1; k < phrases.length; k++) sum += phraseSimilarity(phrases[0], phrases[k], 0, k * phraseSteps);
    repeat = sum / (phrases.length - 1);
  }

  // The loop should end on a stable tone (root, 3rd or 5th of its chord).
  const last = sorted[sorted.length - 1];
  const lastRoles = chordRoles(chordSlotForNote(slots, last.start, last.len).chord);
  const lastPcs = chordPcs(chordSlotForNote(slots, last.start, last.len).chord);
  const stableEnd =
    [lastRoles.root, lastRoles.third, lastRoles.fifth].includes(mod12(last.pitch)) ||
    (!!targets.pedalEnd && !isAvoidNote(mod12(last.pitch), lastPcs));

  const [pMin, pMax] = targets.pitches;
  let penalty = 0;
  penalty += pitches < pMin ? (pMin - pitches) * 3 : pitches > pMax ? (pitches - pMax) * 3 : 0;
  penalty += Math.max(0, range - targets.range) * 1.5;
  if (targets.rangeMin) penalty += Math.max(0, targets.rangeMin - range) * 0.8;
  penalty += Math.max(0, targets.steps - steps) * 12;
  penalty += Math.abs(sync - targets.sync) * 6;
  penalty += Math.abs(repeat - targets.repeat) * 10;
  penalty += Math.max(0, targets.chordTones - chordTones) * 20;
  if (targets.chordShare) {
    const [lo, hi] = targets.chordShare;
    penalty += Math.max(0, lo - chordShare) * 15 + Math.max(0, chordShare - hi) * 15;
  }
  penalty += bigLeaps * 2 + unrecovered * 1.5 + rubs * 3;
  // A recoloured fixed hook may end on a colour tone; others should land on a stable one.
  if (!stableEnd && !targets.chordShare) penalty += 4;
  return { penalty, pitches, range, steps, sync, repeat, chordTones, chordShare };
}

/** Bars per phrase for the repetition check. */
export function phraseStepsFor(rhythmBars: number, totalSteps: number): number {
  return Math.min(totalSteps, Math.max(1, rhythmBars) * STEPS_PER_BAR);
}
