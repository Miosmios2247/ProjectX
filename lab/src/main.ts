// Hör-Labor: listen to generated ideas, rate them, run blind tests.

import {
  ENGINE_VERSION,
  Idea,
  IdeaParams,
  KEYS,
  LaneId,
  STYLES,
  SeedLane,
  fileStem,
  generateIdea,
  getDrumPattern,
  getRhythm,
  ideaToMidiFiles,
  keyId,
  keyName,
  keyShortName,
  parseKeyId,
  randomSeed,
  zip,
} from "../../engine/src/index";
import { Player, PlayLane, SoundMode } from "./audio";
import { SOUND_LABELS } from "./sounds";
import { drawDrums, drawNotes } from "./roll";
import { RatingDoc, Store, StoredRating, errorText } from "./store";

const LAB_VERSION = "0.1.0";
const PLAY_LANES: PlayLane[] = ["chords", "bass", "lead", "pluck", "drums"];
const LANE_LABEL: Record<PlayLane, string> = {
  chords: "Akkorde",
  bass: "Bass",
  lead: "Lead",
  pluck: "Pluck",
  drums: "Drums",
};
const ISSUES: { id: string; label: string }[] = [
  { id: "chords", label: "Akkorde" },
  { id: "bass", label: "Bass" },
  { id: "lead", label: "Lead" },
  { id: "pluck", label: "Pluck" },
  { id: "drums", label: "Drums" },
  { id: "groove", label: "Groove/Tempo" },
  { id: "sounds", label: "Sounds" },
];
const STAR_LABELS = ["gar nicht", "kaum", "teils", "ziemlich", "voll"];
const LEAD_MODE: Record<string, string> = {
  "vocal-chop": "Vocal-Chop",
  "deep-chop": "Stutter-Chop",
  topline: "Topline",
  folk: "Folk-Riff",
  afro: "Ruf & Antwort",
};

interface ExploreState {
  styleId: string;
  variantId: string;
  keyChoice: string; // "auto" or keyId
  bars: 4 | 8;
  seed: number;
  laneSeeds: Partial<Record<SeedLane, number>>;
  bpm: number | null;
}

interface HistoryEntry {
  label: string;
  params: ExploreState;
}

const state = {
  mode: "explore" as "explore" | "blind",
  explore: {
    styleId: STYLES[0].id,
    variantId: STYLES[0].variants[0].id,
    keyChoice: "auto",
    bars: 4,
    seed: randomSeed(),
    laneSeeds: {},
    bpm: null,
  } as ExploreState,
  idea: null as Idea | null,
  exploreIdea: null as Idea | null,
  muted: new Set<PlayLane>(),
  rating: null as number | null,
  issues: new Set<string>(),
  history: [] as HistoryEntry[],
  rated: new Set<string>(),
  blind: {
    round: 0,
    idea: null as Idea | null,
    guessed: null as string | null,
    docId: null as string | null,
    soundMode: "style" as SoundMode,
    quality: null as number | null,
  },
};

const store = new Store();
const Tone = window.Tone;
const player = Tone ? new Player(Tone) : null;

