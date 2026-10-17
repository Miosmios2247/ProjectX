import { describe, expect, it } from "vitest";
import {
  KEYS,
  STYLES,
  buildProgression,
  chordRoles,
  createRng,
  mod12,
  movement,
  voiceProgression,
} from "../src/index";

const LOW_LIMIT: Record<number, number> = {
  1: 52, 2: 51, 3: 48, 4: 46, 5: 45, 6: 46, 7: 34, 8: 41, 9: 41, 10: 41, 11: 41,
};

describe("voicing", () => {
  it("stays in range, keeps the important tones and avoids muddy low intervals", () => {
    let checked = 0;
    let totalMove = 0;
    let moves = 0;
    for (const style of STYLES) {
      for (const v of style.variants) {
        const opts = v.lanes.chords.voicing;
        for (const key of KEYS) {
          const rng = createRng(key.tonic * 31 + (key.mode === "major" ? 7 : 3));
          const { slots } = buildProgression(v.harmony, key, 4, rng.fork("p"));
          const voicings = voiceProgression(slots.map((s) => s.chord), opts, rng.fork("v"));
          voicings.forEach((notes, i) => {
            const chord = slots[i].chord;
            const roles = chordRoles(chord);
            expect(notes.length).toBeGreaterThanOrEqual(opts.voices[0] - 1);
            for (let j = 0; j < notes.length; j++) {
              expect(notes[j]).toBeGreaterThanOrEqual(opts.low);
              expect(notes[j]).toBeLessThanOrEqual(opts.high);
              if (j > 0) {
                const iv = notes[j] - notes[j - 1];
                expect(iv).toBeGreaterThan(0);
                if (iv < 12) expect(notes[j - 1]).toBeGreaterThanOrEqual(LOW_LIMIT[iv]);
              }
            }
            const pcs = notes.map(mod12);
            if (roles.third !== null) expect(pcs).toContain(roles.third);
            if (i > 0) {
              totalMove += movement(voicings[i - 1], notes) / notes.length;
              moves++;
            }
            checked++;
          });
        }
      }
    }
    expect(checked).toBeGreaterThan(500);
    // Smooth voice leading: on average less than 3 semitones per voice.
    expect(totalMove / moves).toBeLessThan(3);
  });
});
