import { describe, expect, it } from "vitest";
import { BANDS, analyzeMix, bandBalance, compareMix, estimateTempo, loudness, loudestStretch, pumpDepth } from "../src/reference";

const RATE = 22050;

function tone(freq: number, seconds: number, amp: number): Float32Array {
  const out = new Float32Array(Math.round(seconds * RATE));
  for (let i = 0; i < out.length; i++) out[i] = amp * Math.sin((2 * Math.PI * freq * i) / RATE);
  return out;
}

/** A four-on-the-floor loop: a kick on every beat and a pad that is ducked after each kick (or not). */
function houseLoop(bpm: number, seconds: number, pumped: boolean): Float32Array {
  const out = new Float32Array(Math.round(seconds * RATE));
  const beat = (60 / bpm) * RATE;
  for (let i = 0; i < out.length; i++) {
    const t = (i % beat) / RATE;
    const kick = 0.6 * Math.exp(-t * 18) * Math.sin(2 * Math.PI * (50 + 60 * Math.exp(-t * 30)) * t);
    const duck = pumped ? 1 - 0.85 * Math.exp(-t * 9) : 1;
    const pad = 0.15 * duck * (Math.sin((2 * Math.PI * 440 * i) / RATE) + 0.5 * Math.sin((2 * Math.PI * 660 * i) / RATE));
    out[i] = kick + pad;
  }
  return out;
}

describe("reference analysis", () => {
  it("measures loudness like BS.1770", () => {
    // A 1 kHz sine with amplitude 0.1 reads about -23 LUFS.
    expect(loudness([tone(1000, 2, 0.1)], RATE)).toBeCloseTo(-23, 0);
  });

  it("puts a bass tone into the bass band", () => {
    const bands = bandBalance(tone(110, 2, 0.5), RATE);
    expect(bands.indexOf(Math.max(...bands))).toBe(BANDS.findIndex((b) => b.name === "Bass"));
  });

  it("finds the tempo and the pump of a house loop", () => {
    const pumped = houseLoop(124, 12, true);
    const steady = houseLoop(124, 12, false);
    expect(Math.abs((estimateTempo(pumped, RATE) ?? 0) - 124)).toBeLessThan(2);
    expect(pumpDepth(pumped, RATE, 124)).toBeGreaterThan(pumpDepth(steady, RATE, 124) + 4);
  });

  it("compares two mixes in plain words", () => {
    const ref = analyzeMix([houseLoop(124, 10, true)], RATE);
    const idea = analyzeMix([houseLoop(124, 10, false)], RATE, { bpm: 124 });
    const lines = compareMix(ref, idea);
    expect(lines.some((l) => l.startsWith("Pumpen"))).toBe(true);
    expect(compareMix(ref, ref)).toEqual(["Klangbalance, Pumpen und Tempo liegen nah am Vorbild."]);
  });

  it("finds the loudest stretch", () => {
    const quiet = tone(440, 10, 0.05);
    const loud = tone(440, 10, 0.5);
    const song = new Float32Array(quiet.length * 2);
    song.set(quiet, 0);
    song.set(loud, quiet.length);
    expect(loudestStretch(song, RATE, 8)).toBeGreaterThanOrEqual(9.5);
  });
});
