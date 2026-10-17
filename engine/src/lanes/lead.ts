// Lead melodies: short motifs that repeat and adapt to the chords,
// like a hook. Several modes cover the different artist styles.
// Phrases come in calls and answers; every mode makes several candidates
// and the critic keeps the one that fits the style best.

import { ChordSlot, STEPS_PER_BAR, chordSlotForNote, slotAt } from "../progression";
import { MelodyTargets, phraseStepsFor, scoreMelody } from "../critic";
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

type Ending = "open" | "closed";

/** Chord of a hit; a hit just before a change that rings into it takes the next chord. */
function chordOf(ctx: Ctx, h: RhythmHit): Chord {
  return chordSlotForNote(ctx.slots, h.step, h.len).chord;
}

/** Phrase endings: a call stays open (3rd/5th, upwards), an answer comes home (root/3rd, downwards). */
function endingPcs(chord: Chord, ending: Ending, allowed: readonly PitchClass[]): PitchClass[] {
  const r = chordRoles(chord);
  const want = (ending === "open" ? [r.fifth, r.third] : [r.root, r.third]).filter((x): x is number => x !== null);
  const inter = want.filter((pc) => allowed.includes(pc));
  return inter.length ? inter : stablePcs(chord, allowed);
}

function makeContour(
  hits: readonly RhythmHit[],
  ctx: Ctx,
  space: DegreeSpace,
  rng: Rng,
  opts: ContourOpts,
  start?: number,
  ending?: Ending,
): number[] {
  const out: number[] = [];
  let d = start ?? space.nearest(ctx.lo + (ctx.hi - ctx.lo) * opts.startBias);
  let lastMove = 0;
  hits.forEach((h, i) => {
    const chord = chordOf(ctx, h);
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
    if (last && ending) d = space.snap(d, endingPcs(chord, ending, space.allowed), ending === "open");
    else if (last) d = space.snap(d, stablePcs(chord, space.allowed), lastMove >= 0);
    else if (isStrong(h) || i === 0) d = space.snap(d, targetPcs(chord, ctx, space.allowed), lastMove >= 0);
    else if (h.len >= 2) d = avoidRub(d, chord, space);
    out.push(d);
  });
  return out;
}

