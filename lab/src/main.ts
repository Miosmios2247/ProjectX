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
import { DEFAULT_OPTIONS, PlayForm, Player, PlayLane, SoundMode, renderOffline } from "./audio";
import { HumStats, HummedNote, humStats, transcribe } from "./hum";
import { MixProfile, analyzeMix, compareMix, loudestStretch, mixDown } from "./reference";
import { DUELS, Duel, duelsFor } from "./duels";
import { SOUND_LABELS } from "./sounds";
import {
  OwnVoice,
  OwnVoiceKind,
  SLOT_FOR_KIND,
  Take,
  VOICE_SLOTS,
  VoiceSlot,
  describeVoice,
  loadAllTakes,
  loadOwnVoice,
  saveTakes,
} from "./voice";
import { drawDrums, drawNotes } from "./roll";
import { RatingDoc, Store, StoredRating, errorText } from "./store";
import type * as ToneNS from "tone";

const LAB_VERSION = "0.5.0";
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
  { id: "voice", label: "Stimme" },
  { id: "mix", label: "Mix/Klangqualität" },
];
/** Goal of the plan: an average of at least 4 from at least 5 ratings. */
const GOAL = 4;
const GOAL_MIN = 5;
const STAR_LABELS = ["gar nicht", "kaum", "teils", "ziemlich", "voll"];
const LEAD_MODE: Record<string, string> = {
  "vocal-chop": "Vocal-Chop",
  "gated-vowel": "Gedehnter Vokal mit Gate",
  topline: "Gesungene Topline",
  "brass-hook": "Bläser-Hook",
  folk: "Folk-Riff",
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

type Mode = "explore" | "blind" | "duel";

const state = {
  mode: "explore" as Mode,
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
  form: "loop" as PlayForm,
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
  duel: {
    round: 0,
    duel: null as Duel | null,
    /** Version 1 and 2 (same seed); order says whether version 1 is the newer one ("ab"). */
    ideas: null as [Idea, Idea] | null,
    order: "ab" as "ab" | "ba",
    current: 0 as 0 | 1,
    voted: null as "1" | "2" | "=" | null,
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
        form: state.form,
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
    if (p.form === "loop" || p.form === "song") state.form = p.form;
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
  renderSongBar();
  if (!player) return;
  const options = state.mode === "duel" ? { ...DEFAULT_OPTIONS, ...duelArm(state.duel.current)?.options } : DEFAULT_OPTIONS;
  player.setOptions(options, !idea);
  if (idea) player.load(idea, state.mode === "blind" ? state.blind.soundMode : "style");
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
  const own = lane === "lead" && state.mode === "explore" && !!player?.usesOwnVoice(idea);
  const sound = own ? "Deine Stimme" : (SOUND_LABELS[data.sound] ?? data.sound);
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
  const blind = state.mode !== "explore";
  const hidden = (state.mode === "blind" && !state.blind.guessed) || (state.mode === "duel" && !state.duel.voted);
  const title = $("idea-title");
  const meta = $("idea-meta");
  const strip = $("chord-strip");
  strip.replaceChildren();
  if (!idea) {
    title.textContent = blind ? "Noch kein Loop" : "";
    meta.textContent = blind ? "Starte rechts eine Runde." : "";
    $("idea-refs").replaceChildren();
    $("why").hidden = true;
    for (const lane of PLAY_LANES) $(`sub-${lane}`).textContent = "";
    drawRolls();
    return;
  }
  title.textContent =
    state.mode === "duel" ? `${idea.artist} · ${idea.variantName} · Version ${state.duel.current + 1}` : hidden ? "Unbekannter Loop" : `${idea.artist} · ${idea.variantName}`;
  meta.textContent = `${keyName(idea.key)} · ${idea.bpm} BPM · ${idea.bars} Takte`;
  const refs = $("idea-refs");
  refs.replaceChildren();
  if ((!hidden || state.mode === "duel") && idea.references.length) {
    refs.append(h("strong", {}, "Zum Vergleich anhören: "), document.createTextNode(idea.references.join(" · ")));
  }
  $("bpm").textContent = String(idea.bpm);
  const humTempo = document.getElementById("hum-bpm") as HTMLInputElement | null;
  if (humTempo && !humTempo.value) humTempo.placeholder = String(idea.bpm);
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
  $("why-list").replaceChildren(...idea.insights.map((t) => h("li", {}, t)));
  $("why").hidden = hidden;
  $("why-title").textContent = `Warum klingt das nach ${idea.artist}?`;
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

/** The blind test and duels always play the plain loop. */
function playForm(): PlayForm {
  return state.mode === "explore" ? state.form : "loop";
}

function renderForm(): void {
  $("form-loop").setAttribute("aria-pressed", String(state.form === "loop"));
  $("form-song").setAttribute("aria-pressed", String(state.form === "song"));
  ($("form-loop") as HTMLButtonElement).disabled = state.mode !== "explore";
  ($("form-song") as HTMLButtonElement).disabled = state.mode !== "explore";
  renderSongBar();
}

function renderSongBar(): void {
  const bar = $("song-bar");
  const idea = state.idea;
  const on = playForm() === "song" && !!idea && idea.arrangement.length > 0;
  bar.hidden = !on;
  bar.replaceChildren();
  if (!on || !idea) return;
  const total = idea.arrangement.reduce((a, s) => a + s.bars, 0);
  bar.setAttribute("aria-label", `Song-Ablauf: ${idea.arrangement.map((s) => `${s.name} (${s.bars} Takte)`).join(", ")}`);
  for (const sec of idea.arrangement) {
    const full = sec.lanes.length === 5 && !sec.noKick;
    const seg = h("div", { class: `song-seg${full ? " is-drop" : ""}` });
    seg.style.flex = `${sec.bars} 1 0`;
    seg.append(document.createTextNode(sec.name), h("small", {}, `${sec.bars} T.`));
    bar.append(seg);
  }
  const marker = h("div", { class: "song-marker", "aria-hidden": "true" });
  bar.append(marker);
  bar.dataset.total = String(total);
}

function setForm(form: PlayForm): void {
  if (state.form === form) return;
  state.form = form;
  renderForm();
  player?.setForm(playForm());
  savePrefs();
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

function avg(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
}

function goalCell(ratings: number[]): HTMLElement {
  const td = h("td");
  const wrap = h("div", { class: "goal" });
  const mean = ratings.length ? avg(ratings) : 0;
  const ok = ratings.length >= GOAL_MIN && mean >= GOAL;
  wrap.dataset.ok = String(ok);
  const bar = h("div", { class: "goal-bar", role: "img", "aria-label": ratings.length ? `Ø ${fmt(mean)} von 5, Ziel 4` : "keine Bewertungen" });
  const fill = h("span");
  fill.style.width = `${(mean / 5) * 100}%`;
  bar.append(fill, h("i"));
  const left = GOAL_MIN - ratings.length;
  const mark = ok ? "✓ am Ziel" : ratings.length && mean >= GOAL ? `noch ${left}` : ratings.length ? `${fmt(GOAL - mean)} fehlen` : "–";
  wrap.append(bar, h("span", { class: "goal-mark" }, mark));
  td.append(wrap);
  return td;
}

function blindCell(list: StoredRating[]): HTMLElement {
  return h("td", { class: "num" }, list.length ? `${list.filter((r) => r.correct).length}/${list.length}` : "–");
}

function renderResults(): void {
  const all = store.ratings;
  const explore = all.filter((r) => r.mode === "entdecken" && typeof r.rating === "number");
  const blind = all.filter((r) => r.mode === "blindtest" && typeof r.correct === "boolean");
  const duels = all.filter((r) => r.mode === "duell" && !!r.winner && !!r.duelId);
  $("kpi-count").textContent = String(explore.length + blind.length + duels.length);
  $("kpi-avg").textContent = explore.length ? fmt(avg(explore.map((r) => r.rating ?? 0))) : "–";
  const correct = blind.filter((r) => r.correct).length;
  $("kpi-blind").textContent = blind.length ? `${Math.round((correct / blind.length) * 100)} %` : "–";
  $("kpi-blind-sub").textContent = blind.length ? `${correct} von ${blind.length} richtig` : "Blindtest richtig";

  const body = $("res-body");
  body.replaceChildren();
  let atGoal = 0;
  let variants = 0;
  for (const style of STYLES) {
    for (const v of style.variants) {
      variants++;
      const ex = explore.filter((r) => r.styleId === style.id && r.variantId === v.id);
      const bl = blind.filter((r) => r.styleId === style.id && r.variantId === v.id);
      const ratings = ex.map((r) => r.rating ?? 0);
      if (ratings.length >= GOAL_MIN && avg(ratings) >= GOAL) atGoal++;
      const issues = new Map<string, number>();
      for (const r of ex) for (const i of r.issues ?? []) issues.set(i, (issues.get(i) ?? 0) + 1);
      const top = [...issues.entries()].sort((a, b) => b[1] - a[1])[0];
      const tr = h("tr");
      const name = h("td");
      name.append(h("span", { class: "res-artist" }, style.artist), document.createTextNode(` ${v.name}`));
      tr.append(
        name,
        h("td", { class: "num" }, String(ex.length)),
        h("td", { class: "num" }, ex.length ? fmt(avg(ratings)) : "–"),
        goalCell(ratings),
        blindCell(bl.filter((r) => r.soundMode !== "neutral")),
        blindCell(bl.filter((r) => r.soundMode === "neutral")),
        h("td", {}, top ? `${ISSUES.find((i) => i.id === top[0])?.label ?? top[0]} (${top[1]})` : "–"),
      );
      body.append(tr);
    }
  }
  $("kpi-goal").textContent = `${atGoal}/${variants}`;

  const dbody = $("duel-body");
  dbody.replaceChildren();
  for (const d of DUELS) {
    const votes = duels.filter((r) => r.duelId === d.id);
    const a = votes.filter((r) => r.winner === "a").length;
    const b = votes.filter((r) => r.winner === "b").length;
    const tie = votes.length - a - b;
    // A clear lead needs a few votes; until then the comparison stays open.
    const verdict = votes.length < 6 ? "offen" : a >= b * 2 && a - b >= 3 ? "neu vorn" : b >= a * 2 && b - a >= 3 ? "alt vorn" : "kein klarer Unterschied";
    const tr = h("tr");
    tr.append(
      h("td", {}, d.title),
      h("td", { class: "num" }, String(votes.length)),
      h("td", { class: "num" }, String(a)),
      h("td", { class: "num" }, String(b)),
      h("td", { class: "num" }, String(tie)),
      h("td", {}, verdict),
    );
    dbody.append(tr);
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
    form: mode === "entdecken" ? state.form : "loop",
    ownVoice: !!player?.usesOwnVoice(idea),
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
  if (ref.listening) {
    stopReference();
    renderRef();
  }
  try {
    await player.unlock();
  } catch {
    toast("Audio konnte nicht starten. Tippe noch einmal auf Play.");
    return;
  }
  if (!state.idea) return;
  if (player.playing) player.stop();
  else {
    if (player.idea !== state.idea) show(state.idea);
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
  const bar = document.getElementById("song-bar");
  if (bar && !bar.hidden) {
    const sp = player?.songProgress() ?? -1;
    const segs = bar.querySelectorAll<HTMLElement>(".song-seg");
    const marker = bar.querySelector<HTMLElement>(".song-marker");
    let at = -1;
    if (sp >= 0 && state.idea) {
      const total = Number(bar.dataset.total) || 1;
      const pos = sp * total;
      let start = 0;
      state.idea.arrangement.forEach((s, i) => {
        if (at < 0 && pos < start + s.bars) at = i;
        start += s.bars;
      });
    }
    segs.forEach((el, i) => el.classList.toggle("is-current", i === at));
    if (marker) {
      // The marker sits inside the segment, proportional to the position in it.
      const seg = at >= 0 ? segs[at] : null;
      if (!seg || !state.idea) marker.style.opacity = "0";
      else {
        const total = Number(bar.dataset.total) || 1;
        let start = 0;
        for (let i = 0; i < at; i++) start += state.idea.arrangement[i].bars;
        const within = (sp * total - start) / state.idea.arrangement[at].bars;
        marker.style.opacity = "1";
        marker.style.left = `${seg.offsetLeft + within * seg.offsetWidth}px`;
      }
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

function setMode(mode: Mode): void {
  if (state.mode === mode) return;
  state.mode = mode;
  $("tab-explore").setAttribute("aria-selected", String(mode === "explore"));
  $("tab-blind").setAttribute("aria-selected", String(mode === "blind"));
  $("tab-duel").setAttribute("aria-selected", String(mode === "duel"));
  $("artists").hidden = mode !== "explore";
  $("blind-intro").hidden = mode !== "blind";
  $("duel-intro").hidden = mode !== "duel";
  $("rating-form").hidden = mode !== "explore";
  $("guess").hidden = mode !== "blind";
  $("duel-card").hidden = mode !== "duel";
  $("new-idea").hidden = mode !== "explore";
  document.body.dataset.mode = mode;
  if (player?.playing) player.stop();
  player?.setForm(playForm());
  renderForm();
  renderPlay();
  if (mode === "explore") show(state.exploreIdea);
  else if (mode === "blind") show(state.blind.idea);
  else show(state.duel.ideas?.[state.duel.current] ?? null);
  renderBlind();
  renderDuel();
  renderHistory();
}

// ---------------------------------------------------------------------------
// Duels

/** The arm behind version 1 or 2 of the current duel. */
function duelArm(version: 0 | 1) {
  const d = state.duel;
  if (!d.duel) return null;
  const newerFirst = d.order === "ab";
  return (version === 0) === newerFirst ? d.duel.a : d.duel.b;
}

function sameNotes(a: Idea, b: Idea): boolean {
  return JSON.stringify(a.lanes) === JSON.stringify(b.lanes);
}

/** A random variant and a comparison that applies to it; rule duels get a seed where the versions differ. */
function pickDuel(): { duel: Duel; ideas: [Idea, Idea] } {
  for (let attempt = 0; attempt < 40; attempt++) {
    const style = STYLES[Math.floor(Math.random() * STYLES.length)];
    const variant = style.variants[Math.floor(Math.random() * style.variants.length)];
    const options = duelsFor(style.id, variant.id);
    if (!options.length) continue;
    const duel = options[Math.floor(Math.random() * options.length)];
    const base: IdeaParams = { styleId: style.id, variantId: variant.id, key: null, bars: state.explore.bars, seed: randomSeed() };
    const a = generateIdea({ ...base, flags: duel.a.flags });
    const b = generateIdea({ ...base, flags: duel.b.flags });
    if ((duel.a.flags || duel.b.flags) && sameNotes(a, b)) continue;
    return { duel, ideas: [a, b] };
  }
  const duel = DUELS[0];
  const style = STYLES[0];
  const base: IdeaParams = { styleId: style.id, variantId: style.variants[0].id, key: null, bars: state.explore.bars, seed: randomSeed() };
  return { duel, ideas: [generateIdea(base), generateIdea(base)] };
}

async function startDuel(): Promise<void> {
  const { duel, ideas } = pickDuel();
  const d = state.duel;
  d.round++;
  d.duel = duel;
  d.order = Math.random() < 0.5 ? "ab" : "ba";
  // ideas[0] belongs to arm a; version 1 is arm a when the order is "ab".
  d.ideas = d.order === "ab" ? ideas : [ideas[1], ideas[0]];
  d.current = 0;
  d.voted = null;
  show(d.ideas[0]);
  renderDuel();
  if (player) {
    try {
      await player.unlock();
      await player.prepare();
      player.play();
    } catch {
      toast("Audio konnte nicht starten. Tippe auf Play.");
    }
    renderPlay();
  }
}

/** Switch between version 1 and 2; keeps playing so the difference is easy to hear. */
async function switchDuel(version: 0 | 1): Promise<void> {
  const d = state.duel;
  if (!d.ideas) return;
  d.current = version;
  show(d.ideas[version]);
  renderDuel();
  if (player && !player.playing) {
    try {
      await player.unlock();
      await player.prepare();
      player.play();
    } catch {
      toast("Audio konnte nicht starten. Tippe auf Play.");
    }
    renderPlay();
  }
}

async function voteDuel(choice: "1" | "2" | "="): Promise<void> {
  const d = state.duel;
  if (!d.duel || !d.ideas || d.voted) return;
  d.voted = choice;
  const winner = choice === "=" ? "tie" : (choice === "1") === (d.order === "ab") ? "a" : "b";
  renderDuel();
  renderIdea();
  try {
    await store.add(buildDoc(d.ideas[0], "duell", { duelId: d.duel.id, winner, order: d.order }));
  } catch (e) {
    toast(errorText(e));
  }
}

function renderDuel(): void {
  const d = state.duel;
  const idea = d.ideas?.[0];
  $("duel-title").textContent = idea ? `Welche klingt mehr nach ${idea.artist}?` : "Welche klingt mehr nach dem Künstler?";
  $("duel-round").textContent = d.ideas ? `Duell ${d.round}` : "Bereit, wenn du es bist.";
  $("duel-start").hidden = !!d.ideas;
  $("duel-play").hidden = !d.ideas || !!d.voted;
  $("duel-reveal").hidden = !d.voted;
  $("duel-v1").setAttribute("aria-pressed", String(!!d.ideas && d.current === 0));
  $("duel-v2").setAttribute("aria-pressed", String(!!d.ideas && d.current === 1));
  if (d.voted && d.duel) {
    const v1 = duelArm(0)!.label;
    const v2 = duelArm(1)!.label;
    const picked = d.voted === "=" ? "Kein Unterschied gewählt." : `Du hast Version ${d.voted} gewählt.`;
    $("duel-verdict").textContent = `${picked} Version 1 war: ${v1}. Version 2 war: ${v2}.`;
  }
}

// ---------------------------------------------------------------------------
// Voice studio

const NO_MIC =
  "Aufnehmen geht in diesem Fenster nicht. Nimm eine Sprachmemo mit dem Handy auf und lade sie mit „Datei“.";
const MAX_TAKES = 3;
const RECORD_SECONDS = 20;
const SLOT_INFO: Record<VoiceSlot, { artist: string; prompt: string }> = {
  fred: {
    artist: "Fred again..",
    prompt: "Sprich zwei, drei Sätze wie in einer Sprachmemo an einen Freund, dann sing kurz eine Zeile.",
  },
  bunt: {
    artist: "BUNT.",
    prompt: "Sing einen langen Vokal, erst „iiii“, dann „aaaa“, jeweils 3–5 Sekunden auf einem Ton.",
  },
  avaion: {
    artist: "AVAION",
    prompt: "Sing ein paar eigene Worte oder „ooh“, eher hoch, gern im Falsett.",
  },
};

const studio = {
  takes: { fred: [], bunt: [], avaion: [] } as Record<VoiceSlot, Take[]>,
  voices: {} as Partial<Record<VoiceSlot, OwnVoice>>,
  info: {} as Partial<Record<VoiceSlot, string>>,
  recording: null as VoiceSlot | null,
  fileFor: null as VoiceSlot | null,
};
let recorder: MediaRecorder | null = null;

function voiceStatus(text: string): void {
  $("voice-status").textContent = text;
}

/** Each vocal sound uses its artist's recordings, or any other recording when there are none. */
function applyVoices(): void {
  const any = VOICE_SLOTS.map((s) => studio.voices[s]).find((v) => !!v);
  const byKind: Partial<Record<OwnVoiceKind, OwnVoice>> = {};
  for (const kind of ["chop", "stretch", "sing"] as OwnVoiceKind[]) {
    const v = studio.voices[SLOT_FOR_KIND[kind]] ?? any;
    if (v) byKind[kind] = v;
  }
  player?.setOwnVoices(byKind, ($("voice-use") as HTMLInputElement).checked);
  renderStudio();
}

async function rebuildSlot(slot: VoiceSlot): Promise<void> {
  const T = window.Tone;
  const takes = studio.takes[slot];
  if (!T || !takes.length) {
    delete studio.voices[slot];
    studio.info[slot] = "";
    applyVoices();
    return;
  }
  studio.info[slot] = "Analysiere …";
  renderStudio();
  try {
    const v = await loadOwnVoice(T, takes);
    if (!v.analysis.slices.length) {
      delete studio.voices[slot];
      studio.info[slot] = "Keine Stimme erkannt. Versuch es lauter oder näher am Mikrofon.";
    } else {
      studio.voices[slot] = v;
      studio.info[slot] = describeVoice(v);
    }
  } catch {
    delete studio.voices[slot];
    studio.info[slot] = "Diese Datei kann der Browser nicht lesen. Probier MP3, M4A oder WAV.";
  }
  applyVoices();
}

async function addTake(slot: VoiceSlot, take: Take): Promise<void> {
  studio.takes[slot] = [...studio.takes[slot], take].slice(-MAX_TAKES);
  await saveTakes(slot, studio.takes[slot]);
  await rebuildSlot(slot);
}

async function clearSlot(slot: VoiceSlot): Promise<void> {
  studio.takes[slot] = [];
  await saveTakes(slot, []);
  await rebuildSlot(slot);
}

function renderStudio(): void {
  const wrap = $("studio");
  wrap.replaceChildren();
  for (const slot of VOICE_SLOTS) {
    const info = SLOT_INFO[slot];
    const n = studio.takes[slot].length;
    const row = h("div", { class: "studio-row", "data-slot": slot });
    const head = h("div", { class: "studio-head" });
    head.append(h("strong", {}, info.artist), h("span", { class: "studio-count" }, n ? `${n}/${MAX_TAKES} Aufnahmen` : "noch keine Aufnahme"));
    const actions = h("div", { class: "actions" });
    const rec = h("button", { type: "button", class: "btn", id: `rec-${slot}` }, studio.recording === slot ? "Stopp" : "Aufnehmen");
    if (studio.recording === slot) rec.classList.add("is-recording");
    rec.disabled = !!studio.recording && studio.recording !== slot;
    rec.addEventListener("click", () => void toggleRecord(slot));
    const pick = h("button", { type: "button", class: "btn", id: `file-${slot}` }, "Datei");
    pick.addEventListener("click", () => {
      studio.fileFor = slot;
      ($("voice-file") as HTMLInputElement).click();
    });
    actions.append(rec, pick);
    if (n) {
      const del = h("button", { type: "button", class: "btn", id: `clear-${slot}` }, "Löschen");
      del.addEventListener("click", () => void clearSlot(slot));
      actions.append(del);
    }
    row.append(head, h("p", { class: "small" }, info.prompt), actions, h("p", { class: "studio-info", id: `info-${slot}` }, studio.info[slot] ?? ""));
    wrap.append(row);
  }
  $("voice-on").hidden = !VOICE_SLOTS.some((s) => studio.voices[s]);
  if (state.idea) renderIdea();
}

async function toggleRecord(slot: VoiceSlot): Promise<void> {
  if (recorder) {
    recorder.stop();
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    voiceStatus(NO_MIC);
    return;
  }
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true },
    });
  } catch {
    voiceStatus(NO_MIC);
    return;
  }
  const chunks: Blob[] = [];
  const rec = new MediaRecorder(stream);
  recorder = rec;
  studio.recording = slot;
  const started = Date.now();
  renderStudio();
  const timer = window.setInterval(() => {
    const s = Math.floor((Date.now() - started) / 1000);
    const btn = document.getElementById(`rec-${slot}`);
    if (btn) btn.textContent = `Stopp (0:${String(s).padStart(2, "0")})`;
    if (s >= RECORD_SECONDS && rec.state === "recording") rec.stop();
  }, 250);
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  rec.onstop = () => {
    window.clearInterval(timer);
    stream.getTracks().forEach((t) => t.stop());
    recorder = null;
    studio.recording = null;
    voiceStatus("");
    renderStudio();
    void new Blob(chunks, { type: rec.mimeType })
      .arrayBuffer()
      .then((bytes) => addTake(slot, { name: `Aufnahme ${new Date().toLocaleTimeString("de-DE")}`, bytes }));
  };
  rec.start();
  voiceStatus(`Aufnahme für ${SLOT_INFO[slot].artist} läuft: ${SLOT_INFO[slot].prompt}`);
}

async function restoreVoices(): Promise<void> {
  studio.takes = await loadAllTakes();
  await Promise.all(VOICE_SLOTS.map((s) => (studio.takes[s].length ? rebuildSlot(s) : Promise.resolve())));
  renderStudio();
}

// ---------------------------------------------------------------------------
// Reference comparison (the song stays in the browser; only measurements are saved)

const REF_SECONDS = 16;
const ref = {
  name: "",
  buffer: null as AudioBuffer | null,
  profile: null as MixProfile | null,
  from: 0,
  listening: false,
  player: null as ToneNS.Player | null,
  gain: null as ToneNS.Gain | null,
};

function refStatus(text: string): void {
  $("ref-status").textContent = text;
}

function renderRef(): void {
  $("ref-on").hidden = !ref.buffer;
  $("ref-idea").setAttribute("aria-pressed", String(!ref.listening));
  $("ref-song").setAttribute("aria-pressed", String(ref.listening));
  ($("ref-from") as HTMLInputElement).value = String(Math.round(ref.from));
}

async function loadReference(file: File): Promise<void> {
  const T = window.Tone;
  if (!T) return;
  refStatus("Lese den Song …");
  try {
    const decoded = await T.getContext().decodeAudioData(await file.arrayBuffer());
    const chs = Array.from({ length: Math.min(2, decoded.numberOfChannels) }, (_, c) => decoded.getChannelData(c));
    ref.from = loudestStretch(mixDown(chs), decoded.sampleRate, REF_SECONDS);
    ref.profile = analyzeMix(chs, decoded.sampleRate, { from: ref.from, maxSeconds: REF_SECONDS });
    ref.buffer = decoded;
    ref.name = file.name;
    stopReference();
    refStatus(
      `${file.name}: etwa ${ref.profile.bpm ? Math.round(ref.profile.bpm) : "?"} BPM. Der Ausschnitt startet beim lautesten Teil (meist der Drop).`,
    );
  } catch {
    refStatus("Diese Datei kann der Browser nicht lesen. Probier MP3, M4A oder WAV.");
  }
  renderRef();
}

function stopReference(): void {
  ref.listening = false;
  try {
    ref.player?.stop();
  } catch {
    // not started
  }
  player?.setOutputMuted(false);
}

/** Switch between idea and reference; the reference plays as loud as a streamed song (-14 LUFS). */
async function listenReference(on: boolean): Promise<void> {
  const T = window.Tone;
  if (!T || !ref.buffer || !ref.profile) return;
  if (!on) {
    stopReference();
    renderRef();
    return;
  }
  await T.start();
  if (!ref.player || !ref.gain) {
    ref.gain = new T.Gain(1).toDestination();
    ref.player = new T.Player({ loop: true, fadeIn: 0.02, fadeOut: 0.05 }).connect(ref.gain);
  }
  ref.player.buffer = new T.ToneAudioBuffer(ref.buffer);
  ref.player.loopStart = ref.from;
  ref.player.loopEnd = Math.min(ref.buffer.duration, ref.from + REF_SECONDS);
  ref.gain.gain.value = T.dbToGain(Math.max(-24, Math.min(12, -14 - ref.profile.lufs)));
  try {
    ref.player.stop();
  } catch {
    // not started
  }
  ref.player.start(T.now() + 0.02, ref.from);
  ref.listening = true;
  player?.setOutputMuted(true);
  renderRef();
}

async function compareReference(): Promise<void> {
  const T = window.Tone;
  const idea = state.idea;
  if (!T || !idea || !ref.profile || !ref.buffer) return;
  if (player?.playing) {
    player.stop();
    renderPlay();
  }
  stopReference();
  renderRef();
  refStatus("Messe die Idee …");
  const button = $("ref-compare") as HTMLButtonElement;
  button.disabled = true;
  try {
    const { chs, rate } = await renderOffline(T, idea, DEFAULT_OPTIONS);
    const mine = analyzeMix(chs, rate, { bpm: idea.bpm });
    const lines = compareMix(ref.profile, mine);
    $("ref-result").replaceChildren(...lines.map((l) => h("li", {}, l)));
    refStatus(`Vergleich mit ${ref.name} (ab ${Math.round(ref.from)} s).`);
    const round = (p: MixProfile) => ({ lufs: +p.lufs.toFixed(1), bands: p.bands.map((b) => +b.toFixed(1)), bpm: p.bpm, pump: +p.pump.toFixed(1) });
    await store.add(buildDoc(idea, "referenz", { reference: { name: ref.name.slice(0, 120), from: Math.round(ref.from), ref: round(ref.profile), idea: round(mine) } }));
  } catch (e) {
    refStatus("Die Messung hat nicht geklappt.");
    toast(errorText(e));
  } finally {
    button.disabled = false;
  }
}

function setReferenceStart(seconds: number): void {
  if (!ref.buffer) return;
  ref.from = Math.max(0, Math.min(ref.buffer.duration - 2, seconds));
  const chs = Array.from({ length: Math.min(2, ref.buffer.numberOfChannels) }, (_, c) => ref.buffer!.getChannelData(c));
  ref.profile = analyzeMix(chs, ref.buffer.sampleRate, { from: ref.from, maxSeconds: REF_SECONDS });
  if (ref.listening) void listenReference(true);
  renderRef();
}

// ---------------------------------------------------------------------------
// Hook-Summer (only statistics are saved, never the melody)

const HUM_BARS = 4;
const hum = { notes: [] as HummedNote[], stats: null as HumStats | null, bpm: 120, t0: 0, recording: false };

function humStatus(text: string): void {
  $("hum-status").textContent = text;
}

function humBpm(): number {
  const v = Number(($("hum-bpm") as HTMLInputElement).value);
  return v >= 60 && v <= 200 ? v : state.idea?.bpm ?? 120;
}

function showHum(notes: HummedNote[], bpm: number, t0: number): void {
  hum.notes = notes;
  hum.bpm = bpm;
  hum.t0 = t0;
  hum.stats = notes.length >= 3 ? humStats(notes, bpm, t0) : null;
  $("hum-on").hidden = !hum.stats;
  if (!hum.stats) {
    humStatus("Zu wenige Töne erkannt. Summ etwas lauter, mit kurzen Pausen zwischen den Tönen.");
    return;
  }
  const s = hum.stats;
  const pct = (x: number) => `${Math.round(x * 100)} %`;
  $("hum-result").replaceChildren(
    h("li", {}, `${s.notes} Töne, ${s.pitches} verschiedene, Umfang ${s.range} Halbtöne`),
    h("li", {}, `Schritte (bis 2 Halbtöne): ${pct(s.steps)}, Wiederholungen: ${pct(s.repeats)}`),
    h("li", {}, `${s.notesPerBar.toFixed(1)} Töne pro Takt, ${pct(s.sync)} zwischen den Achteln (Synkopen)`),
  );
  const step = 60 / bpm / 4;
  const asNotes = notes.map((n) => ({
    pitch: n.midi,
    start: Math.max(0, (n.start - t0) / step),
    len: Math.max(0.5, (n.end - n.start) / step),
    vel: 100,
  }));
  const canvas = $("hum-roll") as HTMLCanvasElement;
  const total = Math.max(16, Math.ceil((asNotes[asNotes.length - 1].start + 2) / 16) * 16);
  drawNotes(canvas, asNotes, total, { note: cssVar("--lane-lead"), grid: cssVar("--grid"), bar: cssVar("--grid-bar") });
  humStatus("Das hat das Hör-Labor gehört. Passt es ungefähr? Dann speichere die Statistik.");
}

async function analyzeHum(bytes: ArrayBuffer, t0: number): Promise<void> {
  const T = window.Tone;
  if (!T) return;
  try {
    const decoded = await T.getContext().decodeAudioData(bytes);
    showHum(transcribe(decoded.getChannelData(0), decoded.sampleRate), humBpm(), t0);
  } catch {
    humStatus("Diese Aufnahme kann der Browser nicht lesen. Probier MP3, M4A oder WAV.");
  }
}

async function recordHum(): Promise<void> {
  const T = window.Tone;
  if (!T || hum.recording) return;
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    humStatus(NO_MIC);
    return;
  }
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true } });
  } catch {
    humStatus(NO_MIC);
    return;
  }
  await T.start();
  if (player?.playing) {
    player.stop();
    renderPlay();
  }
  const bpm = humBpm();
  const beat = 60 / bpm;
  const click = new T.Synth({ oscillator: { type: "square" }, envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.02 }, volume: -16 }).toDestination();
  const rec = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  hum.recording = true;
  ($("hum-record") as HTMLButtonElement).disabled = true;
  rec.start();
  const t = T.now() + 0.15;
  const beats = 4 * (HUM_BARS + 1);
  for (let k = 0; k < beats; k++) click.triggerAttackRelease(k % 4 === 0 ? 1760 : 1320, 0.03, t + k * beat, k < 4 ? 0.9 : 0.5);
  humStatus("Eins, zwei, drei, vier – dann summ die Hook, vier Takte lang.");
  window.setTimeout(() => rec.stop(), (0.15 + beats * beat + 0.3) * 1000);
  rec.onstop = () => {
    stream.getTracks().forEach((tr) => tr.stop());
    click.dispose();
    hum.recording = false;
    ($("hum-record") as HTMLButtonElement).disabled = false;
    humStatus("Werte die Aufnahme aus …");
    void new Blob(chunks, { type: rec.mimeType }).arrayBuffer().then((bytes) => analyzeHum(bytes, 0.15 + 4 * beat));
  };
}

