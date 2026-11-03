// Plain-language reasons why an idea sounds like the artist ("Warum klingt
// das so?"), for people without music theory.

import { ChordSlot, ProgressionTemplate, universalPcs } from "./progression";
import { Rhythm } from "./rhythm";
import { Key, mod12, pcName } from "./theory";
import { ArpOrder, LeadMode, MelodyScale, Note, StyleProfile, StyleVariant } from "./types";
import { Mood, explainMood } from "./mood";

const FORM_TEXT: Record<string, string> = {
  "A B": "Frage und Antwort",
  "A A'": "Motiv und Motiv mit neuem Ende",
  "A B A B'": "Frage, Antwort, Frage, neue Antwort",
  "A A' A B": "Motiv, Motiv mit neuem Ende, Motiv, Antwort",
  "A B A C": "Frage, Antwort, Frage, andere Antwort",
  "A A A A'": "dasselbe Motiv dreimal, dann mit neuem Ende",
  "A A B A'": "Motiv zweimal, ein Kontrast, dann das Motiv mit neuem Ende",
  "A A' B A'": "Motiv, Motiv mit neuem Ende, ein Kontrast, dann das Motiv mit neuem Ende",
  "A A A' A": "Motiv zweimal, einmal mit neuem Ende, dann wieder das Motiv",
  "A A' A A'": "Motiv und Motiv mit neuem Ende, zweimal",
};

// The colour a minor melody gets from its scale, named only when the melody really uses the tone.
const SCALE_COLOUR: Partial<Record<MelodyScale, [number, string]>> = {
  harmonic: [11, ", mit dem Leitton aus harmonisch Moll, der dunkel und dramatisch klingt"],
  phrygian: [1, ", mit der kleinen Sekunde (phrygisch), die bedrohlich klingt"],
  dorian: [9, ", mit der großen Sexte (dorisch), die weicher klingt"],
};

function formText(build: string): string {
  const form = build.replace(" +Auftakt", "");
  return FORM_TEXT[form] ?? form;
}

