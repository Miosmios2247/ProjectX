// How a vocal lead is phrased in the song form: sung "raw" (held notes
// instead of chops), stretched (one held vowel per chord, no gate) or with a
// stacked harmony before the drop. Pure functions, tested in lab/test.

import { ChordSlot, Key, Note, chordPcs, chordSlotForNote, isAvoidNote, mod12, scalePcs, slotIndexAt } from "../../engine/src/index";

/**
 * Legato phrasing: repeats of the same pitch merge into one held syllable that
 * lasts until the next syllable starts. A new syllable starts on a new pitch,
 * after a rest of an 8th or more, and (when `splitAtChords`) on a chord change.
 * Returns each note's held end in steps, or null when it merges into the one before.
 */
export function legatoEnds(
  sorted: readonly Note[],
  slots: readonly ChordSlot[],
  totalSteps: number,
  splitAtChords: boolean,
): (number | null)[] {
  const starts: number[] = [];
  let syllable = -1;
  sorted.forEach((n, i) => {
    const prev = sorted[i - 1];
    const fresh =
      !prev ||
      prev.pitch !== n.pitch ||
      n.start - (prev.start + prev.len) >= 2 ||
      (splitAtChords && slotIndexAt(slots, n.start) !== slotIndexAt(slots, sorted[syllable].start));
    if (fresh) {
      starts.push(i);
      syllable = i;
    }
  });
  const ends: (number | null)[] = sorted.map(() => null);
  starts.forEach((i, k) => {
    const next = starts[k + 1];
    ends[i] = next === undefined ? totalSteps : sorted[next].start;
  });
  return ends;
}

/** A scale tone 3–4 semitones below `pitch` that is no avoid note over the chord (a chord tone first). */
function thirdBelow(pitch: number, chord: readonly number[], scale: readonly number[]): number | null {
  const options = [pitch - 3, pitch - 4].filter((p) => scale.includes(mod12(p)) && !isAvoidNote(mod12(p), chord));
  options.sort((a, b) => Number(chord.includes(mod12(b))) - Number(chord.includes(mod12(a))));
  return options[0] ?? null;
}

/**
 * Stacked harmony under a sung lead, like AVAION's vocal stacks into the drop:
 * for each note a 3rd below and a 3rd below that, from the key's scale.
 */
export function harmonyFor(lead: readonly Note[], slots: readonly ChordSlot[], key: Key): number[][] {
  const scale = scalePcs(key);
  return lead.map((n) => {
    const chord = chordPcs(chordSlotForNote(slots, n.start, n.len).chord);
    const out: number[] = [];
    const h1 = thirdBelow(n.pitch, chord, scale);
    if (h1 !== null) {
      out.push(h1);
      const h2 = thirdBelow(h1, chord, scale);
      if (h2 !== null) out.push(h2);
    }
    return out;
  });
}
