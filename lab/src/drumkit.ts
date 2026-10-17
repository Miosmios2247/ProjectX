// Synthesized drum kits for the listening context.

import type * as ToneNS from "tone";
import type { DrumInst } from "../../engine/src/index";
import { timeGuard } from "./sounds";

type T = ToneLib;

interface KitShape {
  kickDecay: number;
  kickVol: number;
  hatHp: number;
  hatVol: number;
  percVol: number;
  clapVol: number;
}

const KITS: Record<string, KitShape> = {
  house: { kickDecay: 0.38, kickVol: -3, hatHp: 7500, hatVol: -17, percVol: -12, clapVol: -9 },
  garage: { kickDecay: 0.32, kickVol: -3, hatHp: 8200, hatVol: -16, percVol: -13, clapVol: -10 },
  afro: { kickDecay: 0.3, kickVol: -4, hatHp: 7800, hatVol: -19, percVol: -9, clapVol: -11 },
  deep: { kickDecay: 0.45, kickVol: -3, hatHp: 7000, hatVol: -19, percVol: -13, clapVol: -10 },
  neutral: { kickDecay: 0.36, kickVol: -4, hatHp: 7500, hatVol: -18, percVol: -12, clapVol: -10 },
};

export class DrumKit {
  readonly output: ToneNS.Gain;
  private nodes: ToneNS.ToneAudioNode[] = [];
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

  constructor(T: T, kitId: string) {
    const k = KITS[kitId] ?? KITS.house;
    this.output = new T.Gain(1);
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
      octaves: 5.5,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: k.kickDecay, sustain: 0, release: 0.1 },
      volume: k.kickVol,
    }));
    to(this.kick);
    this.snare = track(new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.16, sustain: 0 }, volume: -12 }));
    to(this.snare, track(new T.Filter(1200, "highpass")));
    this.snareBody = track(new T.MembraneSynth({ pitchDecay: 0.02, octaves: 2, envelope: { attack: 0.001, decay: 0.12, sustain: 0 }, volume: -10 }));
    to(this.snareBody);
    this.clap = track(new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.14, sustain: 0 }, volume: k.clapVol }));
    to(this.clap, track(new T.Filter({ type: "bandpass", frequency: 1300, Q: 0.9 })));
    this.hatC = track(new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.045, sustain: 0 }, volume: k.hatVol }));
    to(this.hatC, track(new T.Filter(k.hatHp, "highpass")));
    this.hatO = track(new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.24, sustain: 0 }, volume: k.hatVol - 1 }));
    to(this.hatO, track(new T.Filter(k.hatHp - 500, "highpass")));
    this.shaker = track(new T.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.004, decay: 0.05, sustain: 0 }, volume: k.hatVol - 1 }));
    to(this.shaker, track(new T.Filter({ type: "bandpass", frequency: 6500, Q: 1.2 })));
    this.tamb = track(new T.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.08, sustain: 0 }, volume: k.hatVol }));
    to(this.tamb, track(new T.Filter({ type: "bandpass", frequency: 8500, Q: 2.5 })));
    this.percHi = track(new T.MembraneSynth({ pitchDecay: 0.012, octaves: 1.2, envelope: { attack: 0.001, decay: 0.16, sustain: 0 }, volume: k.percVol }));
    to(this.percHi);
    this.percLo = track(new T.MembraneSynth({ pitchDecay: 0.014, octaves: 1.2, envelope: { attack: 0.001, decay: 0.2, sustain: 0 }, volume: k.percVol }));
    to(this.percLo);
    this.rim = track(new T.MembraneSynth({ pitchDecay: 0.002, octaves: 1, envelope: { attack: 0.0005, decay: 0.035, sustain: 0 }, volume: k.percVol - 2 }));
    to(this.rim);
  }

  private guards = new Map<string, (t: number) => number>();

  private guard(key: string): (t: number) => number {
    let g = this.guards.get(key);
    if (!g) {
      g = timeGuard(this.output);
      this.guards.set(key, g);
    }
    return g;
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
    switch (inst) {
      case "kick":
        this.kick.triggerAttackRelease(50, 0.3, at(time), v);
        break;
      case "snare":
        this.snare.triggerAttackRelease(0.15, at(time), v);
        this.snareBody.triggerAttackRelease(190, 0.1, this.guard("snareBody")(time), v * 0.8);
        break;
      case "clap":
        // Three quick bursts make a clap.
        this.clap.triggerAttackRelease(0.02, at(time), v * 0.7);
        this.clap.triggerAttackRelease(0.02, at(time + 0.011), v * 0.75);
        this.clap.triggerAttackRelease(0.13, at(time + 0.022), v);
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
        this.percLo.triggerAttackRelease(196, 0.15, at(time), v);
        break;
      case "rim":
        this.rim.triggerAttackRelease(1100, 0.03, at(time), v);
        break;
    }
  }

  dispose(): void {
    this.nodes.forEach((n) => n.dispose());
    this.output.dispose();
  }
}
