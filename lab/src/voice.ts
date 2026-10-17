// The rater's own voice as the lead (the "Stimmen-Studio"): short recordings per
// artist, sliced like Fred again.. chops, stretched and gated like BUNT. or sung
// on the topline like AVAION. Notes are re-pitched with PSOLA, so the voice keeps
// its colour instead of turning into a chipmunk. Everything stays in the browser.

import type * as ToneNS from "tone";
import type { Note } from "../../engine/src/index";
import type { PlayerOptions } from "./audio";
import type { Voice } from "./sounds";
import { VoiceAnalysis, analyzeVoice, bestSlices, foldedShift, psola } from "./voice-analysis";

type T = ToneLib;

export type OwnVoiceKind = "chop" | "stretch" | "sing";
export type VoiceSlot = "fred" | "bunt" | "avaion";
export const VOICE_SLOTS: VoiceSlot[] = ["fred", "bunt", "avaion"];

/** Lead sounds that a recorded voice can replace. */
export const OWN_VOICE_KIND: Record<string, OwnVoiceKind> = {
  "vox-chop": "chop",
  "vox-stretch": "stretch",
  "vox-sing": "sing",
};

/** Which artist's recordings a sound uses first. */
export const SLOT_FOR_KIND: Record<OwnVoiceKind, VoiceSlot> = { chop: "fred", stretch: "bunt", sing: "avaion" };

// Level trims (dB) in line with the sampled voices they replace.
const OWN_TRIM: Record<OwnVoiceKind, number> = { chop: 0, stretch: -3, sing: -8 };

export interface Take {
  name: string;
  bytes: ArrayBuffer;
}

export interface OwnVoice {
  /** Changes whenever the recordings change. */
  id: string;
  name: string;
  takes: number;
  /** Mono samples of all takes, one after the other. */
  data: Float32Array;
  rate: number;
  buffer: ToneNS.ToneAudioBuffer;
  analysis: VoiceAnalysis;
  /** The clearest syllables, best first (used for chops). */
  syllables: number[];
}

