// Sound presets for the lab: sampled keys, guitars, brass and voices,
// synthesized basses and a neutral set for the blind test.

import type * as ToneNS from "tone";
import { SAMPLE_SETS, loadSet } from "./samples";

type T = ToneLib;

export interface Voice {
  output: ToneNS.ToneAudioNode;
  trigger(midi: number, duration: number, time: number, velocity: number): void;
  dispose(): void;
  /** Resolves when samples are loaded (synth voices are ready at once). */
  ready?: Promise<void>;
}

export const SOUND_LABELS: Record<string, string> = {
  "felt-piano": "Weiches Piano + Streicher",
  "garage-piano": "Piano-Stabs",
  rhodes: "E-Piano",
  "keys-pad": "Piano + Pad",
  "lush-keys": "Piano + Streicher (satt)",
  "bright-piano": "Helles Flügel-Piano",
  "guitar-strum": "Akustikgitarre",
  "piano-high": "Piano hoch",
  "guitar-pick": "Nylon-Gitarre",
  "glass-bells": "Glas-Glocken",
  marimba: "Marimba",
  sub: "Sub-Bass",
  reese: "Reese-Bass",
  "deep-bass": "Deep-Bass",
  "house-bass": "House-Bass",
  "vox-chop": "Vocal-Slices",
  "vox-stretch": "Gedehnter Vokal",
  "vox-sing": "Gesang (Vokal)",
  "brass-lead": "Bläser-Lead",
  harmonica: "Mundharmonika",
  "neutral-keys": "Neutral",
  "neutral-bass": "Neutral",
  "neutral-lead": "Neutral",
  "neutral-pluck": "Neutral",
};

const freq = (T: T, midi: number) => T.Frequency(midi, "midi").toFrequency();

/**
 * Monophonic sources throw if restarted at the same time (which happens when
 * an idea is swapped while playing). Keep each source's start times rising.
 */
export function timeGuard(clock: { immediate(): number }): (time: number) => number {
  let last = -1;
  return (time: number) => {
    let t = Math.max(time, clock.immediate());
    if (t <= last) t = last + 0.002;
    last = t;
    return t;
  };
}

function safely(fn: () => void): void {
  try {
    fn();
  } catch {
    // a dropped note is better than a stopped loop
  }
}

interface SampledOptions {
  attack?: number;
  release?: number;
  chain?: ToneNS.ToneAudioNode[];
  /** Which sample set plays this note (index into the set list). */
  pick?: (midi: number, count: number) => number;
  /** Extra sampler that only plays notes at least this long (seconds), e.g. a pad layer. */
  layer?: { set: string; minDuration: number; gain: number; attack?: number; release?: number };
}

// Seconds after which a sustained sample is played again (crossfaded), because the
// recordings are short: strings and organ last ~3 s, the voice samples ~1.3 s.
const RETRIGGER: Record<string, number> = { strings: 2, oohs: 0.9, aahs: 0.9, synthvox: 0.9 };

/** Plays a note; long notes on sustained sets are rebuilt from overlapping segments. */
function playNote(T: T, smp: ToneNS.Sampler, set: string, midi: number, duration: number, time: number, velocity: number): void {
  const every = RETRIGGER[set];
  const f = freq(T, midi);
  if (!every || duration <= every + 0.3) {
    safely(() => smp.triggerAttackRelease(f, duration, time, velocity));
    return;
  }
  for (let t = 0; t < duration - 0.05; t += every) {
    const seg = Math.min(duration - t, every + 0.3);
    safely(() => smp.triggerAttackRelease(f, seg, time + t, velocity));
  }
}

