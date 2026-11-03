import { describe, expect, it } from "vitest";
import { ChordSlot, DrumPattern, MOODS, STYLES, buildChord, createRng, generateIdea, getVariant } from "../src/index";
import { lane808 } from "../src/lanes/bass";
import { drumsLane } from "../src/lanes/drums";
import { melodyScalePcs } from "../src/lanes/lead";
import { BassLaneProfile } from "../src/types";

const key = { tonic: 0, mode: "minor" as const };
const slots: ChordSlot[] = [
  { chord: buildChord("i", key), start: 0, length: 16 },
  { chord: buildChord("VI", key), start: 16, length: 16 },
];
const profile: BassLaneProfile = { sound: ["808"], rhythms: ["808-kick"], range: [28, 43], mode: "808", glide: 1, octave: 0 };

describe("trap 808", () => {
  it("starts with every kick and at every chord change, and rings until the next one", () => {
    const notes = lane808(slots, [0, 6, 10, 22, 26], profile, 32, createRng(3));
    expect(notes.map((n) => n.start)).toEqual([0, 6, 10, 16, 22, 26]);
    notes.forEach((n, i) => {
      const next = notes[i + 1]?.start ?? 32;
      expect(n.start + n.len).toBeLessThanOrEqual(next + 1e-9);
    });
    // The roots of the chords: C under i, A♭ under VI.
    expect(notes.slice(0, 3).every((n) => n.pitch % 12 === 0)).toBe(true);
    expect(notes.slice(3).every((n) => n.pitch % 12 === 8)).toBe(true);
  });

  it("slides only into a new pitch from a note that still sounds", () => {
    const notes = lane808(slots, [0, 6, 10, 22, 26], profile, 32, createRng(5));
    notes.forEach((n, i) => {
      if (!n.glide) return;
      const prev = notes[i - 1];
      expect(prev.pitch).not.toBe(n.pitch);
      expect(prev.start + prev.len).toBeGreaterThanOrEqual(n.start - 0.01);
    });
    // With glide chance 1 the chord change is a slide unless the note before left a gap.
    const change = notes.find((n) => n.start === 16)!;
    const before = notes[notes.indexOf(change) - 1];
    if (before.start + before.len >= 16 - 0.01) expect(change.glide).toBe(true);
  });

  it("jumps an octave only after the first note of a chord", () => {
    const notes = lane808(slots, [0, 4, 8, 12, 20, 24, 28], { ...profile, octave: 1, glide: 0 }, 32, createRng(9));
    for (const n of notes) {
      const first = n.start === 0 || n.start === 16;
      if (first) expect(n.pitch).toBeLessThanOrEqual(43);
    }
    expect(notes.some((n) => n.pitch > 43)).toBe(true);
  });
});

describe("hi-hat rolls", () => {
  const pattern: DrumPattern = {
    id: "test",
    name: "Test",
    kit: "trap",
    tags: [],
    bars: 1,
    tracks: { kick: [0], clap: [8], hatC: [0, 2, 4, 6, 8, 10, 12, 14] },
    rolls: { inst: "hatC", at: [14], chance: 1, kinds: ["32"] },
  };

  it("replaces the hats a roll covers with a rising burst", () => {
    const hits = drumsLane(pattern, 2, createRng(1));
    const hats = hits.filter((h) => h.inst === "hatC");
    for (const bar of [0, 1]) {
      const roll = hats.filter((h) => h.step >= bar * 16 + 14 && h.step < bar * 16 + 16);
      expect(roll.map((h) => h.step - bar * 16)).toEqual([14, 14.5, 15, 15.5]);
      expect(roll[3].vel).toBeGreaterThan(roll[0].vel);
    }
    expect(hits.filter((h) => h.inst === "kick")).toHaveLength(2);
  });

  it("plays triplets over two 16ths", () => {
    const hits = drumsLane({ ...pattern, rolls: { inst: "hatC", at: [6], chance: 1, kinds: ["16t"] } }, 1, createRng(2));
    const roll = hits.filter((h) => h.inst === "hatC" && h.step >= 6 && h.step < 8).map((h) => +h.step.toFixed(3));
    expect(roll).toEqual([6, 6.667, 7.333]);
  });

  it("leaves patterns without rolls alone", () => {
    const plain = { ...pattern, rolls: undefined };
    expect(drumsLane(plain, 2, createRng(4)).every((h) => Number.isInteger(h.step))).toBe(true);
  });
});

