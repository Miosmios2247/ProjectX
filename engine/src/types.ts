// Shared data types for style profiles and generated ideas.

import { Key } from "./theory";
import { ChordSlot, HarmonyProfile } from "./progression";
import { DrumInst, LaneId, WeightedRef } from "./rhythm";
import { VoicingOptions } from "./voicing";

export type LeadMode = "vocal-chop" | "deep-chop" | "topline" | "folk" | "afro";
export type PluckMode = "arp" | "stab" | "marimba" | "pick";
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
}

export interface LeadLaneProfile extends LaneProfileBase {
  mode: LeadMode;
  range: [number, number];
  /** Allow 7ths/9ths as target notes on strong beats. */
  tensions?: boolean;
}

export interface PluckLaneProfile extends LaneProfileBase {
  mode: PluckMode;
  range: [number, number];
  orders?: ArpOrder[];
}

export interface StyleVariant {
  id: string;
  name: string;
  blurb: string;
  tempo: [number, number];
  swing: number;
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
  };
  soundHints: string[];
}

export interface StyleProfile {
  id: string;
  artist: string;
  blurb: string;
  variants: StyleVariant[];
}

export interface Note {
  pitch: number;
  /** Start and length in 16th steps (before swing). */
  start: number;
  len: number;
  vel: number;
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

export interface IdeaParams {
  styleId: string;
  variantId: string;
  /** null = choose a key that suits the style. */
  key: Key | null;
  bars: 4 | 8;
  seed: number;
  laneSeeds?: Partial<Record<LaneId | "drums", number>>;
  bpm?: number | null;
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
  fixes: number;
}
