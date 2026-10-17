// Plain-language reasons why an idea sounds like the artist ("Warum klingt
// das so?"), for people without music theory.

import { ProgressionTemplate } from "./progression";
import { Rhythm } from "./rhythm";
import { LeadMode, Note, StyleProfile, StyleVariant } from "./types";

const FORM_TEXT: Record<string, string> = {
  "A B": "Frage und Antwort",
  "A A'": "Motiv und Motiv mit neuem Ende",
  "A B A B'": "Frage, Antwort, Frage, neue Antwort",
  "A A' A B": "Motiv, Motiv mit neuem Ende, Motiv, Antwort",
  "A B A C": "Frage, Antwort, Frage, andere Antwort",
  "A A A A'": "dasselbe Motiv dreimal, dann mit neuem Ende",
  "A A B A'": "Motiv zweimal, ein Kontrast, dann das Motiv mit neuem Ende",
};

function formText(form: string): string {
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
  pluckAnswers: boolean;
}): string[] {
  const { style, variant, template } = input;
  const out: string[] = [];

  const degrees = (template.sourceDegrees ?? template.degrees).join(" – ");
  const like = template.like ? `, dasselbe Muster wie in ${template.like}` : "";
  out.push(`Akkorde ${input.chordNames} (Stufen ${degrees})${like}. ${style.harmonyNote}`);
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
      out.push(
        `Hook: ein gedehnter Vokal, der im 16tel-Takt stottert, auf nur ${pitches} ${pitches === 1 ? "Ton" : "Tönen"}. Er bleibt auf Tönen, die die Akkorde gemeinsam haben, wie die Stimme in „Clouds“.`,
      );
      break;
    case "topline":
      out.push(`Melodie: singbare Phrasen, meist in kleinen Schritten (${formText(input.leadBuild)}). So schreibt AVAION seine Toplines.`);
      break;
    case "brass-hook":
      out.push(`Hook: kurzes Bläser-Motiv mit Antwort (${formText(input.leadBuild)}), wie der Lead im Drop von „WACUKA“.`);
      break;
    case "folk":
      out.push(`Riff: fünftönige (pentatonische) Melodie mit Wiederholung (${formText(input.leadBuild)}), wie BUNT.s frühe Folk-Hooks.`);
      break;
  }

  const approach = input.bassRhythm.hits.some((h) => h.role === "A");
  out.push(
    `Bass: ${input.bassRhythm.name}${approach ? ", mit Überleitungs-Tönen kurz vor jedem Akkordwechsel" : ""}${variant.lanes.bass.chromatic ? " (auch einen Halbton von unten, wie im Garage)" : ""}.`,
  );
  if (input.pluckAnswers) out.push("Pluck: tritt zurück, solange die Hook singt, und füllt ihre Pausen (Frage und Antwort).");
  const swing = Math.round(variant.drumSwing * 100);
  out.push(
    swing > 51
      ? `Groove: Kick gerade, Hats und Percussion mit ${swing} % Swing. Alles außer den Drums pumpt mit der Kick.`
      : "Groove: gerade gespielt. Alles außer den Drums pumpt mit der Kick.",
  );
  return out;
}