function refit(degrees: readonly number[], hits: readonly RhythmHit[], ctx: Ctx, space: DegreeSpace): number[] {
  return degrees.map((d0, i) => {
    const h = hits[i];
    const chord = chordOf(ctx, h);
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

// Phrase forms: A = the motif, A' = the motif with a new ending, B/C = new
// phrases (answers). Calls end open, answers come home.
const FORMS: Record<MotifMode, string[][]> = {
  topline: [["A", "B", "A", "B'"], ["A", "A'", "A", "B"], ["A", "B", "A", "C"]],
  "brass-hook": [["A", "A'", "A", "B"], ["A", "B", "A", "B'"], ["A", "A", "A", "A'"]],
  folk: [["A", "A", "B", "A'"], ["A", "B", "A", "B'"]],
};

let lastForm = "";

/** Motif melody built from a phrase form (call and answer), adapted to the chords. */
function motifLead(ctx: Ctx, mode: MotifMode, rhythmA: Rhythm, rhythmB: Rhythm | null, rng: Rng): Note[] {
  const allowed = mode === "topline" ? scalePcs(ctx.key) : pentatonicPcs(ctx.key);
  const space = new DegreeSpace(ctx.key, allowed, ctx.lo, ctx.hi);
  const opts = MODE_OPTS[mode];
  const spanA = rhythmA.bars * STEPS_PER_BAR;
  const count = Math.max(1, Math.round(ctx.totalSteps / spanA));
  const form = rng.pick(FORMS[mode]);
  // Long loops repeat the form; the very last phrase always answers.
  const letters = Array.from({ length: count }, (_, k) => form[k % form.length]);
  if (count === 2) letters[1] = rng.chance(0.5) ? "B" : "A'";
  if (count > 1 && letters[count - 1] === "A") letters[count - 1] = "A'";
  lastForm = letters.slice(0, 4).join(" ");
  const sameBars = rhythmB && rhythmB.bars === rhythmA.bars;

  const baseHits = rhythmA.hits.filter((h) => h.step < spanA);
  const motif = makeContour(baseHits, ctx, space, rng, opts, undefined, count > 1 ? "open" : "closed");
  const made = new Map<string, number[]>();
  const notes: Note[] = [];
  let lastDegree = motif[motif.length - 1];
  const gate = mode === "folk" ? 0.9 : mode === "brass-hook" ? 0.85 : 1;
  letters.forEach((letter, k) => {
    const offset = k * spanA;
    const ending: Ending = k % 2 === 0 && k < count - 1 ? "open" : "closed";
    const base = letter[0];
    let hits: RhythmHit[];
    let degrees: number[];
    if (base === "A") {
      hits = shift(baseHits, offset);
      degrees = k === 0 ? [...motif] : refit(motif, hits, ctx, space);
      if (letter.endsWith("'") && hits.length > 2) {
        // Same start, new ending (the answer to the call).
        const cut = Math.max(1, hits.length - 2);
        const tail = makeContour(hits.slice(cut - 1), ctx, space, rng, { ...opts, upEarly: 0.3, upLate: 0.2 }, degrees[cut - 1], ending);
        degrees = [...degrees.slice(0, cut), ...tail.slice(1)];
      }
    } else {
      // A new phrase: the B rhythm when it fits, otherwise the motif's rhythm.
      const src = sameBars && rhythmB ? rhythmB.hits.filter((h) => h.step < spanA) : baseHits;
      hits = shift(src, offset);
      const known = made.get(base);
      if (known && !letter.endsWith("'")) degrees = refit(known, hits, ctx, space);
      else {
        degrees = makeContour(hits, ctx, space, rng, { ...opts, upEarly: 0.45, upLate: 0.25 }, lastDegree, ending);
        if (!known) made.set(base, degrees);
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

/** Pick a pool pitch that does not rub against the chord of this hit. */
function fitToChord(pitch: number, h: RhythmHit, pool: readonly number[], ctx: Ctx): number {
  const pcs = chordPcs(chordOf(ctx, h));
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
/** Chord tones (with tensions when allowed) inside the range, low to high. */
function chordLadder(chord: Chord, ctx: Ctx): number[] {
  const r = chordRoles(chord);
  const pcs = [r.root, r.third, r.fifth, ...(ctx.tensions ? r.colors : [])].filter((x): x is number => x !== null);
  const out: number[] = [];
  for (let m = ctx.lo; m <= ctx.hi; m++) if (pcs.includes(mod12(m))) out.push(m);
  return out;
}

/**
 * Chops re-pitched with the chords, like a sampler following the harmony:
 * the cell keeps its shape on each chord's tones, voice-led to the nearest position.
 */
function chordChopLead(ctx: Ctx, rhythm: Rhythm, rng: Rng): Note[] {
  const span = rhythm.bars * STEPS_PER_BAR;
  // Cell: positions on the chord-tone ladder relative to a home tone.
  const cell: number[] = [];
  let cur = 0;
  rhythm.hits.forEach((h, i) => {
    if (i > 0) {
      const stutter = h.step - rhythm.hits[i - 1].step <= 1;
      if (!(stutter && rng.chance(0.85))) {
        const r = rng.next();
        if (r < 0.4) {
          // same syllable
        } else if (r < 0.85) cur = Math.max(-1, Math.min(2, cur + (rng.chance(0.55) ? 1 : -1)));
        else cur = rng.pick([-1, 2]);
      }
    }
    cell.push(cur);
  });
  let home = Math.round((ctx.lo + ctx.hi) / 2);
  const notes: Note[] = [];
  for (let offset = 0; offset < ctx.totalSteps; offset += span) {
    const phraseEnd = (offset + span) % (4 * STEPS_PER_BAR) === 0;
    const vary = offset > 0 && phraseEnd && rng.chance(0.6);
    const hits = shift(rhythm.hits, offset);
    const pitches = hits.map((h, i) => {
      const ladder = chordLadder(chordOf(ctx, h), ctx);
      if (!ladder.length) return home;
      let base = 0;
      for (let k = 1; k < ladder.length; k++) if (Math.abs(ladder[k] - home) < Math.abs(ladder[base] - home)) base = k;
      let idx = base + cell[i] + (vary && i >= hits.length - 2 ? rng.pick([-1, 1]) : 0);
      idx = Math.max(0, Math.min(ladder.length - 1, idx));
      if (i === 0) home = ladder[base];
      return ladder[idx];
    });
    const chunk = toNotes(hits, pitches, rng, 0.88, 96);
    const last = chunk[chunk.length - 1];
    if (vary && last && last.len >= 1) {
      chunk[chunk.length - 1] = { ...last, len: 0.45 };
      chunk.push({ ...last, start: last.start + 0.5, len: 0.45, vel: Math.max(1, last.vel - 8) });
    }
    notes.push(...chunk);
  }
  return notes;
}

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
      return fitToChord(pitch, h, pool, ctx);
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

/**
 * Stutter-house vocal: a stretched, held vowel per chord, chopped by a rhythmic
 * 1/16 gate (the "stutter"), with an accelerating 32nd roll into the loop restart.
 * In MIDI the gate becomes repeated notes, which is how a vocal sampler plays it.
 */
/**
 * The held vowel's pitch for each chord: a smooth path through the chord tones
 * that keeps common tones (like one stretched word over the whole loop) and
 * moves by small steps otherwise.
 */
function vowelPath(ctx: Ctx, rng: Rng): number[] {
  const target = ctx.lo + (ctx.hi - ctx.lo) * (0.55 + rng.next() * 0.25);
  const options = ctx.slots.map((slot) => {
    const r = chordRoles(slot.chord);
    const out: { pitch: number; cost: number }[] = [];
    for (let m = ctx.lo; m <= ctx.hi; m++) {
      const pc = mod12(m);
      let cost: number | null = null;
      if (pc === r.third || pc === r.fifth) cost = 0;
      else if (pc === r.root) cost = 0.6;
      else if (ctx.tensions && r.colors.includes(pc)) cost = 1.2;
      if (cost === null) continue;
      out.push({ pitch: m, cost: cost + Math.abs(m - target) * 0.12 + rng.next() * 0.6 });
    }
    return out.length ? out : [{ pitch: Math.round(target), cost: 0 }];
  });
  // Viterbi: cheapest path, moving costs by distance (0 for a held common tone).
  const best: { cost: number; from: number }[][] = [options[0].map((o) => ({ cost: o.cost, from: -1 }))];
  for (let i = 1; i < options.length; i++) {
    best.push(
      options[i].map((o) => {
        let min = Infinity;
        let from = 0;
        options[i - 1].forEach((p, j) => {
          const move = Math.abs(o.pitch - p.pitch);
          const c = best[i - 1][j].cost + move * 0.5 + (move > 4 ? 3 : 0);
          if (c < min) {
            min = c;
            from = j;
          }
        });
        return { cost: min + o.cost, from };
      }),
    );
  }
  let j = 0;
  const lastRow = best[best.length - 1];
  for (let k = 1; k < lastRow.length; k++) if (lastRow[k].cost < lastRow[j].cost) j = k;
  const path: number[] = [];
  for (let i = options.length - 1; i >= 0; i--) {
    path.unshift(options[i][j].pitch);
    j = best[i][j].from;
  }
  return path;
}

function gatedVowelLead(ctx: Ctx, gate: Rhythm, rng: Rng): Note[] {
  const path = vowelPath(ctx, rng);
  const span = gate.bars * STEPS_PER_BAR;
  const hits: RhythmHit[] = [];
  for (let off = 0; off < ctx.totalSteps; off += span) hits.push(...shift(gate.hits, off));
  // Leave the last beat for the roll.
  const rollStart = ctx.totalSteps - 4;
  const notes: Note[] = [];
  const segmentPitch = new Map<number, number>();
  ctx.slots.forEach((slot, i) => segmentPitch.set(slot.start, path[i]));
  const pitchAt = (step: number, len = 1) => {
    const slot = chordSlotForNote(ctx.slots, step, len);
    return segmentPitch.get(slot.start) ?? path[0];
  };
  hits.forEach((h, i) => {
    if (h.step >= rollStart) return;
    const end = Math.min(h.step + h.len, rollStart);
    // Short hits are the gate: open for about half the time until the next hit
    // (half a 16th, or half an 8th in sparser patterns); held vowels stay legato.
    const gap = Math.min(2, (hits[i + 1]?.step ?? rollStart) - h.step);
    const len = end - h.step <= 1 ? 0.55 * Math.max(1, gap) : Math.max(0.4, (end - h.step) * 0.92);
    notes.push({
      pitch: pitchAt(h.step, len),
      start: h.step,
      len,
      vel: clampVel((h.vel ?? 96) + accent(h.step) + rng.int(-4, 4)),
    });
  });
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

/** What the critic aims for in each mode (styles can override parts). */
export const LEAD_TARGETS: Record<LeadMode, MelodyTargets> = {
  // Fred again..: 2–4 pitches, small range, syncopated syllables, strong repetition.
  "vocal-chop": { pitches: [2, 4], range: 9, steps: 0.6, sync: 0.4, repeat: 0.8, chordTones: 0.8 },
  // BUNT.: one held vowel per chord, gated; almost no melody.
  "gated-vowel": { pitches: [1, 3], range: 7, steps: 0.95, sync: 0.35, repeat: 0.85, chordTones: 0.95 },
  // AVAION: a singable line, mostly steps, phrases that answer each other.
  topline: { pitches: [4, 8], range: 12, steps: 0.65, sync: 0.3, repeat: 0.55, chordTones: 0.75 },
  "brass-hook": { pitches: [3, 6], range: 10, steps: 0.55, sync: 0.4, repeat: 0.7, chordTones: 0.8 },
  folk: { pitches: [4, 7], range: 12, steps: 0.55, sync: 0.25, repeat: 0.65, chordTones: 0.8 },
};

const CANDIDATES = 10;

export interface LeadResult {
  notes: Note[];
  /** How the hook was built: "fixed" pitches, "chords" (follows them), "vowel", or the phrase form. */
  build: string;
}

function generateOnce(ctx: Ctx, mode: LeadMode, rhythm: Rhythm, rhythmB: Rhythm | null, rng: Rng, k: number): LeadResult {
  switch (mode) {
    case "vocal-chop":
      // Half the candidates keep a few fixed pitches, half follow the chords.
      return k % 2 === 0
        ? { notes: chopLead(ctx, rhythm, rng, rng.chance(0.5) ? 3 : 4), build: "fixed" }
        : { notes: chordChopLead(ctx, rhythm, rng), build: "chords" };
    case "gated-vowel":
      return { notes: gatedVowelLead(ctx, rhythm, rng), build: "vowel" };
    case "topline":
    case "folk":
    case "brass-hook": {
      const notes = motifLead(ctx, mode, rhythm, rhythmB, rng);
      return { notes, build: lastForm };
    }
  }
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
  targets: Partial<MelodyTargets> = {},
): LeadResult {
  const ctx: Ctx = { slots, key, lo: range[0], hi: range[1], totalSteps, tensions };
  const want: MelodyTargets = { ...LEAD_TARGETS[mode], ...targets };
  const phrase = phraseStepsFor(rhythm.bars, totalSteps);
  let best: LeadResult = { notes: [], build: "" };
  let bestPenalty = Infinity;
  for (let k = 0; k < CANDIDATES; k++) {
    const cand = generateOnce(ctx, mode, rhythm, rhythmB, rng.fork(`cand${k}`), k);
    const { penalty } = scoreMelody(cand.notes, slots, want, phrase, totalSteps);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      best = cand;
    }
  }
  return best;
}
