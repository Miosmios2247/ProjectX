import { describe, expect, it } from "vitest";
import {
  ColorToken,
  KEYS,
  Key,
  STYLES,
  buildChord,
  chordPcs,
  inScale,
  keyName,
  mod12,
  parseRoman,
  romanToRelative,
} from "../src/index";

const aMinor: Key = { tonic: 9, mode: "minor" };
const cMajor: Key = { tonic: 0, mode: "major" };

describe("roman numerals", () => {
  it("parses degree, quality and inversion", () => {
    expect(parseRoman("bVII")).toMatchObject({ degree: 7, accidental: -1, quality: "maj" });
    expect(parseRoman("ii°")).toMatchObject({ degree: 2, quality: "dim" });
    expect(parseRoman("V/3")).toMatchObject({ degree: 5, inversion: 1 });
    expect(parseRoman("iv")).toMatchObject({ degree: 4, quality: "min" });
    expect(() => parseRoman("VIII")).toThrow();
  });

  it("converts to the relative key without changing the chord", () => {
    expect(romanToRelative("i", "minor")).toBe("vi");
    expect(romanToRelative("VII", "minor")).toBe("V");
    expect(romanToRelative("VI", "minor")).toBe("IV");
    expect(romanToRelative("bII", "minor")).toBe("bVII");
    expect(romanToRelative("IV", "minor")).toBe("II");
    expect(romanToRelative("V", "minor")).toBe("III");
    expect(romanToRelative("I", "major")).toBe("III");
    expect(romanToRelative("vi", "major")).toBe("i");
    expect(romanToRelative("bVII", "major")).toBe("bII");
    expect(romanToRelative("iv", "major")).toBe("vi");
    // Same absolute chord in both keys
    for (const deg of ["i", "iv", "VI", "III", "VII", "v", "V", "IV", "bII"]) {
      const a = buildChord(deg, aMinor);
      const c = buildChord(romanToRelative(deg, "minor"), cMajor);
      expect(c.root).toBe(a.root);
      expect(c.quality).toBe(a.quality);
    }
  });
});

describe("chords", () => {
  it("names diatonic chords with colors", () => {
    expect(buildChord("VI", aMinor, "seventh").name).toBe("Fmaj7");
    expect(buildChord("i", aMinor, "ninth").name).toBe("Am9");
    expect(buildChord("VII", aMinor, "add9").name).toBe("Gadd9");
    expect(buildChord("v", aMinor, "ninth").name).toBe("Em7"); // F# is not in A minor
    expect(buildChord("I", cMajor, "seventh").name).toBe("Cmaj7");
    expect(buildChord("V", cMajor, "seventh").name).toBe("G7");
    expect(buildChord("vii°", cMajor, "seventh").name).toBe("Bm7b5");
    expect(buildChord("I", cMajor, "sixNine").name).toBe("C6/9");
    expect(buildChord("i", aMinor, "eleventh").name).toBe("Am11");
  });

  it("handles borrowed chords", () => {
    expect(buildChord("bVII", cMajor).name).toBe("Bb");
    expect(buildChord("bVII", cMajor, "seventh").name).toBe("Bbmaj7");
    expect(buildChord("iv", cMajor, "add9").name).toBe("Fm(add9)");
    expect(buildChord("iv", cMajor, "six").name).toBe("Fm6");
    expect(buildChord("IV", aMinor, "seventh").name).toBe("D7");
  });

  it("builds inversions and sus chords", () => {
    expect(buildChord("V/3", cMajor).name).toBe("G/B");
    expect(buildChord("I/5", cMajor).name).toBe("C/G");
    expect(buildChord("IV", cMajor, "sus2").name).toBe("Fsus2");
    expect(buildChord("IV", cMajor, "sus4").name).toBe("F"); // Bb would leave the key
  });

  it("keeps every color inside the key for all style templates", () => {
    const colors: ColorToken[] = ["triad", "seventh", "ninth", "add9", "sus2", "sus4", "six", "sixNine", "eleventh"];
    for (const style of STYLES) {
      for (const v of style.variants) {
        for (const t of v.harmony.progressions) {
          for (const key of KEYS) {
            for (const raw of t.degrees) {
              const deg = t.mode === key.mode ? raw : romanToRelative(raw, t.mode);
              for (const color of colors) {
                const chord = buildChord(deg, key, color);
                const triad = buildChord(deg, key, "triad");
                for (const pc of chordPcs(chord)) {
                  const ok = inScale(pc, key) || chordPcs(triad).includes(mod12(pc));
                  expect(ok, `${keyName(key)} ${deg} ${color} → ${chord.name}`).toBe(true);
                }
              }
            }
          }
        }
      }
    }
  });
});
