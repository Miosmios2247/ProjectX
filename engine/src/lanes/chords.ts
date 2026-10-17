import { ChordSlot, slotIndexAt } from "../progression";
import { Rhythm, expandBarRhythm, expandChordRhythm } from "../rhythm";
import { accent, clampVel } from "../groove";
import { Rng } from "../rng";
import { Note } from "../types";

const STRUM_GAP = 0.07; // 16ths between strings (~8 ms at 128 BPM)

export function chordsLane(
  slots: readonly ChordSlot[],
  voicings: readonly number[][],
  rhythm: Rhythm,
  totalSteps: number,
  rng: Rng,
): Note[] {
  const hits = rhythm.perChord
    ? slots.flatMap((s) => expandChordRhythm(rhythm, s.start, s.length))
    : expandBarRhythm(rhythm, totalSteps);
  const notes: Note[] = [];
  for (const h of hits) {
    const idx = slotIndexAt(slots, h.step);
    const slot = slots[idx];
    const voicing = voicings[idx];
    const end = slot.start + slot.length;
    const len = Math.max(0.5, Math.min(h.len, end - h.step));
    let voices = voicing;
    if (h.role === "top") voices = voicing.slice(Math.max(1, voicing.length - 3));
    if (h.role === "low") voices = voicing.slice(0, 2);
    const strum = h.role === "down" || h.role === "up";
    const ordered = h.role === "up" ? [...voices].reverse() : voices;
    const top = voicing[voicing.length - 1];
    ordered.forEach((pitch, i) => {
      const offset = strum ? i * STRUM_GAP : 0;
      let vel = (h.vel ?? 96) + accent(h.step) + rng.int(-5, 5);
      if (pitch === top) vel += 4;
      if (h.role === "up") vel -= 10;
      notes.push({
        pitch,
        start: h.step + offset,
        len: Math.max(0.25, len - offset),
        vel: clampVel(vel),
      });
    });
  }
  return notes;
}
