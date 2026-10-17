// Builds a complete idea (all lanes) from a style variant, key and seeds.

import { Rng, createRng, deriveSeed } from "./rng";
import { ProgressionTemplate, STEPS_PER_BAR, buildProgression, chooseMode } from "./progression";
import { voiceProgression } from "./voicing";
import { LaneId, WeightedRef, pickRef, rhythmDensity } from "./rhythm";
import { getDrumPattern, getRhythm, getStyle, getVariant } from "./styles";
import { chordsLane, yieldToLead } from "./lanes/chords";
import { bassLane } from "./lanes/bass";
import { leadLane } from "./lanes/lead";
import { complementLead, pluckLane } from "./lanes/pluck";
import { drumsLane } from "./lanes/drums";
import { checkLanes } from "./check";
import { explainIdea } from "./explain";
import { Key, mod12 } from "./theory";
import { ArpOrder, Idea, IdeaParams, StyleVariant } from "./types";

export const ENGINE_VERSION = "0.4.0";

export type SeedLane = LaneId | "drums";
export const SEED_LANES: SeedLane[] = ["chords", "bass", "lead", "pluck", "drums"];

export function defaultLaneSeeds(seed: number): Record<SeedLane, number> {
  return {
    chords: deriveSeed(seed, "chords"),
    bass: deriveSeed(seed, "bass"),
    lead: deriveSeed(seed, "lead"),
    pluck: deriveSeed(seed, "pluck"),
    drums: deriveSeed(seed, "drums"),
  };
}

function refId(r: WeightedRef | string): string {
  return typeof r === "string" ? r : r.id;
}

/** Tonal centre of the loop: a template borrowed from the other mode keeps its own tonic (vi in major, III in minor). */
export function loopHome(key: Key, template: ProgressionTemplate): number {
  if (!template.sourceDegrees) return key.tonic;
  return mod12(key.tonic + (key.mode === "major" ? 9 : 3));
}

export function autoKey(variant: StyleVariant, rng: Rng): Key {
  const mode = chooseMode(variant.harmony, rng.fork("mode"));
  return { tonic: rng.fork("tonic").int(0, 11), mode };
}

