// Sampled instruments (FluidR3 GM, GeneralUser GS voices), published next to the page.

import type * as ToneNS from "tone";

type T = ToneLib;

const NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const noteName = (m: number) => `${NAMES[m % 12]}${Math.floor(m / 12) - 1}`;

function every3(from: number, to: number): Record<string, string> {
  const out: Record<string, string> = {};
  for (let m = from; m <= to; m += 3) out[noteName(m)] = `${noteName(m)}.mp3`;
  return out;
}

function vox(prefix: string, roots: number[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of roots) out[noteName(r)] = `${prefix}-${r}.wav`;
  return out;
}

/** Sample sets: base folder and note → file. */
export const SAMPLE_SETS: Record<string, { base: string; urls: Record<string, string> }> = {
  piano: { base: "samples/piano/", urls: every3(33, 96) },
  epiano: { base: "samples/epiano/", urls: every3(33, 96) },
  guitar: { base: "samples/guitar/", urls: every3(40, 87) },
  nylon: { base: "samples/nylon/", urls: every3(40, 87) },
  marimba: { base: "samples/marimba/", urls: every3(48, 96) },
  strings: { base: "samples/strings/", urls: every3(36, 90) },
  oohs: { base: "samples/vox/", urls: vox("oohs", [63, 69, 73, 77, 80, 83]) },
  aahs: { base: "samples/vox/", urls: vox("aahs", [45, 49, 51, 55, 59, 61, 65, 69, 71, 73, 77, 79]) },
  synthvox: { base: "samples/vox/", urls: vox("synthvox", [55, 58, 61, 67, 73, 83]) },
};

export const KIT_SAMPLES = [
  "kick", "sidestick", "snare", "clap", "hatclosed", "hatpedal", "hatopen", "tambourine",
  "bongohi", "bongolo", "congamute", "congaopen", "congalo", "cabasa", "maracas", "claves", "shaker",
] as const;
export type KitSample = (typeof KIT_SAMPLES)[number];

const cache = new Map<string, Promise<ToneNS.ToneAudioBuffer | null>>();

function loadBuffer(T: T, url: string): Promise<ToneNS.ToneAudioBuffer | null> {
  let p = cache.get(url);
  if (!p) {
    p = new Promise((resolve) => {
      const buf = new T.ToneAudioBuffer(
        url,
        () => resolve(buf),
        () => resolve(null),
      );
    });
    cache.set(url, p);
  }
  return p;
}

/** Decoded buffers for one set, keyed by note name (missing files are skipped). */
export async function loadSet(T: T, id: string): Promise<Record<string, ToneNS.ToneAudioBuffer>> {
  const set = SAMPLE_SETS[id];
  if (!set) return {};
  const entries = await Promise.all(
    Object.entries(set.urls).map(async ([note, file]) => [note, await loadBuffer(T, set.base + file)] as const),
  );
  const out: Record<string, ToneNS.ToneAudioBuffer> = {};
  for (const [note, buf] of entries) if (buf) out[note] = buf;
  return out;
}

export async function loadKit(T: T): Promise<Partial<Record<KitSample, ToneNS.ToneAudioBuffer>>> {
  const entries = await Promise.all(
    KIT_SAMPLES.map(async (k) => [k, await loadBuffer(T, `samples/kit/${k}.mp3`)] as const),
  );
  const out: Partial<Record<KitSample, ToneNS.ToneAudioBuffer>> = {};
  for (const [k, buf] of entries) if (buf) out[k] = buf;
  return out;
}
