import { describe, expect, it } from "vitest";
import {
  KEYS,
  LANES,
  MOODS,
  MoodId,
  STYLES,
  buildChord,
  chordPcs,
  chordSlotForNote,
  generateIdea,
  getVariant,
  isAvoidNote,
  loopFeatures,
  mod12,
  typicalMoods,
} from "../src/index";

const variants = STYLES.flatMap((s) => s.variants.map((v) => ({ styleId: s.id, variantId: v.id })));
const moods = MOODS.map((m) => m.id);

describe("moods", () => {
  it("builds every mood loop in every key", () => {
    for (const m of MOODS) {
      for (const p of m.progressions) {
        for (const key of KEYS) for (const d of p.degrees) expect(() => buildChord(d, key), `${m.id} ${d}`).not.toThrow();
      }
    }
  });

  it("works for every variant, mood, length and a few seeds", () => {
    const problems: string[] = [];
    for (const { styleId, variantId } of variants) {
      for (const mood of moods) {
        for (const key of KEYS.filter((_, i) => i % 5 === 0)) {
          for (const bars of [4, 8] as const) {
            for (const seed of [3, 99]) {
              const idea = generateIdea({ styleId, variantId, key, bars, seed, mood });
              const where = `${styleId}/${variantId} ${mood} ${key.tonic}-${key.mode} ${bars} ${seed}`;
              if (idea.mood !== mood) problems.push(`${where}: mood`);
              const covered = idea.progression.reduce((a, s) => a + s.length, 0);
              if (covered !== idea.totalSteps) problems.push(`${where}: chords cover ${covered}`);
              for (const lane of LANES) {
                const notes = idea.lanes[lane].notes;
                if (!notes.length) problems.push(`${where}: ${lane} empty`);
                for (const n of notes) {
                  const ok = n.pitch >= 0 && n.pitch <= 127 && n.len > 0 && n.start >= 0 && n.start < idea.totalSteps && n.vel >= 1 && n.vel <= 127;
                  if (!ok) problems.push(`${where}: ${lane} ${JSON.stringify(n)}`);
                }
              }
              if (!idea.drums.hits.length) problems.push(`${where}: no drums`);
              if (!idea.insights.some((t) => t.startsWith("Stimmung"))) problems.push(`${where}: no mood explanation`);
            }
          }
        }
      }
    }
    expect(problems.slice(0, 10)).toEqual([]);
  }, 60_000);

  it("changes nothing without a mood", () => {
    const p = { styleId: "bunt", variantId: "stutter", key: null, bars: 8 as const, seed: 41 };
    const a = generateIdea(p);
    const b = generateIdea({ ...p, mood: null });
    expect(b.lanes).toEqual(a.lanes);
    expect(b.drums).toEqual(a.drums);
    expect(b.bpm).toBe(a.bpm);
    expect(b.arrangement).toEqual(a.arrangement);
    expect(a.mood).toBeNull();
  });

  it("keeps the lead free of avoid notes on strong beats, also over borrowed chords", () => {
    for (const { styleId, variantId } of variants) {
      for (const mood of moods) {
        for (let seed = 1; seed <= 12; seed++) {
          const idea = generateIdea({ styleId, variantId, key: null, bars: 8, seed, mood });
          const lead = [...idea.lanes.lead.notes].sort((x, y) => x.start - y.start);
          for (let i = 1; i < lead.length; i++) expect(lead[i - 1].start + lead[i - 1].len).toBeLessThanOrEqual(lead[i].start + 1e-6);
          for (const n of lead) {
            if (!(Math.round(n.start) % 4 === 0 || n.len >= 3)) continue;
            const pcs = chordPcs(chordSlotForNote(idea.progression, n.start, n.len).chord);
            expect(isAvoidNote(mod12(n.pitch), pcs), `${styleId}/${variantId} ${mood} seed ${seed} ${idea.progressionText}`).toBe(false);
          }
        }
      }
    }
  }, 60_000);

  it("keeps the bass under the chords", () => {
    for (const { styleId, variantId } of variants) {
      for (const mood of moods) {
        for (let seed = 1; seed <= 8; seed++) {
          const idea = generateIdea({ styleId, variantId, key: null, bars: 4, seed, mood });
          for (const b of idea.lanes.bass.notes) {
            const under = idea.lanes.chords.notes.filter((c) => c.start <= b.start + 0.01 && c.start + c.len > b.start + 0.01);
            if (!under.length || b.pitch - 12 < 24) continue;
            expect(b.pitch, `${styleId}/${variantId} ${mood} seed ${seed}`).toBeLessThanOrEqual(Math.min(...under.map((c) => c.pitch)) - 5);
          }
          expect(Math.min(...idea.lanes.bass.notes.map((n) => n.pitch))).toBeGreaterThanOrEqual(24);
        }
      }
    }
  }, 60_000);

  it("moves loops, tempo, register and drums the way each mood says", () => {
    const stats = (mood: MoodId) => {
      let major = 0, len = 0, bpm = 0, chordMid = 0, drums = 0, epic = 0, n = 0;
      for (const { styleId, variantId } of variants) {
        for (let seed = 1; seed <= 24; seed++) {
          const idea = generateIdea({ styleId, variantId, key: null, bars: 4, seed, mood });
          const slots = idea.progression;
          major += slots.reduce((a, s) => a + (s.chord.quality === "maj" ? s.length : 0), 0) / idea.totalSteps;
          len += idea.totalSteps / 16 / slots.length;
          // Tempo as a share of the style's range, so fast and slow styles count alike.
          const [lo, hi] = getVariant(styleId, variantId).tempo;
          bpm += (idea.bpm - lo) / Math.max(1, hi - lo);
          chordMid += idea.lanes.chords.notes.reduce((a, x) => a + x.pitch, 0) / idea.lanes.chords.notes.length;
          drums += idea.drums.hits.length;
          if (/i – VI – III – VII|VI – III – VII – i/.test(idea.templateText)) epic++;
          n++;
        }
      }
      return { major: major / n, len: len / n, bpm: bpm / n, chordMid: chordMid / n, drums: drums / n, epic: epic / n };
    };
    const s = Object.fromEntries(moods.map((m) => [m, stats(m)])) as Record<MoodId, ReturnType<typeof stats>>;
    expect(s.euphorie.major).toBeGreaterThan(s.dunkel.major + 0.15);
    expect(s.vertraeumt.major).toBeGreaterThan(s.melancholie.major);
    expect(s.energie.bpm).toBeGreaterThan(s.vertraeumt.bpm + 0.3);
    expect(s.energie.drums).toBeGreaterThan(s.vertraeumt.drums);
    expect(s.vertraeumt.len).toBeGreaterThan(s.energie.len);
    expect(s.euphorie.chordMid).toBeGreaterThan(s.dunkel.chordMid + 3);
    expect(s.episch.epic).toBeGreaterThan(0.25);
  }, 60_000);

  it("draws different chords when the mood of one idea changes", () => {
    let distinct = 0;
    let n = 0;
    for (const { styleId, variantId } of variants) {
      for (let seed = 1; seed <= 12; seed++) {
        const loops = [null, ...moods].map((mood) => generateIdea({ styleId, variantId, key: null, bars: 4, seed, mood }).templateText);
        distinct += new Set(loops).size;
        n++;
      }
    }
    // Seven settings (no mood and six moods) should give clearly more than a few loops.
    expect(distinct / n).toBeGreaterThan(4);
  });

  it("keeps song forms in shape", () => {
    for (const { styleId, variantId } of variants) {
      for (const mood of moods) {
        const idea = generateIdea({ styleId, variantId, key: null, bars: 4, seed: 7, mood });
        const total = idea.arrangement.reduce((a, s) => a + s.bars, 0);
        expect(total, `${styleId}/${variantId} ${mood}`).toBeGreaterThanOrEqual(16);
        expect(total, `${styleId}/${variantId} ${mood}`).toBeLessThanOrEqual(40);
        for (const sec of idea.arrangement) expect(sec.bars % 4).toBe(0);
      }
    }
    const epic = generateIdea({ styleId: "bunt", variantId: "stutter", key: null, bars: 4, seed: 7, mood: "episch" });
    expect(epic.arrangement.filter((s) => s.build).every((s) => s.bars === 8)).toBe(true);
    const up = generateIdea({ styleId: "bunt", variantId: "stutter", key: null, bars: 4, seed: 7, mood: "euphorie" });
    expect(up.arrangement[up.arrangement.length - 1].leadUp).toBe(true);
  });

  it("reads what a loop does", () => {
    expect(loopFeatures({ mode: "minor", degrees: ["i", "VI", "III", "VII"], weight: 1 })).toMatchObject({ epic: 1, rise: 1, major: 0.75 });
    expect(loopFeatures({ mode: "minor", degrees: ["i", "bII"], durations: [2, 2], weight: 1 })).toMatchObject({ bII: 1, long: 1, two: 1 });
    expect(loopFeatures({ mode: "major", degrees: ["Imaj7", "IVmaj7"], weight: 1 })).toMatchObject({ maj7: 1, major: 1 });
    expect(loopFeatures({ mode: "minor", degrees: ["i", "iv", "VI", "v"], weight: 1 })).toMatchObject({ iv: 1, rise: 0 });
  });

  it("finds the moods an artist's own chords carry", () => {
    expect(typicalMoods(getVariant("bunt", "stutter"))).toContain("euphorie");
    for (const { styleId, variantId } of variants) expect(typicalMoods(getVariant(styleId, variantId))).toHaveLength(2);
  });

  it("hears a minor third against a borrowed major chord as a clash", () => {
    // F over D major in C major (the lydian II of "Verträumt").
    expect(isAvoidNote(5, [2, 6, 9])).toBe(true);
    // A semitone below other tones stays a colour: the 9th over a minor chord, the maj7.
    expect(isAvoidNote(2, [0, 3, 7])).toBe(false);
    expect(isAvoidNote(11, [0, 4, 7])).toBe(false);
  });
});