// ---------------------------------------------------------------------------
// DOM helpers

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} fehlt`);
  return el;
}

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  text?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text !== undefined) el.textContent = text;
  return el;
}

let toastTimer = 0;
function toast(message: string): void {
  const t = $("toast");
  t.textContent = message;
  t.classList.add("is-on");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove("is-on"), 2600);
}

function fmt(n: number, digits = 1): string {
  return n.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function ideaKey(idea: Idea): string {
  return `${idea.styleId}/${idea.variantId}/${keyId(idea.key)}/${idea.bars}/${JSON.stringify(idea.seeds)}`;
}

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function savePrefs(): void {
  try {
    localStorage.setItem(
      "projectx-hoerlabor-prefs",
      JSON.stringify({
        styleId: state.explore.styleId,
        variantId: state.explore.variantId,
        bars: state.explore.bars,
        blindSound: state.blind.soundMode,
      }),
    );
  } catch {
    // storage blocked
  }
}

function loadPrefs(): void {
  try {
    const raw = localStorage.getItem("projectx-hoerlabor-prefs");
    if (!raw) return;
    const p = JSON.parse(raw);
    const style = STYLES.find((s) => s.id === p.styleId);
    if (style && style.variants.some((v) => v.id === p.variantId)) {
      state.explore.styleId = p.styleId;
      state.explore.variantId = p.variantId;
    }
    if (p.bars === 4 || p.bars === 8) state.explore.bars = p.bars;
    if (p.blindSound === "style" || p.blindSound === "neutral") state.blind.soundMode = p.blindSound;
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Ideas

function paramsOf(s: ExploreState): IdeaParams {
  return {
    styleId: s.styleId,
    variantId: s.variantId,
    key: s.keyChoice === "auto" ? null : parseKeyId(s.keyChoice),
    bars: s.bars,
    seed: s.seed,
    laneSeeds: { ...s.laneSeeds },
    bpm: s.bpm,
  };
}

function regenerate(pushHistory = true): void {
  const idea = generateIdea(paramsOf(state.explore));
  state.exploreIdea = idea;
  if (pushHistory) {
    const tag = (idea.seeds.chords ^ idea.seeds.bass ^ idea.seeds.lead ^ idea.seeds.pluck ^ idea.seeds.drums) >>> 0;
    const label = `${idea.artist} · ${idea.variantName} · ${keyShortName(idea.key)} · ${idea.bpm} BPM · ${idea.bars}T · #${tag.toString(36).slice(-4)}`;
    state.history = [{ label, params: structuredClone(state.explore) }, ...state.history].slice(0, 12);
  }
  if (state.mode === "explore") show(idea);
  renderHistory();
  savePrefs();
}

function show(idea: Idea | null): void {
  state.idea = idea;
  renderIdea();
  if (idea && player) player.load(idea, state.mode === "blind" ? state.blind.soundMode : "style");
}

function newIdea(): void {
  state.explore.seed = randomSeed();
  state.explore.laneSeeds = {};
  state.explore.bpm = null;
  resetRating();
  regenerate();
}

// ---------------------------------------------------------------------------
// Rendering

function renderArtists(): void {
  const wrap = $("artists");
  wrap.replaceChildren();
  for (const style of STYLES) {
    const active = style.id === state.explore.styleId;
    const card = h("article", { class: `artist${active ? " is-active" : ""}` });
    card.append(h("h2", { class: "artist-name" }, style.artist), h("p", { class: "artist-blurb" }, style.blurb));
    const chips = h("div", { class: "variants", role: "group", "aria-label": `Varianten ${style.artist}` });
    for (const v of style.variants) {
      const on = active && v.id === state.explore.variantId;
      const b = h("button", { type: "button", class: "variant", "aria-pressed": String(on), title: v.blurb }, v.name);
      b.addEventListener("click", () => {
        state.explore.styleId = style.id;
        state.explore.variantId = v.id;
        state.explore.bpm = null;
        resetRating();
        renderArtists();
        regenerate();
      });
      chips.append(b);
    }
    card.append(chips);
    wrap.append(card);
  }
}

function renderKeySelect(): void {
  const sel = $("key") as HTMLSelectElement;
  sel.replaceChildren(h("option", { value: "auto" }, "Passend zum Stil"));
  const groups: [string, "minor" | "major"][] = [["Moll", "minor"], ["Dur", "major"]];
  for (const [label, mode] of groups) {
    const g = h("optgroup", { label });
    for (const k of KEYS.filter((x) => x.mode === mode)) {
      g.append(h("option", { value: keyId(k) }, `${keyName(k)} (${keyShortName(k)})`));
    }
    sel.append(g);
  }
  sel.value = state.explore.keyChoice;
}

function laneSub(lane: PlayLane, idea: Idea): string {
  if (lane === "drums") return `Begleitung · ${getDrumPattern(idea.drums.patternId).name}`;
  const data = idea.lanes[lane];
  const rhythm = getRhythm(data.rhythmId).name;
  const sound = SOUND_LABELS[data.sound] ?? data.sound;
  const modeLabel = lane === "lead" && data.detail ? LEAD_MODE[data.detail] ?? data.detail : "";
  const mode = modeLabel && modeLabel !== sound ? ` · ${modeLabel}` : "";
  return `${sound} · ${rhythm}${mode}`;
}

