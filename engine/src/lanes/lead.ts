// Lead melodies: short motifs that repeat and adapt to the chords,
// like a hook. Several modes cover the different artist styles.

import { ChordSlot, STEPS_PER_BAR, slotAt } from "../progression";
import { Rhythm, RhythmHit } from "../rhythm";
import { accent, clampVel } from "../groove";
import { Rng } from "../rng";
import {
  Chord,
  Key,
  PitchClass,
  chordPcs,
  chordRoles,
  mod12,
  nearestWithPc,
  pentatonicPcs,
  rubsSemitone,
  scalePcs,
} from "../theory";
import { LeadMode, Note } from "../types";

interface Ctx {
  slots: readonly ChordSlot[];
  key: Key;
  lo: number;
  hi: number;
  totalSteps: number;
  tensions: boolean;
}

/** Scale-degree space over a set of allowed pitch classes. */
class DegreeSpace {
  readonly steps: number[];
  readonly base: number;
  readonly dMin: number;
  readonly dMax: number;
  readonly allowed: PitchClass[];

  constructor(readonly key: Key, allowed: readonly PitchClass[], lo: number, hi: number) {
    this.steps = [...new Set(allowed.map((pc) => mod12(pc - key.tonic)))].sort((a, b) => a - b);
    this.allowed = this.steps.map((s) => mod12(key.tonic + s));
    this.base = lo - mod12(lo - key.tonic);
    let d = 0;
    while (this.toMidi(d) < lo) d++;
    this.dMin = d;
    while (this.toMidi(d + 1) <= hi) d++;
    this.dMax = d;
  }

  toMidi(d: number): number {
    const n = this.steps.length;
    const oct = Math.floor(d / n);
    const i = ((d % n) + n) % n;
    return this.base + oct * 12 + this.steps[i];
  }

  pc(d: number): PitchClass {
    return mod12(this.toMidi(d));
  }

  nearest(midi: number): number {
    let best = this.dMin;
    for (let d = this.dMin; d <= this.dMax; d++) {
      if (Math.abs(this.toMidi(d) - midi) < Math.abs(this.toMidi(best) - midi)) best = d;
    }
    return best;
  }

  clamp(d: number): number {
    let r = d;
    if (r < this.dMin) r = this.dMin + (this.dMin - r);
    if (r > this.dMax) r = this.dMax - (r - this.dMax);
    return Math.max(this.dMin, Math.min(this.dMax, r));
  }

  snap(d: number, pcs: readonly PitchClass[], preferUp: boolean): number {
    for (let k = 0; k <= this.steps.length + 1; k++) {
      const order = preferUp ? [d + k, d - k] : [d - k, d + k];
      for (const c of order) {
        if (c >= this.dMin && c <= this.dMax && pcs.includes(this.pc(c))) return c;
      }
    }
    return d;
  }
}

function corePcs(chord: Chord): PitchClass[] {
  const r = chordRoles(chord);
  return [r.root, r.third, r.fifth].filter((x): x is number => x !== null);
}

function targetPcs(chord: Chord, ctx: Ctx, allowed: readonly PitchClass[]): PitchClass[] {
  const core = corePcs(chord);
  const pcs = ctx.tensions ? [...core, ...chordRoles(chord).colors] : core;
  const inter = pcs.filter((pc) => allowed.includes(pc));
  return inter.length ? inter : pcs;
}

function stablePcs(chord: Chord, allowed: readonly PitchClass[]): PitchClass[] {
  const core = corePcs(chord);
  const inter = core.filter((pc) => allowed.includes(pc));
  return inter.length ? inter : core;
}

interface ContourOpts {
  /** Weights for step sizes 0, 1, 2, ... (in degrees). */
  weights: number[];
  upEarly: number;
  upLate: number;
  /** 0 = bottom of the range, 1 = top. */
  startBias: number;
}

function sampleIndex(rng: Rng, weights: readonly number[]): number {
  return rng.weighted(
    weights.map((w, i) => ({ w, i })),
    (x) => x.w,
  ).i;
}

function isStrong(h: RhythmHit): boolean {
  return h.step % 8 === 0 || h.len >= 4;
}

function avoidRub(d: number, chord: Chord, space: DegreeSpace): number {
  const all = chordPcs(chord);
  const pc = space.pc(d);
  if (all.includes(pc) || !rubsSemitone(pc, all)) return d;
  for (const c of [d + 1, d - 1]) {
    if (c < space.dMin || c > space.dMax) continue;
    const p = space.pc(c);
    if (all.includes(p) || !rubsSemitone(p, all)) return c;
  }
  return d;
}