/** Sampled instrument. Notes that arrive before the samples are loaded are skipped. */
function sampledVoice(T: T, sets: string[], opts: SampledOptions, out: ToneNS.Gain): Voice {
  const input = new T.Gain(1);
  const chain = opts.chain ?? [];
  let node: ToneNS.ToneAudioNode = input;
  for (const c of chain) {
    node.connect(c);
    node = c;
  }
  node.connect(out);
  const samplers: (ToneNS.Sampler | null)[] = sets.map(() => null);
  let layer: ToneNS.Sampler | null = null;
  let layerGain: ToneNS.Gain | null = null;
  let disposed = false;
  const loads = sets.map((id, i) =>
    loadSet(T, id).then((buffers) => {
      if (disposed || !Object.keys(buffers).length) return;
      const smp = new T.Sampler({
        urls: buffers,
        attack: opts.attack ?? 0,
        release: opts.release ?? 0.8,
        volume: SAMPLE_SETS[id]?.gain ?? 0,
      });
      smp.connect(input);
      samplers[i] = smp;
    }),
  );
  if (opts.layer) {
    const l = opts.layer;
    loads.push(
      loadSet(T, l.set).then((buffers) => {
        if (disposed || !Object.keys(buffers).length) return;
        layerGain = new T.Gain(l.gain);
        layer = new T.Sampler({
          urls: buffers,
          attack: l.attack ?? 0.3,
          release: l.release ?? 1,
          volume: SAMPLE_SETS[l.set]?.gain ?? 0,
        });
        layer.connect(layerGain);
        layerGain.connect(input);
      }),
    );
  }
  let count = 0;
  return {
    output: out,
    ready: Promise.all(loads).then(() => undefined),
    trigger(midi, duration, time, velocity) {
      const want = opts.pick ? opts.pick(midi, count++) : 0;
      const i = samplers[want] ? want : samplers.findIndex((x) => x);
      if (i >= 0) playNote(T, samplers[i]!, sets[i], midi, duration, time, velocity);
      const l = layer;
      if (l && opts.layer && duration >= opts.layer.minDuration) {
        playNote(T, l, opts.layer.set, midi, duration, time, velocity * 0.8);
      }
    },
    dispose() {
      disposed = true;
      samplers.forEach((x) => x?.dispose());
      (layer as ToneNS.Sampler | null)?.dispose();
      (layerGain as ToneNS.Gain | null)?.dispose();
      input.dispose();
      chain.forEach((c) => c.dispose());
      out.dispose();
    },
  };
}

function polyVoice(
  T: T,
  synth: ToneNS.PolySynth<any>,
  chain: ToneNS.ToneAudioNode[],
  out: ToneNS.Gain,
  extra: { dispose(): void }[] = [],
): Voice {
  let node: ToneNS.ToneAudioNode = synth;
  for (const c of chain) {
    node.connect(c);
    node = c;
  }
  node.connect(out);
  return {
    output: out,
    trigger(midi, duration, time, velocity) {
      safely(() => synth.triggerAttackRelease(freq(T, midi), duration, time, velocity));
    },
    dispose() {
      synth.dispose();
      chain.forEach((c) => c.dispose());
      extra.forEach((e) => e.dispose());
      out.dispose();
    },
  };
}

function monoVoice(
  T: T,
  synth: ToneNS.MonoSynth | ToneNS.Synth,
  chain: ToneNS.ToneAudioNode[],
  out: ToneNS.Gain,
): Voice {
  let node: ToneNS.ToneAudioNode = synth;
  for (const c of chain) {
    node.connect(c);
    node = c;
  }
  node.connect(out);
  const at = timeGuard(synth);
  return {
    output: out,
    trigger(midi, duration, time, velocity) {
      safely(() => synth.triggerAttackRelease(freq(T, midi), duration, at(time), velocity));
    },
    dispose() {
      synth.dispose();
      chain.forEach((c) => c.dispose());
      out.dispose();
    },
  };
}

// Level trims (dB) per sound, from offline loudness measurements of the
// style loops, so lanes sit in a balanced mix whatever sound they use.
const SOUND_TRIM: Record<string, number> = {};