function buildLanes(): void {
  const lanes = $("lanes");
  for (const lane of PLAY_LANES) {
    const row = h("div", { class: "lane-row", "data-lane": lane });
    const meta = h("div", { class: "lane-meta" });
    const name = h("div", { class: "lane-name" });
    name.append(h("span", { class: "swatch", "aria-hidden": "true" }), h("span", {}, LANE_LABEL[lane]));
    const sub = h("div", { class: "lane-sub", id: `sub-${lane}` });
    const tools = h("div", { class: "lane-tools" });
    const mute = h("button", {
      type: "button",
      class: "icon-btn",
      id: `mute-${lane}`,
      "aria-pressed": "false",
      "aria-label": `${LANE_LABEL[lane]} stumm`,
      title: "Stumm",
    }, "M");
    mute.addEventListener("click", () => {
      const on = !state.muted.has(lane);
      if (on) state.muted.add(lane);
      else state.muted.delete(lane);
      mute.setAttribute("aria-pressed", String(on));
      row.classList.toggle("is-muted", on);
      player?.setMuted(lane, on);
    });
    const reroll = h("button", {
      type: "button",
      class: "icon-btn reroll",
      id: `reroll-${lane}`,
      "aria-label": `${LANE_LABEL[lane]} neu würfeln`,
      title: lane === "chords" ? "Neue Akkorde (die anderen Spuren passen sich an)" : "Neu würfeln",
    });
    reroll.innerHTML =
      '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="7" cy="7" r="1.4" fill="currentColor"/><circle cx="13" cy="13" r="1.4" fill="currentColor"/><circle cx="10" cy="10" r="1.4" fill="currentColor"/></svg>';
    reroll.addEventListener("click", () => {
      if (state.mode !== "explore") return;
      state.explore.laneSeeds = { ...state.explore.laneSeeds, [lane]: randomSeed() };
      resetRating();
      regenerate();
    });
    tools.append(mute, reroll);
    meta.append(name, sub, tools);
    const rollWrap = h("div", { class: "roll-wrap" });
    const canvas = h("canvas", { class: "roll", id: `roll-${lane}`, role: "img", "aria-label": `Noten ${LANE_LABEL[lane]}` });
    const ph = h("div", { class: "playhead", "aria-hidden": "true" });
    rollWrap.append(canvas, ph);
    row.append(meta, rollWrap);
    lanes.append(row);
  }
}

function drawRolls(): void {
  const idea = state.idea;
  const grid = cssVar("--grid");
  const bar = cssVar("--grid-bar");
  for (const lane of PLAY_LANES) {
    const canvas = document.getElementById(`roll-${lane}`) as HTMLCanvasElement | null;
    if (!canvas) continue;
    const colors = { note: cssVar(`--lane-${lane}`), grid, bar };
    if (!idea) {
      drawNotes(canvas, [], 64, colors);
      continue;
    }
    if (lane === "drums") drawDrums(canvas, idea.drums.hits, idea.totalSteps, colors);
    else drawNotes(canvas, idea.lanes[lane as LaneId].notes, idea.totalSteps, colors);
  }
}