function makeContour(
  hits: readonly RhythmHit[],
  ctx: Ctx,
  space: DegreeSpace,
  rng: Rng,
  opts: ContourOpts,
  start?: number,
): number[] {
  const out: number[] = [];
  let d = start ?? space.nearest(ctx.lo + (ctx.hi - ctx.lo) * opts.startBias);
  let lastMove = 0;
  hits.forEach((h, i) => {
    const chord = slotAt(ctx.slots, h.step).chord;
    if (i > 0) {
      const pos = hits.length > 1 ? i / (hits.length - 1) : 0;
      let size = sampleIndex(rng, opts.weights);
      let up = rng.chance(pos < 0.55 ? opts.upEarly : opts.upLate);
      if (Math.abs(lastMove) >= 3) {
        size = 1;
        up = lastMove < 0;
      }
      const move = size === 0 ? 0 : up ? size : -size;
      d = space.clamp(d + move);
      lastMove = move;
    }
    const last = i === hits.length - 1;
    if (last) d = space.snap(d, stablePcs(chord, space.allowed), lastMove >= 0);
    else if (isStrong(h) || i === 0) d = space.snap(d, targetPcs(chord, ctx, space.allowed), lastMove >= 0);
    else if (h.len >= 2) d = avoidRub(d, chord, space);
    out.push(d);
  });
  return out;
}

function refit(degrees: readonly number[], hits: readonly RhythmHit[], ctx: Ctx, space: DegreeSpace): number[] {
  return degrees.map((d0, i) => {
    const h = hits[i];
    const chord = slotAt(ctx.slots, h.step).chord;
    if (isStrong(h)) return space.snap(d0, targetPcs(chord, ctx, space.allowed), true);
    return avoidRub(d0, chord, space);
  });
}

function shift(hits: readonly RhythmHit[], offset: number): RhythmHit[] {
  return hits.map((h) => ({ ...h, step: h.step + offset }));
}

function toNotes(
  hits: readonly RhythmHit[],
  pitches: readonly number[],
  rng: Rng,
  gate = 1,
  baseVel = 92,
): Note[] {
  const notes: Note[] = [];
  hits.forEach((h, i) => {
    const next = hits[i + 1];
    const room = next ? next.step - h.step : h.len;
    const len = Math.max(0.5, Math.min(h.len, room) * gate);
    notes.push({
      pitch: pitches[i],
      start: h.step,
      len,
      vel: clampVel((h.vel ?? baseVel) + accent(h.step) + rng.int(-5, 5)),
    });
  });
  return notes;
}

type MotifMode = "topline" | "folk" | "brass-hook";

const MODE_OPTS: Record<MotifMode, ContourOpts> = {
  // Sung: mostly steps and repeated notes, phrases fall at the end.
  topline: { weights: [0.2, 0.52, 0.18, 0.06, 0.04], upEarly: 0.6, upLate: 0.3, startBias: 0.4 },
  folk: { weights: [0.22, 0.45, 0.25, 0.08], upEarly: 0.6, upLate: 0.4, startBias: 0.45 },
  // Short, punchy hook: repeats and small steps around the middle of the range.
  "brass-hook": { weights: [0.32, 0.42, 0.2, 0.06], upEarly: 0.5, upLate: 0.3, startBias: 0.55 },
};

/** Motif melody: phrase A repeats and adapts; 8-bar loops end on phrase B. */
function motifLead(ctx: Ctx, mode: MotifMode, rhythmA: Rhythm, rhythmB: Rhythm | null, rng: Rng): Note[] {
  const allowed = mode === "topline" ? scalePcs(ctx.key) : pentatonicPcs(ctx.key);
  const space = new DegreeSpace(ctx.key, allowed, ctx.lo, ctx.hi);
  const opts = MODE_OPTS[mode];
  const spanA = rhythmA.bars * STEPS_PER_BAR;
  const sections: ("A" | "B")[] = [];
  for (let off = 0; off < ctx.totalSteps; off += spanA) sections.push("A");
  const useB = rhythmB && rhythmB.bars === rhythmA.bars && ctx.totalSteps >= 8 * STEPS_PER_BAR;
  if (useB) sections[sections.length - 1] = "B";

  const baseHits = rhythmA.hits.filter((h) => h.step < spanA);
  const motif = makeContour(baseHits, ctx, space, rng, opts);
  const notes: Note[] = [];
  let lastDegree = motif[motif.length - 1];
  const gate = mode === "folk" ? 0.9 : mode === "brass-hook" ? 0.85 : 1;
  sections.forEach((sec, s) => {
    const offset = s * spanA;
    let hits: RhythmHit[];
    let degrees: number[];
    if (sec === "B" && rhythmB) {
      hits = shift(rhythmB.hits, offset);
      degrees = makeContour(hits, ctx, space, rng, { ...opts, upEarly: 0.4, upLate: 0.25 }, lastDegree);
    } else {
      hits = shift(baseHits, offset);
      degrees = s === 0 ? [...motif] : refit(motif, hits, ctx, space);
      const phraseEnd = (offset + spanA) % (4 * STEPS_PER_BAR) === 0;
      if (s > 0 && phraseEnd && hits.length > 2 && rng.chance(0.65)) {
        // New ending for this repeat (answer instead of question).
        const cut = Math.max(1, hits.length - 2);
        const tail = makeContour(hits.slice(cut - 1), ctx, space, rng, { ...opts, upEarly: 0.3, upLate: 0.2 }, degrees[cut - 1]);
        degrees = [...degrees.slice(0, cut), ...tail.slice(1)];
      }
    }
    lastDegree = degrees[degrees.length - 1];
    notes.push(...toNotes(hits, degrees.map((d) => space.toMidi(d)), rng, gate));
  });
  return notes;
}

