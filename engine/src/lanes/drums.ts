// Drum accompaniment for listening (exported as GM drums in the MIDI).

import { STEPS_PER_BAR } from "../progression";
import { DrumInst, DrumPattern, DrumTrack, RollKind } from "../rhythm";
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

/** Hits of one roll: offsets inside the span it covers. */
const ROLL: Record<RollKind, { span: number; at: number[] }> = {
  "32": { span: 2, at: [0, 0.5, 1, 1.5] },
  "16t": { span: 2, at: [0, 2 / 3, 4 / 3] },
  "64": { span: 2, at: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75] },
  "8t": { span: 4, at: [0, 4 / 3, 8 / 3] },
};

/**
 * Trap hi-hat rolls: at some positions a burst of 1/32, 1/16 triplets or 1/64
 * replaces the hats it covers, rising in velocity into the next beat.
 */
function addRolls(hits: DrumHit[], pattern: DrumPattern, bars: number, rng: Rng): DrumHit[] {
  const r = pattern.rolls;
  if (!r) return hits;
  const kinds = r.kinds.map((k) => (typeof k === "string" ? { kind: k, weight: 1 } : k));
  let out = hits;
  for (let bar = 0; bar < bars; bar++) {
    for (const at of r.at) {
      if (!rng.chance(r.chance)) continue;
      const { kind } = rng.weighted(kinds, (k) => k.weight);
      const roll = ROLL[kind];
      const from = bar * STEPS_PER_BAR + at;
      const base = out.find((x) => x.inst === r.inst && x.step >= from - 0.01 && x.step < from + roll.span)?.vel ?? 70;
      out = out.filter((x) => !(x.inst === r.inst && x.step >= from - 0.01 && x.step < from + roll.span - 0.01));
      roll.at.forEach((o, i) => {
        const rise = roll.at.length > 1 ? i / (roll.at.length - 1) : 0;
        out.push({ inst: r.inst, step: from + o, vel: clampVel(base * (0.62 + 0.38 * rise) + rng.int(-3, 3)) });
      });
    }
  }
  return out.sort((a, b) => a.step - b.step);
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
  const sorted = hits.sort((a, b) => a.step - b.step);
  // Rolls draw from their own stream: patterns without rolls keep exactly the hits they had.
  return pattern.rolls ? addRolls(sorted, pattern, bars, rng.fork("rolls")) : sorted;
}
