# Hör-Labor – Runde 2

Das Hör-Labor ist der Prototyp aus Phase 1 (siehe [PLAN.md](PLAN.md)). Hier prüfen wir, ob das
Musik-Gehirn wirklich nach den Künstlern klingt, bevor das VST3-Plugin gebaut wird.

**Link (privat, nur für dich):** https://claude.ai/artifact/RURpPL3bJpJN2EnmkPDcWm

## Was sich seit Runde 1 geändert hat

Rückmeldung aus Runde 1: „Keiner der Künstler klingt nach dem Künstler.“ Deshalb gab es eine
gründliche Stil-Recherche mit Quellen:
[Stilanalyse Fred again AVAION BUNT](../reports/Stilanalyse%20Fred%20again%20AVAION%20BUNT.md).
Daraus wurden alle Stil-Profile neu gebaut:

- **Richtige Tempi und Akkordfolgen pro Ära**, z. B. Fred again.. auf VImaj7–VII–i („Marea“),
  BUNT. mit nur VI–i („Clouds“), AVAION mit I–V–ii–IV („Pieces“). Keine Dominant-Septakkorde
  und keine V→I-Schlüsse mehr, weil keiner der drei sie benutzt.
- **Der Hook sitzt jetzt dort, wo er bei den Künstlern sitzt:** Vocal-Slices bei Fred again..,
  ein gedehnter Vokal mit 1/16-Gate bei BUNT., eine gesungene Topline bei AVAION und bei
  „WACUKA“ der Trompeten-Synth.
- **Echte Samples statt Synthesizer-Ersatz:** Flügel, E-Piano, Streicher, Akustik- und
  Nylon-Gitarre, Trompete, Mundharmonika, Chor-Stimmen und Percussion (Congas, Shaker, Toms).
- **Groove wie in den Tutorials:** Die Kick bleibt gerade, nur Hats und Percussion swingen.
  Alles außer den Drums pumpt mit der Kick, auch der Hall. Bei BUNT. stottert das Piano im
  16tel-Gate, und unter den meisten Varianten von Fred again.. und BUNT. liegt leises Rauschen.
- **Vorbild-Tracks in der App:** Zu jeder Variante steht, welche Songs du zum Vergleich
  anhören kannst.

## Ehrliche Grenzen

- **Keine echten Stimmen.** Die Recherche zeigt: Ein großer Teil der Wiedererkennung steckt in
  der Stimme selbst (Freds Handy-Aufnahmen, BUNT.s geliehene Zeilen, AVAIONs Gesang). Diese
  Aufnahmen dürfen und können wir nicht nachbauen. Im Hör-Labor singen deshalb Chor-Samples
  („ah“, „uh“) als Platzhalter.
- **Das eigentliche Produkt ist MIDI.** Mit deinen eigenen Sounds und Vocal-Samples in FL Studio
  klingt eine Idee näher am Original als im Browser.
- **Drum-Raster sind Startwerte.** Für keinen der drei gibt es genaue Drum-Transkriptionen.
  Die Muster stammen aus Genre-Regeln und Tutorials, deine Bewertung kalibriert sie.

## So machst du den Hörtest

1. **Vergleichen:** Variante wählen und **Play** drücken. Dann einen der angezeigten
   Vorbild-Tracks anhören und zurückwechseln.
2. **Bewerten:** 1–5 für „Wie sehr klingt das nach …?“. Optional antippen, was nicht passt
   (Akkorde, Bass, Lead, Pluck, Drums, Groove/Tempo, Sounds), und eine kurze Notiz schreiben.
   Besonders hilfreich: „Akkorde passen, aber der Sound nicht“ oder umgekehrt.
3. **Würfel pro Spur:** würfelt nur diese Spur neu. Neue Akkorde passen alle anderen Spuren an.
4. **Blindtest:** Ein Loop läuft ohne Namen, du tippst auf den Künstler. Mit „Neutral“ klingen
   alle Stile gleich, dann zählen nur Akkorde, Melodie und Rhythmus.
