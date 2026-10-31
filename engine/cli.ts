// Generate one idea on the command line, e.g.
//   npm run idea -- --style fred-again --variant emotional-house --seed 42 --key 9-minor --bars 4 --zip out.zip
//   npm run idea -- --style bunt --variant stutter --mood euphorie

import { writeFileSync } from "node:fs";
import {
  MOODS,
  MoodId,
  STYLES,
  generateIdea,
  ideaToMidiFiles,
  keyName,
  midiName,
  parseKeyId,
  zip,
} from "./src/index";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const styleId = arg("style") ?? "fred-again";
const style = STYLES.find((s) => s.id === styleId);
if (!style) {
  console.error(`Stile: ${STYLES.map((s) => `${s.id} (${s.variants.map((v) => v.id).join(", ")})`).join("; ")}`);
  process.exit(1);
}
const variantId = arg("variant") ?? style.variants[0].id;
const keyArg = arg("key");
const moodArg = arg("mood");
if (moodArg && !MOODS.some((m) => m.id === moodArg)) {
  console.error(`Stimmungen: ${MOODS.map((m) => m.id).join(", ")}`);
  process.exit(1);
}
const idea = generateIdea({
  styleId,
  variantId,
  key: keyArg ? parseKeyId(keyArg) : null,
  bars: arg("bars") === "8" ? 8 : 4,
  seed: Number(arg("seed") ?? 1),
  mood: (moodArg as MoodId | undefined) ?? null,
});

console.log(`${idea.artist} · ${idea.variantName}${idea.moodName ? ` · Stimmung ${idea.moodName}` : ""} · ${keyName(idea.key)} · ${idea.bpm} BPM · Seed ${idea.params.seed}`);
console.log(`Akkorde: ${idea.progressionText}  (${idea.templateText})`);
for (const [lane, data] of Object.entries(idea.lanes)) {
  const pitches = data.notes.map((n) => n.pitch);
  const range = pitches.length ? `${midiName(Math.min(...pitches))}–${midiName(Math.max(...pitches))}` : "-";
  console.log(`${lane.padEnd(7)} ${String(data.notes.length).padStart(3)} Noten  ${range.padEnd(9)} Rhythmus ${data.rhythmId}  Sound ${data.sound}${data.detail ? `  (${data.detail})` : ""}`);
}
console.log(`drums   ${idea.drums.hits.length} Schläge  Pattern ${idea.drums.patternId}`);
console.log(`Korrekturen (Musik-TÜV): ${idea.fixes}`);

const out = arg("zip");
if (out) {
  writeFileSync(out, zip(ideaToMidiFiles(idea)));
  console.log(`ZIP geschrieben: ${out}`);
}
