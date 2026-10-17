// Lead melodies: short motifs that repeat and adapt to the chords,
// like a hook. Several modes cover the different artist styles.
// Phrases come in calls and answers; every mode makes several candidates
// and the critic keeps the one that fits the style best.

import { ChordSlot, STEPS_PER_BAR, chordSlotForNote, loopTones, slotAt, universalPcs } from "../progression";
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
  isAvoidNote,
  scalePcs,
} from "../theory";
import { LeadMode, Note } from "../types";

interface Ctx {
  slots: readonly ChordSlot[];
  key: Key;
  /** Tonal centre of the loop: the key's tonic, or the relative one for a borrowed template. */
  home: PitchClass;
  /** Scale tones that fit every chord of the loop (never an avoid note). */
  universal: PitchClass[];
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
  if (!isAvoidNote(pc, all)) return d;
  for (const c of [d + 1, d - 1]) {
    if (c < space.dMin || c > space.dMax) continue;
    const p = space.pc(c);
    if (!isAvoidNote(p, all)) return c;
  }
  return d;
}

type Ending = "open" | "closed";

/** Chord of a hit; a hit just before a change that rings into it takes the next chord. */
function chordOf(ctx: Ctx, h: RhythmHit): Chord {
  return chordSlotForNote(ctx.slots, h.step, h.len).chord;
}

/**
 * Phrase endings: a call stays open, an answer comes home. Both land on a chord
 * tone that fits every chord of the loop, because a last note rings on. Answers
 * prefer the loop's tonic or 5th, calls its 5th, 3rd or 2nd. In a major loop
 * with V (AVAION's "Pieces") the tonic would clash over V, so it drops out.
 */
function endingPcs(ctx: Ctx, chord: Chord, ending: Ending, allowed: readonly PitchClass[]): PitchClass[] {
  const r = chordRoles(chord);
  const tones = corePcs(chord).filter((pc) => allowed.includes(pc) && ctx.universal.includes(pc));
  const homeMinor = (ctx.home === ctx.key.tonic) === (ctx.key.mode === "minor");
  const fifth = mod12(ctx.home + 7);
  const third = mod12(ctx.home + (homeMinor ? 3 : 4));
  const pick = (pcs: (PitchClass | null)[]) => pcs.filter((pc): pc is number => pc !== null && tones.includes(pc));
  const home = ending === "closed" ? pick([ctx.home, fifth]) : pick([fifth, third, mod12(ctx.home + 2)]);
  if (home.length) return home;
  const near = pick(ending === "open" ? [r.fifth, r.third] : [r.root, r.third]);
  if (near.length) return near;
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
      // Leap recovery as a pull back to the phrase's middle: after a leap of a 4th
      // or more, or when the line has wandered more than a 4th away, it usually
      // turns back, mostly by step.
      const cur = space.toMidi(d);
      const sorted = out.map((x) => space.toMidi(x)).sort((a, b) => a - b);
      const med = sorted[Math.floor(sorted.length / 2)];
      const leapt = Math.abs(cur - space.toMidi(d - lastMove)) >= 5;
      if ((leapt || Math.abs(cur - med) > 5) && rng.chance(0.78)) {
        up = cur < med;
        if (rng.chance(0.6)) size = Math.min(size, 1);
      }
      const move = size === 0 ? 0 : up ? size : -size;
      d = space.clamp(d + move);
      lastMove = move;
    }
    const last = i === hits.length - 1;
    if (last && ending) d = space.snap(d, endingPcs(ctx, chord, ending, space.allowed), ending === "open");
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
  // Sung: mostly steps and repeated notes, phrases fall at the end. AVAION sings high.
  topline: { weights: [0.2, 0.52, 0.18, 0.06, 0.04], upEarly: 0.6, upLate: 0.3, startBias: 0.5 },
  folk: { weights: [0.24, 0.5, 0.2, 0.06], upEarly: 0.6, upLate: 0.4, startBias: 0.45 },
  // Short, punchy hook: repeats and small steps around the middle of the range.
  "brass-hook": { weights: [0.32, 0.42, 0.2, 0.06], upEarly: 0.5, upLate: 0.3, startBias: 0.55 },
};