describe("melody scales", () => {
  it("colours minor keys and leaves major keys alone", () => {
    expect(melodyScalePcs(key, "harmonic")).toEqual([0, 2, 3, 5, 7, 8, 11]);
    expect(melodyScalePcs(key, "phrygian")).toEqual([0, 1, 3, 5, 7, 8, 10]);
    expect(melodyScalePcs({ tonic: 0, mode: "major" }, "harmonic")).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });
});

describe("hip-hop styles", () => {
  const hiphop = STYLES.filter((s) => s.genre === "hiphop").flatMap((s) => s.variants.map((v) => ({ styleId: s.id, variantId: v.id })));
  const offGrid = (steps: number[]) => steps.filter((x) => !Number.isInteger(x)).length;

  it("has three artists with two takes each", () => {
    expect(hiphop).toHaveLength(6);
  });

  it("lets the 808 follow the kick and slide now and then, with rolling hats", () => {
    for (const { styleId, variantId } of hiphop) {
      let glides = 0;
      let rolls = 0;
      for (let seed = 1; seed <= 6; seed++) {
        const idea = generateIdea({ styleId, variantId, key: null, bars: 8, seed });
        expect(idea.lanes.bass.rhythmId).toBe("808-kick");
        const kicks = new Set(idea.drums.hits.filter((h) => h.inst === "kick").map((h) => Math.round(h.step * 4) / 4));
        const changes = new Set(idea.progression.map((s) => s.start));
        for (const n of idea.lanes.bass.notes) expect(kicks.has(n.start) || changes.has(n.start), `${styleId}/${variantId} ${n.start}`).toBe(true);
        glides += idea.lanes.bass.notes.filter((n) => n.glide).length;
        rolls += offGrid(idea.drums.hits.filter((h) => h.inst === "hatC").map((h) => h.step));
      }
      expect(glides, `${styleId}/${variantId}`).toBeGreaterThan(0);
      expect(rolls, `${styleId}/${variantId}`).toBeGreaterThan(0);
    }
  });

  it("keeps its own grooves under every mood", () => {
    for (const { styleId, variantId } of hiphop) {
      const own = new Set(getVariant(styleId, variantId).lanes.chords.rhythms.map((r) => (typeof r === "string" ? r : r.id)));
      for (const mood of MOODS) {
        for (let seed = 1; seed <= 4; seed++) {
          const plain = generateIdea({ styleId, variantId, key: null, bars: 4, seed });
          const idea = generateIdea({ styleId, variantId, key: null, bars: 4, seed, mood: mood.id });
          const where = `${styleId}/${variantId} ${mood.id} ${seed}`;
          expect(idea.lanes.bass.rhythmId, where).toBe("808-kick");
          expect(own.has(idea.lanes.chords.rhythmId), where).toBe(true);
          // No house offbeat hats or 16th fills: the hats are the pattern's own (rolls aside).
          const opens = (i: typeof idea) => i.drums.hits.filter((h) => h.inst === "hatO").length;
          if (idea.drums.patternId === plain.drums.patternId) expect(opens(idea), where).toBe(opens(plain));
          expect(idea.insights.find((t) => t.startsWith("Stimmung")), where).not.toMatch(/Drop|Tamburin|Shaker|Aufbau|16tel/);
        }
      }
    }
  });

  it("rolls the hats more with energy and less when calm", () => {
    const count = (mood: "energie" | "vertraeumt") => {
      let n = 0;
      for (const { styleId, variantId } of hiphop) {
        for (let seed = 1; seed <= 10; seed++) {
          const idea = generateIdea({ styleId, variantId, key: null, bars: 8, seed, mood });
          n += offGrid(idea.drums.hits.filter((h) => h.inst === "hatC").map((h) => h.step));
        }
      }
      return n;
    };
    expect(count("energie")).toBeGreaterThan(count("vertraeumt") * 2);
  });
});