function renderIdea(): void {
  const idea = state.idea;
  const blind = state.mode === "blind";
  const hidden = blind && !state.blind.guessed;
  const title = $("idea-title");
  const meta = $("idea-meta");
  const strip = $("chord-strip");
  strip.replaceChildren();
  if (!idea) {
    title.textContent = blind ? "Noch kein Loop" : "";
    meta.textContent = blind ? "Starte rechts eine Runde." : "";
    for (const lane of PLAY_LANES) $(`sub-${lane}`).textContent = "";
    drawRolls();
    return;
  }
  title.textContent = hidden ? "Unbekannter Loop" : `${idea.artist} · ${idea.variantName}`;
  meta.textContent = `${keyName(idea.key)} · ${idea.bpm} BPM · ${idea.bars} Takte`;
  $("bpm").textContent = String(idea.bpm);
  $("key-actual").textContent =
    !blind && state.explore.keyChoice === "auto" ? `→ ${keyName(idea.key)}` : "";
  for (const slot of idea.progression) {
    const chip = h("span", { class: "chord", title: slot.chord.degree }, slot.chord.name);
    chip.style.left = `${(slot.start / idea.totalSteps) * 100}%`;
    chip.style.width = `calc(${(slot.length / idea.totalSteps) * 100}% - 4px)`;
    strip.append(chip);
  }
  for (const lane of PLAY_LANES) {
    const sub = $(`sub-${lane}`);
    sub.textContent = hidden ? "verdeckt" : laneSub(lane, idea);
    sub.title = sub.textContent;
    ($(`reroll-${lane}`) as HTMLButtonElement).disabled = blind;
  }
  drawRolls();
  const hints = $("hint-list");
  hints.replaceChildren(...idea.soundHints.map((t) => h("li", {}, t)));
  $("hints").hidden = hidden;
  const q = $("rating-q");
  q.replaceChildren(
    document.createTextNode("Wie sehr klingt das nach "),
    h("strong", {}, idea.artist),
    document.createTextNode(` (${idea.variantName})?`),
  );
  ($("download") as HTMLButtonElement).disabled = hidden;
  ($("key") as HTMLSelectElement).disabled = blind;
}

function renderStars(containerId: string, value: number | null): void {
  const wrap = $(containerId);
  for (const b of wrap.querySelectorAll<HTMLButtonElement>("button")) {
    b.setAttribute("aria-checked", String(Number(b.dataset.v) === value));
  }
}

function buildStars(containerId: string, onPick: (v: number) => void): void {
  const wrap = $(containerId);
  STAR_LABELS.forEach((label, i) => {
    const v = i + 1;
    const b = h("button", { type: "button", role: "radio", "aria-checked": "false", "data-v": String(v) });
    b.append(h("span", { class: "n" }, String(v)), h("span", { class: "t" }, label));
    b.addEventListener("click", () => onPick(v));
    wrap.append(b);
  });
}

function renderRatingControls(): void {
  renderStars("stars", state.rating);
  for (const b of $("issues").querySelectorAll<HTMLButtonElement>("button")) {
    b.setAttribute("aria-pressed", String(state.issues.has(b.dataset.id ?? "")));
  }
  const ready = state.rating !== null && !!state.idea;
  ($("save-next") as HTMLButtonElement).disabled = !ready;
  ($("save-only") as HTMLButtonElement).disabled = !ready;
}

function resetRating(): void {
  state.rating = null;
  state.issues.clear();
  const c = document.getElementById("comment") as HTMLTextAreaElement | null;
  if (c) c.value = "";
  if (document.getElementById("stars")) renderRatingControls();
}

function renderPlay(): void {
  const btn = $("play") as HTMLButtonElement;
  const playing = player?.playing ?? false;
  btn.classList.toggle("is-playing", playing);
  btn.setAttribute("aria-label", playing ? "Stopp" : "Abspielen");
  btn.querySelector(".play-label")!.textContent = playing ? "Stopp" : "Play";
  if (!player) {
    btn.disabled = true;
    btn.title = "Audio-Bibliothek nicht geladen";
  }
}

function renderHistory(): void {
  const list = $("history");
  list.replaceChildren();
  if (!state.history.length) {
    list.append(h("li", { class: "muted" }, "Noch keine Ideen."));
    return;
  }
  state.history.forEach((entry, i) => {
    const li = h("li");
    const b = h("button", { type: "button", class: "hist" });
    const current = i === 0 && state.mode === "explore";
    if (current) b.setAttribute("aria-current", "true");
    const key = ideaKey(generateIdeaCached(entry.params));
    b.textContent = `${state.rated.has(key) ? "✓ " : ""}${entry.label}`;
    b.addEventListener("click", () => {
      state.explore = structuredClone(entry.params);
      ($("key") as HTMLSelectElement).value = state.explore.keyChoice;
      renderLength();
      resetRating();
      renderArtists();
      if (state.mode !== "explore") setMode("explore");
      regenerate(false);
    });
    li.append(b);
    list.append(li);
  });
}