5. **MIDI (ZIP):** lädt alle Spuren als `.mid` in einer ZIP-Datei. Entpacken und die Dateien in
   FL Studio ziehen.

Tastatur: Leertaste = Play/Stopp, N = neue Idee, 1–5 = Bewertung.

**Gut für Runde 2:** pro Variante 3–5 Bewertungen und 15–20 Blindtest-Runden.
Das Ziel für Phase 1 bleibt: die meisten Loops ≥ 4/5 und ≥ 60 % Treffer im Blindtest.

## Was in Runde 2 drinsteckt

| Künstler | Variante | Tempo | Akkordfolgen (Moll-Sicht) | Hook | Zum Vergleich |
|---|---|---|---|---|---|
| Fred again.. | Emotional House | 123–130 | VImaj7–VII–i–III, VImaj7–i7–v7–IIImaj7 | Vocal-Slices | Marea, adore u, ten, Kyle, Danielle |
| Fred again.. | Garage / Speed Garage | 130–135 | VImaj7–i7–v7, iv–i–VI, i7 | Vocal-Slices, Reese-Bass | Delilah, Jungle, Turn On The Lights again.., Kammy |
| Fred again.. | Drum & Bass | 172–176 | iv–i–VI | Vocal-Slices | leavemealone, places to be |
| AVAION | Pieces-Ära | 120–124 | I–V–ii–IV (Dur), VImaj7–i–VII–iv | gesungene Topline, Nylon-Gitarre | Pieces, When You Go, Sleepless |
| AVAION | Afro House (WACUKA) | 128–131 | VI–VII–iv–i | Trompeten-Synth, Congas 3 gegen 4 | WACUKA |
| AVAION | Liquid / UKG 2024–26 | 130–133 | VImaj7–i7–VII–iv7, I–V–ii–IV | gesungene Topline, 2-Step | NEED ME, Other Side, ifidiewouldyoucry |
| BUNT. | Stutter House | 127–133 | VI–i, VI–VII–i–VII, VI–iv–i | gedehnter Vokal mit 1/16-Gate | Clouds, Spaces, Moment, Lost My Mind |
| BUNT. | Drum & Bass | 172–176 | ii–IV–I–I (Dur) | gedehnter Vokal mit Gate | TRIPPIN |
| BUNT. | Folk-House (früh) | 124–127 | vi–IV–I–I (Dur) | Mundharmonika oder Bläser, Gitarre | Old Guitar, Unbreakable, Coming Home, Harmonica |

Bewertungen aus Runde 1 bleiben gespeichert. Runde 2 ist an der Version `0.2.0` erkennbar.

## Was mit den Bewertungen passiert

Jede Bewertung speichert die Idee vollständig (Stil, Tonart, Tempo, Seeds, Rhythmen, Sounds) in
der Datenbank des Hör-Labors. Claude liest sie aus, erzeugt dieselben Ideen exakt nach und passt
die Stil-Profile in `data/styles/` und die Rhythmen in `data/rhythms/` an.

## Für Entwickler

```bash
npm install
npm test              # Theorie, Voicings, Ideen, MIDI/ZIP
npm run build:lab     # baut lab/dist/hoer-labor.html (eine Datei)
npm run idea -- --style avaion --variant wacuka --seed 7 --bars 8 --zip /tmp/idee.zip
```

- `engine/` – Musik-Gehirn (TypeScript, ohne Abhängigkeiten): Theorie, Voicings, Akkordfolgen,
  Spuren-Generatoren, Musik-TÜV, MIDI- und ZIP-Export
- `data/` – Stil-Profile und Rhythmus-Bibliothek als JSON
- `lab/` – die Hör-Labor-Seite (UI, Tone.js-Klänge, Speicher); `lab/samples/` enthält die
  Samples, die neben der Seite veröffentlicht werden (Lizenzen in `lab/samples/LICENSES.md`)
