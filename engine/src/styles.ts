// Registry of style profiles and rhythms (the "knowledge as data").

import fredAgain from "../../data/styles/fred-again.json";
import avaion from "../../data/styles/avaion.json";
import bunt from "../../data/styles/bunt.json";
import chordRhythms from "../../data/rhythms/chords.json";
import bassRhythms from "../../data/rhythms/bass.json";
import leadRhythms from "../../data/rhythms/lead.json";
import pluckRhythms from "../../data/rhythms/pluck.json";
import drumPatterns from "../../data/rhythms/drums.json";
import { DrumPattern, Rhythm } from "./rhythm";
import { StyleProfile, StyleVariant } from "./types";

export const STYLES: StyleProfile[] = [fredAgain, avaion, bunt] as unknown as StyleProfile[];

const RHYTHMS = new Map<string, Rhythm>();
for (const list of [chordRhythms, bassRhythms, leadRhythms, pluckRhythms] as unknown as Rhythm[][]) {
  for (const r of list) {
    if (RHYTHMS.has(r.id)) throw new Error(`Rhythmus doppelt: ${r.id}`);
    RHYTHMS.set(r.id, r);
  }
}

const DRUMS = new Map<string, DrumPattern>();
for (const p of drumPatterns as unknown as DrumPattern[]) DRUMS.set(p.id, p);

export function getStyle(styleId: string): StyleProfile {
  const s = STYLES.find((x) => x.id === styleId);
  if (!s) throw new Error(`Unbekannter Stil: ${styleId}`);
  return s;
}

export function getVariant(styleId: string, variantId: string): StyleVariant {
  const v = getStyle(styleId).variants.find((x) => x.id === variantId);
  if (!v) throw new Error(`Unbekannte Variante: ${styleId}/${variantId}`);
  return v;
}

export function getRhythm(id: string): Rhythm {
  const r = RHYTHMS.get(id);
  if (!r) throw new Error(`Unbekannter Rhythmus: ${id}`);
  return r;
}

export function getDrumPattern(id: string): DrumPattern {
  const p = DRUMS.get(id);
  if (!p) throw new Error(`Unbekanntes Drum-Pattern: ${id}`);
  return p;
}

export function allRhythms(): Rhythm[] {
  return [...RHYTHMS.values()];
}

export function allDrumPatterns(): DrumPattern[] {
  return [...DRUMS.values()];
}