const ideaCache = new Map<string, Idea>();
function generateIdeaCached(s: ExploreState): Idea {
  const k = JSON.stringify(s);
  let idea = ideaCache.get(k);
  if (!idea) {
    idea = generateIdea(paramsOf(s));
    ideaCache.set(k, idea);
  }
  return idea;
}

function renderLength(): void {
  $("len-4").setAttribute("aria-pressed", String(state.explore.bars === 4));
  $("len-8").setAttribute("aria-pressed", String(state.explore.bars === 8));
}

function renderStoreStatus(): void {
  const el = $("store-status");
  if (store.status === "online") el.textContent = "Bewertungen werden gespeichert und kommen bei Claude an.";
  else if (store.status === "connecting") el.textContent = "Verbinde mit dem Speicher …";
  else el.textContent = "Speichern bei Claude geht hier nicht. Öffne das Hör-Labor angemeldet in Claude. Bis dahin bleiben Bewertungen nur in diesem Browser.";
  el.dataset.status = store.status;
  $("local-export").hidden = !(store.status === "local" && store.ratings.length > 0);
}

function renderResults(): void {
  const all = store.ratings;
  const explore = all.filter((r) => r.mode === "entdecken" && typeof r.rating === "number");
  const blind = all.filter((r) => r.mode === "blindtest" && typeof r.correct === "boolean");
  $("kpi-count").textContent = String(explore.length + blind.length);
  $("kpi-avg").textContent = explore.length
    ? fmt(explore.reduce((a, r) => a + (r.rating ?? 0), 0) / explore.length)
    : "–";
  const correct = blind.filter((r) => r.correct).length;
  $("kpi-blind").textContent = blind.length ? `${Math.round((correct / blind.length) * 100)} %` : "–";
  $("kpi-blind-sub").textContent = blind.length ? `${correct} von ${blind.length} richtig` : "Blindtest richtig";

  const body = $("res-body");
  body.replaceChildren();
  for (const style of STYLES) {
    for (const v of style.variants) {
      const ex = explore.filter((r) => r.styleId === style.id && r.variantId === v.id);
      const bl = blind.filter((r) => r.styleId === style.id && r.variantId === v.id);
      const issues = new Map<string, number>();
      for (const r of ex) for (const i of r.issues ?? []) issues.set(i, (issues.get(i) ?? 0) + 1);
      const top = [...issues.entries()].sort((a, b) => b[1] - a[1])[0];
      const tr = h("tr");
      const name = h("td");
      name.append(h("span", { class: "res-artist" }, style.artist), document.createTextNode(` ${v.name}`));
      tr.append(
        name,
        h("td", { class: "num" }, String(ex.length)),
        h("td", { class: "num" }, ex.length ? fmt(ex.reduce((a, r) => a + (r.rating ?? 0), 0) / ex.length) : "–"),
        h("td", { class: "num" }, bl.length ? `${bl.filter((r) => r.correct).length}/${bl.length}` : "–"),
        h("td", {}, top ? `${ISSUES.find((i) => i.id === top[0])?.label ?? top[0]} (${top[1]})` : "–"),
      );
      body.append(tr);
    }
  }
  $("res-empty").hidden = all.length > 0;
  renderBlindScore();
  renderStoreStatus();
}

function renderBlindScore(): void {
  const mine = store.ratings.filter(
    (r) => r.mode === "blindtest" && typeof r.correct === "boolean" && (!store.raterId || r.raterId === store.raterId),
  );
  const correct = mine.filter((r) => r.correct).length;
  $("blind-score").textContent = mine.length
    ? `Deine Trefferquote: ${correct} von ${mine.length} (${Math.round((correct / mine.length) * 100)} %). Raten wäre 33 %.`
    : "Noch keine Runde gespielt. Raten wäre 33 %.";
}

// ---------------------------------------------------------------------------
// Ratings