/**
 * Notes that fit most chords of the loop, like the few pitches a sung phrase
 * is cut from. With tensions on, 7ths and 9ths count (Fred again.. loops sit on maj7 chords).
 */
function vocalPool(ctx: Ctx, rng: Rng, size: number): number[] {
  const scored = scalePcs(ctx.key)
    .map((pc) => {
      let s = 0;
      for (const slot of ctx.slots) {
        const pcs = ctx.tensions ? chordPcs(slot.chord) : corePcs(slot.chord);
        const w = slot.length / STEPS_PER_BAR;
        if (pcs.includes(pc)) s += w;
        else if (rubsSemitone(pc, chordPcs(slot.chord))) s -= 1.4 * w;
        else s += 0.3 * w;
      }
      s /= ctx.totalSteps / STEPS_PER_BAR;
      if (pc === ctx.key.tonic) s += 0.2;
      if (pc === mod12(ctx.key.tonic + 7)) s += 0.12;
      return { pc, s: s + rng.next() * 0.25 };
    })
    .sort((a, b) => b.s - a.s);
  const center = (ctx.lo + ctx.hi) / 2;
  const pitches = scored
    .slice(0, size)
    .map((x) => nearestWithPc(center, [x.pc], ctx.lo, ctx.hi))
    .filter((p): p is number => p !== null);
  return [...new Set(pitches)].sort((a, b) => a - b);
}

/** Pick a pool pitch that does not rub against the chord at this step. */
function fitToChord(pitch: number, step: number, pool: readonly number[], ctx: Ctx): number {
  const pcs = chordPcs(slotAt(ctx.slots, step).chord);
  if (pcs.includes(mod12(pitch)) || !rubsSemitone(mod12(pitch), pcs)) return pitch;
  const fits = pool.filter((p) => pcs.includes(mod12(p)) || !rubsSemitone(mod12(p), pcs));
  if (fits.length) return fits.reduce((a, b) => (Math.abs(b - pitch) < Math.abs(a - pitch) ? b : a));
  return nearestWithPc(pitch, pcs, ctx.lo, ctx.hi) ?? pitch;
}

/**
 * Fred again..-style vocal hook: slices of a sung phrase re-sequenced into a
 * 1-2 bar monophonic pattern with repeated syllables ("re-re-re"),
 * repeated as the hook and varied at phrase ends.
 */