// Phrase forms: A = the motif, A' = the motif with a new ending, B/C = new
// phrases (answers). Calls end open, answers come home.
const FORMS: Record<MotifMode, string[][]> = {
  topline: [["A", "B", "A", "B'"], ["A", "A'", "A", "B"], ["A", "B", "A", "C"]],
  // A drop riff that loops and changes only its ending ("WACUKA").
  "brass-hook": [["A", "A'", "A", "A'"], ["A", "A", "A", "A'"], ["A", "A'", "A", "B"]],
  folk: [["A", "A", "B", "A'"], ["A", "B", "A", "B'"]],
};

// How often a phrase gets 1–3 pickup notes into its first downbeat.
const PICKUP: Record<MotifMode, number> = { topline: 0.4, folk: 0.3, "brass-hook": 0.25 };

let lastForm = "";
let lastPickups = 0;

/**
 * Pickup notes before a phrase: one 8th, two 8ths or three 16ths that walk by
 * step into the phrase's first note (from below more often than from above).
 */
function pickupInto(target: number, at: number, ctx: Ctx, space: DegreeSpace, rng: Rng): { hits: RhythmHit[]; degrees: number[] } {
  const n = rng.weighted([{ n: 1, w: 0.45 }, { n: 2, w: 0.35 }, { n: 3, w: 0.2 }], (x) => x.w).n;
  const steps = n === 1 ? [at - 2] : n === 2 ? [at - 4, at - 2] : [at - 3, at - 2, at - 1];
  const len = n === 3 ? 1 : 2;
  const dir = rng.chance(0.65) ? -1 : 1;
  const hits = steps.map((step) => ({ step, len, vel: 82 }));
  const degrees = steps.map((_, i) => {
    const d = space.clamp(target + dir * (n - i));
    return avoidRub(d, chordOf(ctx, hits[i]), space);
  });
  return { hits, degrees };
}

/** Motif melody built from a phrase form (call and answer), adapted to the chords. */
function motifLead(ctx: Ctx, mode: MotifMode, rhythmA: Rhythm, rhythmB: Rhythm | null, rng: Rng): Note[] {
  // WACUKA's lead lives on the tones that fit every chord (A B D E G over F–G–Dm–Am);
  // folk riffs keep the major pentatonic, minus a tone that would clash.
  const pent = pentatonicPcs(ctx.key);
  const pentU = pent.filter((pc) => ctx.universal.includes(pc));
  const allowed =
    mode === "topline"
      ? scalePcs(ctx.key)
      : mode === "brass-hook"
        ? ctx.universal.length >= 4 ? ctx.universal : pent
        : pentU.length >= 4 ? pentU : pent;
  const space = new DegreeSpace(ctx.key, allowed, ctx.lo, ctx.hi);
  const opts = MODE_OPTS[mode];
  const spanA = rhythmA.bars * STEPS_PER_BAR;
  const count = Math.max(1, Math.round(ctx.totalSteps / spanA));
  const form = rng.pick(FORMS[mode]);
  // Long loops repeat the form; the very last phrase always answers.
  const letters = Array.from({ length: count }, (_, k) => form[k % form.length]);
  if (count === 2) letters[1] = rng.chance(mode === "brass-hook" ? 0.25 : 0.5) ? "B" : "A'";
  if (count > 1 && letters[count - 1] === "A") letters[count - 1] = "A'";
  lastForm = letters.slice(0, 4).join(" ");
  const sameBars = rhythmB && rhythmB.bars === rhythmA.bars;

  const baseHits = rhythmA.hits.filter((h) => h.step < spanA);
  // The drop riff starts at home (the tonic, sometimes the 5th).
  const mid = (ctx.lo + ctx.hi) / 2;
  const homePc = rng.chance(0.7) ? ctx.home : mod12(ctx.home + 7);
  const homeStart = mode === "brass-hook" && allowed.includes(homePc) ? nearestWithPc(mid, [homePc], ctx.lo, ctx.hi) : null;
  const motif = makeContour(baseHits, ctx, space, rng, opts, homeStart === null ? undefined : space.nearest(homeStart), count > 1 ? "open" : "closed");
  const made = new Map<string, number[]>();
  const phrases: { hits: RhythmHit[]; degrees: number[] }[] = [];
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
    phrases.push({ hits, degrees });
  });

  // Pickups into later phrases, where the previous phrase leaves room.
  lastPickups = 0;
  for (let k = 1; k < phrases.length; k++) {
    const next = phrases[k];
    const at = k * spanA;
    if (!next.hits.length || next.hits[0].step !== at || !rng.chance(PICKUP[mode])) continue;
    const pick = pickupInto(next.degrees[0], at, ctx, space, rng);
    const prev = phrases[k - 1];
    const from = pick.hits[0].step;
    const keep = prev.hits.findIndex((h) => h.step >= from);
    const kept = keep < 0 ? prev.hits.length : keep;
    // The previous phrase must keep its shape: at most its last (held) note gets shorter.
    if (kept < prev.hits.length || kept === 0 || from - prev.hits[kept - 1].step < 2) continue;
    prev.hits = [...prev.hits, ...pick.hits];
    prev.degrees = [...prev.degrees, ...pick.degrees];
    lastPickups++;
  }

  const notes: Note[] = [];
  for (const ph of phrases) notes.push(...toNotes(ph.hits, ph.degrees.map((d) => space.toMidi(d)), rng, gate));
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
        else if (isAvoidNote(pc, chordPcs(slot.chord))) s -= 1.4 * w;
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
  if (!isAvoidNote(mod12(pitch), pcs)) return pitch;
  const fits = pool.filter((p) => !isAvoidNote(mod12(p), pcs));
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

