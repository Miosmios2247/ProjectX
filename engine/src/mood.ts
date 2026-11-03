// Moods ("Stimmungen"): a second choice next to the artist. The artist keeps
// its sounds, grooves and hook; the mood shapes the rest: which chord loops
// come up (the artist's own loops weighted by how well they fit, plus loops
// typical for the mood), the chord colours, how high or low things sit, the
// tempo inside the style's range, the rhythms, the drums and the song form.
// Without a mood nothing changes.

import moodData from "../../data/moods.json";
import { ProgressionTemplate } from "./progression";
import { ColorToken, Mode } from "./theory";
import { Rng } from "./rng";
import { DrumInst, DrumPattern, LaneId, WeightedRef } from "./rhythm";
import { clampVel } from "./groove";
import { getRhythm } from "./styles";
import { LEAD_TARGETS } from "./lanes/lead";
import { Spread, VoicingOptions } from "./voicing";
import { ArrangementSection, DrumHit, Genre, MoodId, Note, StyleVariant } from "./types";

/** What a chord loop sounds like, measured on its degrees. */
export type LoopFeature = "major" | "minor" | "rise" | "epic" | "iv" | "bII" | "maj7" | "short" | "long" | "two";

export interface Mood {
  id: MoodId;
  name: string;
  blurb: string;
  /** Mode weights: [multiplier, added weight]. */
  modes: Partial<Record<Mode, [number, number]>>;
  /** How each loop feature changes the weight of the artist's own loops. */
  fit: Partial<Record<LoopFeature, number>>;
  /** Share of all loop weight that goes to the mood's own loops. */
  share: number;
  progressions: (ProgressionTemplate & { note: string })[];
  colors: { mul?: Partial<Record<ColorToken, number>>; add?: Partial<Record<ColorToken, number>> };
  /** Multiplier on the chance to stretch a 4-bar loop to 8 bars, and a lower bound. */
  stretch?: number;
  stretchMin?: number;
  /** Added chance of a lifted ending in 8-bar loops. */
  lift?: number;
  voicing?: { shift?: number; spread?: Spread; voices?: number; colorTop?: number };
  lead?: { shift?: number; range?: number; steps?: number; sync?: number; repeat?: number };
  /** Added chance of a held tonic in the bass (negative = less). */
  pedal?: number;
  /** Part of the style's tempo range, 0 = slowest, 1 = fastest. */
  tempo: [number, number];
  /** Velocity change for chords and pluck. */
  dynamics?: number;
  /** Weight factors per rhythm tag, per lane. */
  rhythms?: Partial<Record<LaneId, Record<string, number>>>;
  /** A rhythm added when none of the lane's own rhythms suits the mood. */
  defaults?: Partial<Record<"chords" | "bass", string>>;
  drums?: { energy?: number; offbeatHats?: boolean; toms?: boolean; noBright?: boolean };
  song?: { climaxUp?: boolean; longBuild?: boolean };
  /** Explanation: a base line, one line per loop feature, and the rest (with its own wording per genre). */
  text: { base: string; after: string; afterBy?: Partial<Record<Genre, string>> } & Partial<Record<LoopFeature, string>>;
}

export const MOODS: Mood[] = (moodData as unknown as Mood[]).map((m) => ({
  ...m,
  progressions: m.progressions.map((p) => ({ ...p, mood: m.id })),
}));

export function getMood(id: string): Mood {
  const m = MOODS.find((x) => x.id === id);
  if (!m) throw new Error(`Unbekannte Stimmung: ${id}`);
  return m;
}