function buildDoc(idea: Idea, mode: RatingDoc["mode"], extra: Partial<RatingDoc>): RatingDoc {
  const rhythms: Record<string, string> = { drums: idea.drums.patternId };
  const sounds: Record<string, string> = { drums: idea.drums.kit };
  for (const lane of ["chords", "bass", "lead", "pluck"] as LaneId[]) {
    rhythms[lane] = idea.lanes[lane].rhythmId;
    sounds[lane] = idea.lanes[lane].sound;
  }
  return {
    createdAt: new Date().toISOString(),
    raterId: store.raterId,
    labVersion: LAB_VERSION,
    engineVersion: ENGINE_VERSION,
    mode,
    styleId: idea.styleId,
    variantId: idea.variantId,
    artist: idea.artist,
    variantName: idea.variantName,
    key: keyName(idea.key),
    keyId: keyId(idea.key),
    bpm: idea.bpm,
    bars: idea.bars,
    seed: idea.params.seed,
    laneSeeds: { ...idea.seeds },
    progression: idea.progressionText,
    degrees: idea.templateText,
    rhythms,
    sounds,
    soundMode: mode === "blindtest" ? state.blind.soundMode : "style",
    muted: [...state.muted],
    rating: null,
    issues: [],
    comment: "",
    guess: null,
    correct: null,
    ...extra,
  };
}

let saving = false;
async function saveRating(next: boolean): Promise<void> {
  const idea = state.idea;
  if (!idea || state.rating === null || saving) return;
  saving = true;
  ($("save-next") as HTMLButtonElement).disabled = true;
  ($("save-only") as HTMLButtonElement).disabled = true;
  const comment = ($("comment") as HTMLTextAreaElement).value.trim().slice(0, 2000);
  try {
    await store.add(buildDoc(idea, "entdecken", { rating: state.rating, issues: [...state.issues], comment }));
    state.rated.add(ideaKey(idea));
    toast(store.status === "online" ? "Bewertung gespeichert" : "Bewertung in diesem Browser gespeichert");
    resetRating();
    if (next) newIdea();
    else renderHistory();
  } catch (e) {
    toast(errorText(e));
    renderRatingControls();
  } finally {
    saving = false;
  }
}

async function exportLocal(): Promise<void> {
  const data = JSON.stringify(store.ratings, null, 2);
  const res = await store.saveFile("projectx-bewertungen.json", data);
  if (res === "saved") toast("Datei gespeichert");
  else if (res === "unavailable") {
    const box = $("local-json") as HTMLTextAreaElement;
    box.hidden = false;
    box.value = data;
    box.select();
    toast("Download geht hier nicht. Kopier den Text und schick ihn mir.");
  } else if (res === "error") toast("Speichern hat nicht geklappt.");
}

// ---------------------------------------------------------------------------
// Audio

async function togglePlay(): Promise<void> {
  if (!player) return;
  try {
    await player.unlock();
  } catch {
    toast("Audio konnte nicht starten. Tippe noch einmal auf Play.");
    return;
  }
  if (!state.idea) return;
  if (player.playing) player.stop();
  else {
    if (player.idea !== state.idea) player.load(state.idea, state.mode === "blind" ? state.blind.soundMode : "style");
    const btn = $("play") as HTMLButtonElement;
    btn.classList.add("is-loading");
    await player.prepare();
    btn.classList.remove("is-loading");
    player.play();
  }
  renderPlay();
}

function tickPlayhead(): void {
  const p = player?.progress() ?? -1;
  for (const ph of document.querySelectorAll<HTMLElement>(".playhead")) {
    if (p < 0) ph.style.opacity = "0";
    else {
      ph.style.opacity = "1";
      ph.style.left = `${p * 100}%`;
    }
  }
  requestAnimationFrame(tickPlayhead);
}

async function download(): Promise<void> {
  const idea = state.idea;
  if (!idea) return;
  const files = ideaToMidiFiles(idea);
  const res = await store.saveFile(`${fileStem(idea)}.zip`, zip(files));
  if (res === "saved") toast("ZIP gespeichert: entpacken und die .mid-Dateien in FL Studio ziehen");
  else if (res === "unavailable") toast("Download geht nur, wenn das Hör-Labor in Claude geöffnet ist.");
  else if (res === "error") toast("Download hat nicht geklappt.");
}

