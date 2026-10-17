import { describe, expect, it } from "vitest";
import { Midi } from "@tonejs/midi";
import { crc32, generateIdea, ideaToMidiFiles, writeMidi, zip } from "../src/index";

describe("midi", () => {
  it("writes files a standard parser reads back", () => {
    const bytes = writeMidi(
      [{ name: "Test", channel: 0, notes: [{ pitch: 60, startBeat: 1, durBeat: 0.5, vel: 100 }] }],
      125,
    );
    const midi = new Midi(bytes);
    expect(midi.header.tempos[0].bpm).toBeCloseTo(125, 1);
    // @tonejs/midi drops the empty tempo track of a type-1 file.
    expect(midi.tracks.length).toBe(1);
    const note = midi.tracks[0].notes[0];
    expect(note.midi).toBe(60);
    expect(note.ticks).toBe(480);
    expect(note.durationTicks).toBe(240);
    expect(midi.tracks[0].name).toBe("Test");
  });

  it("exports every lane of an idea with matching note counts", () => {
    const idea = generateIdea({ styleId: "bunt", variantId: "folk-house", key: null, bars: 8, seed: 3 });
    const files = ideaToMidiFiles(idea);
    expect(files.map((f) => f.name.split("_").pop())).toEqual([
      "Chords.mid", "Bass.mid", "Lead.mid", "Pluck.mid", "Drums.mid", "Alle-Spuren.mid",
    ]);
    const all = new Midi(files[5].data);
    const counts = all.tracks.filter((t) => t.notes.length).map((t) => t.notes.length);
    expect(counts).toEqual([
      idea.lanes.chords.notes.length,
      idea.lanes.bass.notes.length,
      idea.lanes.lead.notes.length,
      idea.lanes.pluck.notes.length,
      idea.drums.hits.length,
    ]);
    const drums = all.tracks.find((t) => t.name === "Drums")!;
    expect(drums.channel).toBe(9);
    for (const f of files) expect(f.name).toMatch(/^[A-Za-z0-9_.#-]+$/);
  });

  it("builds a valid stored zip", () => {
    const data = new TextEncoder().encode("hello");
    expect(crc32(data)).toBe(0x3610a686);
    const z = zip([{ name: "a.txt", data }]);
    const view = new DataView(z.buffer);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(view.getUint32(z.length - 22, true)).toBe(0x06054b50);
    expect(view.getUint16(z.length - 22 + 10, true)).toBe(1);
  });
});