const SUFFIX = /(maj7|add9|sus2|sus4|7|9|6)?(\/[35])?$/;
const coreOf = (degree: string) => degree.replace(SUFFIX, "");
const isMajorChord = (core: string) => {
  const m = /^[b#]?(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)/.exec(core);
  return !!m && m[1] === m[1].toUpperCase() && !/[°o+]/.test(core);
};

/** Rising root steps that lead home (VI–VII–i in minor; IV–V, V–vi or ♭VI–♭VII–I in major). */
const RISES: Record<Mode, [string, string][]> = {
  minor: [["VI", "VII"], ["VII", "i"]],
  major: [["IV", "V"], ["V", "vi"], ["bVI", "bVII"], ["bVII", "I"]],
};
/** i–VI–III–VII, the "epic" loop (vi–IV–I–V in major). */
const EPIC: Record<Mode, string[]> = { minor: ["i", "VI", "III", "VII"], major: ["vi", "IV", "I", "V"] };

export function loopFeatures(t: ProgressionTemplate): Record<LoopFeature, number> {
  const cores = t.degrees.map(coreOf);
  const n = cores.length;
  const lens = t.durations ?? cores.map(() => 1);
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  let majorLen = 0;
  cores.forEach((c, i) => {
    if (isMajorChord(c)) majorLen += lens[i];
  });
  const major = majorLen / total;
  const pairs = cores.map((c, i) => [c, cores[(i + 1) % n]] as const);
  const rise = n > 1 && pairs.some(([a, b]) => RISES[t.mode].some(([x, y]) => a === x && b === y));
  const epicSeq = EPIC[t.mode];
  const epic = n >= 4 && cores.some((_, s) => epicSeq.every((d, k) => cores[(s + k) % n] === d));
  // The minor iv: diatonic in minor, borrowed in major.
  const iv = cores.includes("iv");
  const avg = total / n;
  return {
    major,
    minor: 1 - major,
    rise: rise ? 1 : 0,
    epic: epic ? 1 : 0,
    iv: iv ? 1 : 0,
    bII: cores.includes("bII") ? 1 : 0,
    maj7: t.degrees.some((d) => /maj7|9$/.test(d)) ? 1 : 0,
    short: avg <= 1 ? 1 : 0,
    long: avg >= 2 ? 1 : 0,
    two: n <= 2 ? 1 : 0,
  };
}

/** How well one loop suits a mood: a weight factor, 1 = neutral; a loop that works against the mood almost drops out. */
export function loopFit(t: ProgressionTemplate, mood: Mood): number {
  const f = loopFeatures(t);
  let fit = 1;
  for (const [k, c] of Object.entries(mood.fit) as [LoopFeature, number][]) fit += c * f[k];
  return Math.max(0.05, Math.min(3, fit));
}

/** Average fit of the artist's own loops: which moods its chords already carry. */
export function moodAffinity(variant: StyleVariant, mood: Mood): number {
  const list = variant.harmony.progressions;
  const total = list.reduce((a, p) => a + p.weight, 0) || 1;
  return list.reduce((a, p) => a + p.weight * loopFit(p, mood), 0) / total;
}

/** The two moods closest to the variant's own chord loops. */
export function typicalMoods(variant: StyleVariant): MoodId[] {
  if (variant.moods?.length) return variant.moods.slice(0, 2);
  return [...MOODS]
    .sort((a, b) => moodAffinity(variant, b) - moodAffinity(variant, a))
    .slice(0, 2)
    .map((m) => m.id);
}

function reweight(refs: (WeightedRef | string)[], factors: Record<string, number> | undefined, fallback?: string): WeightedRef[] {
  const list = refs.map((r) => (typeof r === "string" ? { id: r, weight: 1 } : { ...r }));
  if (!factors) return list;
  let matched = false;
  for (const r of list) {
    let f = 1;
    for (const tag of getRhythm(r.id).tags) {
      const k = factors[tag];
      if (k === undefined) continue;
      f *= k;
      if (k > 1) matched = true;
    }
    r.weight *= Math.max(0.15, Math.min(4, f));
  }
  if (!matched && fallback && !list.some((r) => r.id === fallback)) {
    const total = list.reduce((a, r) => a + r.weight, 0);
    list.push({ id: fallback, weight: total * 0.4 });
  }
  return list;
}

const shiftRange = (r: [number, number], by: number): [number, number] => [r[0] + by, r[1] + by];

/**
 * The variant as the mood hears it. Hip-hop and film keep their own grooves: no house rhythms come in,
 * the 808 stays on the kick.
 */
export function applyMood(variant: StyleVariant, mood: Mood, genre: Genre = "house"): StyleVariant {
  const h = variant.harmony;
  // Modes
  const modes: Partial<Record<Mode, number>> = {};
  for (const m of ["major", "minor"] as Mode[]) {
    const [mul, add] = mood.modes[m] ?? [1, 0];
    const w = (h.modes[m] ?? 0) * mul + add;
    if (w > 0) modes[m] = w;
  }
  // Loops: the artist's own weighted by fit, the mood's own measured against the artist's
  // unweighted loops. Where the artist's loops already carry the mood they stay in front;
  // where they work against it, the mood's loops take over.
  const own = h.progressions.map((p) => ({ ...p, weight: p.weight * loopFit(p, mood) }));
  const ownBase = h.progressions.reduce((a, p) => a + p.weight, 0);
  const moodTotal = mood.progressions.reduce((a, p) => a + p.weight, 0) || 1;
  const moodShare = (ownBase * mood.share) / (1 - mood.share);
  const extra = mood.progressions.map((p) => ({ ...p, weight: (p.weight / moodTotal) * moodShare }));
  // Colours
  const colors: Partial<Record<ColorToken, number>> = {};
  const tokens = new Set([...Object.keys(h.colors), ...Object.keys(mood.colors.add ?? {})]) as Set<ColorToken>;
  for (const c of tokens) {
    const w = (h.colors[c] ?? 0) * (mood.colors.mul?.[c] ?? 1) + (mood.colors.add?.[c] ?? 0);
    if (w > 0) colors[c] = w;
  }
  const stretch = Math.min(0.9, Math.max(mood.stretchMin ?? 0, (h.stretch ?? 0) * (mood.stretch ?? 1)));
  const lift = Math.min(0.9, Math.max(0, (h.lift ?? 0) + (mood.lift ?? 0)));

  const L = variant.lanes;
  const v = mood.voicing ?? {};
  const vs = v.shift ?? 0;
  const cv = L.chords.voicing;
  const voicing: VoicingOptions = {
    ...cv,
    low: cv.low + vs,
    high: cv.high + vs,
    spread: v.spread ?? cv.spread,
    voices: cv.voices.map((n) => Math.max(2, Math.min(6, n + (v.voices ?? 0)))) as [number, number],
    colorTop: (cv.colorTop ?? 0) + (v.colorTop ?? 0),
    ...(cv.topRange ? { topRange: shiftRange(cv.topRange, vs) } : {}),
  };

  const ld = mood.lead ?? {};
  const base = { ...LEAD_TARGETS[L.lead.mode], ...(L.lead.targets ?? {}) };
  const targets = { ...(L.lead.targets ?? {}) };
  if (ld.range) targets.range = Math.max(3, base.range + ld.range);
  if (ld.steps) targets.steps = Math.min(0.97, Math.max(0.3, base.steps + ld.steps));
  if (ld.sync) targets.sync = Math.min(0.6, Math.max(0.05, base.sync + ld.sync));
  if (ld.repeat) targets.repeat = Math.min(0.95, Math.max(0.3, base.repeat + ld.repeat));

  const r = mood.rhythms ?? {};
  const house = genre === "house";
  return {
    ...variant,
    harmony: { ...h, modes, progressions: [...own, ...extra], colors, stretch, lift },
    lanes: {
      chords: { ...L.chords, voicing, rhythms: reweight(L.chords.rhythms, r.chords, house ? mood.defaults?.chords : undefined) },
      bass:
        L.bass.mode === "808"
          ? { ...L.bass }
          : {
              ...L.bass,
              rhythms: reweight(L.bass.rhythms, r.bass, house ? mood.defaults?.bass : undefined),
              pedal: Math.min(0.8, Math.max(0, (L.bass.pedal ?? 0) + (mood.pedal ?? 0))),
            },
      lead: { ...L.lead, range: shiftRange(L.lead.range, ld.shift ?? 0), rhythms: reweight(L.lead.rhythms, r.lead), targets },
      pluck: { ...L.pluck, range: shiftRange(L.pluck.range, vs), rhythms: reweight(L.pluck.rhythms, r.pluck) },
    },
  };
}

/** Tempo inside the style's range, in the part the mood asks for. */
export function moodTempo(range: [number, number], mood: Mood, rng: Rng): number {
  const [lo, hi] = range;
  const a = lo + Math.round(mood.tempo[0] * (hi - lo));
  const b = lo + Math.round(mood.tempo[1] * (hi - lo));
  return rng.int(Math.min(a, b), Math.max(a, b));
}

/** Louder or softer chords and pluck. */
export function moodDynamics(notes: Note[], mood: Mood): Note[] {
  const d = mood.dynamics ?? 0;
  return d ? notes.map((n) => ({ ...n, vel: clampVel(n.vel + d) })) : notes;
}

const SMALL: DrumInst[] = ["hatC", "hatO", "shaker", "tamb", "percHi", "rim"];

/** Hi-hat rolls as the mood plays them: more of them with energy, fewer when calm. */
export function moodRolls(pattern: DrumPattern, mood: Mood): DrumPattern {
  const e = mood.drums?.energy ?? 0;
  if (!pattern.rolls || !e) return pattern;
  const chance = Math.min(0.9, Math.max(0.05, pattern.rolls.chance * (e > 0 ? 1.7 : 0.45)));
  return { ...pattern, rolls: { ...pattern.rolls, chance } };
}

/**
 * Drums as the mood plays them: more or fewer hats, open hats, epic toms.
 * Hip-hop keeps its hats (the rolls carry the energy there, see moodRolls); calm moods only play them softer.
 * Film percussion gets a tom pulse in 8ths with energy and plays softer when calm; a cue without drums stays without.
 */
export function moodDrums(hits: readonly DrumHit[], mood: Mood, bars: number, bpm: number, rng: Rng, genre: Genre = "house"): DrumHit[] {
  const d = mood.drums ?? {};
  let out = hits.map((x) => ({ ...x }));
  if (genre === "hiphop") {
    if ((d.energy ?? 0) < 0) out = out.map((x) => (SMALL.includes(x.inst) ? { ...x, vel: clampVel(x.vel * 0.85) } : x));
    if (d.toms) addToms(out, bars, rng);
    return out.sort((a, b) => a.step - b.step || a.inst.localeCompare(b.inst));
  }
  if (genre === "film") {
    if (!out.length) return out;
    if ((d.energy ?? 0) < 0) out = out.map((x) => ({ ...x, vel: clampVel(x.vel * 0.8) }));
    if ((d.energy ?? 0) > 0) {
      for (let s = 0; s < bars * 16; s += 2) {
        if (out.some((x) => Math.abs(x.step - s) < 0.01 && (x.inst === "tom" || x.inst === "kick" || x.inst === "percLo"))) continue;
        out.push({ inst: "tom", step: s, vel: clampVel((s % 4 === 0 ? 70 : 58) + rng.int(-5, 5)) });
      }
    }
    if (d.toms) addToms(out, bars, rng);
    return out.sort((a, b) => a.step - b.step || a.inst.localeCompare(b.inst));
  }
  const has = (inst: DrumInst) => out.some((x) => x.inst === inst);
  const at = (inst: DrumInst, step: number) => out.some((x) => x.inst === inst && x.step === step);
  const total = bars * 16;
  // Dark: no tambourine, a quieter shaker.
  if (d.noBright) out = out.filter((x) => x.inst !== "tamb").map((x) => (x.inst === "shaker" ? { ...x, vel: clampVel(x.vel * 0.7) } : x));
  if ((d.energy ?? 0) < 0) {
    // Calm: no 16th ticks between the 8ths, small percussion softer.
    out = out
      .filter((x) => !(SMALL.includes(x.inst) && x.step % 2 === 1))
      .map((x) => (SMALL.includes(x.inst) ? { ...x, vel: clampVel(x.vel * 0.8) } : x));
  }
  if ((d.energy ?? 0) > 0) {
    // Driving: closed hats on every free 16th (8ths at drum & bass tempo), or the shaker if the kit has no hats.
    const tick: DrumInst = has("hatC") || !has("shaker") ? "hatC" : "shaker";
    const every = bpm > 150 ? 2 : 1;
    for (let s = 0; s < total; s += every) {
      if (at(tick, s) || at("hatO", s)) continue;
      out.push({ inst: tick, step: s, vel: clampVel((s % 2 ? 44 : 58) + rng.int(-6, 6)) });
    }
  }
  if (d.offbeatHats && !has("hatO")) {
    for (let s = 2; s < total; s += 4) out.push({ inst: "hatO", step: s, vel: clampVel(70 + rng.int(-6, 6)) });
  }
  if (d.toms) addToms(out, bars, rng);
  return out.sort((a, b) => a.step - b.step || a.inst.localeCompare(b.inst));
}

/** A falling tom fill at the end of every 4th bar announces the next round. */
function addToms(out: DrumHit[], bars: number, rng: Rng): void {
  for (let bar = 3; bar < bars; bar += 4) {
    const o = bar * 16;
    [12, 13, 14, 15].forEach((s, k) => out.push({ inst: "tom", step: o + s, vel: clampVel(84 + k * 6 + rng.int(-4, 4)) }));
  }
}

/** Song form as the mood shapes it: longer builds (episch), the hook an octave up at the end (euphorisch). */
export function moodArrangement(sections: readonly ArrangementSection[], mood: Mood): ArrangementSection[] {
  const out = sections.map((s) => ({ ...s, lanes: [...s.lanes] }));
  if (mood.song?.longBuild) for (const s of out) if (s.build && s.bars < 8) s.bars = 8;
  if (mood.song?.climaxUp) {
    const rev = [...out].reverse();
    // The last full section with drums; a cue without drums takes its fullest section with the theme.
    const last =
      rev.find((s) => s.lanes.includes("lead") && !s.build && !s.noKick && s.lanes.includes("drums")) ??
      rev.filter((s) => s.lanes.includes("lead") && !s.build).sort((a, b) => b.lanes.length - a.lanes.length)[0];
    if (last) last.leadUp = true;
  }
  return out;
}

/** Plain-language lines for "Warum klingt das so?". A loop the mood brought along is explained on its own line. */
export function explainMood(mood: Mood, template: ProgressionTemplate, genre: Genre = "house"): string {
  const f = loopFeatures(template);
  const lines: string[] = [];
  const add = (k: LoopFeature, on: boolean) => {
    const t = mood.text[k];
    if (t && on && !template.mood) lines.push(t);
  };
  add("rise", f.rise === 1);
  add("epic", f.epic === 1);
  add("bII", f.bII === 1);
  add("iv", f.iv === 1);
  add("maj7", f.maj7 === 1);
  add("major", f.major >= 0.6);
  add("minor", f.minor >= 0.75);
  add("two", f.two === 1);
  add("short", f.short === 1 && f.two === 0);
  add("long", f.long === 1);
  const after = mood.text.afterBy?.[genre] ?? mood.text.after;
  return `Stimmung „${mood.name}“: ${mood.text.base} ${[...lines.slice(0, 2), after].join(" ")}`;
}
