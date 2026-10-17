// The rater's own voice as the lead: a short recording (voice memo, a few sung
// words) is sliced like Fred again.. chops, stretched and gated like BUNT. or
// sung on the topline like AVAION. Everything stays in the browser.

import type * as ToneNS from "tone";
import type { PlayerOptions } from "./audio";
import type { Voice } from "./sounds";
import { VoiceAnalysis, analyzeVoice, foldedRate } from "./voice-analysis";

type T = ToneLib;

export type OwnVoiceKind = "chop" | "stretch" | "sing";

/** Lead sounds that a recorded voice can replace. */
export const OWN_VOICE_KIND: Record<string, OwnVoiceKind> = {
  "vox-chop": "chop",
  "vox-stretch": "stretch",
  "vox-sing": "sing",
};

// Level trims (dB) in line with the sampled voices they replace.
const OWN_TRIM: Record<OwnVoiceKind, number> = { chop: 0, stretch: -3, sing: -8 };

export interface OwnVoice {
  /** Changes whenever a new recording is loaded. */
  id: string;
  name: string;
  buffer: ToneNS.ToneAudioBuffer;
  analysis: VoiceAnalysis;
}

const MAX_SECONDS = 20;
const NOTE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function noteOf(f: number): string {
  const m = Math.round(69 + 12 * Math.log2(f / 440));
  return `${NOTE[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
}

/** Decodes a recording, keeps the first 20 s as mono and analyses it. */
export async function loadOwnVoice(T: T, bytes: ArrayBuffer, name: string): Promise<OwnVoice> {
  const decoded = await T.getContext().decodeAudioData(bytes.slice(0));
  const rate = decoded.sampleRate;
  const n = Math.min(decoded.length, Math.round(MAX_SECONDS * rate));
  const mono = new Float32Array(n);
  for (let c = 0; c < decoded.numberOfChannels; c++) {
    const ch = decoded.getChannelData(c);
    for (let i = 0; i < n; i++) mono[i] += ch[i] / decoded.numberOfChannels;
  }
  const analysis = analyzeVoice(mono, rate);
  const raw = T.getContext().createBuffer(1, n, rate);
  raw.copyToChannel(mono, 0);
  return { id: `${name}:${n}:${Date.now()}`, name, buffer: new T.ToneAudioBuffer(raw), analysis };
}

export function describeVoice(v: OwnVoice): string {
  const a = v.analysis;
  const pitched = a.slices.filter((s) => s.f0 > 0).length;
  const parts = [`${a.slices.length} Silben erkannt`];
  if (pitched) parts.push(`${pitched} mit Tonhöhe`);
  if (a.sustain) parts.push(`gehaltener Ton ${noteOf(a.sustain.f0)}`);
  return parts.join(" · ");
}

/** A lead voice that plays the recording. Monophonic: each note cuts the previous one. */
export function ownVoice(T: T, own: OwnVoice, kind: OwnVoiceKind, options: PlayerOptions = { soundSet: "v5", grain: true }): Voice {
  const { analysis, buffer } = own;
  const out = new T.Gain(T.dbToGain(OWN_TRIM[kind]));
  const nodes: ToneNS.ToneAudioNode[] = [];
  const keep = <N extends ToneNS.ToneAudioNode>(n: N): N => {
    nodes.push(n);
    return n;
  };
  const input = keep(new T.Gain(analysis.gain));
  // Fred again..: raw phone-like voice; BUNT.: brighter and driven; AVAION: clean, a little vibrato.
  const chain: ToneNS.ToneAudioNode[] =
    kind === "chop"
      ? [keep(new T.Filter(160, "highpass")), keep(new T.Filter({ type: "peaking", frequency: 2800, Q: 0.9, gain: 3 })), keep(new T.Distortion(0.06))]
      : kind === "stretch"
        ? [keep(new T.Filter(200, "highpass")), keep(new T.Filter({ type: "peaking", frequency: 3200, Q: 0.8, gain: 3 })), keep(new T.Distortion(0.18))]
        : [keep(new T.Filter(120, "highpass")), keep(new T.Vibrato(5, 0.05))];
  let node: ToneNS.ToneAudioNode = input;
  for (const c of chain) {
    node.connect(c);
    node = c;
  }
  node.connect(out);

  const slices = analysis.slices.length ? analysis.slices : [{ start: 0, end: Math.min(1, analysis.duration), f0: 0, level: 0 }];
  const sustain = analysis.sustain;
  let last: ToneNS.ToneBufferSource | null = null;
  let lastAt = -1;
  let count = 0;
  const live = new Set<ToneNS.ToneBufferSource>();
  const fade = kind === "sing" ? { in: 0.03, out: 0.12 } : kind === "stretch" ? { in: 0.003, out: 0.012 } : { in: 0.004, out: 0.02 };

  const play = (time: number, offset: number, duration: number, rate: number, velocity: number, loop?: [number, number]) => {
    const t = Math.max(time, lastAt + 0.001, input.immediate());
    if (last) {
      try {
        last.stop(t);
      } catch {
        // already stopped
      }
    }
    // Same context as the chain, so the voice also works in offline renders.
    const src = new T.ToneBufferSource({
      context: input.context,
      url: buffer,
      playbackRate: rate,
      fadeIn: fade.in,
      fadeOut: fade.out,
      curve: "linear",
      loop: !!loop,
      loopStart: loop?.[0] ?? 0,
      loopEnd: loop?.[1] ?? 0,
    });
    src.connect(input);
    live.add(src);
    // Tone disposes ended one-shot sources itself (online only; offline renders
    // run their callbacks before the audio, so disposing here would mute them).
    src.onended = () => live.delete(src);
    src.start(t, offset, duration, velocity);
    last = src;
    lastAt = t;
  };

  const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

  return {
    output: out,
    trigger(midi, duration, time, velocity, index) {
      try {
        if (kind === "chop" || !sustain) {
          // The same note always gets the same syllable, so the hook repeats like a phrase.
          const s = slices[(index ?? count++) % slices.length];
          const rate = foldedRate(freq(midi), s.f0);
          play(time, s.start, Math.min(duration, (s.end - s.start) / rate), rate, velocity);
        } else {
          const rate = foldedRate(freq(midi), sustain.f0);
          play(time, sustain.start, duration, rate, velocity, [sustain.loopStart, sustain.loopEnd]);
        }
      } catch {
        // a dropped note is better than a stopped loop
      }
    },
    dispose() {
      for (const s of live) {
        try {
          s.stop();
        } catch {
          // ignore
        }
        s.dispose();
      }
      live.clear();
      nodes.forEach((n) => n.dispose());
      out.dispose();
    },
  };
}

// --- Keep the last recording in this browser (IndexedDB), so it survives a reload.

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

export async function saveVoiceBytes(name: string, bytes: ArrayBuffer): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ name, bytes }, "own");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // storage blocked: the voice just won't survive a reload
  }
}

export async function loadVoiceBytes(): Promise<{ name: string; bytes: ArrayBuffer } | null> {
  try {
    const db = await openDb();
    const row = await new Promise<{ name: string; bytes: ArrayBuffer } | undefined>((resolve, reject) => {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get("own");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return row && row.bytes ? row : null;
  } catch {
    return null;
  }
}

export async function clearVoiceBytes(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete("own");
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    // ignore
  }
}