export function createVoice(T: T, id: string): Voice {
  const out = new T.Gain(T.dbToGain(SOUND_TRIM[id] ?? 0));
  switch (id) {
    // ---- keys (sampled piano / e-piano, sometimes with a string pad under long chords)
    case "felt-piano":
      return sampledVoice(T, ["piano"], {
        release: 0.9,
        chain: [new T.Filter(2300, "lowpass"), new T.Filter({ type: "lowshelf", frequency: 200, gain: -3 })],
        layer: { set: "strings", minDuration: 0.6, gain: 0.32, attack: 0.35, release: 1.2 },
      }, out);
    case "garage-piano":
      return sampledVoice(T, ["piano"], {
        release: 0.22,
        chain: [new T.Filter(5200, "lowpass"), new T.Distortion(0.05)],
      }, out);
    case "rhodes":
      return sampledVoice(T, ["epiano"], {
        release: 0.6,
        chain: [new T.Tremolo(4, 0.2).start(), new T.Chorus(0.8, 2.5, 0.3).start()],
      }, out);
    case "keys-pad":
      return sampledVoice(T, ["piano"], {
        release: 0.8,
        chain: [new T.Filter(3800, "lowpass")],
        layer: { set: "strings", minDuration: 0.3, gain: 0.5, attack: 0.3, release: 1.2 },
      }, out);
    case "lush-keys":
      return sampledVoice(T, ["piano"], {
        release: 0.9,
        chain: [new T.Filter(4200, "lowpass"), new T.Chorus(0.6, 3, 0.25).start()],
        layer: { set: "strings", minDuration: 0.3, gain: 0.45, attack: 0.25, release: 1.3 },
      }, out);
    case "bright-piano":
      // Bright grand with a held string layer, so a stutter gate has something to chop.
      return sampledVoice(T, ["piano"], {
        release: 0.8,
        chain: [new T.Filter({ type: "highshelf", frequency: 2500, gain: 4 })],
        layer: { set: "strings", minDuration: 0.9, gain: 0.4, attack: 0.25, release: 1.2 },
      }, out);
    case "guitar-strum":
      return sampledVoice(T, ["guitar"], { release: 0.4, chain: [new T.Filter(110, "highpass")] }, out);
    case "piano-high":
      return sampledVoice(T, ["piano"], {
        release: 1.0,
        chain: [new T.Filter({ type: "highshelf", frequency: 3000, gain: 3 })],
      }, out);
    case "guitar-pick":
      return sampledVoice(T, ["nylon"], { release: 0.6 }, out);
    case "marimba":
      return sampledVoice(T, ["marimba"], { release: 0.4 }, out);
    case "glass-bells": {
      const s = new T.PolySynth(T.FMSynth, {
        harmonicity: 7,
        modulationIndex: 2,
        oscillator: { type: "sine" },
        modulation: { type: "sine" },
        envelope: { attack: 0.002, decay: 0.9, sustain: 0, release: 0.6 },
        modulationEnvelope: { attack: 0.002, decay: 0.25, sustain: 0, release: 0.3 },
        volume: -12,
      });
      s.maxPolyphony = 24;
      return polyVoice(T, s, [], out);
    }
    // ---- vocals (GeneralUser GS voice samples)
    case "vox-chop":
      // Slices of a sung/spoken recording: vowels alternate like different syllables,
      // band-limited like a phone recording, slightly crunchy.
      return sampledVoice(T, ["aahs", "oohs"], {
        attack: 0.004,
        release: 0.06,
        pick: (_m, n) => ([0, 0, 1, 0, 1, 1][n % 6]),
        chain: [
          new T.Filter(280, "highpass"),
          new T.Filter(7000, "lowpass"),
          new T.Filter({ type: "peaking", frequency: 2600, Q: 0.9, gain: 4 }),
          new T.Distortion(0.08),
        ],
      }, out);
    case "vox-stretch":
      // A stretched, distorted vowel; the gate comes from the repeated MIDI notes.
      return sampledVoice(T, ["aahs"], {
        attack: 0.002,
        release: 0.02,
        chain: [
          new T.Filter(220, "highpass"),
          new T.Filter({ type: "peaking", frequency: 3000, Q: 0.8, gain: 3 }),
          new T.Distortion(0.2),
        ],
      }, out);
    case "vox-sing":
      return sampledVoice(T, ["oohs", "aahs"], {
        attack: 0.03,
        release: 0.25,
        pick: (_m, n) => (n % 4 === 3 ? 1 : 0),
        chain: [new T.Filter(160, "highpass"), new T.Vibrato(5, 0.06)],
      }, out);
    case "brass-lead":
      // Trumpet through a moving filter, like the "WACUKA" drop lead.
      return sampledVoice(T, ["trumpet"], {
        attack: 0.01,
        release: 0.15,
        chain: [
          new T.AutoFilter({ frequency: "8n", baseFrequency: 700, octaves: 2.2, depth: 0.6 }).start(),
          new T.Distortion(0.12),
        ],
      }, out);
    case "harmonica":
      return sampledVoice(T, ["harmonica"], { release: 0.15 }, out);
    // ---- bass (synthesized)
    case "sub": {
      const s = new T.MonoSynth({
        oscillator: { type: "triangle" },
        filter: { type: "lowpass", Q: 0.5, rolloff: -24 },
        filterEnvelope: { attack: 0.001, decay: 0.1, sustain: 1, release: 0.1, baseFrequency: 180, octaves: 1.5 },
        envelope: { attack: 0.004, decay: 0.2, sustain: 0.95, release: 0.08 },
        volume: -4,
      });
      return monoVoice(T, s, [], out);
    }
    case "reese": {
      const s = new T.MonoSynth({
        oscillator: { type: "fatsawtooth", count: 3, spread: 24 },
        filter: { type: "lowpass", Q: 1, rolloff: -24 },
        filterEnvelope: { attack: 0.005, decay: 0.3, sustain: 0.7, release: 0.2, baseFrequency: 160, octaves: 2 },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.9, release: 0.1 },
        volume: -12,
      });
      return monoVoice(T, s, [new T.Distortion(0.3), new T.Filter(1800, "lowpass")], out);
    }
    case "deep-bass": {
      const s = new T.MonoSynth({
        oscillator: { type: "sawtooth" },
        filter: { type: "lowpass", Q: 1.2, rolloff: -24 },
        filterEnvelope: { attack: 0.002, decay: 0.18, sustain: 0.2, release: 0.15, baseFrequency: 110, octaves: 2.6 },
        envelope: { attack: 0.003, decay: 0.25, sustain: 0.6, release: 0.1 },
        volume: -7,
      });
      return monoVoice(T, s, [], out);
    }
    case "house-bass": {
      const s = new T.MonoSynth({
        oscillator: { type: "square" },
        filter: { type: "lowpass", Q: 2, rolloff: -24 },
        filterEnvelope: { attack: 0.001, decay: 0.12, sustain: 0.1, release: 0.1, baseFrequency: 150, octaves: 2.8 },
        envelope: { attack: 0.002, decay: 0.18, sustain: 0.4, release: 0.06 },
        volume: -10,
      });
      return monoVoice(T, s, [], out);
    }
    // ---- neutral set for the fair blind test
    case "neutral-bass": {
      const s = new T.MonoSynth({
        oscillator: { type: "triangle" },
        filter: { type: "lowpass", Q: 0.5 },
        filterEnvelope: { attack: 0.001, decay: 0.1, sustain: 1, release: 0.1, baseFrequency: 400, octaves: 0.5 },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.8, release: 0.08 },
        volume: -5,
      });
      return monoVoice(T, s, [], out);
    }
    case "neutral-lead": {
      const s = new T.PolySynth(T.Synth, {
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.2 },
        volume: -20,
      });
      return polyVoice(T, s, [new T.Filter(2000, "lowpass")], out);
    }
    case "neutral-pluck": {
      const s = new T.PolySynth(T.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.002, decay: 0.25, sustain: 0, release: 0.2 },
        volume: -12,
      });
      return polyVoice(T, s, [], out);
    }
    case "neutral-keys":
    default: {
      const s = new T.PolySynth(T.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.01, decay: 0.6, sustain: 0.5, release: 0.4 },
        volume: -13,
      });
      s.maxPolyphony = 32;
      return polyVoice(T, s, [], out);
    }
  }
}