function chopLead(ctx: Ctx, rhythm: Rhythm, rng: Rng, poolSize: number): Note[] {
  const pool = vocalPool(ctx, rng, poolSize);
  const span = rhythm.bars * STEPS_PER_BAR;
  const clampIdx = (i: number) => Math.max(0, Math.min(pool.length - 1, i));
  const motif: number[] = [];
  let cur = rng.int(0, pool.length - 1);
  rhythm.hits.forEach((h, i) => {
    if (i > 0) {
      const stutter = h.step - rhythm.hits[i - 1].step <= 1;
      if (!(stutter && rng.chance(0.85))) {
        const r = rng.next();
        if (r < 0.4) {
          // repeat the syllable
        } else if (r < 0.85) cur = clampIdx(cur + (rng.chance(0.5) ? 1 : -1));
        else cur = rng.pick([0, pool.length - 1]);
      }
    }
    motif.push(cur);
  });
  // Sometimes one slice is pitched up an octave, like a re-pitched sample.
  const jumpAt = rng.chance(0.3) && rhythm.hits.length > 3 ? rng.int(1, rhythm.hits.length - 1) : -1;

  const notes: Note[] = [];
  for (let offset = 0; offset < ctx.totalSteps; offset += span) {
    const phraseEnd = (offset + span) % (4 * STEPS_PER_BAR) === 0;
    const vary = offset > 0 && phraseEnd && rng.chance(0.7);
    const hits = shift(rhythm.hits, offset);
    const pitches = hits.map((h, i) => {
      let idx = motif[i];
      if (vary && i >= hits.length - 2) idx = clampIdx(idx + rng.pick([-1, 1, 1]));
      const pitch = pool[idx] + (i === jumpAt && pool[idx] + 12 <= ctx.hi + 5 ? 12 : 0);
      return fitToChord(pitch, h.step, pool, ctx);
    });
    const chunk = toNotes(hits, pitches, rng, 0.88, 96);
    // Phrase end: the last slice stutters as two 32nds ("re-re").
    const last = chunk[chunk.length - 1];
    if (vary && last && last.len >= 1) {
      chunk[chunk.length - 1] = { ...last, len: 0.45 };
      chunk.push({ ...last, start: last.start + 0.5, len: 0.45, vel: Math.max(1, last.vel - 8) });
    }
    notes.push(...chunk);
  }
  return notes;
}

const VOWEL_SHAPES = [
  [0, 0, 1, 0],
  [0, 1, 0, 2],
  [0, 0, 0, 1],
  [0, 1, 1, 0],
  [1, 0, 0, 0],
];

/**
 * Stutter-house vocal: a stretched, held vowel per chord, chopped by a rhythmic
 * 1/16 gate (the "stutter"), with an accelerating 32nd roll into the loop restart.
 * In MIDI the gate becomes repeated notes, which is how a vocal sampler plays it.
 */
function gatedVowelLead(ctx: Ctx, gate: Rhythm, rng: Rng): Note[] {
  const pool = vocalPool(ctx, rng, 3);
  // Order the pool from the top: the held vowel usually sits on the highest note.
  const ordered = [...pool].sort((a, b) => b - a);
  const shape = rng.pick(VOWEL_SHAPES);
  const span = gate.bars * STEPS_PER_BAR;
  const hits: RhythmHit[] = [];
  for (let off = 0; off < ctx.totalSteps; off += span) hits.push(...shift(gate.hits, off));
  // Leave the last beat for the roll.
  const rollStart = ctx.totalSteps - 4;
  const notes: Note[] = [];
  const segmentPitch = new Map<number, number>();
  ctx.slots.forEach((slot, i) => {
    const want = ordered[Math.min(ordered.length - 1, shape[i % shape.length])];
    segmentPitch.set(slot.start, fitToChord(want, slot.start, pool, ctx));
  });
  const pitchAt = (step: number) => {
    const slot = slotAt(ctx.slots, step);
    return segmentPitch.get(slot.start) ?? ordered[0];
  };
  for (const h of hits) {
    if (h.step >= rollStart) break;
    const end = Math.min(h.step + h.len, rollStart);
    // Short hits are the gate: about half of each 16th is silent, held vowels stay legato.
    const len = end - h.step <= 1 ? 0.55 : Math.max(0.4, (end - h.step) * 0.92);
    notes.push({
      pitch: pitchAt(h.step),
      start: h.step,
      len,
      vel: clampVel((h.vel ?? 96) + accent(h.step) + rng.int(-4, 4)),
    });
  }
  // Accelerating roll: 16ths, then 32nds, getting louder.
  const rollPitch = pitchAt(rollStart);
  const roll = [0, 1, 2, 2.5, 3, 3.5];
  roll.forEach((r, i) => {
    notes.push({
      pitch: rollPitch,
      start: rollStart + r,
      len: r < 2 ? 0.55 : 0.3,
      vel: clampVel(80 + i * 6),
    });
  });
  return notes;
}

export function leadLane(
  slots: readonly ChordSlot[],
  key: Key,
  mode: LeadMode,
  range: [number, number],
  tensions: boolean,
  rhythm: Rhythm,
  rhythmB: Rhythm | null,
  totalSteps: number,
  rng: Rng,
): Note[] {
  const ctx: Ctx = { slots, key, lo: range[0], hi: range[1], totalSteps, tensions };
  switch (mode) {
    case "vocal-chop":
      return chopLead(ctx, rhythm, rng, rng.chance(0.5) ? 3 : 4);
    case "gated-vowel":
      return gatedVowelLead(ctx, rhythm, rng);
    case "topline":
    case "folk":
    case "brass-hook":
      return motifLead(ctx, mode, rhythm, rhythmB, rng);
  }
}
