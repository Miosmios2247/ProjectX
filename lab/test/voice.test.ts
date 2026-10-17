import { describe, expect, it } from "vitest";
import { analyzeVoice, foldedRate, foldedShift, psola } from "../src/voice-analysis";

const RATE = 44100;

/** A sung-vowel stand-in: a few harmonics with a soft attack and release. */
function vowel(f0: number, seconds: number, rate = RATE): Float32Array {
  const n = Math.round(seconds * rate);
  const out = new Float32Array(n);
  const amps = [1, 0.6, 0.45, 0.3, 0.2, 0.12];
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const env = Math.min(1, t / 0.03, (seconds - t) / 0.05);
    let v = 0;
    amps.forEach((a, h) => (v += a * Math.sin(2 * Math.PI * f0 * (h + 1) * t)));
    out[i] = 0.25 * env * v;
  }
  return out;
}

function concat(...parts: Float32Array[]): Float32Array {
  const out = new Float32Array(parts.reduce((a, p) => a + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

const silence = (s: number) => new Float32Array(Math.round(s * RATE));

describe("analyzeVoice", () => {
  it("finds the pitch of a held vowel and loops it on whole periods", () => {
    const a = analyzeVoice(concat(silence(0.2), vowel(220, 0.9), silence(0.2)), RATE);
    expect(a.slices.length).toBeGreaterThanOrEqual(1);
    for (const s of a.slices) expect(Math.abs(s.f0 - 220) / 220).toBeLessThan(0.02);
    expect(a.sustain).not.toBeNull();
    const sus = a.sustain!;
    expect(Math.abs(sus.f0 - 220) / 220).toBeLessThan(0.02);
    expect(sus.loopEnd).toBeGreaterThan(sus.loopStart + 0.05);
    const periods = (sus.loopEnd - sus.loopStart) * 220;
    expect(Math.abs(periods - Math.round(periods))).toBeLessThan(0.15);
    expect(a.gain).toBeGreaterThan(1);
  });

  it("cuts syllables at the gaps and keeps their pitches", () => {
    const pitches = [196, 247, 294];
    const a = analyzeVoice(
      concat(silence(0.15), vowel(196, 0.25), silence(0.08), vowel(247, 0.25), silence(0.08), vowel(294, 0.3), silence(0.2)),
      RATE,
    );
    expect(a.slices.length).toBe(3);
    a.slices.forEach((s, i) => expect(Math.abs(s.f0 - pitches[i]) / pitches[i]).toBeLessThan(0.02));
    expect(a.slices[0].start).toBeGreaterThan(0.1);
    expect(a.slices[0].start).toBeLessThan(0.2);
  });

  it("marks noise as unpitched and handles silence", () => {
    let seed = 1;
    const noise = new Float32Array(Math.round(0.4 * RATE)).map(() => {
      seed = (seed * 16807) % 2147483647;
      return (seed / 2147483647 - 0.5) * 0.4;
    });
    const a = analyzeVoice(concat(silence(0.1), noise, silence(0.1)), RATE);
    expect(a.slices.length).toBeGreaterThanOrEqual(1);
    expect(a.slices.every((s) => s.f0 === 0)).toBe(true);
    expect(a.sustain).toBeNull();
    const quiet = analyzeVoice(silence(0.5), RATE);
    expect(quiet.sustain).toBeNull();
  });
});

describe("foldedRate", () => {
  it("transposes by octaves into ±6 semitones", () => {
    expect(foldedRate(440, 220)).toBeCloseTo(1, 5);
    expect(foldedRate(330, 220)).toBeCloseTo(0.75, 5);
    expect(foldedRate(261.63, 220)).toBeCloseTo(261.63 / 220, 5);
    expect(foldedRate(500, 0)).toBe(1);
  });
});

describe("psola", () => {
  const f0Of = (x: Float32Array) => {
    const a = analyzeVoice(concat(silence(0.1), x, silence(0.1)), RATE);
    return a.slices.length ? a.slices[0].f0 : 0;
  };

  it("moves the pitch and keeps the length and level", () => {
    const src = vowel(220, 0.6);
    for (const st of [-5, -2, 3, 6]) {
      const out = psola(src, RATE, 0, 0.6, 220, st);
      expect(out.length).toBe(src.length);
      const want = 220 * Math.pow(2, st / 12);
      expect(Math.abs(f0Of(out) - want) / want).toBeLessThan(0.03);
      const rms = (v: Float32Array) => Math.sqrt(v.reduce((s, q) => s + q * q, 0) / v.length);
      expect(rms(out) / rms(src)).toBeGreaterThan(0.6);
      expect(rms(out) / rms(src)).toBeLessThan(1.5);
    }
  });

  it("leaves unpitched sound and zero shifts alone", () => {
    const src = vowel(220, 0.3);
    expect(psola(src, RATE, 0, 0.3, 0, 4)).toEqual(src);
    expect(psola(src, RATE, 0, 0.3, 220, 0)).toEqual(src);
  });

  it("folds a target into ±6 semitones of the voice", () => {
    expect(foldedShift(57, 220)).toBeCloseTo(0, 5); // A3 on A3
    expect(foldedShift(69 + 3, 220)).toBeCloseTo(3, 5);
    expect(foldedShift(69 + 7, 220)).toBeCloseTo(-5, 5);
    expect(foldedShift(60, 0)).toBe(0);
  });
});
