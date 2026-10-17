// Plays an idea in the browser, looped and synced: sidechain pumping on
// everything but the drums, an optional 1/16 stutter gate and a noise bed.

import type * as ToneNS from "tone";
import { Idea, LaneId, stepToBeat } from "../../engine/src/index";
import { Voice, createVoice } from "./sounds";
import { DrumKit } from "./drumkit";

export type PlayLane = LaneId | "drums";
export type SoundMode = "style" | "neutral";

const NEUTRAL: Record<LaneId, string> = {
  chords: "neutral-keys",
  bass: "neutral-bass",
  lead: "neutral-lead",
  pluck: "neutral-pluck",
};

// Per-lane level trims (dB), balanced with offline renders.
const LANE_TRIM: Record<PlayLane, number> = { chords: -2, bass: 0, lead: -1, pluck: 0, drums: -1 };
const REVERB_SEND: Record<PlayLane, number> = { chords: 0.55, bass: 0, lead: 0.6, pluck: 0.7, drums: 0.08 };
// Lanes that pump with the kick; the reverb return pumps too.
const DUCKED: PlayLane[] = ["chords", "bass", "lead", "pluck"];

const PLAY_LANES_ALL: PlayLane[] = ["chords", "bass", "lead", "pluck", "drums"];

export class Player {
  private readonly T: ToneLib;
  private master!: ToneNS.Gain;
  private duck!: ToneNS.Gain;
  private reverb!: ToneNS.Reverb;
  private reverbIn!: ToneNS.Gain;
  private delay!: ToneNS.FeedbackDelay;
  private laneGain = {} as Record<PlayLane, ToneNS.Gain>;
  /** Stutter gate per lane, between the lane level and the mix. */
  private gate = {} as Record<PlayLane, ToneNS.Gain>;
  private noise!: ToneNS.Noise;
  private noiseLevel!: ToneNS.Gain;
  private voices: Partial<Record<LaneId, { id: string; voice: Voice }>> = {};
  private kit: { id: string; kit: DrumKit } | null = null;
  private parts: ToneNS.Part[] = [];
  private duckEvent: number | null = null;
  private gateEvent: number | null = null;
  private muted = new Set<PlayLane>();
  private built = false;
  idea: Idea | null = null;
  soundMode: SoundMode = "style";

  constructor(tone: ToneLib) {
    this.T = tone;
  }

  private wantPlaying = false;

  get playing(): boolean {
    return this.built && this.wantPlaying;
  }

  /** Must be called from a user gesture the first time. */
  async unlock(): Promise<void> {
    await this.T.start();
    try {
      if (navigator.audioSession) navigator.audioSession.type = "playback";
    } catch {
      // not supported
    }
    if (!this.built) await this.build();
  }

  async build(): Promise<void> {
    const T = this.T;
    const comp = new T.Compressor({ threshold: -16, ratio: 3, attack: 0.01, release: 0.2 });
    const limiter = new T.Limiter(-1);
    this.master = new T.Gain(T.dbToGain(-4));
    this.master.chain(comp, limiter, T.getDestination());
    this.duck = new T.Gain(1);
    this.duck.connect(this.master);
    this.reverb = new T.Reverb({ decay: 3.2, preDelay: 0.02, wet: 1 });
    this.reverbIn = new T.Gain(0.35);
    this.reverbIn.connect(this.reverb);
    this.reverb.connect(this.duck);
    this.delay = new T.FeedbackDelay({ delayTime: "8n.", feedback: 0.28, wet: 1 });
    const delaySend = new T.Gain(0.16);
    delaySend.connect(this.delay);
    this.delay.connect(this.master);
    for (const lane of PLAY_LANES_ALL) {
      const g = new T.Gain(T.dbToGain(LANE_TRIM[lane]));
      const gate = new T.Gain(1);
      g.connect(gate);
      gate.connect(DUCKED.includes(lane) ? this.duck : this.master);
      // Sends after the gate, so the reverb tail stutters with the lane.
      const send = new T.Gain(REVERB_SEND[lane]);
      gate.connect(send);
      send.connect(this.reverbIn);
      if (lane === "lead") gate.connect(delaySend);
      this.laneGain[lane] = g;
      this.gate[lane] = gate;
    }
    // Quiet tape/room noise under the loop (Fred again.., BUNT.).
    this.noiseLevel = new T.Gain(0);
    const noiseTone = new T.Filter({ type: "bandpass", frequency: 2400, Q: 0.35 });
    this.noise = new T.Noise("pink");
    this.noise.chain(noiseTone, this.noiseLevel, this.duck);
    await this.reverb.ready;
    this.built = true;
    if (this.idea) this.load(this.idea, this.soundMode);
  }

  setMuted(lane: PlayLane, muted: boolean): void {
    if (muted) this.muted.add(lane);
    else this.muted.delete(lane);
    if (!this.built) return;
    const base = this.T.dbToGain(LANE_TRIM[lane]);
    this.laneGain[lane].gain.rampTo(muted ? 0 : base, 0.03);
  }

  private voiceFor(lane: LaneId, id: string): Voice {
    const cur = this.voices[lane];
    if (cur && cur.id === id) return cur.voice;
    cur?.voice.dispose();
    const voice = createVoice(this.T, id);
    voice.output.connect(this.laneGain[lane]);
    this.voices[lane] = { id, voice };
    return voice;
  }

  private kitFor(id: string): DrumKit {
    if (this.kit && this.kit.id === id) return this.kit.kit;
    this.kit?.kit.dispose();
    const kit = new DrumKit(this.T, id);
    kit.output.connect(this.laneGain.drums);
    this.kit = { id, kit };
    return kit;
  }

