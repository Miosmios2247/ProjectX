// "Musik-TÜV": checks the lanes against each other and fixes clashes.

import { ChordSlot, chordSlotForNote } from "./progression";
import { chordPcs, isAvoidNote, mod12, nearestWithPc, rubsSemitone } from "./theory";
import { Note } from "./types";

function soundingAt(notes: readonly Note[], step: number): Note[] {
  return notes.filter((n) => n.start <= step + 0.01 && n.start + n.len > step + 0.01);
}

export interface CheckResult {
  fixes: number;
}

export function checkLanes(
  slots: readonly ChordSlot[],
  chords: Note[],
  bass: Note[],
  lead: Note[],
  pluck: Note[],
  leadRange: [number, number],
): CheckResult {
  let fixes = 0;

  // Lead: no avoid notes (a semitone above a chord tone) on strong or long notes.
  for (const n of lead) {
    const chordPcSet = chordPcs(chordSlotForNote(slots, n.start, n.len).chord);
    const strong = Math.round(n.start) % 4 === 0 || n.len >= 3;
    const pc = mod12(n.pitch);
    if (strong && isAvoidNote(pc, chordPcSet)) {
      const fixed = nearestWithPc(n.pitch, chordPcSet, n.pitch - 3, n.pitch + 3);
      if (fixed !== null) {
        n.pitch = fixed;
        fixes++;
      }
    }
  }

  // Lead buried inside the chords most of the time: move the whole line up
  // an octave (per-note jumps would break the melody).
  if (lead.length) {
    let buried = 0;
    for (const n of lead) {
      const under = soundingAt(chords, n.start);
      if (under.length && n.pitch < Math.max(...under.map((c) => c.pitch)) - 4) buried++;
    }
    const maxPitch = Math.max(...lead.map((n) => n.pitch));
    // Only within the lead's range: a sung topline may sit among the keys.
    if (buried / lead.length > 0.5 && maxPitch + 12 <= leadRange[1] + 2) {
      for (const n of lead) n.pitch += 12;
      fixes++;
    }
  }

  // Pluck: drop notes that rub against a lead note starting together.
  for (let i = pluck.length - 1; i >= 0; i--) {
    const p = pluck[i];
    const clash = lead.some(
      (l) => Math.abs(l.start - p.start) < 0.5 && rubsSemitone(mod12(p.pitch), [mod12(l.pitch)]),
    );
    if (clash) {
      pluck.splice(i, 1);
      fixes++;
    }
  }

  // Bass: keep a clear gap under the chords.
  for (const b of bass) {
    const under = soundingAt(chords, b.start);
    if (!under.length) continue;
    const lowest = Math.min(...under.map((c) => c.pitch));
    while (b.pitch > lowest - 5 && b.pitch - 12 >= 24) {
      b.pitch -= 12;
      fixes++;
    }
  }
  return { fixes };
}