/**
 * The few pitches a Fred again.. hook lives on: neighbouring scale notes,
 * 2–5 of them and a 4th to a 5th wide, that every chord of the loop can
 * recolour (one or two of them belong to each chord, the rest become 9ths,
 * 11ths or maj7s). The minor-key tonic is avoided (the cell sits on ♭3–♭7
 * or 2–5 of the minor key), which keeps major and minor ambiguous.
 */
function hookWindow(ctx: Ctx, rng: Rng, size: number): number[] {
  const scale = scalePcs(ctx.key);
  const minorTonic = ctx.key.mode === "minor" ? ctx.key.tonic : mod12(ctx.key.tonic + 9);
  const notes: number[] = [];
  for (let m = ctx.lo; m <= ctx.hi; m++) if (scale.includes(mod12(m))) notes.push(m);
  const bars = ctx.totalSteps / STEPS_PER_BAR;
  let best: number[] = [];
  let bestScore = -Infinity;
  for (let i = 0; i + size <= notes.length; i++) {
    const win = notes.slice(i, i + size);
    if (win[win.length - 1] - win[0] > 7) continue;
    let score = 0;
    for (const slot of ctx.slots) {
      const pcs = chordPcs(slot.chord);
      const w = slot.length / STEPS_PER_BAR;
      const tones = win.filter((p) => pcs.includes(mod12(p))).length;
      const rubs = win.filter((p) => isAvoidNote(mod12(p), pcs)).length;
      score += w * ((tones >= 1 ? 1 : -1) - (tones === size && size > 1 ? 0.3 : 0) - rubs * 0.6);
    }
    if (win.some((p) => mod12(p) === minorTonic)) score -= 0.6 * bars;
    score -= Math.abs((win[0] + win[win.length - 1]) / 2 - (ctx.lo + ctx.hi) / 2) * 0.05;
    score += rng.next() * 0.8;
    if (score > bestScore) {
      bestScore = score;
      best = win;
    }
  }
  return best.length ? best : vocalPool(ctx, rng, size);
}

/**
 * Fred again..-style vocal hook: a 1–2 bar cell of short, detached syllables on
 * a fixed set of pitches, repeated (A A A A'); at phrase ends the cell answers
 * with a stutter, a reversal or a pitched-up last syllable.
 */
