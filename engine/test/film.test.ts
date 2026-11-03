import { describe, expect, it } from "vitest";
import { ChordSlot, buildChord, chordPcs, createRng, getMood, getRhythm, moodDrums } from "../src/index";
import { pluckLane } from "../src/lanes/pluck";
import { leadLane } from "../src/lanes/lead";
import { DrumHit } from "../src/types";

const key = { tonic: 9, mode: "minor" as const };
const slots: ChordSlot[] = ["i", "VI", "III", "VII"].map((d, i) => ({ chord: buildChord(d, key), start: i * 16, length: 16 }));

describe("film ostinato", () => {
  it("returns to its lowest tone between all other notes", () => {
    const voicings = slots.map((s) => chordPcs(s.chord).map((pc) => 57 + ((pc - 9 + 12) % 12)));
    const notes = pluckLane(slots, voicings, getRhythm("ostinato-16"), "arp", "pedal", [57, 81], 64, createRng(4));
    expect(notes).toHaveLength(64);
    for (let bar = 0; bar < 4; bar++) {
      const inBar = notes.filter((n) => n.start >= bar * 16 && n.start < bar * 16 + 16);
      const low = Math.min(...inBar.map((n) => n.pitch));
      inBar.forEach((n, i) => {
        if (i % 2 === 0) expect(n.pitch).toBe(low);
        else expect(n.pitch).toBeGreaterThan(low);
      });
    }
  });
});

describe("film theme", () => {
  it("sings long notes, mostly in steps, with few syncopations", () => {
    let long = 0;
    let all = 0;
    let steps = 0;
    let moves = 0;
    let offbeats = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const { notes } = leadLane(slots, key, "theme", [60, 81], false, getRhythm("theme-long"), getRhythm("theme-call"), 64, createRng(seed));
      expect(notes.length).toBeGreaterThan(6);
      for (const n of notes) {
        expect(n.pitch).toBeGreaterThanOrEqual(58);
        expect(n.pitch).toBeLessThanOrEqual(83);
        all++;
        if (n.len >= 4) long++;
        if (Math.round(n.start) % 2 === 1) offbeats++;
      }
      for (let i = 1; i < notes.length; i++) {
        const d = Math.abs(notes[i].pitch - notes[i - 1].pitch);
        if (d === 0) continue;
        moves++;
        if (d <= 2) steps++;
      }
    }
    expect(long / all).toBeGreaterThan(0.5);
    expect(steps / moves).toBeGreaterThan(0.45);
    expect(offbeats / all).toBeLessThan(0.1);
  });
});

describe("film percussion under moods", () => {
  const taiko: DrumHit[] = [
    { inst: "kick", step: 0, vel: 110 },
    { inst: "tom", step: 12, vel: 84 },
  ];

  it("adds a tom pulse in 8ths with energy and plays softer when calm", () => {
    const up = moodDrums(taiko, getMood("energie"), 1, 120, createRng(1), "film");
    expect(up.filter((h) => h.inst === "tom").map((h) => h.step)).toEqual([2, 4, 6, 8, 10, 12, 14]);
    const calm = moodDrums(taiko, getMood("vertraeumt"), 1, 120, createRng(1), "film");
    expect(calm.every((h, i) => h.vel < taiko[i].vel)).toBe(true);
  });

  it("leaves a cue without drums without drums", () => {
    expect(moodDrums([], getMood("energie"), 2, 120, createRng(1), "film")).toEqual([]);
    expect(moodDrums([], getMood("episch"), 4, 120, createRng(1), "film")).toEqual([]);
  });
});
