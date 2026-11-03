// Sound presets for the lab: sampled keys, guitars, brass and voices,
// synthesized basses and a neutral set for the blind test.

import type * as ToneNS from "tone";
import type { Note } from "../../engine/src/index";
import type { PlayerOptions } from "./audio";
import { SAMPLE_SETS, loadSet } from "./samples";

type T = ToneLib;

export interface Voice {
  output: ToneNS.ToneAudioNode;
  /**
   * `index` is the note's position in its lane (stable across loops); negative = a harmony voice.
   * `glide`: slide from the sounding note without a new attack (trap 808).
   */
  trigger(midi: number, duration: number, time: number, velocity: number, index?: number, opts?: { glide?: boolean }): void;
  /** Get ready for these notes (and harmony pitches per note) before the loop plays. */
  prepare?(notes: readonly Note[], harmony?: readonly (readonly number[])[]): void;
  dispose(): void;
  /** Resolves when samples are loaded (synth voices are ready at once). */
  ready?: Promise<void>;
}

export const SOUND_LABELS: Record<string, string> = {
  "felt-piano": "Weiches Piano + Streicher",
  "garage-piano": "Piano-Stabs",
  rhodes: "E-Piano",
  "keys-pad": "Piano + Pad",
  "lush-keys": "Piano + Streicher + weiche Fläche",
  "bright-piano": "Helles Flügel-Piano + Synth-Fläche",
  "guitar-strum": "Akustikgitarre",
  "piano-high": "Piano hoch",
  "guitar-pick": "Nylon-Gitarre",
  blips: "Synth-Blips",
  "staccato-synth": "Staccato-Synth",
  "lofi-sine": "Lo-Fi-Sinus",
  sub: "Sub-Bass",
  reese: "Reese-Bass",
  "deep-bass": "Deep-Bass",
  "house-bass": "House-Bass",
  "bounce-sub": "Hüpfender Sub-Bass",
  "vox-chop": "Vocal-Slices",
  "vox-stretch": "Gedehnter Vokal",
  "vox-sing": "Gesang (Vokal)",
  "brass-lead": "Bläser-Lead",
  harmonica: "Mundharmonika",
  "deep-pluck": "Deep-House-Pluck",
  "808": "808",
  "808-hard": "808 verzerrt",
  bells: "Glocken",
  flute: "Flöte",
  "dark-piano": "Dunkles Piano",
  "trap-guitar": "Gitarre (Loop)",
  "choir-dark": "Dunkler Chor",
  "trap-strings": "Streicher",
  "synth-lead": "Synth-Lead",
  "dark-pad": "Dunkle Fläche",
  theremin: "Schwebender Sinus",
  "warm-pad": "Warme Fläche",
  "film-strings": "Streicher (Orchester)",
  "low-strings": "Tiefe Streicher",
  horns: "Hörner",
  "low-brass": "Posaunen und Hörner",
  braam: "Blech-Wand",
  violin: "Solo-Geige",
  cello: "Solo-Cello",
  spiccato: "Spiccato-Streicher",
  "violin-spiccato": "Geigen-Ostinato",
  "film-flute": "Orchester-Flöte",
  "breath-flute": "Hauchflöte",
  organ: "Kirchenorgel",
  "film-piano": "Weicher Flügel",
  "synth-bass": "Analog-Synth-Bass",
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
// recordings are short: strings last ~3 s, the voice samples ~1.3 s.
const RETRIGGER: Record<string, number> = { strings: 2, oohs: 0.9, aahs: 0.9 };

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

const NOTE_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const midiOfName = (name: string) => {
  const m = /^([A-G]b?)(-?\d)$/.exec(name);
  return m ? NOTE_NAMES.indexOf(m[1]) + 12 * (Number(m[2]) + 1) : 60;
};

/**
 * A held vowel from a sampled voice set, stretched by grain players (BUNT.'s
 * "stretched as hell" vowel): one player per pitch runs all the time, an
 * envelope opens it for each note. Grainy = big grains crawling through the
 * vowel; smooth = small grains at normal speed.
 */
function grainVowel(T: T, set: string, grainy: boolean, chain: ToneNS.ToneAudioNode[], out: ToneNS.Gain): Voice {
  const input = new T.Gain(1);
  let node: ToneNS.ToneAudioNode = input;
  for (const c of chain) {
    node.connect(c);
    node = c;
  }
  node.connect(out);
  let buffers: Record<string, ToneNS.ToneAudioBuffer> = {};
  let disposed = false;
  const players = new Map<number, { player: ToneNS.GrainPlayer; env: ToneNS.Gain }>();
  let pending: number[] = [];
  const playerFor = (midi: number) => {
    let p = players.get(midi);
    if (p) return p;
    const roots = Object.keys(buffers);
    if (!roots.length) return null;
    const root = roots.reduce((a, b) => (Math.abs(midiOfName(b) - midi) < Math.abs(midiOfName(a) - midi) ? b : a));
    const buffer = buffers[root];
    const env = new T.Gain(0);
    env.connect(input);
    const player = new T.GrainPlayer({
      url: buffer,
      loop: true,
      loopStart: Math.min(0.15, buffer.duration * 0.2),
      loopEnd: buffer.duration * 0.85,
      grainSize: grainy ? 0.12 : 0.07,
      overlap: grainy ? 0.05 : 0.035,
      playbackRate: grainy ? 0.3 : 1,
      detune: (midi - midiOfName(root)) * 100,
      volume: SAMPLE_SETS[set]?.gain ?? 0,
    });
    player.connect(env);
    player.start();
    p = { player, env };
    players.set(midi, p);
    return p;
  };
  const ready = loadSet(T, set).then((b) => {
    if (disposed) return;
    buffers = b;
    for (const m of pending) playerFor(m);
    pending = [];
  });
  let last: ToneNS.Gain | null = null;
  return {
    output: out,
    ready,
    prepare(notes) {
      const pitches = [...new Set(notes.map((n) => n.pitch))];
      if (!Object.keys(buffers).length) pending = pitches;
      else for (const m of pitches) playerFor(m);
    },
    trigger(midi, duration, time, velocity) {
      safely(() => {
        const p = playerFor(midi);
        if (!p) return;
        const t = time + 0.001;
        if (last && last !== p.env) {
          last.gain.cancelScheduledValues(t);
          last.gain.setTargetAtTime(0, t, 0.006);
        }
        const g = p.env.gain;
        g.cancelScheduledValues(t);
        g.setValueAtTime(0, t);
        g.linearRampToValueAtTime(velocity, t + 0.004);
        g.setValueAtTime(velocity, t + Math.max(0.004, duration - 0.03));
        g.linearRampToValueAtTime(0, t + duration);
        last = p.env;
      });
    },
    dispose() {
      disposed = true;
      for (const { player, env } of players.values()) {
        player.dispose();
        env.dispose();
      }
      players.clear();
      input.dispose();
      chain.forEach((c) => c.dispose());
      out.dispose();
    },
  };
}

/**
 * Adds a quiet pad under held chords: a supersaw for BUNT.'s gated pads (the lane's
 * stutter gate chops it together with the piano), or a soft, slow one for AVAION.
 */
function withPad(T: T, voice: Voice, into: ToneNS.ToneAudioNode, level: number, minDuration: number, soft = false): Voice {
  const pad = new T.PolySynth(T.Synth, {
    // count 3 is Tone's default: other counts rebuild the oscillators inside the audio callback.
    oscillator: soft ? { type: "fattriangle", count: 3, spread: 18 } : { type: "fatsawtooth", count: 3, spread: 28 },
    envelope: soft ? { attack: 0.45, decay: 0.5, sustain: 0.85, release: 1.2 } : { attack: 0.08, decay: 0.3, sustain: 0.8, release: 0.5 },
    volume: T.gainToDb(level),
  });
  pad.maxPolyphony = 24;
  const tone = new T.Filter({ type: "lowpass", frequency: soft ? 1400 : 2600, Q: 0.6 });
  pad.chain(tone, into);
  return {
    ...voice,
    trigger(midi, duration, time, velocity, index) {
      voice.trigger(midi, duration, time, velocity, index);
      if (duration >= minDuration) safely(() => pad.triggerAttackRelease(freq(T, midi), duration, time, velocity * 0.8));
    },
    dispose() {
      pad.dispose();
      tone.dispose();
      voice.dispose();
    },
  };
}

/**
 * Trap 808: a sine with a short pitch punch and some drive, mono. A note with
 * glide slides from the sounding pitch and keeps sounding (FL Studio's slide).
 */
function voice808(T: T, out: ToneNS.Gain, o: { drive: number; decay: number; tone: number }): Voice {
  const osc = new T.Oscillator({ type: "sine", frequency: 55 }).start();
  const amp = new T.Gain(0);
  const drive = new T.Distortion({ distortion: o.drive, oversample: "2x" });
  const tone = new T.Filter({ type: "lowpass", frequency: o.tone, Q: 0.5 });
  osc.chain(amp, drive, tone, out);
  const at = timeGuard(osc);
  return {
    output: out,
    trigger(midi, duration, time, velocity, _index, opts) {
      const t = at(time);
      const f = freq(T, midi);
      const end = t + Math.max(0.05, duration);
      safely(() => {
        const fr = osc.frequency;
        const g = amp.gain;
        fr.cancelAndHoldAtTime(t);
        g.cancelAndHoldAtTime(t);
        if (opts?.glide) {
          // The slide: the pitch moves over about 80 ms, the note rings on.
          fr.exponentialRampToValueAtTime(f, t + 0.08);
          g.setTargetAtTime(velocity * 0.55, t, o.decay);
        } else {
          // A new hit: a short punch from above, a fast attack, then a slow decay.
          fr.setValueAtTime(f * 1.8, t);
          fr.exponentialRampToValueAtTime(f, t + 0.03);
          g.linearRampToValueAtTime(velocity, t + 0.004);
          g.setTargetAtTime(velocity * 0.55, t + 0.004, o.decay);
        }
        g.setTargetAtTime(0, end, 0.035);
      });
    },
    dispose() {
      osc.dispose();
      amp.dispose();
      drive.dispose();
      tone.dispose();
      out.dispose();
    },
  };
}

/** Adds a filtered noise layer that follows each note, like a synth's noise oscillator. */
function withNoise(T: T, voice: Voice, into: ToneNS.ToneAudioNode, level: number): Voice {
  const noise = new T.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.01, decay: 0.25, sustain: 0.35, release: 0.12 },
    volume: T.gainToDb(level),
  });
  const band = new T.Filter({ type: "bandpass", frequency: 1800, Q: 0.8 });
  noise.chain(band, into);
  const at = timeGuard(noise);
  return {
    ...voice,
    trigger(midi, duration, time, velocity) {
      voice.trigger(midi, duration, time, velocity);
      safely(() => noise.triggerAttackRelease(duration, at(time), velocity));
    },
    dispose() {
      noise.dispose();
      band.dispose();
      voice.dispose();
    },
  };
}

