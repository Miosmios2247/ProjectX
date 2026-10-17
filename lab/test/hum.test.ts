import { describe, expect, it } from "vitest";
import { humStats, transcribe } from "../src/hum";

const RATE = 22050;

/** A hummed note: a few harmonics, soft edges. */
function hum(midi: number, seconds: number): Float32Array {
  const f0 = 440 * Math.pow(2, (midi - 69) / 12);
  const n = Math.round(seconds * RATE);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const env = Math.min(1, t / 0.02, (seconds - t) / 0.03);
    out[i] = 0.3 * env * (Math.sin(2 * Math.PI * f0 * t) + 0.4 * Math.sin(4 * Math.PI * f0 * t) + 0.2 * Math.sin(6 * Math.PI * f0 * t));
  }
  return out;
}

function line(parts: [number | null, number][]): Float32Array {
  const chunks = parts.map(([m, s]) => (m === null ? new Float32Array(Math.round(s * RATE)) : hum(m, s)));
  const out = new Float32Array(chunks.reduce((a, c) => a + c.length, 0));
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

describe("Hook-Summer", () => {
  it("finds the hummed notes and their timing", () => {
    // 120 BPM: a 16th is 0.125 s.
    const audio = line([[null, 0.25], [64, 0.45], [null, 0.05], [67, 0.2], [null, 0.05], [69, 0.45], [null, 0.05], [67, 0.7], [null, 0.3]]);
    const notes = transcribe(audio, RATE);
    expect(notes.map((n) => n.midi)).toEqual([64, 67, 69, 67]);
    expect(Math.abs(notes[0].start - 0.25)).toBeLessThan(0.05);
    const stats = humStats(notes, 120, 0.25);
    expect(stats.pitches).toBe(3);
    expect(stats.range).toBe(5);
    expect(stats.notes).toBe(4);
    expect(stats.intervals[12 + 3]).toBe(1);
    expect(stats.intervals[12 - 2]).toBe(1);
    expect(stats.steps).toBeCloseTo(2 / 3, 5);
  });

  it("ignores silence", () => {
    expect(transcribe(new Float32Array(RATE), RATE)).toEqual([]);
  });
});
