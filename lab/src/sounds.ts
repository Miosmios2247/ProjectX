// Sound presets for the lab: sampled instruments where it matters (piano,
// guitar, voices), synthesized with Tone.js elsewhere.

import type * as ToneNS from "tone";
import { loadSet } from "./samples";

type T = ToneLib;

export interface Voice {
  output: ToneNS.ToneAudioNode;
  trigger(midi: number, duration: number, time: number, velocity: number): void;
  dispose(): void;
  /** Resolves when samples are loaded (synth voices are ready at once). */
  ready?: Promise<void>;
}

export const SOUND_LABELS: Record<string, string> = {
  "felt-piano": "Weiches Piano + Pad",
  "warm-pad": "Warmes Pad",
  "ep-keys": "E-Piano",
  "organ-stab": "Orgel-Stab",
  "deep-stab": "Deep-Stab",
  guitar: "Akustikgitarre",
  "guitar-pick": "Gitarre gezupft",
  sub: "Sub-Bass",
  "reese-sub": "Reese-Bass",
  "deep-bass": "Deep-Bass",
  "house-bass": "House-Bass",
  "vox-chop": "Vocal-Chop",
  "vox-chant": "Vocal-Chant",
  "soft-lead": "Weicher Lead",
  "airy-lead": "Luftiger Lead",
  harmonica: "Mundharmonika",
  whistle: "Pfeifen",
  "soft-bell": "Glocke",
  "bell-pluck": "Glocken-Pluck",
  "house-pluck": "House-Pluck",
  marimba: "Marimba",
  kalimba: "Kalimba",
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
      const smp = new T.Sampler({ urls: buffers, attack: opts.attack ?? 0, release: opts.release ?? 0.8 });
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
        layer = new T.Sampler({ urls: buffers, attack: l.attack ?? 0.3, release: l.release ?? 1 });
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
      const i = opts.pick ? opts.pick(midi, count++) : 0;
      const smp = samplers[i] ?? samplers.find((x) => x);
      if (smp) safely(() => smp.triggerAttackRelease(freq(T, midi), duration, time, velocity));
      const l = layer;
      if (l && opts.layer && duration >= opts.layer.minDuration) {
        safely(() => l.triggerAttackRelease(freq(T, midi), duration, time, velocity * 0.8));
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

/** Plucked string from FM (no AudioWorklet needed, unlike Karplus-Strong). */
function guitarVoice(T: T, bright: boolean, out: ToneNS.Gain): Voice {
  const s = new T.PolySynth(T.FMSynth, {
    harmonicity: 1,
    modulationIndex: bright ? 5 : 3.5,
    oscillator: { type: "triangle" },
    modulation: { type: "sawtooth" },
    envelope: { attack: 0.002, decay: bright ? 0.6 : 0.9, sustain: 0.04, release: 0.35 },
    modulationEnvelope: { attack: 0.001, decay: 0.09, sustain: 0.05, release: 0.2 },
    volume: bright ? -12 : -10,
  });
  s.maxPolyphony = 36;
  const hp = new T.Filter(100, "highpass");
  const body = new T.Filter({ type: "peaking", frequency: 220, Q: 0.9, gain: 3 });
  const lp = new T.Filter(bright ? 5200 : 3800, "lowpass");
  return polyVoice(T, s, [hp, body, lp], out);
}

function formantVoice(
  T: T,
  formants: [number, number, number],
  env: Partial<ToneNS.EnvelopeOptions>,
  vibrato: number,
  out: ToneNS.Gain,
): Voice {
  const src = new T.PolySynth(T.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: env,
    volume: -2,
  });
  src.maxPolyphony = 12;
  const vib = new T.Vibrato(5.2, vibrato);
  src.connect(vib);
  const gains = [1, 0.75, 0.35];
  const qs = [5, 7, 9];
  const nodes: ToneNS.ToneAudioNode[] = [vib];
  formants.forEach((f, i) => {
    const bp = new T.Filter({ type: "bandpass", frequency: f, Q: qs[i] });
    const g = new T.Gain(gains[i] * 2.4);
    vib.connect(bp);
    bp.connect(g);
    g.connect(out);
    nodes.push(bp, g);
  });
  return {
    output: out,
    trigger(midi, duration, time, velocity) {
      safely(() => src.triggerAttackRelease(freq(T, midi), duration, time, velocity));
    },
    dispose() {
      src.dispose();
      nodes.forEach((n) => n.dispose());
      out.dispose();
    },
  };
}

// Level trims (dB) per sound, from offline loudness measurements of the
// style loops, so lanes sit in a balanced mix whatever sound they use.
const SOUND_TRIM: Record<string, number> = {
  "felt-piano": 9,
  "organ-stab": 6,
  "warm-pad": 8,
  "ep-keys": 11,
  guitar: 6,
  "deep-stab": 6,
  sub: -5,
  "reese-sub": 6,
  "deep-bass": 1,
  "house-bass": 4,
  "vox-chop": -3,
  "soft-lead": 11,
  "airy-lead": -3.5,
  "vox-chant": -2,
  whistle: -2,
  "soft-bell": 18,
  "bell-pluck": 17,
  "house-pluck": 5.5,
  kalimba: 10,
  marimba: 10,
  "guitar-pick": 11.5,
};

export function createVoice(T: T, id: string): Voice {
  const out = new T.Gain(T.dbToGain(SOUND_TRIM[id] ?? 0));
  switch (id) {
    case "felt-piano": {
      const piano = new T.PolySynth(T.FMSynth, {
        harmonicity: 2,
        modulationIndex: 1.6,
        oscillator: { type: "sine" },
        modulation: { type: "sine" },
        envelope: { attack: 0.004, decay: 1.0, sustain: 0.1, release: 0.45 },
        modulationEnvelope: { attack: 0.002, decay: 0.35, sustain: 0.05, release: 0.4 },
        volume: -8,
      });
      piano.maxPolyphony = 32;
      const pad = new T.PolySynth(T.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.3, decay: 0.6, sustain: 0.55, release: 0.6 },
        volume: -22,
      });
      pad.maxPolyphony = 16;
      const lp = new T.Filter(2600, "lowpass");
      const padLp = new T.Filter(1100, "lowpass");
      piano.connect(lp);
      lp.connect(out);
      pad.connect(padLp);
      padLp.connect(out);
      return {
        output: out,
        trigger(midi, duration, time, velocity) {
          const f = freq(T, midi);
          safely(() => piano.triggerAttackRelease(f, duration, time, velocity));
          // The pad only carries long chords; short hits stay pure piano.
          if (duration >= 0.45) safely(() => pad.triggerAttackRelease(f, duration, time, velocity * 0.8));
        },
        dispose() {
          [piano, pad, lp, padLp, out].forEach((n) => n.dispose());
        },
      };
    }
    case "warm-pad": {
      const s = new T.PolySynth(T.Synth, {
        oscillator: { type: "fatsawtooth", count: 2, spread: 20 },
        envelope: { attack: 0.25, decay: 0.8, sustain: 0.7, release: 0.9 },
        volume: -14,
      });
      s.maxPolyphony = 28;
      const chorus = new T.Chorus(1.5, 3.5, 0.5).start();
      return polyVoice(T, s, [new T.Filter({ frequency: 1500, type: "lowpass", rolloff: -24 }), chorus], out);
    }
    case "ep-keys": {
      const s = new T.PolySynth(T.FMSynth, {
        harmonicity: 1,
        modulationIndex: 3.2,
        oscillator: { type: "sine" },
        modulation: { type: "sine" },
        envelope: { attack: 0.003, decay: 1.2, sustain: 0.18, release: 0.5 },
        modulationEnvelope: { attack: 0.002, decay: 0.5, sustain: 0.1, release: 0.4 },
        volume: -9,
      });
      s.maxPolyphony = 32;
      const trem = new T.Tremolo(4, 0.25).start();
      const chorus = new T.Chorus(0.8, 2.5, 0.3).start();
      return polyVoice(T, s, [trem, chorus], out);
    }
    case "organ-stab": {
      const s = new T.PolySynth(T.Synth, {
        oscillator: { type: "custom", partials: [1, 0.55, 0.32, 0.18, 0.1] },
        envelope: { attack: 0.004, decay: 0.28, sustain: 0.25, release: 0.12 },
        volume: -12,
      });
      s.maxPolyphony = 24;
      return polyVoice(T, s, [new T.Filter(2400, "lowpass")], out);
    }
    case "deep-stab": {
      const s = new T.PolySynth(T.MonoSynth, {
        oscillator: { type: "sawtooth" },
        filter: { Q: 2, type: "lowpass", rolloff: -24 },
        filterEnvelope: { attack: 0.003, decay: 0.22, sustain: 0.15, release: 0.2, baseFrequency: 260, octaves: 3.2 },
        envelope: { attack: 0.003, decay: 0.3, sustain: 0.25, release: 0.18 },
        volume: -12,
      });
      s.maxPolyphony = 24;
      const chorus = new T.Chorus(1.2, 3, 0.4).start();
      return polyVoice(T, s, [chorus], out);
    }
    case "guitar":
      return guitarVoice(T, false, out);
    case "guitar-pick":
      return guitarVoice(T, true, out);
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
    case "reese-sub": {
      const s = new T.MonoSynth({
        oscillator: { type: "fatsawtooth", count: 2, spread: 18 },
        filter: { type: "lowpass", Q: 1, rolloff: -24 },
        filterEnvelope: { attack: 0.005, decay: 0.3, sustain: 0.6, release: 0.2, baseFrequency: 140, octaves: 2 },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.9, release: 0.1 },
        volume: -10,
      });
      return monoVoice(T, s, [new T.Distortion(0.15)], out);
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
    case "vox-chop":
      return formantVoice(T, [750, 1150, 2700], { attack: 0.008, decay: 0.15, sustain: 0.55, release: 0.07 }, 0.04, out);
    case "vox-chant":
      return formantVoice(T, [520, 860, 2500], { attack: 0.03, decay: 0.3, sustain: 0.7, release: 0.25 }, 0.12, out);
    case "soft-lead": {
      const s = new T.PolySynth(T.Synth, {
        oscillator: { type: "fatsawtooth", count: 2, spread: 14 },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.65, release: 0.35 },
        volume: -14,
      });
      return polyVoice(T, s, [new T.Filter(2600, "lowpass")], out);
    }
    case "airy-lead": {
      const s = new T.PolySynth(T.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.04, decay: 0.2, sustain: 0.8, release: 0.5 },
        volume: -6,
      });
      return polyVoice(T, s, [new T.Vibrato(5, 0.08)], out);
    }
    case "harmonica": {
      const s = new T.PolySynth(T.Synth, {
        oscillator: { type: "pulse", width: 0.35 },
        envelope: { attack: 0.035, decay: 0.2, sustain: 0.8, release: 0.15 },
        volume: -10,
      });
      return polyVoice(T, s, [new T.Vibrato(5.5, 0.1), new T.Filter({ type: "bandpass", frequency: 1500, Q: 0.7 })], out);
    }
    case "whistle": {
      const s = new T.PolySynth(T.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.03, decay: 0.1, sustain: 0.9, release: 0.12 },
        volume: -9,
      });
      return polyVoice(T, s, [new T.Vibrato(6, 0.12)], out);
    }
    case "soft-bell": {
      const s = new T.PolySynth(T.FMSynth, {
        harmonicity: 3.01,
        modulationIndex: 5,
        oscillator: { type: "sine" },
        modulation: { type: "sine" },
        envelope: { attack: 0.002, decay: 0.9, sustain: 0, release: 0.5 },
        modulationEnvelope: { attack: 0.002, decay: 0.3, sustain: 0, release: 0.3 },
        volume: -16,
      });
      return polyVoice(T, s, [], out);
    }
    case "bell-pluck": {
      const s = new T.PolySynth(T.FMSynth, {
        harmonicity: 4,
        modulationIndex: 3,
        oscillator: { type: "sine" },
        modulation: { type: "sine" },
        envelope: { attack: 0.002, decay: 0.4, sustain: 0, release: 0.4 },
        modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.2 },
        volume: -15,
      });
      return polyVoice(T, s, [], out);
    }
    case "house-pluck": {
      const s = new T.PolySynth(T.MonoSynth, {
        oscillator: { type: "sawtooth" },
        filter: { type: "lowpass", Q: 3, rolloff: -24 },
        filterEnvelope: { attack: 0.001, decay: 0.16, sustain: 0, release: 0.2, baseFrequency: 500, octaves: 3.5 },
        envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.25 },
        volume: -13,
      });
      return polyVoice(T, s, [], out);
    }
    case "marimba": {
      const s = new T.PolySynth(T.FMSynth, {
        harmonicity: 4,
        modulationIndex: 1.2,
        oscillator: { type: "sine" },
        modulation: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.45, sustain: 0, release: 0.35 },
        modulationEnvelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1 },
        volume: -8,
      });
      return polyVoice(T, s, [], out);
    }
    case "kalimba": {
      const s = new T.PolySynth(T.FMSynth, {
        harmonicity: 7,
        modulationIndex: 1.5,
        oscillator: { type: "sine" },
        modulation: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.55, sustain: 0, release: 0.35 },
        modulationEnvelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
        volume: -9,
      });
      return polyVoice(T, s, [], out);
    }
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
