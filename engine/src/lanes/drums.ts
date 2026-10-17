// Drum accompaniment for listening (exported as GM drums in the MIDI).

import { STEPS_PER_BAR } from "../progression";
import { DrumInst, DrumPattern, DrumTrack } from "../rhythm";
import { clampVel } from "../groove";
import { Rng } from "../rng";
import { DrumHit } from "../types";

const DEFAULT_VEL: Record<DrumInst, number> = {
  kick: 112, snare: 100, clap: 100, hatC: 72, hatO: 80, shaker: 60, percHi: 82, percLo: 86, tom: 84, rim: 78, tamb: 64,
};

const LOOSE: Partial<Record<DrumInst, number>> = {
  hatC: 10, hatO: 8, shaker: 12, tamb: 10, percHi: 8, percLo: 8, tom: 8, rim: 6,
};

function entries(track: DrumTrack | undefined, inst: DrumInst, pattern: DrumPattern): [number, number][] {
  if (!track) return [];
  const base = pattern.vel?.[inst] ?? DEFAULT_VEL[inst];
  return track.map((e) => (Array.isArray(e) ? e : [e, base]));
}

export function drumsLane(pattern: DrumPattern, bars: number, rng: Rng): DrumHit[] {
  const hits: DrumHit[] = [];
  const seen = new Set<string>();
  const add = (inst: DrumInst, step: number, vel: number) => {
    const k = `${inst}:${step}`;
    if (seen.has(k)) return;
    seen.add(k);
    const loose = LOOSE[inst] ?? 3;
    hits.push({ inst, step, vel: clampVel(vel + rng.int(-loose, loose)) });
  };
  for (let bar = 0; bar < bars; bar++) {
    const inPattern = bar % pattern.bars;
    const offset = bar * STEPS_PER_BAR;
    for (const inst of Object.keys(pattern.tracks) as DrumInst[]) {
      for (const [step, vel] of entries(pattern.tracks[inst], inst, pattern)) {
        if (Math.floor(step / STEPS_PER_BAR) !== inPattern) continue;
        add(inst, offset + (step % STEPS_PER_BAR), vel);
      }
    }
    if (pattern.fill && (bar + 1) % 4 === 0) {
      for (const inst of Object.keys(pattern.fill) as DrumInst[]) {
        for (const [step, vel] of entries(pattern.fill[inst], inst, pattern)) {
          add(inst, offset + (step % STEPS_PER_BAR), vel);
        }
      }
    }
  }
  return hits.sort((a, b) => a.step - b.step);
}
