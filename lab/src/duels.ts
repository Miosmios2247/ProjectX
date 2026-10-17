// Duels: the same idea in two versions (an older and a newer rule or sound),
// played blind. The rater picks the one that sounds more like the artist.

import type { IdeaFlags } from "../../engine/src/index";
import type { PlayerOptions } from "./audio";

export interface DuelArm {
  /** Short name, shown after the vote. */
  label: string;
  flags?: IdeaFlags;
  options?: Partial<PlayerOptions>;
}

export interface Duel {
  id: string;
  /** What is compared, shown in the results. */
  title: string;
  /** Variants it applies to: "style" or "style/variant". */
  for: string[] | "all";
  /** a = the newer version, b = the older one. */
  a: DuelArm;
  b: DuelArm;
}

export const DUELS: Duel[] = [
  {
    id: "klang-r5",
    title: "Klänge aus Runde 5 gegen Runde 4",
    for: "all",
    a: { label: "neue Klänge (Runde 5)", options: { soundSet: "v5" } },
    b: { label: "alte Klänge (Runde 4)", options: { soundSet: "v4" } },
  },
  {
    id: "bunt-vokal",
    title: "BUNT.: Vokal bleibt auf einem Ton gegen Vokal folgt den Akkorden",
    for: ["bunt/stutter", "bunt/dnb"],
    a: { label: "Vokal bleibt auf einem Ton", flags: { vowel: "pedal" } },
    b: { label: "Vokal folgt den Akkorden", flags: { vowel: "path" } },
  },
  {
    id: "bunt-koernung",
    title: "BUNT.: körnig gedehnter Vokal gegen glatten Vokal",
    for: ["bunt/stutter", "bunt/dnb"],
    a: { label: "körnig gedehnt", options: { grain: true } },
    b: { label: "glatt", options: { grain: false } },
  },
  {
    id: "avaion-auftakt",
    title: "AVAION: Topline mit Auftakten gegen ohne",
    for: ["avaion/pieces", "avaion/liquid"],
    a: { label: "mit Auftakten", flags: { pickups: "on" } },
    b: { label: "ohne Auftakte", flags: { pickups: "off" } },
  },
  {
    id: "fred-chops",
    title: "Fred again..: Chops auf festen Tönen gegen Chops, die den Akkorden folgen",
    for: ["fred-again"],
    a: { label: "feste Töne", flags: { chops: "fixed" } },
    b: { label: "folgen den Akkorden", flags: { chops: "chords" } },
  },
];

export function duelsFor(styleId: string, variantId: string): Duel[] {
  return DUELS.filter((d) => d.for === "all" || d.for.includes(styleId) || d.for.includes(`${styleId}/${variantId}`));
}
