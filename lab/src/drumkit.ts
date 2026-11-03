// Drum kits for the listening context: synthesized 909-style kick, snare,
// clap and hats, sampled percussion per style (congas, shaker, toms ...).
// Round 5 plays kick, hats and snare from CC0 samples (Sonic Pi), layers a
// finger snap on the clap and hits a real crash on the drop.

import type * as ToneNS from "tone";
import type { DrumInst } from "../../engine/src/index";
import { timeGuard } from "./sounds";
import { KIT5_SAMPLES, Kit5Sample, KitSample, ORCH_SAMPLES, OrchSample, loadKit } from "./samples";

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
  // Trap (round 7): a short, punchy kick (the 808 carries the low end), crisp clap and hats.
  trap: {
    trim: 3, kickDecay: 0.22, kickVol: -4, kickPunch: 7, hatHp: 9500, hatVol: -17, clapVol: -7, snareVol: -8,
    samples: { rim: ["sidestick", -10], percHi: ["bongohi", -14], percLo: ["congalo", -14], tom: ["tomlo", -10], shaker: ["shaker", -16], tamb: ["tambourine", -18] },
  },
  // Film (round 8): the orchestral samples below carry these kits; the synths are only a fallback.
  epic: {
    trim: 0, kickDecay: 0.9, kickVol: -2, kickPunch: 2, hatHp: 7000, hatVol: -20, clapVol: -12, snareVol: -10,
    samples: { shaker: ["shaker", -16] },
  },
  wakanda: {
    trim: 0, kickDecay: 0.7, kickVol: -3, kickPunch: 2.5, hatHp: 7000, hatVol: -19, clapVol: -11, snareVol: -11,
    samples: { shaker: ["shaker", -13], tamb: ["cabasa", -16] },
  },
  neutral: {
    trim: 3, kickDecay: 0.36, kickVol: -4, kickPunch: 5, hatHp: 7500, hatVol: -18, clapVol: -10, snareVol: -11,
    samples: {},
  },
};

interface OrchShape {
  /** Orchestral one-shots (they ring out instead of choking each other) and their level in dB. */
  samples: Partial<Record<DrumInst, [OrchSample, number]>>;
  /** Talking drums (a pitch-bending membrane) on the high and low percussion. */
  talking?: boolean;
}

// Round-8 film percussion: a taiko ensemble, concert bass drum and snare, a cymbal for
// swells and climaxes, timpani and a woodblock that ticks like a clock.
const KITS_ORCH: Record<string, OrchShape> = {
  epic: {
    samples: {
      kick: ["taiko-lo", -3], percLo: ["bass-drum", -4], tom: ["taiko-hi", -6], percHi: ["taiko-mid", -6],
      snare: ["concert-snare", -8], clap: ["concert-snare", -9], hatO: ["cymbal", -12], rim: ["woodblock", -12], hatC: ["woodblock", -18],
      tamb: ["timpani", -6],
    },
  },
  // Black Panther: deep drums under talking drums, shaker and woodblock.
  wakanda: {
    samples: { kick: ["taiko-lo", -4], tom: ["taiko-hi", -7], snare: ["concert-snare", -10], hatO: ["cymbal", -14], rim: ["woodblock", -13], hatC: ["woodblock", -19] },
    talking: true,
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
  // Trap: tight kick, bright snare, short crisp hats for fast rolls, a snap on the clap.
  trap: { samples: { kick: ["kick-tek", -6], hatC: ["hat-cab", -18], hatO: ["hat-gump", -21], snare: ["snare-dolf", -10] }, snap: -14 },
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
  private T: T;
  private oneShots: Partial<Record<DrumInst, { buffer: ToneNS.ToneAudioBuffer; gain: ToneNS.Gain }>> = {};
  private talkOut: ToneNS.Gain | null = null;
  private slap: ToneNS.NoiseSynth | null = null;

  constructor(T: T, kitId: string, readonly soundSet: "v5" | "v4" = "v5") {
    this.T = T;
    const k = KITS[kitId] ?? KITS.house;
    const orch = KITS_ORCH[kitId];
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
    if (orch) {
      if (orch.talking) {
        this.talkOut = track(new T.Gain(T.dbToGain(-8)));
        this.talkOut.connect(this.output);
        this.slap = track(new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.03, sustain: 0 }, volume: -22 }));
        to(this.slap, track(new T.Filter({ type: "bandpass", frequency: 2200, Q: 1.2 })));
      }
      loads.push(
        loadKit(T, ORCH_SAMPLES, "samples/orch/").then((buffers) => {
          if (this.disposed) return;
          for (const [inst, [sample, db]] of Object.entries(orch.samples) as [DrumInst, [OrchSample, number]][]) {
            const buf = buffers[sample];
            if (!buf) continue;
            const gain = track(new T.Gain(T.dbToGain(db)));
            gain.connect(this.output);
            this.oneShots[inst] = { buffer: buf, gain };
          }
          // The song form's crash becomes a real cymbal.
          if (buffers.cymbal) {
            this.crashSample = track(new T.Player({ url: buffers.cymbal, volume: -10, fadeOut: 0.3 }));
            to(this.crashSample);
          }
        }),
      );
    }
    // The orchestral kits have their own samples; the round-5 drum samples would replace them.
    const k5 = soundSet === "v5" && !orch ? KITS5[kitId] ?? KITS5.house : null;
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
    if (this.talkOut && (inst === "percHi" || inst === "percLo")) {
      this.talk(at(time), v, inst === "percHi");
      return;
    }
    const one = this.oneShots[inst];
    if (one) {
      // A fresh source per hit, so a taiko keeps ringing under the next one. A non-empty
      // onended lets Tone dispose the source when it is done.
      const src = new this.T.ToneBufferSource({ url: one.buffer, fadeOut: 0.05, onended: () => undefined });
      src.connect(one.gain);
      src.start(at(time), 0, undefined, v);
      return;
    }
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

  /**
   * A talking drum: the skin is squeezed while it rings, so the pitch drops after the
   * strike and then bends up, like a voice.
   */
  private talk(time: number, v: number, high: boolean): void {
    const T = this.T;
    const out = this.talkOut;
    if (!out) return;
    const f0 = high ? 210 : 135;
    const bend = high ? 1.42 : 1.26;
    const osc = new T.Oscillator({ type: "sine", frequency: f0 * 1.7 });
    const amp = new T.Gain(0);
    osc.connect(amp);
    amp.connect(out);
    osc.frequency.setValueAtTime(f0 * 1.7, time);
    osc.frequency.exponentialRampToValueAtTime(f0, time + 0.025);
    osc.frequency.exponentialRampToValueAtTime(f0 * bend, time + 0.2);
    amp.gain.setValueAtTime(0, time);
    amp.gain.linearRampToValueAtTime(v, time + 0.003);
    amp.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
    osc.onstop = () => {
      osc.dispose();
      amp.dispose();
    };
    osc.start(time).stop(time + 0.55);
    this.slap?.triggerAttackRelease(0.03, this.guard("slap")(time), v);
  }

  dispose(): void {
    this.disposed = true;
    this.nodes.forEach((n) => n.dispose());
    this.output.dispose();
  }
}
