// Shared data types for style profiles and generated ideas.

import { Key } from "./theory";
import { ChordSlot, HarmonyProfile } from "./progression";
import { DrumInst, LaneId, WeightedRef } from "./rhythm";
import { VoicingOptions } from "./voicing";
import { MelodyTargets } from "./critic";

/**
 * vocal-chop: re-sequenced vocal slices (Fred again..)
 * gated-vowel: stretched, held vowels chopped by a 1/16 gate (stutter house, BUNT.)
 * topline: sung melody (AVAION)
 * brass-hook: short call-and-response lead hook (AVAION "WACUKA" drop)
 * folk: pentatonic riff (early BUNT.)
 */
export type LeadMode = "vocal-chop" | "gated-vowel" | "topline" | "brass-hook" | "folk";
export type PluckMode = "arp" | "stab" | "marimba" | "pick" | "counter";
export type ArpOrder = "up" | "down" | "updown" | "skip" | "pendulum";

export interface LaneProfileBase {
  /** Sound preset id(s) for the lab player. */
  sound: (WeightedRef | string)[];
  rhythms: (WeightedRef | string)[];
}

export interface ChordsLaneProfile extends LaneProfileBase {
  voicing: VoicingOptions;
}

export interface BassLaneProfile extends LaneProfileBase {
  range: [number, number];
  /** Chance to hold the tonic under all chords (pedal). */
  pedal?: number;
  /** Approach notes may come a semitone from below, outside the scale (garage, house). */
  chromatic?: boolean;
}

export interface LeadLaneProfile extends LaneProfileBase {
  mode: LeadMode;
  range: [number, number];
  /** Allow 7ths/9ths as target notes on strong beats. */
  tensions?: boolean;
  /** What the melody critic aims for (overrides the mode's defaults). */
  targets?: Partial<MelodyTargets>;
}

export interface PluckLaneProfile extends LaneProfileBase {
  mode: PluckMode;
  range: [number, number];
  orders?: ArpOrder[];
}

/** One part of the song preview: which lanes play and how the section sounds. */
export interface ArrangementSection {
  name: string;
  bars: number;
  lanes: (LaneId | "drums")[];
  /** Low-pass filter on the music bus (Hz); omit for an open filter. */
  filter?: number;
  /** Drums play without the kick (builds, verses, breakdowns). */
  noKick?: boolean;
  /** Build-up into the next section: snare roll, noise riser, opening filter. */
  build?: boolean;
  /** The vocal hook sings "raw": held notes instead of chops (Fred again.. intros). */
  leadRaw?: boolean;
  /** The hook goes up an octave here, like a pitched-up vocal at the climax. */
  leadUp?: boolean;
  /** The gated vowel is held instead (one stretched vowel per chord, no gate), as BUNT. starts a track. */
  leadHold?: boolean;
  /** Only the kick plays from the drums (BUNT.'s "subdued stutter break" with a pulsing kick). */
  kickOnly?: boolean;
  /** The sung lead gets a stacked harmony (a 3rd and a 5th below), AVAION's vocal stack before the drop. */
  leadHarmony?: boolean;
}

export interface StyleVariant {
  id: string;
  name: string;
  blurb: string;
  /** Tracks this variant is modelled on (shown in the lab). */
  references: string[];
  tempo: [number, number];
  /** Swing of the melodic lanes (0.5 = straight). */
  swing: number;
  /** Swing of hats and percussion; the kick always stays straight. */
  drumSwing: number;
  drums: (WeightedRef | string)[];
  harmony: HarmonyProfile;
  lanes: {
    chords: ChordsLaneProfile;
    bass: BassLaneProfile;
    lead: LeadLaneProfile;
    pluck: PluckLaneProfile;
  };
  mix: {
    sidechain: number;
    reverb: number;
    drumKit: string;
    /** Stutter gate (audio effect in the lab): 16 steps of 0..1 per bar. */
    gate?: { lanes: LaneId[]; pattern: number[]; depth: number };
    /** Level of a quiet noise/tape bed under the loop (0..1). */
    noise?: number;
  };
  soundHints: string[];
  /** Song preview for this variant; falls back to the artist's arrangement. */
  arrangement?: ArrangementSection[];
}

export interface StyleProfile {
  id: string;
  artist: string;
  blurb: string;
  /** Why the artist's chords sound the way they do (shown to the user). */
  harmonyNote: string;
  /** Typical song shape of the artist (intro, build, drop ...). */
  arrangement: ArrangementSection[];
  variants: StyleVariant[];
}

export interface Note {
  pitch: number;
  /** Start and length in 16th steps (before swing). */
  start: number;
  len: number;
  vel: number;
  /** A vocal sampler plays this syllable reversed (Fred again..-style answer). */
  fx?: "rev";
}

export interface DrumHit {
  inst: DrumInst;
  step: number;
  vel: number;
}

export interface LaneData {
  notes: Note[];
  rhythmId: string;
  sound: string;
  /** Extra detail, e.g. lead mode or arp order. */
  detail?: string;
}

/** Switches for duels: an older and a newer rule side by side. Omitted = the current rule. */
export interface IdeaFlags {
  /** BUNT.: vowel on a tone that fits every chord ("pedal") or the older smooth path through the chords ("path"). */
  vowel?: "pedal" | "path";
  /** Pickup notes into a phrase: "on" wherever one fits, "off" never; omitted = now and then. */
  pickups?: "on" | "off";
  /** Fred again..: chops on a fixed pitch set, chops that follow the chords, or both (default). */
  chops?: "mixed" | "fixed" | "chords";
}

export interface IdeaParams {
  styleId: string;
  variantId: string;
  /** null = choose a key that suits the style. */
  key: Key | null;
  bars: 4 | 8;
  seed: number;
  laneSeeds?: Partial<Record<LaneId | "drums", number>>;
  bpm?: number | null;
  flags?: IdeaFlags;
}

export interface Idea {
  engineVersion: string;
  params: IdeaParams;
  seeds: Record<LaneId | "drums", number>;
  styleId: string;
  variantId: string;
  artist: string;
  variantName: string;
  key: Key;
  bpm: number;
  swing: number;
  drumSwing: number;
  references: string[];
  bars: number;
  totalSteps: number;
  progression: ChordSlot[];
  progressionText: string;
  templateText: string;
  voicings: number[][];
  lanes: Record<LaneId, LaneData>;
  drums: { patternId: string; kit: string; hits: DrumHit[] };
  mix: StyleVariant["mix"];
  soundHints: string[];
  arrangement: ArrangementSection[];
  /** Plain-language reasons why this idea sounds like the artist. */
  insights: string[];
  fixes: number;
}