export function generateIdea(params: IdeaParams): Idea {
  const style = getStyle(params.styleId);
  const variant = getVariant(params.styleId, params.variantId);
  const base = createRng(params.seed);
  const seeds = { ...defaultLaneSeeds(params.seed), ...(params.laneSeeds ?? {}) };
  const key = params.key ?? autoKey(variant, base.fork("key"));
  const bpm = params.bpm ?? base.fork("bpm").int(variant.tempo[0], variant.tempo[1]);
  const bars = params.bars;
  const totalSteps = bars * STEPS_PER_BAR;

  // Harmony and chords
  const hr = createRng(seeds.chords);
  const { slots, template } = buildProgression(variant.harmony, key, bars, hr.fork("progression"));
  const voicings = voiceProgression(
    slots.map((s) => s.chord),
    variant.lanes.chords.voicing,
    hr.fork("voicing"),
  );
  const chordRhythmId = pickRef(variant.lanes.chords.rhythms, hr.fork("rhythm"));
  const chordsNotes = chordsLane(slots, voicings, getRhythm(chordRhythmId), totalSteps, hr.fork("notes"));

  // Bass
  const br = createRng(seeds.bass);
  const bassRhythmId = pickRef(variant.lanes.bass.rhythms, br.fork("rhythm"));
  const bass = bassLane(slots, key, getRhythm(bassRhythmId), variant.lanes.bass, totalSteps, br.fork("notes"));

  // Lead
  const lr = createRng(seeds.lead);
  const leadProfile = variant.lanes.lead;
  const leadRhythmId = pickRef(leadProfile.rhythms, lr.fork("rhythm"));
  const others = leadProfile.rhythms.filter((r) => refId(r) !== leadRhythmId);
  const leadRhythmB = others.length ? getRhythm(pickRef(others, lr.fork("rhythmB"))) : null;
  const lead = leadLane(
    slots,
    key,
    leadProfile.mode,
    leadProfile.range,
    leadProfile.tensions ?? false,
    getRhythm(leadRhythmId),
    leadRhythmB,
    totalSteps,
    lr.fork("notes"),
    leadProfile.targets,
    loopHome(key, template),
    params.flags ?? {},
  );
  const leadNotes = lead.notes;

  // Pluck, calmer when the lead or a 16th bass is busy (two 16th motors at once is too much)
  const pr = createRng(seeds.pluck);
  const pluckProfile = variant.lanes.pluck;
  let pluckRefs = pluckProfile.rhythms;
  const busyBass = rhythmDensity(getRhythm(bassRhythmId)) >= 8;
  if ((leadNotes.length / bars > 7 || busyBass) && pluckRefs.length > 1) {
    const sorted = [...pluckRefs].sort(
      (a, b) => rhythmDensity(getRhythm(refId(a))) - rhythmDensity(getRhythm(refId(b))),
    );
    pluckRefs = sorted.slice(0, Math.ceil(sorted.length / 2));
  }
  const pluckRhythmId = pickRef(pluckRefs, pr.fork("rhythm"));
  const order = pr.fork("order").pick<ArpOrder>(pluckProfile.orders ?? ["up"]);
  const pluckNotes = pluckLane(
    slots,
    voicings,
    getRhythm(pluckRhythmId),
    pluckProfile.mode,
    order,
    pluckProfile.range,
    totalSteps,
    pr.fork("notes"),
  );

  // Drums (accompaniment)
  const dr = createRng(seeds.drums);
  const drumId = pickRef(variant.drums, dr.fork("pattern"));
  const drumPattern = getDrumPattern(drumId);
  const drumHits = drumsLane(drumPattern, bars, dr.fork("hits"));

  // Held vowels and sung toplines get their own pitch; the keys do not double it.
  const keys =
    leadProfile.mode === "gated-vowel" || leadProfile.mode === "topline"
      ? yieldToLead(chordsNotes, leadNotes, variant.lanes.chords.voicing.low)
      : chordsNotes;
  const { fixes } = checkLanes(slots, keys, bass.notes, leadNotes, pluckNotes, leadProfile.range);
  // The pluck answers the hook: it steps back while the lead sings and fills the gaps.
  const pluckFinal = complementLead(pluckNotes, leadNotes, pluckProfile.range, pluckProfile.mode);

  const sound = (lane: LaneId, refs: (WeightedRef | string)[]) =>
    pickRef(refs, createRng(seeds[lane]).fork("sound"));

  return {
    engineVersion: ENGINE_VERSION,
    params: { ...params, laneSeeds: { ...(params.laneSeeds ?? {}) }, flags: { ...(params.flags ?? {}) } },
    seeds,
    styleId: style.id,
    variantId: variant.id,
    artist: style.artist,
    variantName: variant.name,
    key,
    bpm,
    swing: variant.swing,
    drumSwing: variant.drumSwing,
    references: variant.references,
    bars,
    totalSteps,
    progression: slots,
    progressionText: slots.map((s) => s.chord.name).join(" – "),
    templateText: slots.map((s) => s.chord.degree).join(" – "),
    voicings,
    lanes: {
      chords: { notes: keys, rhythmId: chordRhythmId, sound: sound("chords", variant.lanes.chords.sound) },
      bass: {
        notes: bass.notes,
        rhythmId: bassRhythmId,
        sound: sound("bass", variant.lanes.bass.sound),
        detail: bass.pedal ? "Orgelpunkt" : undefined,
      },
      lead: {
        notes: leadNotes,
        rhythmId: leadRhythmId,
        sound: sound("lead", leadProfile.sound),
        detail: leadProfile.mode,
      },
      pluck: {
        notes: pluckFinal,
        rhythmId: pluckRhythmId,
        sound: sound("pluck", pluckProfile.sound),
        detail: pluckProfile.mode === "arp" ? `arp ${order}` : pluckProfile.mode,
      },
    },
    drums: { patternId: drumId, kit: variant.mix.drumKit, hits: drumHits },
    mix: variant.mix,
    soundHints: variant.soundHints,
    arrangement: variant.arrangement ?? style.arrangement,
    insights: explainIdea({
      style,
      variant,
      template,
      templateText: slots.map((s) => s.chord.degree).join(" – "),
      chordNames: [...new Set(slots.map((s) => s.chord.name))].join(" – "),
      chordRhythm: getRhythm(chordRhythmId),
      leadMode: leadProfile.mode,
      leadBuild: lead.build,
      leadNotes,
      bassRhythm: getRhythm(bassRhythmId),
      pluckAnswers: pluckFinal.length > 0,
      key,
      slots,
      keysYield: keys.length !== chordsNotes.length || keys.some((n, i) => n.pitch !== chordsNotes[i].pitch),
    }),
    fixes,
  };
}
