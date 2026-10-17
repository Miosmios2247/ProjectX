// Drum kits for the listening context: synthesized 909-style kick, snare,
// clap and hats, sampled percussion per style (congas, shaker, toms ...).
// Round 5 plays kick, hats and snare from CC0 samples (Sonic Pi), layers a
// finger snap on the clap and hits a real crash on the drop.

import type * as ToneNS from "tone";
import type { DrumInst } from "../../engine/src/index";
import { timeGuard } from "./sounds";
import { KIT5_SAMPLES, Kit5Sample, KitSample, loadKit } from "./samples";

type T = ToneLib;

interface KitShape {
  /** Output level (dB), balanced with offline loudness measurements. */
  trim: number;
  kickDecay: number;
  kickVol: number;
  /** Kick start pitch in octaves above 50 Hz (more = harder click). */
  kickPunch: number;
  hatHp: number;
  hatVol: number;
  clapVol: number;
  snareVol: number;
  /** Instruments played from samples: sample and level in dB. */
  samples: Partial<Record<DrumInst, [KitSample, number]>>;
}

const KITS: Record<string, KitShape> = {
  // Fred again.. / AVAION Pieces: 909 kick and clap, crisp hats, a bit of shaker.
  house: {
    trim: 3, kickDecay: 0.4, kickVol: -3, kickPunch: 5.5, hatHp: 7600, hatVol: -17, clapVol: -9, snareVol: -11,
    samples: { shaker: ["shaker", -15], tamb: ["tambourine", -19], rim: ["sidestick", -13], percHi: ["bongohi", -12], percLo: ["congalo", -12], tom: ["tomlo", -12] },
  },
  // UKG / 2-step: tight kick, snappier snare and rim, more open hats.
  garage: {
    trim: 4.5, kickDecay: 0.32, kickVol: -3, kickPunch: 6, hatHp: 8200, hatVol: -16, clapVol: -10, snareVol: -9,
    samples: { shaker: ["maracas", -15], tamb: ["tambourine", -18], rim: ["sidestick", -11], percHi: ["bongohi", -13], percLo: ["bongolo", -13], tom: ["tommid", -13] },
  },
  // BUNT. stutter house: big round kick, airy shaker, clap up front.
  stutter: {
    trim: 1.5, kickDecay: 0.45, kickVol: -2, kickPunch: 5, hatHp: 8000, hatVol: -18, clapVol: -8, snareVol: -11,
    samples: { shaker: ["shaker", -13], tamb: ["tambourine", -17], rim: ["sidestick", -13], percHi: ["bongohi", -13], percLo: ["congalo", -13], tom: ["tomlo", -12] },
  },
  // AVAION WACUKA: live percussion carries the groove.
  afro: {
    trim: 3.5, kickDecay: 0.3, kickVol: -4, kickPunch: 5, hatHp: 7800, hatVol: -19, clapVol: -11, snareVol: -12,
    samples: { shaker: ["shaker", -12], tamb: ["cabasa", -14], percHi: ["congaopen", -7], percLo: ["congalo", -7], tom: ["tomlo", -9], rim: ["claves", -11] },
  },
  // Drum & bass: sampled acoustic snare and ride-ish hats over a short kick.
  dnb: {
    trim: 4.5, kickDecay: 0.28, kickVol: -3, kickPunch: 6.5, hatHp: 8600, hatVol: -17, clapVol: -12, snareVol: -6,
    samples: { snare: ["snare", -5], shaker: ["shaker", -16], tamb: ["ride", -18], rim: ["sidestick", -12], percHi: ["bongohi", -14], percLo: ["bongolo", -14], tom: ["tommid", -11] },
  },
  neutral: {
    trim: 3, kickDecay: 0.36, kickVol: -4, kickPunch: 5, hatHp: 7500, hatVol: -18, clapVol: -10, snareVol: -11,
    samples: {},
  },
};

type Kit5Inst = "kick" | "hatC" | "hatO" | "snare";

interface Kit5Shape {
  /** Sample and level (dB) per instrument. */
  samples: Partial<Record<Kit5Inst, [Kit5Sample, number]>>;
  /** Level (dB) of a finger snap layered on the clap; omitted = no snap. */
  snap?: number;
}

// Round-5 drums, levels balanced against the round-4 kits by offline loudness.
const KITS5: Record<string, Kit5Shape> = {
  // Fred again.. / AVAION Pieces: punchy house kick, crisp hats, snap on the clap.
  house: { samples: { kick: ["kick-haus", -5.5], hatC: ["hat-gem", -20], hatO: ["hat-gump", -22], snare: ["snare-dub", -15] }, snap: -17 },
  // UKG / 2-step: tight clicky kick, bright hats, crisp snare.
  garage: { samples: { kick: ["kick-tek", -6.5], hatC: ["hat-cab", -19], hatO: ["hat-gump", -21], snare: ["snare-dolf", -12] }, snap: -16 },
  // BUNT.: big round kick, soft hats.
  stutter: { samples: { kick: ["kick-klub", -8.5], hatC: ["hat-star", -21], hatO: ["hat-gump", -23], snare: ["snare-dub", -16] }, snap: -20 },
  // WACUKA: deep round kick, acoustic hats under the congas.
  afro: { samples: { kick: ["kick-pure", -8], hatC: ["hat-acoustic", -21], hatO: ["hat-open-acoustic", -24], snare: ["snare-elec", -15] }, snap: -18 },
  // Drum & bass: short kick, sharp hats, a snare with body.
  dnb: { samples: { kick: ["kick-gas", -1.5], hatC: ["hat-zap", -17], hatO: ["hat-gump", -19], snare: ["snare-generic", -4.5] } },
};