function chopLead(ctx: Ctx, rhythm: Rhythm, rng: Rng, poolSize: number): Note[] {
  const pool = hookWindow(ctx, rng, poolSize);
  const span = rhythm.bars * STEPS_PER_BAR;
  const clampIdx = (i: number) => Math.max(0, Math.min(pool.length - 1, i));
  // Mostly repeats and steps: ~35 % repeat, ~50 % step, ~10 % third, rare jumps.
  const motif: number[] = [];
  let cur = rng.int(0, pool.length - 1);
  rhythm.hits.forEach((h, i) => {
    if (i > 0) {
      const stutter = h.step - rhythm.hits[i - 1].step <= 1;
      if (!(stutter && rng.chance(0.85))) {
        const r = rng.next();
        if (r < 0.35) {
          // repeat the syllable
        } else if (r < 0.85) cur = clampIdx(cur + (rng.chance(0.5) ? 1 : -1));
        else if (r < 0.95) cur = clampIdx(cur + (rng.chance(0.5) ? 2 : -2));
        else cur = rng.pick([0, pool.length - 1]);
      }
    }
    motif.push(cur);
  });
  // Sometimes one slice is pitched up an octave, like a re-pitched sample.
  const jumpAt = rng.chance(0.2) && rhythm.hits.length > 3 ? rng.int(1, rhythm.hits.length - 1) : -1;

  const notes: Note[] = [];
  for (let offset = 0; offset < ctx.totalSteps; offset += span) {
    const phraseEnd = (offset + span) % (4 * STEPS_PER_BAR) === 0;
    const vary = offset > 0 && phraseEnd && rng.chance(0.8);
    const how = rng.weighted(
      [
        { v: "stutter", w: 0.4 },
        { v: "reverse", w: 0.3 },
        { v: "octave", w: 0.3 },
      ],
      (x) => x.w,
    ).v;
    const hits = shift(rhythm.hits, offset);
    const idxs = hits.map((_, i) => motif[i]);
    if (vary && how === "reverse" && idxs.length >= 3) {
      const tail = idxs.slice(-3).reverse();
      idxs.splice(idxs.length - 3, 3, ...tail);
    }
    const pitches = hits.map((h, i) => {
      const idx = idxs[i];
      let pitch = pool[idx] + (i === jumpAt && pool[idx] + 12 <= ctx.hi + 5 ? 12 : 0);
      if (vary && how === "octave" && i === hits.length - 1 && pitch + 12 <= ctx.hi + 7) pitch += 12;
      return fitToChord(pitch, h, pool, ctx);
    });
    // Short, detached syllables.
    const chunk = toNotes(hits, pitches, rng, 0.72, 96);
    const last = chunk[chunk.length - 1];
    if (vary && how === "stutter" && last) {
      // 16th repeats of the last syllable for half a beat to a beat, up to the phrase end.
      const end = offset + span;
      const reps = Math.min(rng.pick([2, 3, 4]), Math.floor(end - last.start));
      if (reps >= 2) {
        chunk.pop();
        for (let r = 0; r < reps; r++) {
          chunk.push({ ...last, start: last.start + r, len: 0.6, vel: clampVel(last.vel - 6 + r * 4) });
        }
      }
    }
    notes.push(...chunk);
  }
  return notes;
}

/**
 * Fallback for loops without a tone that fits every chord: a smooth path
 * through the chord tones that keeps common tones and moves by small steps.
 */