const MAX_SECONDS = 20;
const GAP_SECONDS = 0.3;
const NOTE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function noteOf(f: number): string {
  const m = Math.round(69 + 12 * Math.log2(f / 440));
  return `${NOTE[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
}

/** Decodes the takes, keeps up to 20 s of each as mono, joins and analyses them. */
export async function loadOwnVoice(T: T, takes: readonly Take[], name?: string): Promise<OwnVoice> {
  const ctx = T.getContext();
  const parts: Float32Array[] = [];
  let rate = ctx.sampleRate;
  for (const take of takes) {
    const decoded = await ctx.decodeAudioData(take.bytes.slice(0));
    rate = decoded.sampleRate;
    const n = Math.min(decoded.length, Math.round(MAX_SECONDS * rate));
    const mono = new Float32Array(n);
    for (let c = 0; c < decoded.numberOfChannels; c++) {
      const ch = decoded.getChannelData(c);
      for (let i = 0; i < n; i++) mono[i] += ch[i] / decoded.numberOfChannels;
    }
    parts.push(mono);
  }
  const gap = Math.round(GAP_SECONDS * rate);
  const data = new Float32Array(parts.reduce((a, p) => a + p.length + gap, 0));
  let at = 0;
  for (const p of parts) {
    data.set(p, at);
    at += p.length + gap;
  }
  const analysis = analyzeVoice(data, rate);
  const raw = ctx.createBuffer(1, data.length, rate);
  raw.copyToChannel(data, 0);
  return {
    id: `${takes.map((t) => `${t.name}:${t.bytes.byteLength}`).join("|")}:${Date.now()}`,
    name: name ?? (takes.length === 1 ? takes[0].name : `${takes.length} Aufnahmen`),
    takes: takes.length,
    data,
    rate,
    buffer: new T.ToneAudioBuffer(raw),
    analysis,
    syllables: bestSlices(analysis, 10),
  };
}

export function describeVoice(v: OwnVoice): string {
  const a = v.analysis;
  const pitched = a.slices.filter((s) => s.f0 > 0).length;
  const parts = [v.takes === 1 ? "1 Aufnahme" : `${v.takes} Aufnahmen`, `${a.slices.length} Silben erkannt`];
  if (pitched) parts.push(`${pitched} mit Tonhöhe`);
  if (a.sustain) parts.push(`gehaltener Ton ${noteOf(a.sustain.f0)}`);
  return parts.join(" · ");
}

/**
 * A lead voice that sings with the recording.
 * - chop (Fred again..): one syllable per note, the same note always the same syllable;
 *   reversed where the hook answers backwards.
 * - stretch (BUNT.): the held vowel, stretched by a grain player (grainy or smooth).
 * - sing (AVAION): the held vowel per note, doubled, and polyphonic for harmony stacks.
 * Lead notes cut each other (monophonic); harmony notes (negative index) do not.
 */
export function ownVoice(T: T, own: OwnVoice, kind: OwnVoiceKind, options: PlayerOptions = { soundSet: "v5", grain: true }): Voice {
  const { analysis, data, rate } = own;
  const out = new T.Gain(T.dbToGain(OWN_TRIM[kind]));
  const nodes: ToneNS.ToneAudioNode[] = [];
  const keep = <N extends ToneNS.ToneAudioNode>(n: N): N => {
    nodes.push(n);
    return n;
  };
  const input = keep(new T.Gain(analysis.gain));
  // Fred again..: a phone-memo voice; BUNT.: brighter and driven; AVAION: clean, doubled, a little vibrato.
  const chain: ToneNS.ToneAudioNode[] =
    kind === "chop"
      ? [
          keep(new T.Filter(180, "highpass")),
          keep(new T.Filter(7500, "lowpass")),
          keep(new T.Filter({ type: "peaking", frequency: 2800, Q: 0.9, gain: 3 })),
          keep(new T.Distortion(0.06)),
        ]
      : kind === "stretch"
        ? [keep(new T.Filter(200, "highpass")), keep(new T.Filter({ type: "peaking", frequency: 3200, Q: 0.8, gain: 3 })), keep(new T.Distortion(0.18))]
        : [keep(new T.Filter(120, "highpass")), keep(new T.Vibrato(5, 0.05)), keep(new T.Chorus({ frequency: 1.2, delayTime: 4, depth: 0.4, wet: 0.3 }).start())];
  let node: ToneNS.ToneAudioNode = input;
  for (const c of chain) {
    node.connect(c);
    node = c;
  }
  node.connect(out);

  const slices = analysis.slices.length ? analysis.slices : [{ start: 0, end: Math.min(1, analysis.duration), f0: 0, level: 0 }];
  const syllables = own.syllables.length ? own.syllables : slices.map((_, i) => i);
  const sustain = analysis.sustain;
  const held = kind !== "chop" && !!sustain;

  // Re-pitched audio, made once per syllable/vowel and semitone shift.
  const buffers = new Map<string, ToneNS.ToneAudioBuffer>();
  const toBuffer = (samples: Float32Array) => {
    const b = input.context.createBuffer(1, Math.max(1, samples.length), rate);
    b.copyToChannel(new Float32Array(samples), 0);
    return new T.ToneAudioBuffer(b);
  };
  const shiftOf = (midi: number, f0: number) => Math.round(foldedShift(midi, f0) * 4) / 4;
  const sliceBuffer = (si: number, shift: number, reverse = false) => {
    const key = `s${si}:${shift}${reverse ? ":r" : ""}`;
    let b = buffers.get(key);
    if (!b) {
      const s = slices[si];
      const samples = psola(data, rate, s.start, s.end, s.f0, shift);
      if (reverse) samples.reverse();
      b = toBuffer(samples);
      buffers.set(key, b);
    }
    return b;
  };
  const vowelBuffer = (shift: number) => {
    const key = `v:${shift}`;
    let b = buffers.get(key);
    if (!b && sustain) {
      b = toBuffer(psola(data, rate, sustain.start, sustain.end, sustain.f0, shift));
      buffers.set(key, b);
    }
    return b!;
  };
  const sliceFor = (index: number) => syllables[Math.abs(index) % syllables.length];
  let reversed = new Set<number>();

  // Grain players for held vowels, one per pitch and per voice (lead or harmony). They
  // run all the time; an envelope opens them for each note (no start/stop timing races).
  const grains = new Map<string, { player: ToneNS.GrainPlayer; env: ToneNS.Gain }>();
  const grainy = kind === "stretch" && options.grain;
  const grainFor = (shift: number, part: string) => {
    const key = `${shift}:${part}`;
    let g = grains.get(key);
    if (!g) {
      const buffer = vowelBuffer(shift);
      const env = keep(new T.Gain(0));
      env.connect(input);
      const player = keep(
        new T.GrainPlayer({
          url: buffer,
          loop: true,
          // "Stretched as hell": large grains crawling slowly through the vowel; otherwise a smooth hold.
          grainSize: grainy ? 0.12 : 0.07,
          overlap: grainy ? 0.05 : 0.035,
          playbackRate: grainy ? 0.3 : 1,
        }),
      );
      player.connect(env);
      player.start();
      g = { player, env };
      grains.set(key, g);
    }
    return g;
  };

  let last: { stop(t: number): void } | null = null;
  let lastAt = -1;
  const sources = new Set<ToneNS.ToneBufferSource>();
  const fade = kind === "sing" ? { in: 0.03, out: 0.12 } : kind === "stretch" ? { in: 0.004, out: 0.03 } : { in: 0.004, out: 0.02 };

  const playSlice = (time: number, si: number, shift: number, duration: number, velocity: number, poly: boolean, reverse: boolean) => {
    const buffer = sliceBuffer(si, shift, reverse);
    const src = new T.ToneBufferSource({
      context: input.context,
      url: buffer,
      fadeIn: fade.in,
      fadeOut: fade.out,
      curve: "linear",
    });
    src.connect(input);
    sources.add(src);
    // Tone disposes ended one-shot sources itself (online only; offline renders
    // run their callbacks before the audio, so disposing here would mute them).
    src.onended = () => sources.delete(src);
    src.start(time, 0, Math.min(duration, buffer.duration), velocity);
    if (!poly) last = src;
  };

  const playVowel = (time: number, shift: number, duration: number, velocity: number, part: string, poly: boolean) => {
    const { env } = grainFor(shift, part);
    const t = time + 0.001;
    env.gain.cancelScheduledValues(t);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(velocity, t + fade.in);
    env.gain.setValueAtTime(velocity, t + Math.max(fade.in, duration - fade.out));
    env.gain.linearRampToValueAtTime(0, t + duration);
    if (!poly) {
      last = {
        stop: (s: number) => {
          env.gain.cancelScheduledValues(s);
          env.gain.setTargetAtTime(0, s, 0.01);
        },
      };
    }
  };

  return {
    output: out,
    prepare(notes: readonly Note[], harmony: readonly (readonly number[])[] = []) {
      // Make every re-pitched syllable or vowel now, not while the loop plays.
      reversed = new Set(notes.flatMap((n, i) => (n.fx === "rev" ? [i] : [])));
      notes.forEach((n, i) => {
        if (held && sustain) {
          grainFor(shiftOf(n.pitch, sustain.f0), "lead");
          (harmony[i] ?? []).forEach((p, k) => grainFor(shiftOf(p, sustain.f0), `h-${k + 1}`));
        } else {
          const si = sliceFor(i);
          sliceBuffer(si, shiftOf(n.pitch, slices[si].f0), reversed.has(i));
        }
      });
    },
    trigger(midi, duration, time, velocity, index) {
      try {
        const poly = (index ?? 0) < 0;
        const t = poly ? time : Math.max(time, lastAt + 0.001, input.immediate());
        if (!poly && last) {
          try {
            last.stop(t);
          } catch {
            // already stopped
          }
        }
        if (held && sustain) {
          playVowel(t, shiftOf(midi, sustain.f0), duration, velocity, poly ? `h${index}` : "lead", poly);
        } else {
          const si = sliceFor(index ?? 0);
          playSlice(t, si, shiftOf(midi, slices[si].f0), duration, velocity, poly, reversed.has(index ?? -1));
        }
        if (!poly) lastAt = t;
      } catch {
        // a dropped note is better than a stopped loop
      }
    },
    dispose() {
      for (const s of sources) {
        try {
          s.stop();
        } catch {
          // ignore
        }
        s.dispose();
      }
      sources.clear();
      nodes.forEach((n) => n.dispose());
      out.dispose();
    },
  };
}

// --- Keep the recordings in this browser (IndexedDB), so they survive a reload.

const DB = "projectx-hoerlabor";
const STORE = "voice";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<R>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest | void): Promise<R | undefined> {
  const db = await openDb();
  try {
    return await new Promise<R | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req ? (req.result as R) : undefined);
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

/** All stored takes per artist; a recording from round 3/4 ("own") moves to every artist. */
export async function loadAllTakes(): Promise<Record<VoiceSlot, Take[]>> {
  const out: Record<VoiceSlot, Take[]> = { fred: [], bunt: [], avaion: [] };
  try {
    for (const slot of VOICE_SLOTS) {
      const rows = await withStore<Take[]>("readonly", (s) => s.get(`slot:${slot}`));
      if (Array.isArray(rows)) out[slot] = rows.filter((r) => r && r.bytes);
    }
    if (VOICE_SLOTS.every((s) => !out[s].length)) {
      const legacy = await withStore<Take>("readonly", (s) => s.get("own"));
      if (legacy?.bytes) {
        for (const slot of VOICE_SLOTS) {
          out[slot] = [legacy];
          await saveTakes(slot, [legacy]);
        }
      }
    }
  } catch {
    // storage blocked
  }
  return out;
}

export async function saveTakes(slot: VoiceSlot, takes: readonly Take[]): Promise<void> {
  try {
    await withStore("readwrite", (s) => {
      s.put([...takes], `slot:${slot}`);
      s.delete("own");
    });
  } catch {
    // storage blocked: the voice just won't survive a reload
  }
}