// ---------------------------------------------------------------------------
// Blind test

async function startRound(): Promise<void> {
  const style = STYLES[Math.floor(Math.random() * STYLES.length)];
  const variant = style.variants[Math.floor(Math.random() * style.variants.length)];
  const idea = generateIdea({
    styleId: style.id,
    variantId: variant.id,
    key: null,
    bars: state.explore.bars,
    seed: randomSeed(),
  });
  state.blind.round++;
  state.blind.idea = idea;
  state.blind.guessed = null;
  state.blind.docId = null;
  state.blind.quality = null;
  show(idea);
  renderBlind();
  if (player) {
    try {
      await player.unlock();
      player.load(idea, state.blind.soundMode);
      await player.prepare();
      player.play();
    } catch {
      toast("Audio konnte nicht starten. Tippe auf Play.");
    }
    renderPlay();
  }
}

async function guess(styleId: string): Promise<void> {
  const idea = state.blind.idea;
  if (!idea || state.blind.guessed) return;
  state.blind.guessed = styleId;
  const correct = styleId === idea.styleId;
  renderBlind();
  renderIdea();
  try {
    state.blind.docId = await store.add(buildDoc(idea, "blindtest", { guess: styleId, correct }));
  } catch (e) {
    toast(errorText(e));
  }
}

async function rateBlind(v: number): Promise<void> {
  state.blind.quality = v;
  renderStars("blind-stars", v);
  if (!state.blind.docId) return;
  try {
    await store.update(state.blind.docId, { rating: v });
    toast("Danke!");
  } catch (e) {
    toast(errorText(e));
  }
}

function renderBlind(): void {
  const b = state.blind;
  $("blind-round").textContent = b.idea ? `Runde ${b.round}` : "Bereit, wenn du es bist.";
  $("blind-start").hidden = !!b.idea;
  $("guess-buttons").hidden = !b.idea || !!b.guessed;
  $("reveal").hidden = !b.guessed;
  if (b.guessed && b.idea) {
    const ok = b.guessed === b.idea.styleId;
    const verdict = $("verdict");
    verdict.dataset.ok = String(ok);
    verdict.replaceChildren(
      h("span", { class: "verdict-icon", "aria-hidden": "true" }, ok ? "✓" : "✕"),
      h("span", {}, ok ? "Richtig. " : "Nicht ganz. "),
      document.createTextNode(`Das war ${b.idea.artist} · ${b.idea.variantName}.`),
    );
    renderStars("blind-stars", b.quality);
  }
  $("snd-style").setAttribute("aria-pressed", String(b.soundMode === "style"));
  $("snd-neutral").setAttribute("aria-pressed", String(b.soundMode === "neutral"));
  renderBlindScore();
}

function setMode(mode: "explore" | "blind"): void {
  if (state.mode === mode) return;
  state.mode = mode;
  $("tab-explore").setAttribute("aria-selected", String(mode === "explore"));
  $("tab-blind").setAttribute("aria-selected", String(mode === "blind"));
  $("artists").hidden = mode !== "explore";
  $("blind-intro").hidden = mode !== "blind";
  $("rating-form").hidden = mode !== "explore";
  $("guess").hidden = mode !== "blind";
  $("new-idea").hidden = mode !== "explore";
  document.body.dataset.mode = mode;
  if (player?.playing) player.stop();
  renderPlay();
  if (mode === "explore") show(state.exploreIdea);
  else show(state.blind.idea);
  renderBlind();
  renderHistory();
}

// ---------------------------------------------------------------------------
// Wiring