function smoothVowelPath(ctx: Ctx, rng: Rng): number[] {
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

/**
 * The held vowel's pitch for each chord. BUNT.'s loops have tones that fit
 * every chord (in VI–i, VI–iv–i and VI–VII–i–VII the tonic: a chord tone, or
 * the 9th over VII), so one stretched vowel can sit over the whole loop like
 * "eeee" in "Clouds". Sometimes the word's second syllable moves to another
 * such tone for the second half ("ea – sy").
 */
function vowelPath(ctx: Ctx, rng: Rng): { path: number[]; build: string } {
  const tones = loopTones(ctx.slots, ctx.key).filter((t) => t.universal);
  if (!tones.length) return { path: smoothVowelPath(ctx, rng), build: "vowel" };
  const fifth = mod12(ctx.home + 7);
  // Mostly the tonic, sometimes the 5th, now and then another tone most chords contain.
  const weight = (pc: number, share: number) => (pc === ctx.home ? 7 : pc === fifth ? 2 : share);
  const main = rng.weighted(tones, (t) => weight(t.pc, t.chordShare)).pc;
  const target = ctx.lo + (ctx.hi - ctx.lo) * (0.45 + rng.next() * 0.3);
  const first = nearestWithPc(target, [main], ctx.lo, ctx.hi) ?? Math.round(target);
  const half = ctx.totalSteps / 2;
  const early = ctx.slots.map((s) => s.start < half);
  const pedal = ctx.slots.map(() => first);
  if (rng.chance(0.55) || early.every((e) => e === early[0])) return { path: pedal, build: "pedal" };

  // Two syllables: the other one starts on a chord that contains it, close to the first.
  const lateFirst = rng.chance(0.5);
  const half2 = ctx.slots.filter((_, i) => early[i] === lateFirst);
  const onset = chordPcs(half2[0].chord);
  let second: number | null = null;
  let bestScore = -Infinity;
  for (const t of tones) {
    if (t.pc === main || !onset.includes(t.pc)) continue;
    const p = nearestWithPc(first, [t.pc], Math.max(ctx.lo, first - 5), Math.min(ctx.hi, first + 5));
    if (p === null) continue;
    const owned = half2.filter((s) => chordPcs(s.chord).includes(t.pc)).length / half2.length;
    const score = owned + (t.pc === ctx.home || t.pc === fifth ? 0.2 : 0) - Math.abs(p - first) * 0.05 + rng.next() * 0.1;
    if (score > bestScore) {
      bestScore = score;
      second = p;
    }
  }
  if (second === null) return { path: pedal, build: "pedal" };
  const path = ctx.slots.map((_, i) => (early[i] === lateFirst ? second! : first));
  return { path, build: "two" };
}

function gatedVowelLead(ctx: Ctx, gate: Rhythm, rng: Rng, path: readonly number[]): Note[] {
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
    const len = end - h.step <= 1 ? Math.min(end - h.step, 0.55 * Math.max(1, gap)) : Math.max(0.4, (end - h.step) * 0.92);
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
  // Fred again.. (Hooktheory stats): 2–5 pitches, 5–7 semitones, steps and repeats,
  // simple rhythm, a fixed pitch set the chords recolour (35–55 % chord tones).
  "vocal-chop": { pitches: [2, 5], range: 7, rangeMin: 4, steps: 0.85, sync: 0.35, repeat: 0.85, chordTones: 0.3, chordShare: [0.35, 0.65] },
  // BUNT.: one or two held vowels on tones that fit every chord, gated; almost no melody.
  // Over VII the tonic is the 9th, so not every strong note is a chord tone.
  "gated-vowel": { pitches: [1, 2], range: 5, steps: 0.95, sync: 0.35, repeat: 0.85, chordTones: 0.45, pedalEnd: true },
  // AVAION: a singable line, mostly steps, phrases that answer each other.
  topline: { pitches: [4, 8], range: 12, steps: 0.6, sync: 0.3, repeat: 0.55, chordTones: 0.75 },
  // WACUKA: a looping drop riff that changes only its ending.
  "brass-hook": { pitches: [3, 6], range: 10, steps: 0.55, sync: 0.4, repeat: 0.85, chordTones: 0.8 },
  // Early BUNT. (and Avicii, whom the press compares them to): stepwise, a 6th wide, ~65 % chord tones.
  folk: { pitches: [4, 7], range: 9, steps: 0.6, sync: 0.25, repeat: 0.65, chordTones: 0.65 },
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
      // Mostly a fixed pitch set the chords recolour; now and then chops that follow the chords.
      return k % 5 === 4
        ? { notes: chordChopLead(ctx, rhythm, rng), build: "chords" }
        : { notes: chopLead(ctx, rhythm, rng, rng.weighted([2, 3, 3, 4, 4, 5].map((n) => ({ n })), () => 1).n), build: "fixed" };
    case "gated-vowel": {
      const { path, build } = vowelPath(ctx, rng);
      return { notes: gatedVowelLead(ctx, rhythm, rng, path), build };
    }
    case "topline":
    case "folk":
    case "brass-hook": {
      const notes = motifLead(ctx, mode, rhythm, rhythmB, rng);
      return { notes, build: lastPickups ? `${lastForm} +Auftakt` : lastForm };
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
  home: PitchClass = key.tonic,
): LeadResult {
  const ctx: Ctx = { slots, key, home, universal: universalPcs(slots, key), lo: range[0], hi: range[1], totalSteps, tensions };
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
