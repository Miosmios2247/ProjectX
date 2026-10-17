// Theory core: keys, scales, roman numerals, chord building and naming.
// Everything here is plain music theory and holds for every style.

export type PitchClass = number; // 0..11, C = 0
export type Mode = "major" | "minor";

export interface Key {
  tonic: PitchClass;
  mode: Mode;
}

export const SCALE_STEPS: Record<Mode, readonly number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const SHARP_MAJOR = new Set([7, 2, 9, 4, 11, 6]); // G D A E B F#
const SHARP_MINOR = new Set([4, 11, 6, 1, 8]); // Em Bm F#m C#m G#m

export function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

export function usesSharps(key: Key): boolean {
  return key.mode === "major" ? SHARP_MAJOR.has(key.tonic) : SHARP_MINOR.has(key.tonic);
}

export function pcName(pc: PitchClass, key: Key): string {
  return (usesSharps(key) ? SHARP_NAMES : FLAT_NAMES)[mod12(pc)];
}

export function keyName(key: Key): string {
  const tonic = pcName(key.tonic, key);
  return key.mode === "major" ? `${tonic}-Dur` : `${tonic}-Moll`;
}

/** Short DAW-style name: "Am", "C", "F#m". */
export function keyShortName(key: Key): string {
  const tonic = pcName(key.tonic, key);
  return key.mode === "major" ? tonic : `${tonic}m`;
}

export function scalePcs(key: Key): PitchClass[] {
  return SCALE_STEPS[key.mode].map((s) => mod12(key.tonic + s));
}

export function inScale(pc: PitchClass, key: Key): boolean {
  return scalePcs(key).includes(mod12(pc));
}

export function pentatonicPcs(key: Key): PitchClass[] {
  const steps = key.mode === "major" ? [0, 2, 4, 7, 9] : [0, 3, 5, 7, 10];
  return steps.map((s) => mod12(key.tonic + s));
}

export function midiName(midi: number): string {
  return `${SHARP_NAMES[mod12(midi)]}${Math.floor(midi / 12) - 1}`;
}

// ---------------------------------------------------------------------------
// Roman numerals

export type TriadQuality = "maj" | "min" | "dim" | "aug" | "sus2" | "sus4";

export interface RomanSpec {
  text: string;
  degree: number; // 1..7
  accidental: number; // -1 flat, +1 sharp
  quality: TriadQuality;
  /** Extension written into the template, e.g. "7" in "V7". */
  forced?: ColorToken;
  inversion: 0 | 1 | 2;
}

