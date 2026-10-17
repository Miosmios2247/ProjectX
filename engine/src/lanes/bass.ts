import { ChordSlot, chordSlotForNote, slotIndexAt } from "../progression";
import { Rhythm, expandBarRhythm, expandChordRhythm } from "../rhythm";
import { accent, clampVel } from "../groove";
import { Rng } from "../rng";
import { Key, chordRoles, inScale, nearestWithPc } from "../theory";
import { BassLaneProfile, Note } from "../types";

export function bassLane(
  slots: readonly ChordSlot[],
  key: Key,
  rhythm: Rhythm,
  profile: BassLaneProfile,
  totalSteps: number,
  rng: Rng,
): { notes: Note[]; pedal: boolean } {
  const [lo, hi] = profile.range;
  const pedal = rng.chance(profile.pedal ?? 0);
  const hits = rhythm.perChord
    ? slots.flatMap((s) => expandChordRhythm(rhythm, s.start, s.length))
    : expandBarRhythm(rhythm, totalSteps);
  const notes: Note[] = [];
  let anchor = lo + 7;
  for (const h of hits) {
    const idx = slots.indexOf(chordSlotForNote(slots, h.step, h.len));
    const slot = slots[idx];
    const chord = slot.chord;
    const end = slot.start + slot.length;
    const bassPc = pedal ? key.tonic : chord.bass;
    const root = nearestWithPc(anchor, [bassPc], lo, hi) ?? lo;
    let pitch = root;
    const roles = chordRoles(chord);
    switch (h.role) {
      case "O":
        pitch = root + 12;
        break;
      case "5":
        if (roles.fifth !== null) pitch = nearestWithPc(root + 7, [roles.fifth], root + 1, root + 11) ?? root;
        break;
      case "3":
        if (roles.third !== null) pitch = nearestWithPc(root + 4, [roles.third], root + 1, root + 11) ?? root;
        break;
      case "A": {
        const nextIdx = idx + 1 < slots.length ? idx + 1 : 0;
        const nextStart = idx + 1 < slots.length ? slots[nextIdx].start : totalSteps;
        if (nextStart - h.step <= 4) {
          const nextPc = pedal ? key.tonic : slots[nextIdx].chord.bass;
          const target = nearestWithPc(root, [nextPc], lo, hi) ?? root;
          if (target !== root) {
            // A scale step either side, or (garage, house) a semitone from below.
            const options = [target - 2, target - 1, target + 2, target + 1].filter(
              (n) =>
                n >= lo - 2 &&
                n <= hi + 2 &&
                n !== root &&
                (inScale(n, key) || (profile.chromatic === true && n === target - 1)),
            );
            if (options.length) {
              options.sort((a, b) => Math.abs(a - root) - Math.abs(b - root));
              pitch = options[0];
            }
          }
        }
        break;
      }
    }
    anchor = root;
    const len = Math.max(0.5, Math.min(h.len, end - h.step));
    notes.push({
      pitch,
      start: h.step,
      len,
      vel: clampVel((h.vel ?? 100) + accent(h.step) + rng.int(-4, 4)),
    });
  }
  // Keep the sub register clean: no note above hi + 12.
  for (const n of notes) while (n.pitch > hi + 12) n.pitch -= 12;
  for (const n of notes) while (n.pitch < lo - 4) n.pitch += 12;
  return { notes, pedal };
}
