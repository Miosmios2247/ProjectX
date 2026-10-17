import { describe, expect, it } from "vitest";
import {
  KEYS,
  LANES,
  STYLES,
  chordPcs,
  generateIdea,
  mod12,
  rubsSemitone,
  slotAt,
} from "../src/index";

const variants = STYLES.flatMap((s) => s.variants.map((v) => ({ styleId: s.id, variantId: v.id })));

describe("generateIdea", () => {
  it("works for every style, key, length and a few seeds", () => {
    let count = 0;
    const problems: string[] = [];
    for (const { styleId, variantId } of variants) {
      for (const key of KEYS) {
        for (const bars of [4, 8] as const) {
          for (const seed of [1, 2024]) {
            const idea = generateIdea({ styleId, variantId, key, bars, seed });
            const where = `${styleId}/${variantId} ${key.tonic}-${key.mode} ${bars} ${seed}`;
            if (idea.totalSteps !== bars * 16) problems.push(`${where}: length`);
            for (const lane of LANES) {
              const notes = idea.lanes[lane].notes;
              if (!notes.length) problems.push(`${where}: ${lane} empty`);
              for (const n of notes) {
                const ok =
                  n.pitch >= 0 && n.pitch <= 127 && n.len > 0 && n.start >= 0 &&
                  n.start < idea.totalSteps && n.vel >= 1 && n.vel <= 127;
                if (!ok) problems.push(`${where}: ${lane} ${JSON.stringify(n)}`);
              }
            }
            if (!idea.drums.hits.length) problems.push(`${where}: no drums`);
            count++;
          }
        }
      }
    }
    expect(problems.slice(0, 10)).toEqual([]);
    expect(count).toBe(variants.length * 24 * 4);
  }, 60_000);

  it("is deterministic", () => {
    const p = { styleId: "avaion", variantId: "wacuka", key: null, bars: 8 as const, seed: 77 };
    expect(JSON.stringify(generateIdea(p))).toBe(JSON.stringify(generateIdea(p)));
  });

  it("re-rolling one lane leaves the others alone", () => {
    const p = { styleId: "fred-again", variantId: "emotional-house", key: null, bars: 4 as const, seed: 5 };
    const a = generateIdea(p);
    const b = generateIdea({ ...p, laneSeeds: { bass: 999 } });
    expect(b.lanes.chords.notes).toEqual(a.lanes.chords.notes);
    expect(b.progressionText).toBe(a.progressionText);
    expect(b.drums.hits).toEqual(a.drums.hits);
    const c = generateIdea({ ...p, laneSeeds: { chords: 12345 } });
    expect(c.key).toEqual(a.key);
    expect(c.bpm).toBe(a.bpm);
  });

  it("keeps the lead monophonic and free of semitone rubs on strong beats", () => {
    for (const { styleId, variantId } of variants) {
      for (let seed = 1; seed <= 40; seed++) {
        const idea = generateIdea({ styleId, variantId, key: null, bars: 8, seed });
        const lead = [...idea.lanes.lead.notes].sort((x, y) => x.start - y.start);
        for (let i = 1; i < lead.length; i++) {
          expect(lead[i - 1].start + lead[i - 1].len).toBeLessThanOrEqual(lead[i].start + 1e-6);
        }
        for (const n of lead) {
          const strong = Math.round(n.start) % 4 === 0 || n.len >= 3;
          if (!strong) continue;
          const pcs = chordPcs(slotAt(idea.progression, n.start).chord);
          const pc = mod12(n.pitch);
          const rub = !pcs.includes(pc) && rubsSemitone(pc, pcs);
          expect(rub, `${styleId}/${variantId} seed ${seed} ${idea.progressionText}`).toBe(false);
        }
      }
    }
  });

  it("keeps the bass under the chords that sound with it", () => {
    for (const { styleId, variantId } of variants) {
      for (let seed = 1; seed <= 20; seed++) {
        const idea = generateIdea({ styleId, variantId, key: null, bars: 4, seed });
        for (const b of idea.lanes.bass.notes) {
          const under = idea.lanes.chords.notes.filter(
            (c) => c.start <= b.start + 0.01 && c.start + c.len > b.start + 0.01,
          );
          if (!under.length || b.pitch - 12 < 24) continue;
          const lowest = Math.min(...under.map((c) => c.pitch));
          expect(b.pitch, `${styleId}/${variantId} seed ${seed}`).toBeLessThanOrEqual(lowest - 5);
        }
        expect(Math.min(...idea.lanes.bass.notes.map((n) => n.pitch))).toBeGreaterThanOrEqual(24);
      }
    }
  });

  it("gives every variant a song arrangement with a full drop", () => {
    const lanes = new Set<string>([...LANES, "drums"]);
    for (const { styleId, variantId } of variants) {
      const idea = generateIdea({ styleId, variantId, key: null, bars: 4, seed: 7 });
      const where = `${styleId}/${variantId}`;
      const total = idea.arrangement.reduce((a, s) => a + s.bars, 0);
      expect(total, where).toBeGreaterThanOrEqual(16);
      expect(total, where).toBeLessThanOrEqual(40);
      for (const s of idea.arrangement) {
        expect(s.bars % 4, `${where} ${s.name}`).toBe(0);
        for (const l of s.lanes) expect(lanes.has(l), `${where} ${s.name} ${l}`).toBe(true);
      }
      expect(idea.arrangement.some((s) => s.lanes.length === lanes.size && !s.noKick), where).toBe(true);
      // A build always leads into another section.
      const last = idea.arrangement[idea.arrangement.length - 1];
      expect(last.build ?? false, where).toBe(false);
    }
  });
});