  /** Load (or swap) the idea; keeps playing if already playing. */
  load(idea: Idea, soundMode: SoundMode = this.soundMode): void {
    this.idea = idea;
    this.soundMode = soundMode;
    if (!this.built) return;
    const T = this.T;
    const transport = T.getTransport();
    for (const p of this.parts) p.dispose();
    this.parts = [];
    if (this.duckEvent !== null) transport.clear(this.duckEvent);
    if (this.gateEvent !== null) transport.clear(this.gateEvent);
    this.gateEvent = null;

    transport.bpm.value = idea.bpm;
    const ppq = transport.PPQ;
    const secPerBeat = 60 / idea.bpm;
    const ticks = (beats: number) => `${Math.round(beats * ppq)}i`;
    const totalBeats = idea.bars * 4;
    transport.loop = true;
    transport.loopStart = 0;
    transport.loopEnd = ticks(totalBeats);
    if (transport.ticks >= Math.round(totalBeats * ppq)) transport.ticks = 0;

    const neutral = soundMode === "neutral";
    for (const lane of ["chords", "bass", "lead", "pluck"] as LaneId[]) {
      const data = idea.lanes[lane];
      const voice = this.voiceFor(lane, neutral ? NEUTRAL[lane] : data.sound);
      const events = data.notes.map((n) => {
        const start = stepToBeat(n.start, idea.swing);
        const end = stepToBeat(n.start + n.len, idea.swing);
        return { time: ticks(start), midi: n.pitch, dur: Math.max(0.03, (end - start) * secPerBeat * 0.98), vel: n.vel / 127 };
      });
      const part = new T.Part((time, ev: { midi: number; dur: number; vel: number }) => {
        voice.trigger(ev.midi, ev.dur, time, ev.vel);
      }, events);
      part.start(0);
      this.parts.push(part);
    }
    const kit = this.kitFor(neutral ? "neutral" : idea.drums.kit);
    // Kick stays straight; hats and percussion get the style's drum swing.
    const drumEvents = idea.drums.hits.map((h) => ({
      time: ticks(stepToBeat(h.step, h.inst === "kick" ? 0.5 : idea.drumSwing)),
      inst: h.inst,
      vel: h.vel / 127,
    }));
    const drumPart = new T.Part((time, ev: (typeof drumEvents)[number]) => kit.hit(ev.inst, time, ev.vel), drumEvents);
    drumPart.start(0);
    this.parts.push(drumPart);

    // Sidechain: duck on every beat, recover quickly.
    const depth = neutral ? 0.3 : idea.mix.sidechain;
    const g = this.duck.gain;
    this.duckEvent = transport.scheduleRepeat((time) => {
      g.cancelScheduledValues(time);
      g.setValueAtTime(1 - depth, time);
      g.setTargetAtTime(1, time + 0.015, secPerBeat * 0.16);
    }, "4n", 0);
    if (depth <= 0.01) g.value = 1;

    // Stutter gate: straight 1/16 steps, "off" steps drop by `depth`.
    this.openGates();
    const gate = neutral ? undefined : idea.mix.gate;
    if (gate && gate.lanes.length && gate.pattern.length) {
      const stepTicks = ppq / 4;
      const nodes = gate.lanes.map((l) => this.gate[l].gain);
      this.gateEvent = transport.scheduleRepeat((time) => {
        const step = Math.round(transport.getTicksAtTime(time) / stepTicks);
        const on = gate.pattern[step % gate.pattern.length] ?? 1;
        const level = 1 - gate.depth * (1 - on);
        for (const n of nodes) {
          n.cancelScheduledValues(time);
          n.setTargetAtTime(level, time, 0.003);
        }
      }, "16n", 0);
    }

    this.noiseLevel.gain.rampTo(neutral ? 0 : (idea.mix.noise ?? 0) * (this.wantPlaying ? 1 : 0), 0.05);
    this.reverbIn.gain.value = neutral ? 0.25 : idea.mix.reverb;
    for (const lane of this.muted) this.setMuted(lane, true);
  }

  private openGates(): void {
    for (const lane of PLAY_LANES_ALL) {
      const g = this.gate[lane].gain;
      g.cancelScheduledValues(this.T.now());
      g.value = 1;
    }
  }

  /** Wait (up to a few seconds) until sampled instruments of the loaded idea are ready. */
  async prepare(timeoutMs = 8000): Promise<void> {
    const waits = Object.values(this.voices)
      .map((v) => v?.voice.ready)
      .filter((p): p is Promise<void> => !!p);
    if (this.kit?.kit.ready) waits.push(this.kit.kit.ready);
    if (!waits.length) return;
    await Promise.race([Promise.all(waits), new Promise((r) => setTimeout(r, timeoutMs))]);
  }

  play(): void {
    if (!this.built) return;
    const transport = this.T.getTransport();
    if (transport.state !== "started") transport.start("+0.05");
    this.wantPlaying = true;
    if (this.noise.state !== "started") this.noise.start();
    const level = this.soundMode === "neutral" ? 0 : (this.idea?.mix.noise ?? 0);
    this.noiseLevel.gain.rampTo(level, 0.1);
  }

  stop(): void {
    if (!this.built) return;
    const transport = this.T.getTransport();
    this.wantPlaying = false;
    transport.stop();
    transport.ticks = 0;
    this.duck.gain.cancelScheduledValues(this.T.now());
    this.duck.gain.value = 1;
    this.openGates();
    this.noiseLevel.gain.cancelScheduledValues(this.T.now());
    this.noiseLevel.gain.value = 0;
    if (this.noise.state === "started") this.noise.stop();
  }

  /** Loop position 0..1 for the playhead. */
  progress(): number {
    if (!this.playing || this.T.getTransport().state !== "started") return -1;
    return this.T.getTransport().progress;
  }
}
