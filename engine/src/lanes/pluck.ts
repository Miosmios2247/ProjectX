// Plucks and arps: chord tones played over a rhythm in a pattern.

import { ChordSlot, slotIndexAt } from "../progression";
import { Rhythm, expandBarRhythm } from "../rhythm";
import { accent, clampVel } from "../groove";
import { Rng } from "../rng";
import { ArpOrder, Note, PluckMode } from "../types";

function arpTones(voicing: readonly number[], lo: number, hi: number): number[] {
  // Same chord shape, moved up into the pluck register.
  let shift = 0;
  while (Math.min(...voicing) + shift < lo) shift += 12;
  const tones = voicing.map((n) => n + shift).filter((n) => n <= hi);
  const set = [...new Set(tones)].sort((a, b) => a - b);
  // Add the lowest tone an octave up for longer arps.
  if (set.length && set.length < 5 && set[0] + 12 <= hi) set.push(set[0] + 12);
  if (set.length === 0) set.push(lo + ((voicing[0] - lo) % 12 + 12) % 12);
  return [...new Set(set)].sort((a, b) => a - b);
}

function orderIndex(order: ArpOrder, c: number, n: number): number {
  if (n <= 1) return 0;
  switch (order) {
    case "up":
      return c % n;
    case "down":
      return n - 1 - (c % n);
    case "updown": {
      const period = 2 * n - 2;
      const i = c % period;
      return i < n ? i : period - i;
    }
    case "skip": {
      const k = Math.floor(c / 2);
      return (c % 2 === 0 ? k : k + 2) % n;
    }
    case "pendulum": {
      const k = Math.floor(c / 2) % n;
      return c % 2 === 0 ? k : n - 1 - k;
    }
  }
}

const TRAVIS = [0, 3, 2, 3, 1, 3, 2, 3];

export function pluckLane(
  slots: readonly ChordSlot[],
  voicings: readonly number[][],
  rhythm: Rhythm,
  mode: PluckMode,
  order: ArpOrder,
  range: [number, number],
  totalSteps: number,
  rng: Rng,
): Note[] {
  const [lo, hi] = range;
  const hits = expandBarRhythm(rhythm, totalSteps);
  const notes: Note[] = [];
  let counter = 0;
  let lastSlot = -1;
  let prevCounter: number | null = null;
  for (const h of hits) {
    const idx = slotIndexAt(slots, h.step);
    if (idx !== lastSlot) {
      counter = 0;
      lastSlot = idx;
    }
    const slot = slots[idx];
    const end = slot.start + slot.length;
    const len = Math.max(0.5, Math.min(h.len, end - h.step));
    const vel = clampVel((h.vel ?? 84) + accent(h.step) + rng.int(-6, 6));
    const voicing = voicings[idx];
    if (mode === "stab") {
      const tones = arpTones(voicing, lo, hi).slice(-3);
      for (const pitch of tones) notes.push({ pitch, start: h.step, len, vel });
    } else if (mode === "pick") {
      // Guitar-style picking: bass string, then the upper strings.
      const tones = arpTones(voicing, lo, hi);
      const i = TRAVIS[counter % TRAVIS.length] % tones.length;
      notes.push({ pitch: tones[i], start: h.step, len, vel });
    } else if (mode === "counter") {
      // A quiet high line: stays near the previous note, moves when the chord changes.
      const tones = arpTones(voicing, lo, hi);
      const target = prevCounter ?? tones[tones.length - 1];
      let best = tones[0];
      for (const t of tones) if (Math.abs(t - target) < Math.abs(best - target)) best = t;
      if (best === prevCounter && counter % 2 === 1) {
        const i = tones.indexOf(best);
        best = tones[Math.max(0, Math.min(tones.length - 1, i + (rng.chance(0.5) ? 1 : -1)))];
      }
      prevCounter = best;
      notes.push({ pitch: best, start: h.step, len, vel: clampVel(vel - 6) });
    } else if (mode === "marimba") {
      const tones = arpTones(voicing, lo, hi).slice(-3);
      const pattern = [2, 1, 2, 0, 2, 1, 1, 0];
      const i = Math.min(tones.length - 1, pattern[counter % pattern.length]);
      notes.push({ pitch: tones[i], start: h.step, len, vel });
    } else {
      const tones = arpTones(voicing, lo, hi);
      notes.push({ pitch: tones[orderIndex(order, counter, tones.length)], start: h.step, len, vel });
    }
    counter++;
  }
  return notes;
}

/**
 * Call and answer with the lead: the pluck steps back while the hook sings
 * (quieter, below it, never doubling its onset) and speaks up in the gaps.
 */
export function complementLead(pluck: readonly Note[], lead: readonly Note[], range: [number, number], mode: PluckMode): Note[] {
  const out: Note[] = [];
  for (const p of pluck) {
    const sounding = lead.filter((l) => l.start <= p.start + 0.01 && l.start + l.len > p.start + 0.01);
    if (!sounding.length) {
      out.push({ ...p, vel: clampVel(p.vel + 6) });
      continue;
    }
    const l = sounding[0];
    const together = Math.abs(l.start - p.start) < 0.3;
    if (together && Math.abs(p.pitch - l.pitch) <= 4 && out.length > 0) continue;
    // Arps move under the hook; a counter-line or stabs keep their register and just get quieter.
    let pitch = p.pitch;
    const movable = mode !== "stab" && mode !== "counter";
    if (movable && pitch >= l.pitch - 2 && pitch - 12 >= range[0] - 5) pitch -= 12;
    out.push({ ...p, pitch, vel: clampVel(p.vel - (pitch > l.pitch ? 14 : 8)) });
  }
  return out;
}
