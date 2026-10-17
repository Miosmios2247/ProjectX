// Plays an idea in the browser, looped and synced: sidechain pumping on
// everything but the drums, an optional 1/16 stutter gate and a noise bed.
// In song form the loop runs through the artist's arrangement (intro, build,
// drop ...) with lanes switching on and off, a filter, a riser and a snare roll.

import type * as ToneNS from "tone";
import { ArrangementSection, Idea, LaneId, stepToBeat } from "../../engine/src/index";
import { Voice, createVoice } from "./sounds";
import { OWN_VOICE_KIND, OwnVoice, ownVoice } from "./voice";
import { DrumKit } from "./drumkit";
import { harmonyFor, legatoEnds } from "./phrasing";

export type PlayLane = LaneId | "drums";
export type SoundMode = "style" | "neutral";
export type PlayForm = "loop" | "song";

export interface SongSection {
  name: string;
  startBar: number;
  bars: number;
}

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
const OPEN = 20000;

/** Snare roll for a build: quarters, 8ths, 16ths, then 32nds on the last two beats. */
function buildRoll(bars: number): { beat: number; vel: number }[] {
  const out: { beat: number; vel: number }[] = [];
  const first = Math.max(0, bars - 4);
  for (let bar = first; bar < bars; bar++) {
    const k = bar - first;
    const per = [1, 2, 4, 4][k] ?? 4;
    for (let b = 0; b < 4; b++) {
      const sub = k === 3 && b >= 2 ? 8 : per;
      for (let i = 0; i < sub; i++) out.push({ beat: bar * 4 + b + i / sub, vel: 0 });
    }
  }
  const span = bars * 4;
  for (const e of out) e.vel = 0.3 + 0.65 * (e.beat - first * 4) / Math.max(1, span - first * 4);
  return out;
}

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
  /** Song form: low-pass on the music bus, noise riser for builds. */
  private songFilter!: ToneNS.Filter;
  private riser!: ToneNS.Noise;
  private riserFilter!: ToneNS.Filter;
  private riserLevel!: ToneNS.Gain;
  private songEvents: number[] = [];
  private song: SongSection[] = [];
  private loopTicks = 1;
  private songTicks = 1;
  private voices: Partial<Record<LaneId, { id: string; voice: Voice }>> = {};
  private kit: { id: string; kit: DrumKit } | null = null;
  private parts: ToneNS.Part[] = [];
  private duckEvent: number | null = null;
  private gateEvent: number | null = null;
  private muted = new Set<PlayLane>();
  private built = false;
  idea: Idea | null = null;
  soundMode: SoundMode = "style";
  form: PlayForm = "loop";
  /** The rater's own recording, used for vocal leads when `useOwnVoice` is on. */
  ownVoice: OwnVoice | null = null;
  useOwnVoice = true;

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
    this.master = new T.Gain(T.dbToGain(-5.5));
    this.master.chain(comp, limiter, T.getDestination());
    this.duck = new T.Gain(1);
    this.songFilter = new T.Filter({ type: "lowpass", frequency: OPEN, rolloff: -24, Q: 0.6 });
    this.duck.chain(this.songFilter, this.master);
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
    // White-noise riser for builds, with a little reverb.
    this.riserLevel = new T.Gain(0);
    this.riserFilter = new T.Filter({ type: "bandpass", frequency: 500, Q: 1.4 });
    this.riser = new T.Noise("white");
    this.riser.chain(this.riserFilter, this.riserLevel, this.master);
    const riserSend = new T.Gain(0.5);
    this.riserLevel.connect(riserSend);
    riserSend.connect(this.reverbIn);
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
    const own = lane === "lead" && this.useOwnVoice ? this.ownVoice : null;
    const kind = own ? OWN_VOICE_KIND[id] : undefined;
    const key = own && kind ? `${id}:own:${own.id}` : id;
    const cur = this.voices[lane];
    if (cur && cur.id === key) return cur.voice;
    cur?.voice.dispose();
    const voice = own && kind ? ownVoice(this.T, own, kind) : createVoice(this.T, id);
    voice.output.connect(this.laneGain[lane]);
    this.voices[lane] = { id: key, voice };
    return voice;
  }

  /** Whether the lead of this idea is sung by the own recording. */
  usesOwnVoice(idea: Idea): boolean {
    return !!this.ownVoice && this.useOwnVoice && this.soundMode !== "neutral" && !!OWN_VOICE_KIND[idea.lanes.lead.sound];
  }

  setOwnVoice(voice: OwnVoice | null, use = this.useOwnVoice): void {
    this.ownVoice = voice;
    this.useOwnVoice = use;
    if (this.built && this.idea) this.load(this.idea, this.soundMode);
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
    for (const id of this.songEvents) transport.clear(id);
    this.songEvents = [];

    transport.bpm.value = idea.bpm;
    const ppq = transport.PPQ;
    const secPerBeat = 60 / idea.bpm;
    const ticks = (beats: number) => `${Math.round(beats * ppq)}i`;
    const neutral = soundMode === "neutral";

    // Song form: the loop repeats inside the arrangement.
    const arrangement = this.form === "song" && idea.arrangement.length ? idea.arrangement : null;
    const loopBeats = idea.bars * 4;
    const songBars = arrangement ? arrangement.reduce((a, s) => a + s.bars, 0) : idea.bars;
    const byBar: ArrangementSection[] = [];
    this.song = [];
    if (arrangement) {
      for (const sec of arrangement) {
        this.song.push({ name: sec.name, startBar: byBar.length, bars: sec.bars });
        for (let i = 0; i < sec.bars; i++) byBar.push(sec);
      }
    }
    this.loopTicks = Math.round(loopBeats * ppq);
    this.songTicks = Math.round(songBars * 4 * ppq);
    const sectionAt = (time: number): ArrangementSection | null => {
      if (!arrangement) return null;
      const bar = Math.floor((transport.getTicksAtTime(time) + 2) / (4 * ppq));
      return byBar[((bar % songBars) + songBars) % songBars] ?? null;
    };
    transport.loop = true;
    transport.loopStart = 0;
    transport.loopEnd = ticks(songBars * 4);
    if (transport.ticks >= this.songTicks) transport.ticks = 0;
    const loopPart = (part: ToneNS.Part) => {
      if (arrangement) {
        part.loop = true;
        part.loopEnd = ticks(loopBeats);
      }
      part.start(0);
      this.parts.push(part);
    };

    // A harmony stack needs a polyphonic voice; a recorded voice sings alone.
    const harmonize = !this.usesOwnVoice(idea);
    for (const lane of ["chords", "bass", "lead", "pluck"] as LaneId[]) {
      const data = idea.lanes[lane];
      const voice = this.voiceFor(lane, neutral ? NEUTRAL[lane] : data.sound);
      const sorted = [...data.notes].sort((a, b) => a.start - b.start);
      const top = Math.max(...sorted.map((n) => n.pitch), 0);
      // Raw vocal: repeated syllables merge into held notes; stretched vowel: one per chord.
      const rawEnds = lane === "lead" ? legatoEnds(sorted, idea.progression, idea.totalSteps, false) : [];
      const holdEnds = lane === "lead" ? legatoEnds(sorted, idea.progression, idea.totalSteps, true) : [];
      const harmony = lane === "lead" && harmonize ? harmonyFor(sorted, idea.progression, idea.key) : [];
      const held = (start: number, end: number | null | undefined) =>
        end === null || end === undefined ? 0 : Math.max(0.03, (stepToBeat(end, idea.swing) - start) * secPerBeat * 0.98);
      const events = sorted.map((n, i) => {
        const start = stepToBeat(n.start, idea.swing);
        const end = stepToBeat(n.start + n.len, idea.swing);
        return {
          time: ticks(start),
          midi: n.pitch,
          dur: Math.max(0.03, (end - start) * secPerBeat * 0.98),
          // 0 = this note merges into the held one before it.
          raw: held(start, rawEnds[i]),
          hold: held(start, holdEnds[i]),
          harm: harmony[i] ?? [],
          vel: n.vel / 127,
          i,
        };
      });
      const part = new T.Part((time, ev: (typeof events)[number]) => {
        const sec = sectionAt(time);
        if (sec && !sec.lanes.includes(lane)) return;
        if (lane === "lead" && (sec?.leadRaw || sec?.leadHold)) {
          const dur = sec.leadHold ? ev.hold : ev.raw;
          if (dur > 0) voice.trigger(ev.midi, dur, time, ev.vel * (sec.leadHold ? 0.72 : 0.9), ev.i);
          return;
        }
        const up = lane === "lead" && sec?.leadUp && top + 12 <= 86 ? 12 : 0;
        voice.trigger(ev.midi + up, ev.dur, time, ev.vel, ev.i);
        if (lane === "lead" && sec?.leadHarmony) {
          ev.harm.forEach((h, k) => voice.trigger(h + up, ev.dur, time, ev.vel * (k === 0 ? 0.6 : 0.5), ev.i));
        }
      }, events);
      loopPart(part);
    }
    const kit = this.kitFor(neutral ? "neutral" : idea.drums.kit);
    // Kick stays straight; hats and percussion get the style's drum swing.
    const drumEvents = idea.drums.hits.map((h) => ({
      time: ticks(stepToBeat(h.step, h.inst === "kick" ? 0.5 : idea.drumSwing)),
      inst: h.inst,
      vel: h.vel / 127,
    }));
    const drumPart = new T.Part((time, ev: (typeof drumEvents)[number]) => {
      const sec = sectionAt(time);
      if (sec && (!sec.lanes.includes("drums") || (sec.noKick && ev.inst === "kick") || (sec.kickOnly && ev.inst !== "kick"))) return;
      kit.hit(ev.inst, time, ev.vel);
    }, drumEvents);
    loopPart(drumPart);

    // Sidechain: duck on every beat, recover quickly. No kick, no pumping.
    const depth = neutral ? 0.3 : idea.mix.sidechain;
    const g = this.duck.gain;
    this.duckEvent = transport.scheduleRepeat((time) => {
      const sec = sectionAt(time);
      g.cancelScheduledValues(time);
      if (sec && (sec.noKick || !sec.lanes.includes("drums"))) {
        g.setTargetAtTime(1, time, 0.02);
        return;
      }
      g.setValueAtTime(1 - depth, time);
      g.setTargetAtTime(1, time + 0.015, secPerBeat * 0.16);
    }, "4n", 0);
    if (depth <= 0.01) g.value = 1;

    this.scheduleSong(arrangement, kit, ppq, secPerBeat);
    if (this.wantPlaying && this.song.length && this.riser.state !== "started") this.riser.start();

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

  /** Filter, riser, snare roll and crash for each section of the song form. */
  private scheduleSong(arrangement: ArrangementSection[] | null, kit: DrumKit, ppq: number, secPerBeat: number): void {
    const T = this.T;
    const transport = T.getTransport();
    const f = this.songFilter.frequency;
    const rl = this.riserLevel.gain;
    const rf = this.riserFilter.frequency;
    f.cancelScheduledValues(T.now());
    f.value = OPEN;
    rl.cancelScheduledValues(T.now());
    rl.value = 0;
    if (!arrangement) return;
    const ticks = (beats: number) => `${Math.round(beats * ppq)}i`;
    let bar = 0;
    arrangement.forEach((sec, i) => {
      const prev = arrangement[(i - 1 + arrangement.length) % arrangement.length];
      const dur = sec.bars * 4 * secPerBeat;
      this.songEvents.push(
        transport.schedule((time) => {
          f.cancelScheduledValues(time);
          rl.cancelScheduledValues(time);
          rf.cancelScheduledValues(time);
          if (sec.build) {
            // The filter opens and the riser swells into the next section.
            f.setValueAtTime(sec.filter ?? 900, time);
            f.exponentialRampToValueAtTime(16000, time + dur);
            rl.setValueAtTime(0, time);
            rl.linearRampToValueAtTime(0.2, time + dur);
            rf.setValueAtTime(400, time);
            rf.exponentialRampToValueAtTime(9000, time + dur);
          } else {
            f.setTargetAtTime(sec.filter ?? OPEN, time, 0.03);
            rl.setTargetAtTime(0, time, 0.04);
            // Crash when the full beat comes back (after a build or a breakdown).
            const kickBack = sec.lanes.includes("drums") && !sec.noKick;
            const kickWasOut = prev.build || prev.noKick || !prev.lanes.includes("drums");
            if (kickBack && kickWasOut && arrangement.length > 1) kit.crash(time);
          }
        }, ticks(bar * 4)),
      );
      if (sec.build) {
        const roll = buildRoll(sec.bars).map((e) => ({ time: ticks(bar * 4 + e.beat), vel: e.vel }));
        const part = new T.Part((time, ev: { vel: number }) => kit.hit("snare", time, ev.vel), roll);
        part.start(0);
        this.parts.push(part);
      }
      bar += sec.bars;
    });

    // Reloading mid-song (new idea, re-rolled lane): set the current section's state now.
    const now = T.now();
    const pos = transport.state === "started" ? transport.getTicksAtTime(now) / (4 * ppq) : 0;
    let start = 0;
    for (const sec of arrangement) {
      if (pos < start + sec.bars) {
        const end = now + (start + sec.bars - pos) * 4 * secPerBeat;
        if (sec.build) {
          const k = (pos - start) / sec.bars;
          const from = sec.filter ?? 900;
          f.setValueAtTime(from * Math.pow(16000 / from, k), now);
          f.exponentialRampToValueAtTime(16000, end);
          rl.setValueAtTime(0.2 * k, now);
          rl.linearRampToValueAtTime(0.2, end);
          rf.setValueAtTime(400 * Math.pow(9000 / 400, k), now);
          rf.exponentialRampToValueAtTime(9000, end);
        } else {
          f.setValueAtTime(sec.filter ?? OPEN, now);
        }
        break;
      }
      start += sec.bars;
    }
  }

  /** Switch between the plain loop and the song form; keeps playing. */
  setForm(form: PlayForm): void {
    if (this.form === form) return;
    this.form = form;
    if (this.built && this.idea) this.load(this.idea, this.soundMode);
  }

  /** Sections of the current song form (empty in loop form). */
  sections(): SongSection[] {
    return this.song;
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
    if (this.song.length && this.riser.state !== "started") this.riser.start();
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
    this.riserLevel.gain.cancelScheduledValues(this.T.now());
    this.riserLevel.gain.value = 0;
    if (this.riser.state === "started") this.riser.stop();
  }

  /** Loop position 0..1 for the piano-roll playhead. */
  progress(): number {
    if (!this.playing || this.T.getTransport().state !== "started") return -1;
    return (this.T.getTransport().ticks % this.loopTicks) / this.loopTicks;
  }

  /** Song position 0..1 (song form only). */
  songProgress(): number {
    if (!this.song.length || !this.playing || this.T.getTransport().state !== "started") return -1;
    return (this.T.getTransport().ticks % this.songTicks) / this.songTicks;
  }
}
