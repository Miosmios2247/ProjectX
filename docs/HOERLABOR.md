# Hör-Labor – Runde 1

Das Hör-Labor ist der Prototyp aus Phase 1 (siehe [PLAN.md](PLAN.md)): Hier prüfen wir, ob das
Musik-Gehirn wirklich nach den Künstlern klingt, bevor das VST3-Plugin gebaut wird.

**Link (privat, nur für dich):** https://claude.ai/artifact/RURpPL3bJpJN2EnmkPDcWm

## So machst du den Hörtest

1. **Entdecken:** Künstler und Variante wählen, **Play** drücken, zuhören.
2. **Bewerten:** 1–5 für „Wie sehr klingt das nach …?“. Optional antippen, was nicht passt
   (Akkorde, Bass, Lead, Pluck, Drums, Groove/Tempo, Sounds), und eine kurze Notiz schreiben.
   „Speichern & nächste Idee“ geht direkt weiter.
3. **Würfel pro Spur:** würfelt nur diese Spur neu. Neue Akkorde passen alle anderen Spuren an.
4. **Blindtest:** Ein Loop läuft ohne Namen, du tippst auf den Künstler. Mit „Neutral“ klingen
   alle Stile gleich, dann zählen nur Akkorde, Melodie und Rhythmus.
5. **MIDI (ZIP):** lädt alle Spuren als `.mid` in einer ZIP-Datei. Entpacken und die Dateien in
   FL Studio ziehen; mit deinen eigenen Sounds hörst du den echten Eindruck.

Tastatur: Leertaste = Play/Stopp, N = neue Idee, 1–5 = Bewertung.

**Gut für die erste Runde:** pro Variante 5–10 Bewertungen und 15–20 Blindtest-Runden.
Das Ziel für Phase 1 sind die meisten Loops ≥ 4/5 und ≥ 60 % Treffer im Blindtest.

## Was in Runde 1 drinsteckt

| Künstler | Varianten | Typische Merkmale im Profil (Hypothesen) |
|---|---|---|
| Fred again.. | Emotional House, UKG / 2-Step | lange gepumpte Piano-/Pad-Akkorde, Vocal-Chops aus wenigen Tönen, Sub-Bass; im UKG Shuffle und Orgel-Stabs |
| AVAION | Melodic House, Afro House, Liquid UKG | melancholische Moll-Loops mit add9-Farben, Plucks, singbare Topline; Afro mit Marimba und Percussion |
| BUNT. | Folk-House, Deep / Stutter House | Dur-Hymnen mit Gitarren-Strumming und Pentatonik-Riffs; Deep mit Moll-7er-Stabs und gestotterten Chops |

Die Klänge werden im Browser synthetisiert (Tone.js). Sie sind bewusst einfach: Bewertet wird
vor allem, ob Harmonie, Melodie und Rhythmus den Stil treffen.

## Was mit den Bewertungen passiert

Jede Bewertung speichert die Idee vollständig (Stil, Tonart, Tempo, Seeds, Rhythmen, Sounds) in
der Datenbank des Hör-Labors. Claude liest sie aus, erzeugt dieselben Ideen exakt nach und passt
die Stil-Profile in `data/styles/` und die Rhythmen in `data/rhythms/` an. Danach kommt Runde 2.

## Für Entwickler

```bash
npm install
npm test              # Theorie, Voicings, Ideen, MIDI/ZIP
npm run build:lab     # baut lab/dist/hoer-labor.html (eine Datei)
npm run idea -- --style avaion --variant afro-house --seed 7 --bars 8 --zip /tmp/idee.zip
```

- `engine/` – Musik-Gehirn (TypeScript, ohne Abhängigkeiten): Theorie, Voicings, Akkordfolgen,
  Spuren-Generatoren, Musik-TÜV, MIDI- und ZIP-Export
- `data/` – Stil-Profile und Rhythmus-Bibliothek als JSON
- `lab/` – die Hör-Labor-Seite (UI, Tone.js-Klänge, Speicher)
