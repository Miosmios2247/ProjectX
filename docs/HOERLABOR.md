# Hör-Labor – Runde 4

Das Hör-Labor ist der Prototyp aus Phase 1 (siehe [PLAN.md](PLAN.md)). Hier prüfen wir, ob das
Musik-Gehirn wirklich nach den Künstlern klingt, bevor das VST3-Plugin gebaut wird.

**Link (privat, nur für dich):** https://claude.ai/artifact/RURpPL3bJpJN2EnmkPDcWm

## Neu in Runde 4: mehr Musik-Gehirn

Rückmeldung aus Runde 3: „Kannst du machen, dass das noch mehr nach den Künstlern klingt? Das
Programm braucht mehr Musik-Gehirn.“ Dafür gab es eine zweite Recherche zu Hooks, Basslines,
Akkord-Griffen und Handwerksregeln aus Tutorials
([Notizen](../research_notes/Hooks%20Bass%20und%20Voicings/)). Daraus wurde:

- **Ein Musik-Kritiker sucht die beste Melodie aus.** Für jede Idee entstehen zehn Melodien. Der
  Kritiker prüft, wie gut jede zum Künstler passt: Tonumfang, Zahl der Töne, Schritte statt
  Sprünge, Wiederholung und welche Töne auf den Schlägen liegen. Die beste bleibt.
- **Melodien in Frage und Antwort.** Phrasen folgen Formen wie A B A B'. Eine Frage endet offen,
  die Antwort kommt nach Hause. Nach einem großen Sprung geht die Melodie meist zur Mitte zurück.
- **Fred again..:** Die Vocal-Chops bleiben auf 2–5 festen Tönen, und die Akkorde darunter
  färben sie um. So sind seine Hooks gebaut. Die Keys halten oben einen Ton fest. Im Song-Modus
  singt die Stimme in Intro und Breakdown „roh“ statt gechoppt, im letzten Drop eine Oktave höher.
- **BUNT.:** Der gedehnte Vokal bleibt auf einem Ton, der über jeden Akkord der Folge passt, meist
  auf dem Grundton. So kann die Stimme wie in „Clouds“ den ganzen Loop über stehen bleiben.
  Manchmal sind es zwei Silben wie „ea-sy“. Das Stottern ist jetzt ein Lautstärke-Gate auf einem
  durchklingenden Vokal, wie mit ShaperBox oder LFO Tool, dazu ein neues Gate im 3+3+2-Rhythmus.
  Im Song-Modus beginnt der Vokal gehalten und ohne Stottern, und im Break pumpt die Kick weiter.
- **AVAION:** Jede Phrase der Topline endet auf einem Ton, der zu allen Akkorden passt. Manchmal
  führen ein bis drei Auftakt-Töne in die nächste Phrase. Der WACUKA-Hook besteht nur aus den fünf
  Tönen, die über alle Akkorde passen, und wiederholt sich mit neuem Ende. Im Song-Modus singt vor
  dem Drop bei Pieces und Liquid ein Stimmen-Satz aus drei Stimmen (nicht mit deiner eigenen
  Stimme, die singt allein).
- **Zusammenspiel:** Akkorde kommen manchmal eine Achtel zu früh (Push). Der Bass leitet mit einem
  Überleitungs-Ton zum nächsten Akkord. Der Pluck tritt zurück, solange die Hook singt. Die
  Akkorde spielen den gehaltenen Ton der Stimme nicht mit, damit sie klar bleibt.
- **„Warum klingt das so?“:** Ein neuer Kasten erklärt in einfachen Worten, was eine Idee nach
  dem Künstler klingen lässt, zum Beispiel welcher Song dieselbe Akkordfolge hat.

Wie es weitergeht, bis jeder Künstler mindestens 4 von 5 erreicht: [PLAN-4-VON-5.md](PLAN-4-VON-5.md).

## Seit Runde 3 dabei

- **Song-Modus:** Umschalter „Ablauf: Loop | Song“. Im Song-Modus läuft die Idee durch den
  typischen Aufbau des Künstlers, zum Beispiel bei BUNT. Hook → Aufbau → Drop → Break → Aufbau
  → Drop. Im Aufbau fällt die Kick weg, ein Trommelwirbel wird schneller (Viertel → Achtel →
  16tel → 32tel), ein Rausch-Riser steigt und der Filter öffnet sich; der Drop kommt mit Crash.
  Die Song-Leiste über den Spuren zeigt, wo du gerade bist. Der Blindtest bleibt beim Loop.
- **Deine Stimme als Hook:** Im Kasten „Deine Stimme als Hook“ eine Sprachmemo oder ein paar
  gesungene Wörter laden (oder direkt aufnehmen, wenn der Browser das Mikrofon erlaubt). Das
  Hör-Labor erkennt Silben, Tonhöhen und einen gehaltenen Vokal:
  - **Fred again..:** deine Silben werden zu Vocal-Chops, jede Note immer dieselbe Silbe.
  - **BUNT.:** dein gehaltener Vokal wird gedehnt und im 16tel-Gate gestottert.
  - **AVAION (Pieces, Liquid):** deine Stimme singt die Topline.
  Die Aufnahme bleibt in deinem Browser und ist nach dem Neuladen noch da. Tipp: Sprich oder
  sing nah am Handy-Mikrofon, ein langer Vokal („jeeeaah“, „ooooh“) hilft BUNT. und AVAION.

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
- **Für BUNT. und AVAION gibt es keine Noten-Abschriften.** Ihre Melodie-Regeln sind aus den
  bekannten Akkordfolgen berechnet (welche Töne über alle Akkorde passen) oder stammen aus
  Tutorials. Bei Fred again.. gibt es Hooktheory-Daten, deshalb sind seine Regeln genauer.

