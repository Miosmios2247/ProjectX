// Standard MIDI File (type 1) export: one file per lane plus one with all lanes.

import { stepToBeat } from "./groove";
import { LaneId, DrumInst } from "./rhythm";
import { keyShortName } from "./theory";
import { Idea } from "./types";

export const PPQ = 480;

export interface MidiNote {
  pitch: number;
  startBeat: number;
  durBeat: number;
  vel: number;
}

export interface MidiTrack {
  name: string;
  channel: number;
  notes: MidiNote[];
}

// General MIDI drum notes
export const GM_DRUMS: Record<DrumInst, number> = {
  kick: 36, snare: 38, clap: 39, rim: 37, hatC: 42, hatO: 46, shaker: 82, tamb: 54, percHi: 63, percLo: 64, tom: 45,
};

const LANE_NAMES: Record<LaneId, string> = { chords: "Chords", bass: "Bass", lead: "Lead", pluck: "Pluck" };

function vlq(n: number): number[] {
  let v = Math.max(0, Math.round(n));
  const bytes = [v & 0x7f];
  v >>= 7;
  while (v > 0) {
    bytes.unshift((v & 0x7f) | 0x80);
    v >>= 7;
  }
  return bytes;
}

function text(s: string): number[] {
  const out: number[] = [];
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    out.push(c < 128 ? c : 63);
  }
  return out;
}

function chunk(type: string, data: number[]): number[] {
  const len = data.length;
  return [...text(type), (len >>> 24) & 255, (len >>> 16) & 255, (len >>> 8) & 255, len & 255, ...data];
}

function trackChunk(events: { tick: number; bytes: number[]; order: number }[]): number[] {
  events.sort((a, b) => a.tick - b.tick || a.order - b.order);
  const data: number[] = [];
  let last = 0;
  for (const e of events) {
    data.push(...vlq(e.tick - last), ...e.bytes);
    last = e.tick;
  }
  data.push(0, 0xff, 0x2f, 0);
  return chunk("MTrk", data);
}

function meta(type: number, payload: number[]): number[] {
  return [0xff, type, ...vlq(payload.length), ...payload];
}

export function writeMidi(tracks: MidiTrack[], bpm: number, title = "ProjectX"): Uint8Array {
  const out: number[] = [];
  out.push(...chunk("MThd", [0, 1, 0, tracks.length + 1, (PPQ >> 8) & 255, PPQ & 255]));
  const mpq = Math.round(60_000_000 / bpm);
  out.push(
    ...trackChunk([
      { tick: 0, order: 0, bytes: meta(0x03, text(title)) },
      { tick: 0, order: 1, bytes: meta(0x51, [(mpq >> 16) & 255, (mpq >> 8) & 255, mpq & 255]) },
      { tick: 0, order: 2, bytes: meta(0x58, [4, 2, 24, 8]) },
    ]),
  );
  for (const t of tracks) {
    const ch = t.channel & 15;
    const events: { tick: number; bytes: number[]; order: number }[] = [
      { tick: 0, order: 0, bytes: meta(0x03, text(t.name)) },
    ];
    for (const n of t.notes) {
      const on = Math.max(0, Math.round(n.startBeat * PPQ));
      const off = Math.max(on + 1, Math.round((n.startBeat + n.durBeat) * PPQ));
      const pitch = Math.max(0, Math.min(127, n.pitch));
      const vel = Math.max(1, Math.min(127, Math.round(n.vel)));
      // Note-offs sort before note-ons on the same tick.
      events.push({ tick: on, order: 2, bytes: [0x90 | ch, pitch, vel] });
      events.push({ tick: off, order: 1, bytes: [0x80 | ch, pitch, 64] });
    }
    out.push(...trackChunk(events));
  }
  return new Uint8Array(out);
}

function laneToMidi(idea: Idea, lane: LaneId): MidiNote[] {
  return idea.lanes[lane].notes.map((n) => {
    const start = stepToBeat(n.start, idea.swing);
    const end = stepToBeat(n.start + n.len, idea.swing);
    return { pitch: n.pitch, startBeat: start, durBeat: Math.max(1 / 32, end - start), vel: n.vel };
  });
}

/** Kick stays straight; hats and percussion get the drum swing. */
export function drumBeat(idea: Idea, inst: DrumInst, step: number): number {
  return stepToBeat(step, inst === "kick" ? 0.5 : idea.drumSwing);
}

function drumsToMidi(idea: Idea): MidiNote[] {
  return idea.drums.hits.map((h) => ({
    pitch: GM_DRUMS[h.inst],
    startBeat: drumBeat(idea, h.inst, h.step),
    durBeat: 0.125,
    vel: h.vel,
  }));
}

/** ASCII-only file name stem, e.g. ProjectX_FredAgain-EmotionalHouse_Am_128bpm. */
export function fileStem(idea: Idea): string {
  const clean = (s: string) =>
    s
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss")
      .replace(/[^A-Za-z0-9 ]+/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join("");
  const key = keyShortName(idea.key);
  return `ProjectX_${clean(idea.artist)}-${clean(idea.variantName)}_${key}_${idea.bpm}bpm_${idea.params.seed}`;
}

export interface MidiFile {
  name: string;
  data: Uint8Array;
}

export function ideaToMidiFiles(idea: Idea, lanes: LaneId[] = ["chords", "bass", "lead", "pluck"]): MidiFile[] {
  const stem = fileStem(idea);
  const tracks: MidiTrack[] = lanes.map((lane, i) => ({
    name: LANE_NAMES[lane],
    channel: i,
    notes: laneToMidi(idea, lane),
  }));
  const drums: MidiTrack = { name: "Drums", channel: 9, notes: drumsToMidi(idea) };
  const files: MidiFile[] = tracks.map((t) => ({
    name: `${stem}_${t.name}.mid`,
    data: writeMidi([{ ...t, channel: 0 }], idea.bpm, t.name),
  }));
  files.push({ name: `${stem}_Drums.mid`, data: writeMidi([drums], idea.bpm, "Drums") });
  files.push({ name: `${stem}_Alle-Spuren.mid`, data: writeMidi([...tracks, drums], idea.bpm, stem) });
  return files;
}
