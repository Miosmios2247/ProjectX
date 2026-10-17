import { describe, expect, it } from "vitest";
import { generateIdea, mod12, scalePcs } from "../../engine/src/index";
import { harmonyFor, legatoEnds } from "../src/phrasing";

describe("legatoEnds", () => {
  const idea = generateIdea({ styleId: "bunt", variantId: "stutter", key: null, bars: 4, seed: 3 });
  const lead = [...idea.lanes.lead.notes].sort((a, b) => a.start - b.start);

  it("turns a gated vowel into one held note per chord", () => {
    const ends = legatoEnds(lead, idea.progression, idea.totalSteps, true);
    const held = lead.map((n, i) => ({ n, end: ends[i] })).filter((x) => x.end !== null);
    expect(held.length).toBeLessThanOrEqual(idea.progression.length + 1);
    // Held syllables cover the loop without holes.
    for (let i = 1; i < held.length; i++) expect(held[i].n.start).toBe(held[i - 1].end);
    expect(held[held.length - 1].end).toBe(idea.totalSteps);
    for (const h of held) expect(idea.progression.some((s) => s.start === h.n.start)).toBe(true);
  });

  it("keeps re-sung syllables after a rest and on a new pitch", () => {
    const notes = [
      { pitch: 60, start: 0, len: 1, vel: 90 },
      { pitch: 60, start: 1, len: 1, vel: 90 },
      { pitch: 62, start: 2, len: 1, vel: 90 },
      { pitch: 62, start: 6, len: 1, vel: 90 },
    ];
    expect(legatoEnds(notes, idea.progression, 16, false)).toEqual([2, null, 6, 16]);
  });
});

describe("harmonyFor", () => {
  it("stacks scale tones a third apart under a sung topline", () => {
    const idea = generateIdea({ styleId: "avaion", variantId: "pieces", key: null, bars: 4, seed: 2 });
    const scale = scalePcs(idea.key);
    const harm = harmonyFor(idea.lanes.lead.notes, idea.progression, idea.key);
    expect(harm.length).toBe(idea.lanes.lead.notes.length);
    expect(harm.filter((h) => h.length === 2).length).toBeGreaterThan(harm.length / 2);
    idea.lanes.lead.notes.forEach((n, i) => {
      let above = n.pitch;
      for (const h of harm[i]) {
        expect(above - h === 3 || above - h === 4).toBe(true);
        expect(scale).toContain(mod12(h));
        above = h;
      }
    });
  });
});