export function explainIdea(input: {
  style: StyleProfile;
  variant: StyleVariant;
  template: ProgressionTemplate;
  templateText: string;
  chordNames: string;
  chordRhythm: Rhythm;
  leadMode: LeadMode;
  leadBuild: string;
  leadNotes: readonly Note[];
  bassRhythm: Rhythm;
  bassNotes?: readonly Note[];
  /** The bass holds the tonic under all chords. */
  bassPedal?: boolean;
  pluckRhythm?: Rhythm;
  pluckOrder?: ArpOrder;
  drumName?: string;
  drumHits?: number;
  leadScale?: MelodyScale;
  drumRolls?: boolean;
  pluckAnswers: boolean;
  key: Key;
  slots: readonly ChordSlot[];
  /** The keys left the held vocal note to the voice. */
  keysYield: boolean;
  mood?: Mood | null;
}): string[] {
  const { style, variant, template, key } = input;
  const out: string[] = [];
  const name = (pc: number) => pcName(mod12(pc), key);
  const leadPcs: number[] = [];
  for (const n of [...input.leadNotes].sort((a, b) => a.start - b.start)) {
    if (!leadPcs.includes(mod12(n.pitch))) leadPcs.push(mod12(n.pitch));
  }

  const degrees = (template.sourceDegrees ?? template.degrees).join(" – ");
  if (template.mood && template.note) {
    // A loop the mood brought along: say what it does instead of the artist's usual harmony.
    const note = template.note.charAt(0).toUpperCase() + template.note.slice(1);
    const owner = style.artist.endsWith("s") ? `${style.artist}’` : `${style.artist}s`;
    out.push(`Akkorde ${input.chordNames} (Stufen ${degrees}): ${note}. Die Folge bringt die Stimmung mit, ${owner} Klang und Hook bleiben.`);
  } else {
    const like = template.like ? `, dasselbe Muster wie in ${template.like}` : "";
    out.push(`Akkorde ${input.chordNames} (Stufen ${degrees})${like}. ${style.harmonyNote}`);
  }
  if (input.mood) out.push(explainMood(input.mood, template, style.genre ?? "house"));
  if (input.chordRhythm.tags.includes("push")) {
    out.push("Die Akkorde kommen eine Achtel vor dem Taktanfang (Push). Das gibt den typischen House-Schwung.");
  }

  const pitches = new Set(input.leadNotes.map((n) => n.pitch)).size;
  switch (input.leadMode) {
    case "vocal-chop":
      out.push(
        input.leadBuild === "chords"
          ? `Hook: kurze Stimm-Schnipsel aus ${pitches} Tönen, als Muster wiederholt. Die Silben folgen den Akkorden wie ein umgestimmtes Sample, so baut Fred again.. seine Vocal-Chops.`
          : `Hook: kurze Stimm-Schnipsel aus nur ${pitches} Tönen, die über alle Akkorde passen und sich wiederholen. Typisch für Fred again..s Vocal-Chops.`,
      );
      break;
    case "gated-vowel":
      if (input.leadBuild === "pedal") {
        out.push(
          `Hook: ein gedehnter Vokal auf nur einem Ton (${name(leadPcs[0])}), der im 16tel-Takt stottert. Dieser Ton passt über jeden Akkord der Folge, deshalb kann die Stimme wie in „Clouds“ den ganzen Loop über stehen bleiben.`,
        );
      } else if (input.leadBuild === "two" && leadPcs.length === 2) {
        out.push(
          `Hook: zwei gedehnte Silben (wie „ea-sy“ in „Clouds“) auf ${name(leadPcs[0])} und ${name(leadPcs[1])}, die im 16tel-Takt stottern. Beide Töne passen über alle Akkorde der Folge.`,
        );
      } else {
        out.push(
          `Hook: ein gedehnter Vokal, der im 16tel-Takt stottert, auf nur ${pitches} ${pitches === 1 ? "Ton" : "Tönen"}. Er bleibt auf Tönen, die die Akkorde gemeinsam haben, wie die Stimme in „Clouds“.`,
        );
      }
      break;
    case "topline":
      out.push(
        `Melodie: singbare Phrasen, meist in kleinen Schritten (${formText(input.leadBuild)}). Jede Phrase endet auf einem Ton, der zu allen Akkorden passt${input.leadBuild.includes("+Auftakt") ? ", und kurze Auftakt-Töne führen in die nächste Phrase" : ""}. So schreibt AVAION seine Toplines.`,
      );
      break;
    case "brass-hook": {
      const tones = universalPcs(input.slots, key);
      out.push(
        tones.length >= 4 && leadPcs.every((pc) => tones.includes(pc))
          ? `Hook: kurzes Bläser-Motiv (${formText(input.leadBuild)}), nur aus den ${tones.length} Tönen, die über alle Akkorde passen (${tones.map(name).join(", ")}), wie der Lead im Drop von „WACUKA“. Darum kann es sich immer wiederholen.`
          : `Hook: kurzes Bläser-Motiv mit Antwort (${formText(input.leadBuild)}), wie der Lead im Drop von „WACUKA“.`,
      );
      break;
    }
    case "folk":
      out.push(`Riff: fünftönige (pentatonische) Melodie mit Wiederholung (${formText(input.leadBuild)}), wie BUNT.s frühe Folk-Hooks.`);
      break;
    case "loop": {
      const c = SCALE_COLOUR[input.leadScale ?? "natural"];
      const uses = !!c && key.mode === "minor" && leadPcs.includes(mod12(key.tonic + c[0]));
      out.push(`Melodie-Loop: ein kurzes Motiv (${formText(input.leadBuild)}), das sich wie ein Sample-Loop wiederholt${uses ? c[1] : ""}.`);
      break;
    }
    case "theme": {
      const c = SCALE_COLOUR[input.leadScale ?? "natural"];
      const uses = !!c && key.mode === "minor" && leadPcs.includes(mod12(key.tonic + c[0]));
      out.push(
        `Thema: lange Töne, meist in kleinen Schritten, oft mit einem Sprung nach oben am Anfang (${formText(input.leadBuild)})${uses ? c[1] : ""}. Das Motiv kommt verändert wieder, so wächst ein Filmthema.`,
      );
      break;
    }
  }

  const approach = input.bassRhythm.hits.some((h) => h.role === "A");
  if (variant.lanes.bass.mode === "808") {
    const glides = input.bassNotes?.some((n) => n.glide) ?? false;
    out.push(`Bass: eine 808, die mit jeder Kick einsetzt und bis zum nächsten Schlag klingt${glides ? ", manchmal gleitet sie in den nächsten Ton (Slide)" : ""}.`);
  } else {
    out.push(
      `Bass: ${input.bassRhythm.name}${approach ? ", mit Überleitungs-Tönen kurz vor jedem Akkordwechsel" : ""}${variant.lanes.bass.chromatic ? " (auch einen Halbton von unten, wie im Garage)" : ""}${input.bassPedal ? ". Er bleibt als Orgelpunkt auf dem Grundton liegen, während die Akkorde darüber wechseln" : ""}.`,
    );
  }
  if (input.pluckOrder === "pedal") {
    const perBar = input.pluckRhythm ? input.pluckRhythm.hits.length / input.pluckRhythm.bars : 8;
    out.push(
      `Ostinato: eine kurze Figur in ${perBar >= 12 ? "16teln" : "8teln"}, die immer wieder zu ihrem tiefsten Ton zurückkehrt. So treiben Streicher in der Filmmusik eine Szene an.`,
    );
  }
  if (input.keysYield) {
    out.push(
      `Begleitung: Die Akkorde spielen den gehaltenen Ton der Stimme nicht mit, so bleibt sie klar${style.id === "bunt" ? " („weniger klingt größer“)" : ""}.`,
    );
  }
  if (input.pluckAnswers) out.push("Pluck: tritt zurück, solange die Hook singt, und füllt ihre Pausen (Frage und Antwort).");
  const swing = Math.round(variant.drumSwing * 100);
  const pump = variant.mix.sidechain > 0.01 ? " Alles außer den Drums pumpt mit der Kick." : "";
  if (style.genre === "film") {
    out.push(
      input.drumHits
        ? `Trommeln: ${input.drumName ?? "große Trommeln"}. Nichts pumpt, dafür klingt alles wie in einem großen Saal.`
        : "Keine Drums: Die Begleitfigur und der Bass tragen den Puls, alles klingt wie in einem großen Saal.",
    );
  } else if (variant.lanes.bass.mode === "808") {
    out.push(
      `Groove: Half-Time, die Snare kommt auf die Drei${input.drumRolls ? ", und die Hi-Hats rollen in 32teln und Triolen" : ""}. Nichts pumpt, die 808 trägt den Bass allein.`,
    );
  } else {
    out.push(swing > 51 ? `Groove: Kick gerade, Hats und Percussion mit ${swing} % Swing.${pump}` : `Groove: gerade gespielt.${pump}`);
  }
  return out;
}