const ROMAN_RE =
  /^([b#]?)(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(°|o|\+)?(sus2|sus4|maj7|add9|7|9|6)?(\/[35])?$/;
const NUMERALS = ["i", "ii", "iii", "iv", "v", "vi", "vii"];

export function parseRoman(text: string): RomanSpec {
  const m = ROMAN_RE.exec(text.trim());
  if (!m) throw new Error(`Unbekannte Stufe: "${text}"`);
  const [, acc, numeral, mark, suffix, slash] = m;
  const degree = NUMERALS.indexOf(numeral.toLowerCase()) + 1;
  const upper = numeral === numeral.toUpperCase();
  let quality: TriadQuality = upper ? "maj" : "min";
  if (mark === "°" || mark === "o") quality = "dim";
  if (mark === "+") quality = "aug";
  let forced: ColorToken | undefined;
  if (suffix === "sus2" || suffix === "sus4") quality = suffix;
  else if (suffix === "maj7" || suffix === "7") forced = "seventh";
  else if (suffix === "9") forced = "ninth";
  else if (suffix === "add9") forced = "add9";
  else if (suffix === "6") forced = "six";
  return {
    text,
    degree,
    accidental: acc === "b" ? -1 : acc === "#" ? 1 : 0,
    quality,
    forced,
    inversion: slash === "/3" ? 1 : slash === "/5" ? 2 : 0,
  };
}

export function romanRoot(spec: RomanSpec, key: Key): PitchClass {
  return mod12(key.tonic + SCALE_STEPS[key.mode][spec.degree - 1] + spec.accidental);
}

/**
 * Rewrite a numeral for the relative key of the other mode, keeping the
 * absolute chord: "vi" in C major is "i" in A minor.
 */
export function romanToRelative(text: string, from: Mode): string {
  const m = ROMAN_RE.exec(text.trim());
  if (!m) throw new Error(`Unbekannte Stufe: "${text}"`);
  const [, acc, numeral, mark = "", suffix = "", slash = ""] = m;
  const degree = NUMERALS.indexOf(numeral.toLowerCase()) + 1;
  const shift = from === "minor" ? 5 : 2;
  const newDegree = ((degree - 1 + shift) % 7) + 1;
  // Accidentals stay correct for diatonic and the usual borrowed chords.
  let newNumeral = NUMERALS[newDegree - 1];
  if (numeral === numeral.toUpperCase()) newNumeral = newNumeral.toUpperCase();
  let newAcc = acc;
  // Degrees whose scale step differs between major and natural minor.
  const fromSteps = SCALE_STEPS[from];
  const toSteps = SCALE_STEPS[from === "minor" ? "major" : "minor"];
  const tonicShift = from === "minor" ? 3 : -3; // relative tonic offset
  const absolute = fromSteps[degree - 1] + (acc === "b" ? -1 : acc === "#" ? 1 : 0);
  const target = mod12(absolute - tonicShift);
  const natural = toSteps[newDegree - 1];
  const diff = mod12(target - natural);
  newAcc = diff === 0 ? "" : diff === 11 ? "b" : diff === 1 ? "#" : acc;
  return `${newAcc}${newNumeral}${mark}${suffix}${slash}`;
}

// ---------------------------------------------------------------------------
// Chords

export type ColorToken =
  | "triad"
  | "seventh"
  | "ninth"
  | "add9"
  | "sus2"
  | "sus4"
  | "six"
  | "sixNine"
  | "eleventh";

export interface Chord {
  degree: string; // roman numeral as used
  root: PitchClass;
  /** Semitones above the root (0 = root). 14 = ninth, 17 = eleventh. */
  intervals: number[];
  bass: PitchClass;
  quality: TriadQuality;
  color: ColorToken;
  name: string;
}

const TRIADS: Record<TriadQuality, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
};

const FALLBACK: Record<ColorToken, ColorToken[]> = {
  triad: [],
  seventh: ["triad"],
  ninth: ["seventh", "add9", "triad"],
  add9: ["triad"],
  sus2: ["add9", "triad"],
  sus4: ["triad"],
  six: ["add9", "triad"],
  sixNine: ["six", "add9", "triad"],
  eleventh: ["ninth", "seventh", "triad"],
};

/** Try to apply one color; returns null when it would leave the key. */
function tryColor(
  quality: TriadQuality,
  root: PitchClass,
  color: ColorToken,
  ok: (pc: PitchClass) => boolean,
): { quality: TriadQuality; intervals: number[] } | null {
  const base = [...TRIADS[quality]];
  const has = (i: number) => ok(root + i);
  const seventh = (): number | null => {
    if (quality === "min" || quality === "dim") return has(10) ? 10 : null;
    if (quality === "aug") return null;
    if (has(11)) return 11;
    if (has(10)) return 10;
    return null;
  };
  switch (color) {
    case "triad":
      return { quality, intervals: base };
    case "seventh": {
      const s = seventh();
      return s === null ? null : { quality, intervals: [...base, s] };
    }
    case "ninth": {
      if (quality === "dim" || quality === "aug") return null;
      const s = seventh();
      if (s === null || !has(14)) return null;
      return { quality, intervals: [...base, s, 14] };
    }
    case "add9": {
      if (quality !== "maj" && quality !== "min") return null;
      return has(14) ? { quality, intervals: [...base, 14] } : null;
    }
    case "sus2": {
      if (quality !== "maj" && quality !== "min") return null;
      return has(2) ? { quality: "sus2", intervals: [0, 2, 7] } : null;
    }
    case "sus4": {
      if (quality !== "maj" && quality !== "min") return null;
      return has(5) ? { quality: "sus4", intervals: [0, 5, 7] } : null;
    }
    case "six": {
      if (quality !== "maj" && quality !== "min") return null;
      return has(9) ? { quality, intervals: [...base, 9] } : null;
    }
    case "sixNine": {
      if (quality !== "maj") return null;
      return has(9) && has(14) ? { quality, intervals: [...base, 9, 14] } : null;
    }
    case "eleventh": {
      if (quality !== "min") return null;
      if (!has(10) || !has(5)) return null;
      return { quality, intervals: has(14) ? [0, 3, 7, 10, 14, 17] : [0, 3, 7, 10, 17] };
    }
  }
}

export function buildChord(degree: string, key: Key, color: ColorToken = "triad"): Chord {
  const spec = parseRoman(degree);
  const root = romanRoot(spec, key);
  const triadPcs = TRIADS[spec.quality].map((i) => mod12(root + i));
  // Extensions must stay inside the key (or the chord's own triad).
  const ok = (pc: PitchClass) => inScale(pc, key) || triadPcs.includes(mod12(pc));
  const wanted = spec.forced ?? color;
  let applied: ColorToken = "triad";
  let result = tryColor(spec.quality, root, wanted, ok);
  if (result) applied = wanted;
  else {
    for (const alt of FALLBACK[wanted]) {
      result = tryColor(spec.quality, root, alt, ok);
      if (result) {
        applied = alt;
        break;
      }
    }
  }
  if (!result) result = { quality: spec.quality, intervals: [...TRIADS[spec.quality]] };
  const intervals = [...new Set(result.intervals)].sort((a, b) => a - b);
  let bass = root;
  if (spec.inversion === 1) bass = mod12(root + intervals[1]);
  if (spec.inversion === 2) bass = mod12(root + (intervals.find((i) => i >= 6 && i <= 8) ?? 7));
  const chord: Chord = {
    degree,
    root,
    intervals,
    bass,
    quality: result.quality,
    color: applied,
    name: "",
  };
  chord.name = chordName(chord, key);
  return chord;
}

/** Same chord with another bass note (slash chord / inversion). */
export function withBass(chord: Chord, bass: PitchClass, key: Key): Chord {
  const c = { ...chord, bass: mod12(bass) };
  c.name = chordName(c, key);
  return c;
}

export function chordPcs(chord: Chord): PitchClass[] {
  return [...new Set(chord.intervals.map((i) => mod12(chord.root + i)))];
}

/** Chord tones by role, for voicing and melody decisions. */
export function chordRoles(chord: Chord): {
  root: PitchClass;
  third: PitchClass | null;
  fifth: PitchClass | null;
  colors: PitchClass[];
} {
  const r = chord.root;
  const iv = chord.intervals;
  const third = iv.find((i) => i >= 2 && i <= 5);
  const fifth = iv.find((i) => i >= 6 && i <= 8);
  const colors = iv.filter((i) => i !== 0 && i !== third && i !== fifth).map((i) => mod12(r + i));
  return {
    root: r,
    third: third === undefined ? null : mod12(r + third),
    fifth: fifth === undefined ? null : mod12(r + fifth),
    colors,
  };
}

export function chordName(chord: Chord, key: Key): string {
  const iv = new Set(chord.intervals);
  const root = pcName(chord.root, key);
  let s = "";
  const q = chord.quality;
  const sev = iv.has(11) ? "maj7" : iv.has(10) ? "7" : "";
  if (q === "sus2" || q === "sus4") {
    s = sev === "maj7" ? `maj7${q}` : sev === "7" ? `7${q}` : q;
  } else if (q === "dim") {
    s = iv.has(10) ? "m7b5" : "dim";
  } else if (q === "aug") {
    s = "aug";
  } else if (q === "min") {
    if (iv.has(17)) s = "m11";
    else if (sev === "7" && iv.has(14)) s = "m9";
    else if (sev === "7") s = "m7";
    else if (iv.has(9)) s = "m6";
    else if (iv.has(14)) s = "m(add9)";
    else s = "m";
  } else {
    if (sev === "maj7" && iv.has(14)) s = "maj9";
    else if (sev === "maj7") s = "maj7";
    else if (sev === "7" && iv.has(14)) s = "9";
    else if (sev === "7") s = "7";
    else if (iv.has(9) && iv.has(14)) s = "6/9";
    else if (iv.has(9)) s = "6";
    else if (iv.has(14)) s = "add9";
  }
  const slash = chord.bass !== chord.root ? `/${pcName(chord.bass, key)}` : "";
  return `${root}${s}${slash}`;
}

/** Interval class 0..6 between two pitch classes. */
export function intervalClass(a: PitchClass, b: PitchClass): number {
  const d = mod12(a - b);
  return Math.min(d, 12 - d);
}

/** True if pc rubs a semitone against any of the given pcs. */
export function rubsSemitone(pc: PitchClass, others: readonly PitchClass[]): boolean {
  return others.some((o) => intervalClass(pc, o) === 1);
}

/** Nearest MIDI note >= lo and <= hi with one of the pitch classes. */
export function nearestWithPc(
  target: number,
  pcs: readonly PitchClass[],
  lo: number,
  hi: number,
): number | null {
  let best: number | null = null;
  for (let n = lo; n <= hi; n++) {
    if (!pcs.includes(mod12(n))) continue;
    if (best === null || Math.abs(n - target) < Math.abs(best - target)) best = n;
  }
  return best;
}

export const KEYS: Key[] = (() => {
  const keys: Key[] = [];
  for (const mode of ["minor", "major"] as Mode[]) {
    for (let tonic = 0; tonic < 12; tonic++) keys.push({ tonic, mode });
  }
  return keys;
})();

export function keyId(key: Key): string {
  return `${key.tonic}-${key.mode}`;
}

export function parseKeyId(id: string): Key | null {
  const m = /^(\d{1,2})-(major|minor)$/.exec(id);
  if (!m) return null;
  const tonic = Number(m[1]);
  if (tonic < 0 || tonic > 11) return null;
  return { tonic, mode: m[2] as Mode };
}