/**
 * Short notes cut from sustained samples (spiccato): the slow bowed onset is skipped,
 * so each note starts crisp, and a quick fade ends it.
 */
function shortSampleVoice(
  T: T,
  set: string,
  o: { offset: number; maxLength: number; fade: number },
  chain: ToneNS.ToneAudioNode[],
  out: ToneNS.Gain,
): Voice {
  const input = new T.Gain(T.dbToGain(SAMPLE_SETS[set]?.gain ?? 0));
  let node: ToneNS.ToneAudioNode = input;
  for (const c of chain) {
    node.connect(c);
    node = c;
  }
  node.connect(out);
  let buffers: { midi: number; buf: ToneNS.ToneAudioBuffer }[] = [];
  let disposed = false;
  const ready = loadSet(T, set).then((b) => {
    if (disposed) return;
    buffers = Object.entries(b).map(([name, buf]) => ({ midi: midiOfName(name), buf }));
  });
  return {
    output: out,
    ready,
    trigger(midi, duration, time, velocity) {
      if (!buffers.length) return;
      let best = buffers[0];
      for (const x of buffers) if (Math.abs(x.midi - midi) < Math.abs(best.midi - midi)) best = x;
      const len = Math.max(0.06, Math.min(duration, o.maxLength));
      safely(() => {
        // A non-empty onended lets Tone dispose the source once it has played.
        const src = new T.ToneBufferSource({
          url: best.buf,
          playbackRate: Math.pow(2, (midi - best.midi) / 12),
          fadeIn: 0.004,
          fadeOut: o.fade,
          curve: "exponential",
          onended: () => undefined,
        });
        src.connect(input);
        src.start(time, o.offset, len, velocity);
      });
    },
    dispose() {
      disposed = true;
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

// Round-5 level trims where a sound changed (Salamander layers, new synths).
const SOUND_TRIM_V5: Record<string, number> = {
  "felt-piano": -3,
  "keys-pad": -4.6,
  "lush-keys": -4.3,
  "bright-piano": -1.8,
  "garage-piano": 0.5,
  "piano-high": -1.5,
};

// Level trims (dB) per sound, from offline loudness measurements of the
// style loops, so lanes sit in a balanced mix whatever sound they use.
const SOUND_TRIM: Record<string, number> = {
  "felt-piano": -4.5,
  "garage-piano": 0.5,
  rhodes: -4,
  "keys-pad": -6,
  "lush-keys": -4.5,
  "bright-piano": -1.5,
  "guitar-strum": -8.5,
  "piano-high": -1.5,
  "guitar-pick": -8.5,
  "deep-pluck": 1.5,
  "lofi-sine": -1.5,
  sub: -6,
  reese: 1,
  "deep-bass": 1.5,
  "house-bass": 3.5,
  "bounce-sub": -1.5,
  // Hip-hop (round 7), from offline loudness of the six hip-hop loops with the trap lane
  // balance (mix.laneDb); the 808 sits a little above a house sub.
  "808": -2.5,
  "808-hard": -3.3,
  "trap-guitar": -4.5,
  "choir-dark": -9.5,
  "trap-strings": -7.5,
  "synth-lead": 1.8,
  bells: 2,
  flute: -2,
  "dark-piano": -2.5,
  theremin: -6,
  // Film (round 8): first values, balanced with the offline loudness of the film loops.
  "film-strings": 0,
  "low-strings": 0,
  horns: 0,
  "low-brass": 0,
  braam: 0,
  violin: 0,
  cello: 0,
  spiccato: 0,
  "violin-spiccato": 0,
  "film-flute": 0,
  "breath-flute": 0,
  organ: 0,
  "film-piano": 0,
  "synth-bass": 0,
  "vox-chop": 0.5,
  "vox-stretch": 0,
  "vox-sing": -4,
  "brass-lead": 1.5,
  harmonica: -5,
};

export function createVoice(T: T, id: string, options: PlayerOptions = { soundSet: "v5", grain: true }): Voice {
  const v5 = options.soundSet === "v5";
  const trim = (v5 ? SOUND_TRIM_V5[id] : undefined) ?? SOUND_TRIM[id] ?? 0;
  const out = new T.Gain(T.dbToGain(trim));
  switch (id) {
    // ---- keys (sampled piano / e-piano, sometimes with a string pad under long chords)
    case "felt-piano":
      // Round 5: the soft grand layer with a slow tape wobble, like Fred again..'s worn felt pianos.
      return sampledVoice(T, [v5 ? "grand-soft" : "piano"], {
        release: 0.9,
        chain: [
          new T.Filter(2300, "lowpass"),
          new T.Filter({ type: "lowshelf", frequency: 200, gain: -3 }),
          ...(v5 ? [new T.Vibrato(0.55, 0.035)] : []),
        ],
        layer: { set: "strings", minDuration: 0.6, gain: 0.32, attack: 0.35, release: 1.2 },
      }, out);
    case "garage-piano":
      return sampledVoice(T, [v5 ? "grand-hard" : "piano"], {
        release: 0.22,
        chain: [new T.Filter(5200, "lowpass"), new T.Distortion(0.05)],
      }, out);
    case "rhodes":
      return sampledVoice(T, ["epiano"], {
        release: 0.6,
        chain: [new T.Tremolo(4, 0.2).start(), new T.Chorus(0.8, 2.5, 0.3).start()],
      }, out);
    case "keys-pad":
      return sampledVoice(T, [v5 ? "grand-soft" : "piano"], {
        release: 0.8,
        chain: [new T.Filter(3800, "lowpass")],
        layer: { set: "strings", minDuration: 0.3, gain: 0.5, attack: 0.3, release: 1.2 },
      }, out);
    case "lush-keys": {
      // Round 5 adds a soft synth pad under long chords (AVAION's warm deep-house pads).
      const keys = sampledVoice(T, [v5 ? "grand-soft" : "piano"], {
        release: 0.9,
        chain: [new T.Filter(4200, "lowpass"), new T.Chorus(0.6, 3, 0.25).start()],
        layer: { set: "strings", minDuration: 0.3, gain: 0.45, attack: 0.25, release: 1.3 },
      }, out);
      return v5 ? withPad(T, keys, out, 0.2, 0.6, true) : keys;
    }
    case "bright-piano": {
      // Bright grand with a held string layer, so a stutter gate has something to chop;
      // round 5 plays the hard concert-grand layer and adds a gated supersaw pad.
      const piano = sampledVoice(T, [v5 ? "grand-hard" : "piano"], {
        release: 0.8,
        chain: [new T.Filter({ type: "highshelf", frequency: 2500, gain: v5 ? 2 : 4 })],
        layer: { set: "strings", minDuration: 0.9, gain: 0.4, attack: 0.25, release: 1.2 },
      }, out);
      return v5 ? withPad(T, piano, out, 0.29, 0.6) : piano;
    }
    case "guitar-strum":
      return sampledVoice(T, ["guitar"], { release: 0.4, chain: [new T.Filter(110, "highpass")] }, out);
    case "piano-high":
      return sampledVoice(T, [v5 ? "grand-hard" : "piano"], {
        release: 1.0,
        chain: [new T.Filter({ type: "highshelf", frequency: 3000, gain: 3 })],
      }, out);
    case "guitar-pick":
      return sampledVoice(T, ["nylon"], { release: 0.6 }, out);
    case "blips": {
      // Short "bleeping" square blips, a quiet 16th layer under the hook (WACUKA).
      const s = new T.PolySynth(T.Synth, {
        oscillator: { type: "square" },
        envelope: { attack: 0.001, decay: 0.09, sustain: 0, release: 0.05 },
        volume: -5.5,
      });
      s.maxPolyphony = 16;
      return polyVoice(T, s, [new T.Filter(2600, "lowpass")], out);
    }
    case "staccato-synth": {
      // Short saw stabs on the loop chords (BUNT.: "staccato synth" next to the vocal).
      const s = new T.PolySynth(T.Synth, {
        // count 3 is Tone's default: other counts rebuild the oscillators inside the audio callback.
        oscillator: { type: "fatsawtooth", count: 3, spread: 18 },
        envelope: { attack: 0.002, decay: 0.16, sustain: 0, release: 0.08 },
        volume: -1,
      });
      s.maxPolyphony = 24;
      return polyVoice(T, s, [new T.Filter({ type: "lowpass", frequency: 2400, Q: 1.2 })], out);
    }
    case "drop-lead": {
      // A bright supersaw lead that doubles the hook an octave up in AVAION's drops.
      const s = new T.PolySynth(T.Synth, {
        // count 3 is Tone's default: other counts rebuild the oscillators inside the audio callback.
        oscillator: { type: "fatsawtooth", count: 3, spread: 22 },
        envelope: { attack: 0.006, decay: 0.2, sustain: 0.55, release: 0.18 },
        // Measured: about 5 dB under the sung vocal it doubles, clearly there without taking over.
        volume: -4,
      });
      s.maxPolyphony = 8;
      return polyVoice(T, s, [new T.Filter({ type: "lowpass", frequency: 3600, Q: 0.7 })], out);
    }
    case "deep-pluck": {
      // Deep-house pluck (AVAION, "Selected" style): saw and square, a fast filter
      // envelope and a breath of noise, softened by the reverb send.
      const s = new T.PolySynth(T.MonoSynth, {
        oscillator: { type: "fatsawtooth", count: 3, spread: 12 },
        filter: { type: "lowpass", Q: 2, rolloff: -24 },
        filterEnvelope: { attack: 0.001, decay: 0.22, sustain: 0.05, release: 0.2, baseFrequency: 450, octaves: 3 },
        envelope: { attack: 0.002, decay: 0.35, sustain: 0, release: 0.25 },
        // Measured: as loud as the nylon guitar it alternates with.
        volume: 0,
      });
      s.maxPolyphony = 16;
      return polyVoice(T, s, [new T.Filter(4500, "lowpass")], out);
    }
    // ---- hip-hop (round 7): 808s and the instruments of trap melody loops
    case "808":
      return voice808(T, out, { drive: 0.22, decay: 0.9, tone: 1400 });
    case "808-hard":
      // Driven harder, so it reads on small speakers too.
      return voice808(T, out, { drive: 0.55, decay: 0.7, tone: 2200 });
    case "bells": {
      // A bright FM bell with a short tail, for melody loops and counter-melodies.
      const s = new T.PolySynth(T.FMSynth, {
        harmonicity: 3.01,
        modulationIndex: 12,
        oscillator: { type: "sine" },
        modulation: { type: "sine" },
        envelope: { attack: 0.002, decay: 0.9, sustain: 0, release: 0.6 },
        modulationEnvelope: { attack: 0.002, decay: 0.3, sustain: 0, release: 0.2 },
        volume: -2,
      });
      s.maxPolyphony = 12;
      return polyVoice(T, s, [new T.Filter(7000, "lowpass")], out);
    }
    case "flute": {
      // A breathy flute: a soft triangle with vibrato and a breath of noise.
      const s = new T.PolySynth(T.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.06, decay: 0.2, sustain: 0.8, release: 0.25 },
        volume: -10,
      });
      s.maxPolyphony = 4;
      return withNoise(T, polyVoice(T, s, [new T.Vibrato(5, 0.08), new T.Filter(3200, "lowpass")], out), out, 0.05);
    }
    case "dark-piano":
      // A soft grand behind a low-pass, like a piano loop that sits in the back.
      return sampledVoice(T, [v5 ? "grand-soft" : "piano"], {
        release: 1.2,
        chain: [new T.Filter(1900, "lowpass"), new T.Filter({ type: "lowshelf", frequency: 250, gain: 2 })],
      }, out);
    case "trap-guitar":
      return sampledVoice(T, ["guitar"], {
        release: 0.8,
        chain: [new T.Filter(150, "highpass"), new T.Filter(3600, "lowpass"), new T.Chorus(0.5, 3, 0.2).start()],
      }, out);
    case "choir-dark":
      return sampledVoice(T, ["aahs", "oohs"], {
        attack: 0.25,
        release: 1.2,
        pick: (_m, n) => n % 2,
        chain: [new T.Filter(2600, "lowpass")],
      }, out);
    case "trap-strings":
      return sampledVoice(T, ["strings"], { attack: 0.15, release: 1.0, chain: [new T.Filter(3200, "lowpass")] }, out);
    case "synth-lead": {
      // A bright, playful square lead with a touch of glide, like a video-game synth.
      const s = new T.MonoSynth({
        oscillator: { type: "square" },
        filter: { type: "lowpass", Q: 1, rolloff: -12 },
        filterEnvelope: { attack: 0.002, decay: 0.2, sustain: 0.5, release: 0.2, baseFrequency: 900, octaves: 2.5 },
        envelope: { attack: 0.003, decay: 0.15, sustain: 0.6, release: 0.12 },
        portamento: 0.02,
        volume: -16,
      });
      return monoVoice(T, s, [new T.Vibrato(6, 0.04)], out);
    }
    case "theremin": {
      // An eerie sine that glides from note to note with a wide vibrato (OZ's odd hook layer).
      const s = new T.MonoSynth({
        oscillator: { type: "sine" },
        filter: { type: "lowpass", Q: 0.5, rolloff: -12 },
        filterEnvelope: { attack: 0.01, decay: 0.3, sustain: 1, release: 0.3, baseFrequency: 2500, octaves: 0 },
        envelope: { attack: 0.08, decay: 0.2, sustain: 0.9, release: 0.4 },
        portamento: 0.09,
        volume: -8,
      });
      return monoVoice(T, s, [new T.Vibrato(5.5, 0.18), new T.Distortion(0.08)], out);
    }
    case "warm-pad": {
      const s = new T.PolySynth(T.Synth, {
        // count 3 is Tone's default: other counts rebuild the oscillators inside the audio callback.
        oscillator: { type: "fattriangle", count: 3, spread: 16 },
        envelope: { attack: 0.35, decay: 0.4, sustain: 0.85, release: 1.2 },
        volume: -10,
      });
      s.maxPolyphony = 16;
      return polyVoice(T, s, [new T.Filter(2200, "lowpass")], out);
    }
    case "dark-pad": {
      const s = new T.PolySynth(T.Synth, {
        // count 3 is Tone's default: other counts rebuild the oscillators inside the audio callback.
        oscillator: { type: "fatsawtooth", count: 3, spread: 20 },
        envelope: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1.5 },
        volume: -8,
      });
      s.maxPolyphony = 16;
      return polyVoice(T, s, [new T.Filter(900, "lowpass")], out);
    }
    // ---- film (round 8): FluidR3 orchestra samples and a few synths
    case "film-strings":
      // The string section as a bed: a slow bow, a long release, a little darker.
      return sampledVoice(T, ["strings"], { attack: 0.35, release: 1.8, chain: [new T.Filter(3600, "lowpass")] }, out);
    case "low-strings":
      // Basses below C3, cellos above: the low strings that carry a film cue's bass.
      return sampledVoice(T, ["contrabass", "cello"], {
        attack: 0.08,
        release: 0.9,
        pick: (m) => (m < 48 ? 0 : 1),
        chain: [new T.Filter(2400, "lowpass")],
      }, out);
    case "horns":
      return sampledVoice(T, ["horns"], { attack: 0.08, release: 1.0, chain: [new T.Filter(3800, "lowpass")] }, out);
    case "low-brass":
      // Trombones, with horns on the long notes: the big brass chord.
      return sampledVoice(T, ["trombone"], {
        attack: 0.05,
        release: 0.9,
        chain: [new T.Filter(3200, "lowpass")],
        layer: { set: "horns", minDuration: 0.4, gain: 0.7, attack: 0.1, release: 1.0 },
      }, out);
    case "braam":
      // The trailer blast: low brass driven into distortion, dark.
      return sampledVoice(T, ["trombone"], {
        attack: 0.02,
        release: 1.2,
        chain: [new T.Distortion(0.35), new T.Filter(1600, "lowpass")],
        layer: { set: "horns", minDuration: 0.3, gain: 0.8, attack: 0.05, release: 1.2 },
      }, out);
    case "violin":
      return sampledVoice(T, ["violin"], { attack: 0.03, release: 0.5, chain: [new T.Filter(220, "highpass"), new T.Filter(7000, "lowpass")] }, out);
    case "cello":
      return sampledVoice(T, ["cello"], { attack: 0.05, release: 0.8, chain: [new T.Filter(5000, "lowpass")] }, out);
    case "spiccato":
      // Short, bouncing section strings for ostinatos.
      return shortSampleVoice(T, "strings", { offset: 0.12, maxLength: 0.22, fade: 0.06 }, [new T.Filter(5500, "lowpass")], out);
    case "violin-spiccato":
      // One fast violin, close and dry, as in a racing ostinato.
      return shortSampleVoice(T, "violin", { offset: 0.1, maxLength: 0.2, fade: 0.05 }, [new T.Filter(250, "highpass"), new T.Filter(7500, "lowpass")], out);
    case "film-flute":
      return sampledVoice(T, ["flute-real"], { attack: 0.03, release: 0.4, chain: [new T.Filter(7000, "lowpass")] }, out);
    case "breath-flute":
      // An airy, breathy flute (shakuhachi samples), close to a fula flute or a bass recorder.
      return sampledVoice(T, ["shakuhachi"], { attack: 0.02, release: 0.5, chain: [new T.Filter(5000, "lowpass")] }, out);
    case "organ": {
      // A pipe organ: 8' and 4' flue stops (partials) and a soft 16' an octave below.
      const s = new T.PolySynth(T.Synth, {
        oscillator: { type: "custom", partials: [1, 0.55, 0.3, 0.4, 0.1, 0.18, 0, 0.12] },
        envelope: { attack: 0.08, decay: 0.2, sustain: 0.9, release: 1.0 },
        volume: -16,
      });
      s.maxPolyphony = 16;
      const sub = new T.PolySynth(T.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.12, decay: 0.2, sustain: 0.9, release: 1.0 },
        volume: -20,
      });
      sub.maxPolyphony = 16;
      const tone = new T.Filter(4800, "lowpass");
      s.connect(tone);
      sub.connect(tone);
      tone.connect(out);
      return {
        output: out,
        trigger(midi, duration, time, velocity) {
          // Pipes do not get louder when pressed harder.
          const v = 0.6 + velocity * 0.3;
          safely(() => s.triggerAttackRelease(freq(T, midi), duration, time, v));
          safely(() => sub.triggerAttackRelease(freq(T, midi - 12), duration, time, v));
        },
        dispose() {
          s.dispose();
          sub.dispose();
          tone.dispose();
          out.dispose();
        },
      };
    }
    case "film-piano":
      return sampledVoice(T, [v5 ? "grand-soft" : "piano"], { release: 2.2, chain: [new T.Filter(3400, "lowpass")] }, out);
    case "synth-bass": {
      // A driven analog saw bass with a plucky filter.
      const s = new T.MonoSynth({
        oscillator: { type: "sawtooth" },
        filter: { type: "lowpass", Q: 2, rolloff: -24 },
        filterEnvelope: { attack: 0.002, decay: 0.25, sustain: 0.3, release: 0.2, baseFrequency: 120, octaves: 3 },
        envelope: { attack: 0.004, decay: 0.2, sustain: 0.8, release: 0.12 },
        volume: -10,
      });
      return monoVoice(T, s, [new T.Distortion(0.3), new T.Filter(2200, "lowpass")], out);
    }
    case "lofi-sine": {
      // Sine one-shot with pitch wobble and saturation: a bubbling bed (Fred again..).
      const s = new T.PolySynth(T.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.004, decay: 0.5, sustain: 0.1, release: 0.4 },
        volume: -10,
      });
      s.maxPolyphony = 16;
      return polyVoice(T, s, [new T.Vibrato(0.9, 0.12), new T.Distortion(0.25), new T.Filter(4200, "lowpass")], out);
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
      // A stretched, distorted vowel; the stutter gate sits on the lead in the player.
      if (options.soundSet === "v5") {
        return grainVowel(T, "aahs", options.grain, [
          new T.Filter(220, "highpass"),
          new T.Filter({ type: "peaking", frequency: 3000, Q: 0.8, gain: 3 }),
          new T.Distortion(0.2),
        ], out);
      }
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
    case "brass-lead": {
      // Trumpet plus noise through one LFO filter, like the "WACUKA" drop lead (Serum).
      const filter = new T.AutoFilter({ frequency: "8n", baseFrequency: 700, octaves: 2.2, depth: 0.6 }).start();
      const voice = sampledVoice(T, ["trumpet"], {
        attack: 0.01,
        release: 0.15,
        chain: [filter, new T.Distortion(0.12)],
      }, out);
      return withNoise(T, voice, filter, 0.12);
    }
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
    case "bounce-sub": {
      // BUNT.'s bouncing sub (round 5): a round sub with a short knock on each note,
      // so the offbeat bass bounces under the sidechain and is heard on small speakers too.
      const s = new T.MonoSynth({
        oscillator: { type: "triangle" },
        filter: { type: "lowpass", Q: 0.8, rolloff: -24 },
        filterEnvelope: { attack: 0.001, decay: 0.08, sustain: 0.3, release: 0.08, baseFrequency: 150, octaves: 2.6 },
        envelope: { attack: 0.002, decay: 0.16, sustain: 0.55, release: 0.07 },
        volume: -4,
      });
      return monoVoice(T, s, [new T.Distortion(0.12)], out);
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