async function saveHum(): Promise<void> {
  const idea = state.idea;
  if (!idea || !hum.stats) return;
  const song = ($("hum-song") as HTMLInputElement).value.trim().slice(0, 80);
  try {
    await store.add(buildDoc(idea, "summen", { hum: { song: song || "ohne Namen", bpm: hum.bpm, stats: hum.stats } }));
    toast("Statistik gespeichert. Danke!");
    $("hum-on").hidden = true;
    humStatus("");
  } catch (e) {
    toast(errorText(e));
  }
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
  $("voice-file").addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    const slot = studio.fileFor;
    input.value = "";
    if (file && slot) void file.arrayBuffer().then((bytes) => addTake(slot, { name: file.name, bytes }));
  });
  $("voice-use").addEventListener("change", () => applyVoices());
  $("ref-pick").addEventListener("click", () => ($("ref-file") as HTMLInputElement).click());
  $("ref-file").addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (file) void loadReference(file);
  });
  $("ref-idea").addEventListener("click", () => void listenReference(false));
  $("ref-song").addEventListener("click", () => void listenReference(true));
  $("ref-from").addEventListener("change", (e) => setReferenceStart(Number((e.target as HTMLInputElement).value) || 0));
  $("ref-compare").addEventListener("click", () => void compareReference());
  $("hum-record").addEventListener("click", () => void recordHum());
  $("hum-pick").addEventListener("click", () => ($("hum-file") as HTMLInputElement).click());
  $("hum-file").addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (file) void file.arrayBuffer().then((bytes) => analyzeHum(bytes, 0));
  });
  $("hum-save").addEventListener("click", () => void saveHum());
  $("form-loop").addEventListener("click", () => setForm("loop"));
  $("form-song").addEventListener("click", () => setForm("song"));
  $("bpm-down").addEventListener("click", () => bump(-1));
  $("bpm-up").addEventListener("click", () => bump(1));
  $("tab-explore").addEventListener("click", () => setMode("explore"));
  $("tab-blind").addEventListener("click", () => setMode("blind"));
  $("tab-duel").addEventListener("click", () => setMode("duel"));
  $("duel-start").addEventListener("click", () => void startDuel());
  $("duel-next").addEventListener("click", () => void startDuel());
  $("duel-v1").addEventListener("click", () => void switchDuel(0));
  $("duel-v2").addEventListener("click", () => void switchDuel(1));
  $("duel-pick1").addEventListener("click", () => void voteDuel("1"));
  $("duel-pick2").addEventListener("click", () => void voteDuel("2"));
  $("duel-same").addEventListener("click", () => void voteDuel("="));

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
    } else if (state.mode === "duel" && (e.key === "1" || e.key === "2")) {
      void switchDuel(e.key === "1" ? 0 : 1);
    } else if (/^[1-5]$/.test(e.key)) {
      const v = Number(e.key);
      if (state.mode === "explore") {
        state.rating = v;
        renderRatingControls();
      } else if (state.mode === "blind" && state.blind.guessed) void rateBlind(v);
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
  renderForm();
  player?.setForm(playForm());
  wire();
  regenerate(state.history.length === 0);
  renderPlay();
  renderBlind();
  renderDuel();
  renderRatingControls();
  renderResults();
  store.onChange = renderResults;
  void store.init();
  renderStudio();
  void restoreVoices();
  window.claude?.hot?.snapshot?.(snapshot);
  requestAnimationFrame(tickPlayhead);
}

const hot = window.claude?.hot;
if (hot?.ready) hot.ready(boot);
else boot(hot?.data ?? {});