function wire(): void {
  $("play").addEventListener("click", () => void togglePlay());
  $("new-idea").addEventListener("click", newIdea);
  $("download").addEventListener("click", () => void download());
  ($("key") as HTMLSelectElement).addEventListener("change", (e) => {
    state.explore.keyChoice = (e.target as HTMLSelectElement).value;
    resetRating();
    regenerate();
  });
  for (const bars of [4, 8] as const) {
    $(`len-${bars}`).addEventListener("click", () => {
      if (state.explore.bars === bars) return;
      state.explore.bars = bars;
      renderLength();
      if (state.mode === "explore") {
        resetRating();
        regenerate();
      } else savePrefs();
    });
  }
  const bump = (d: number) => {
    if (state.mode !== "explore" || !state.idea) return;
    state.explore.bpm = Math.max(60, Math.min(180, state.idea.bpm + d));
    regenerate(false);
  };
  $("bpm-down").addEventListener("click", () => bump(-1));
  $("bpm-up").addEventListener("click", () => bump(1));
  $("tab-explore").addEventListener("click", () => setMode("explore"));
  $("tab-blind").addEventListener("click", () => setMode("blind"));

  buildStars("stars", (v) => {
    state.rating = v;
    renderRatingControls();
  });
  const issues = $("issues");
  for (const i of ISSUES) {
    const b = h("button", { type: "button", class: "chip", "data-id": i.id, "aria-pressed": "false" }, i.label);
    b.addEventListener("click", () => {
      if (state.issues.has(i.id)) state.issues.delete(i.id);
      else state.issues.add(i.id);
      renderRatingControls();
    });
    issues.append(b);
  }
  $("rating-form").addEventListener("submit", (e) => {
    e.preventDefault();
    void saveRating(true);
  });
  $("save-only").addEventListener("click", () => void saveRating(false));

  $("blind-start").addEventListener("click", () => void startRound());
  $("blind-next").addEventListener("click", () => void startRound());
  const guesses = $("guess-buttons");
  for (const style of STYLES) {
    const b = h("button", { type: "button", class: "btn guess-btn" }, style.artist);
    b.addEventListener("click", () => void guess(style.id));
    guesses.append(b);
  }
  buildStars("blind-stars", (v) => void rateBlind(v));
  const setSound = (m: SoundMode) => {
    state.blind.soundMode = m;
    savePrefs();
    renderBlind();
    if (state.mode === "blind" && state.idea && player) player.load(state.idea, m);
  };
  $("snd-style").addEventListener("click", () => setSound("style"));
  $("snd-neutral").addEventListener("click", () => setSound("neutral"));
  $("export-local").addEventListener("click", () => void exportLocal());

  document.addEventListener("keydown", (e) => {
    const t = e.target as HTMLElement;
    if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.tagName === "SELECT")) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.code === "Space") {
      if (t && t.tagName === "BUTTON") return;
      e.preventDefault();
      void togglePlay();
    } else if (e.key === "n" || e.key === "N") {
      if (state.mode === "explore") newIdea();
    } else if (/^[1-5]$/.test(e.key)) {
      const v = Number(e.key);
      if (state.mode === "explore") {
        state.rating = v;
        renderRatingControls();
      } else if (state.blind.guessed) void rateBlind(v);
    }
  });

  const redraw = () => drawRolls();
  new ResizeObserver(redraw).observe($("lanes"));
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redraw);
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

function snapshot(): unknown {
  return { explore: state.explore, history: state.history, blindSound: state.blind.soundMode, mode: state.mode };
}

function boot(data: unknown): void {
  loadPrefs();
  const d = (data ?? {}) as { explore?: ExploreState; history?: HistoryEntry[]; blindSound?: SoundMode };
  if (d.explore && STYLES.some((s) => s.id === d.explore!.styleId)) state.explore = { ...state.explore, ...d.explore };
  if (Array.isArray(d.history)) state.history = d.history;
  if (d.blindSound === "style" || d.blindSound === "neutral") state.blind.soundMode = d.blindSound;
  buildLanes();
  renderArtists();
  renderKeySelect();
  renderLength();
  wire();
  regenerate(state.history.length === 0);
  renderPlay();
  renderBlind();
  renderRatingControls();
  renderResults();
  store.onChange = renderResults;
  void store.init();
  window.claude?.hot?.snapshot?.(snapshot);
  requestAnimationFrame(tickPlayhead);
}

const hot = window.claude?.hot;
if (hot?.ready) hot.ready(boot);
else boot(hot?.data ?? {});