## So machst du den Hörtest

1. **Vergleichen:** Variante wählen und **Play** drücken. Dann einen der angezeigten
   Vorbild-Tracks anhören und zurückwechseln.
2. **Bewerten:** 1–5 für „Wie sehr klingt das nach …?“. Optional antippen, was nicht passt
   (Akkorde, Bass, Lead, Pluck, Drums, Groove/Tempo, Sounds), und eine kurze Notiz schreiben.
   Besonders hilfreich: „Akkorde passen, aber der Sound nicht“ oder umgekehrt.
3. **Würfel pro Spur:** würfelt nur diese Spur neu. Neue Akkorde passen alle anderen Spuren an.
   Unter „Warum klingt das so?“ steht, was die neue Idee ausmacht.
4. **Blindtest:** Ein Loop läuft ohne Namen, du tippst auf den Künstler. Mit „Neutral“ klingen
   alle Stile gleich, dann zählen nur Akkorde, Melodie und Rhythmus.
5. **MIDI (ZIP):** lädt alle Spuren als `.mid` in einer ZIP-Datei. Entpacken und die Dateien in
   FL Studio ziehen.

Tastatur: Leertaste = Play/Stopp, N = neue Idee, 1–5 = Bewertung.

**Gut für Runde 4:** pro Variante 3–5 Bewertungen, gern im Song-Modus, dazu 15–20
Blindtest-Runden. Achte besonders auf die Hook: Wirkt sie zu starr, zu unruhig oder genau richtig?
Ein Wort dazu in der Notiz hilft sehr.
Das Ziel für Phase 1 bleibt: die meisten Loops ≥ 4/5 und ≥ 60 % Treffer im Blindtest.

## Was in den Stilen drinsteckt

| Künstler | Variante | Tempo | Akkordfolgen (Moll-Sicht) | Hook | Zum Vergleich |
|---|---|---|---|---|---|
| Fred again.. | Emotional House | 123–130 | VImaj7–VII–i–III, VImaj7–i7–v7–IIImaj7 | Vocal-Slices auf 2–5 festen Tönen | Marea, adore u, ten, Kyle, Danielle |
| Fred again.. | Garage / Speed Garage | 130–135 | VImaj7–i7–v7, iv–i–VI, i7 | Vocal-Slices, Reese-Bass, rollende 16tel | Delilah, Jungle, Turn On The Lights again.., Kammy |
| Fred again.. | Drum & Bass | 172–176 | iv–i–VI | Vocal-Slices | leavemealone, places to be |
| AVAION | Pieces-Ära | 120–124 | I–V–ii–IV (Dur), VImaj7–i–VII–iv | gesungene Topline, Nylon-Gitarre | Pieces, When You Go, Sleepless |
| AVAION | Afro House (WACUKA) | 128–131 | VI–VII–iv–i | Trompeten-Synth aus den 5 passenden Tönen, Congas 3 gegen 4 | WACUKA |
| AVAION | Liquid / UKG 2024–26 | 130–133 | VImaj7–i7–VII–iv7, I–V–ii–IV | gesungene Topline, 2-Step | NEED ME, Other Side, ifidiewouldyoucry |
| BUNT. | Stutter House | 127–133 | VI–i, VI–VII–i–VII, VI–iv–i | gedehnter Vokal auf dem Grundton, 1/16-Gate | Clouds, Spaces, Moment, Lost My Mind |
| BUNT. | Drum & Bass | 172–176 | ii–IV–I–I (Dur) | gedehnter Vokal mit Gate | TRIPPIN |
| BUNT. | Folk-House (früh) | 124–127 | vi–IV–I–I (Dur) | Mundharmonika oder Bläser, Gitarre | Old Guitar, Unbreakable, Coming Home, Harmonica |

Bewertungen aus früheren Runden bleiben gespeichert. Runde 2 ist an der Version `0.2.0`
erkennbar, Runde 3 an `0.3.0` und Runde 4 an `0.4.0`. Seit Runde 3 steht dort auch, ob du im
Song-Modus und mit eigener Stimme bewertet hast.

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
  Spuren-Generatoren, Musik-Kritiker (`critic.ts`), Musik-TÜV, Erklärungen (`explain.ts`),
  MIDI- und ZIP-Export
- `data/` – Stil-Profile und Rhythmus-Bibliothek als JSON
- `lab/` – die Hör-Labor-Seite (UI, Tone.js-Klänge, Speicher); `lab/samples/` enthält die
  Samples, die neben der Seite veröffentlicht werden (Lizenzen in `lab/samples/LICENSES.md`);
  `lab/src/voice-analysis.ts` erkennt Silben und Tonhöhe der eigenen Stimme,
  `lab/src/phrasing.ts` phrasiert die Stimme im Song-Modus (Tests in `lab/test/`)