export class DrumKit {
  readonly output: ToneNS.Gain;
  readonly ready: Promise<void>;
  private nodes: ToneNS.ToneAudioNode[] = [];
  private players: Partial<Record<DrumInst, ToneNS.Player>> = {};
  private sampleDb: Partial<Record<DrumInst, number>> = {};
  private disposed = false;
  private kick: ToneNS.MembraneSynth;
  private snare: ToneNS.NoiseSynth;
  private snareBody: ToneNS.MembraneSynth;
  private clap: ToneNS.NoiseSynth;
  private hatC: ToneNS.NoiseSynth;
  private hatO: ToneNS.NoiseSynth;
  private shaker: ToneNS.NoiseSynth;
  private tamb: ToneNS.NoiseSynth;
  private percHi: ToneNS.MembraneSynth;
  private percLo: ToneNS.MembraneSynth;
  private rim: ToneNS.MembraneSynth;
  private crashSynth: ToneNS.NoiseSynth;

  constructor(T: T, kitId: string, readonly soundSet: "v5" | "v4" = "v5") {
    const k = KITS[kitId] ?? KITS.house;
    this.output = new T.Gain(T.dbToGain(k.trim));
    const track = <N extends ToneNS.ToneAudioNode>(n: N): N => {
      this.nodes.push(n);
      return n;
    };
    const to = (src: ToneNS.ToneAudioNode, ...chain: ToneNS.ToneAudioNode[]) => {
      let node = src;
      for (const c of chain) {
        node.connect(c);
        node = c;
      }
      node.connect(this.output);
    };
    this.kick = track(new T.MembraneSynth({
      pitchDecay: 0.045,
      octaves: k.kickPunch,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: k.kickDecay, sustain: 0, release: 0.1 },
      volume: k.kickVol,
    }));
    to(this.kick);
    this.snare = track(new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.16, sustain: 0 }, volume: k.snareVol }));
    to(this.snare, track(new T.Filter(1200, "highpass")));
    this.snareBody = track(new T.MembraneSynth({ pitchDecay: 0.02, octaves: 2, envelope: { attack: 0.001, decay: 0.12, sustain: 0 }, volume: k.snareVol + 2 }));
    to(this.snareBody);
    this.clap = track(new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.14, sustain: 0 }, volume: k.clapVol }));
    to(this.clap, track(new T.Filter({ type: "bandpass", frequency: 1300, Q: 0.9 })));
    this.hatC = track(new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.045, sustain: 0 }, volume: k.hatVol }));
    to(this.hatC, track(new T.Filter(k.hatHp, "highpass")));
    this.hatO = track(new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.24, sustain: 0 }, volume: k.hatVol - 1 }));
    to(this.hatO, track(new T.Filter(k.hatHp - 500, "highpass")));
    // Synth fallbacks for percussion, used until (or if) the samples load.
    this.shaker = track(new T.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.004, decay: 0.05, sustain: 0 }, volume: k.hatVol - 1 }));
    to(this.shaker, track(new T.Filter({ type: "bandpass", frequency: 6500, Q: 1.2 })));
    this.tamb = track(new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.08, sustain: 0 }, volume: k.hatVol }));
    to(this.tamb, track(new T.Filter({ type: "bandpass", frequency: 8500, Q: 2.5 })));
    this.percHi = track(new T.MembraneSynth({ pitchDecay: 0.012, octaves: 1.2, envelope: { attack: 0.001, decay: 0.16, sustain: 0 }, volume: -12 }));
    to(this.percHi);
    this.percLo = track(new T.MembraneSynth({ pitchDecay: 0.014, octaves: 1.2, envelope: { attack: 0.001, decay: 0.2, sustain: 0 }, volume: -12 }));
    to(this.percLo);
    this.rim = track(new T.MembraneSynth({ pitchDecay: 0.002, octaves: 1, envelope: { attack: 0.0005, decay: 0.035, sustain: 0 }, volume: -14 }));
    to(this.rim);
    // Crash on the first beat of a drop (song form).
    this.crashSynth = track(new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.002, decay: 1.8, sustain: 0, release: 0.4 }, volume: k.hatVol + 2 }));
    to(this.crashSynth, track(new T.Filter(5200, "highpass")));

    const wanted = Object.entries(k.samples) as [DrumInst, [KitSample, number]][];
    const loads: Promise<void>[] = [];
    if (wanted.length) {
      loads.push(
        loadKit(T, wanted.map(([, [sample]]) => sample)).then((buffers) => {
          if (this.disposed) return;
          for (const [inst, [sample, db]] of wanted) {
            const buf = buffers[sample];
            if (!buf) continue;
            const player = track(new T.Player({ url: buf, volume: db, fadeOut: 0.01 }));
            to(player);
            this.players[inst] = player;
            this.sampleDb[inst] = db;
          }
        }),
      );
    }
    const k5 = soundSet === "v5" ? KITS5[kitId] ?? KITS5.house : null;
    if (k5) {
      loads.push(
        loadKit(T, KIT5_SAMPLES, "samples/kit5/").then((buffers) => {
          if (this.disposed) return;
          for (const [inst, [sample, db]] of Object.entries(k5.samples) as [Kit5Inst, [Kit5Sample, number]][]) {
            const buf = buffers[sample];
            if (!buf) continue;
            const player = track(new T.Player({ url: buf, volume: db, fadeOut: 0.01 }));
            to(player);
            this.players[inst] = player;
            this.sampleDb[inst] = db;
          }
          if (k5.snap !== undefined && buffers.snap) {
            this.snap = track(new T.Player({ url: buffers.snap, volume: k5.snap, fadeOut: 0.01 }));
            to(this.snap);
            this.snapDb = k5.snap;
          }
          if (buffers.crash) {
            this.crashSample = track(new T.Player({ url: buffers.crash, volume: k.hatVol + 1, fadeOut: 0.3 }));
            to(this.crashSample);
          }
          if (buffers.impact) {
            this.impact = track(new T.Player({ url: buffers.impact, volume: -12, fadeOut: 0.2 }));
            to(this.impact);
          }
        }),
      );
    }
    this.ready = Promise.all(loads).then(() => undefined);
  }

  private snap: ToneNS.Player | null = null;
  private snapDb = 0;
  private crashSample: ToneNS.Player | null = null;
  private impact: ToneNS.Player | null = null;

  private guards = new Map<string, (t: number) => number>();

  private guard(key: string): (t: number) => number {
    let g = this.guards.get(key);
    if (!g) {
      g = timeGuard(this.output);
      this.guards.set(key, g);
    }
    return g;
  }

  crash(time: number): void {
    try {
      const t = this.guard("crash")(time);
      if (this.crashSample) {
        this.crashSample.start(t);
        this.impact?.start(this.guard("impact")(time));
      } else this.crashSynth.triggerAttackRelease(1.4, t, 0.9);
    } catch {
      // drop the hit, keep the loop running
    }
  }

  hit(inst: DrumInst, time: number, velocity: number): void {
    const at = this.guard(inst);
    try {
      this.play(inst, time, velocity, at);
    } catch {
      // drop the hit, keep the loop running
    }
  }

  private play(inst: DrumInst, time: number, velocity: number, at: (t: number) => number): void {
    const v = Math.max(0.05, Math.min(1, velocity));
    const player = this.players[inst];
    if (player) {
      // Velocity as a level change; restarting a Player chokes the previous hit.
      const t = at(time);
      player.volume.setValueAtTime(this.sampleDb[inst]! + 20 * Math.log10(v), t);
      player.start(t);
      return;
    }
    switch (inst) {
      case "kick":
        this.kick.triggerAttackRelease(50, 0.3, at(time), v);
        break;
      case "snare":
        this.snare.triggerAttackRelease(0.15, at(time), v);
        this.snareBody.triggerAttackRelease(190, 0.1, this.guard("snareBody")(time), v * 0.8);
        break;
      case "clap":
        // Three quick bursts make a clap; round 5 adds a finger snap on top.
        this.clap.triggerAttackRelease(0.02, at(time), v * 0.7);
        this.clap.triggerAttackRelease(0.02, at(time + 0.011), v * 0.75);
        this.clap.triggerAttackRelease(0.13, at(time + 0.022), v);
        if (this.snap) {
          const t = this.guard("snap")(time);
          this.snap.volume.setValueAtTime(this.snapDb + 20 * Math.log10(v), t);
          this.snap.start(t);
        }
        break;
      case "hatC":
        this.hatC.triggerAttackRelease(0.04, at(time), v);
        break;
      case "hatO":
        this.hatO.triggerAttackRelease(0.2, at(time), v);
        break;
      case "shaker":
        this.shaker.triggerAttackRelease(0.05, at(time), v);
        break;
      case "tamb":
        this.tamb.triggerAttackRelease(0.07, at(time), v);
        break;
      case "percHi":
        this.percHi.triggerAttackRelease(330, 0.12, at(time), v);
        break;
      case "percLo":
      case "tom":
        this.percLo.triggerAttackRelease(inst === "tom" ? 120 : 196, 0.15, at(time), v);
        break;
      case "rim":
        this.rim.triggerAttackRelease(1100, 0.03, at(time), v);
        break;
    }
  }

  dispose(): void {
    this.disposed = true;
    this.nodes.forEach((n) => n.dispose());
    this.output.dispose();
  }
}
