# ProjectX – Planung: Stil-Generator-Plugin (VST3)

> **Status:** v0.2 · Phase 1 läuft: Das Hör-Labor (Runde 1) ist online, siehe [HOERLABOR.md](HOERLABOR.md) · Stand 17.10.2026
> Wir planen gemeinsam weiter. Was noch zu entscheiden ist, steht in [Abschnitt 11](#11-offene-entscheidungen).

## 1. Vision

Ein VST3-Plugin für FL Studio (und andere DAWs), mit dem **jeder, auch ganz ohne Musiktheorie,**
in Sekunden komplette, zusammenpassende Ideen im Stil seiner Lieblingskünstler bekommt:
Chords, Bass, Lead und Plucks, dazu sehr viele Rhythmen, die man auf jede Spur legen kann.

**Was anders sein soll als bei Scaler 3:** Scaler ist ein mächtiger Werkzeugkasten, aber man muss
wissen, was man sucht. ProjectX dreht das um:

1. **Ergebnis statt Werkzeug:** Ein Klick liefert eine komplette Idee, in der alle Spuren zusammenpassen. Feinschliff ist optional.
2. **Stil statt Theorie:** Du wählst Künstler und Key, nicht „Dorisch" oder „maj9". Die Theorie arbeitet unsichtbar im Hintergrund (eine Profi-Ansicht kommt später optional dazu).
3. **Rhythmus als Pinsel:** Jeder Rhythmus lässt sich auf jede Spur legen.
4. **Wissen wächst als Daten:** Neue Künstler und Rhythmen sind Dateien, kein neuer Code. So kann die Bibliothek wirklich „massiv" werden.
5. **Nichts geht verloren:** Jede Idee hat eine Ideen-Nummer (Seed), mit Verlauf und Favoriten.

## 2. So fühlt es sich an

1. Plugin in FL Studio in den Channel Rack laden. Das Tempo kommt automatisch aus FL.
2. **Key** wählen (z. B. „A-Moll"), oder „passend zum Künstler".
3. **Künstler** anklicken: *Fred again..*, *AVAION*, *BUNT.*
4. **Generieren:** 4 oder 8 Takte mit Chords, Bass, Lead und Pluck. Die Idee spielt sofort mit eingebauten Sounds, synchron zu FL.
5. Pro Spur: **Sperren** (behalten), **Neu würfeln**, **Rhythmus** wechseln, Oktave, Stumm.
6. **Drag & Drop:** einzelne Spuren oder alles als MIDI in Playlist oder Piano Roll ziehen und mit deinen Synths (Serum, Vital, Sylenth …) weiterarbeiten.

**Grobe UI-Skizze:**

```
 KEY [A-Moll v]     LÄNGE [8 Takte v]     TEMPO 128 BPM (aus FL Studio)
 -------------------------------------------------------------------------
 KÜNSTLER   (Fred again..)   (AVAION)   (BUNT.)   (+ mehr)
 -------------------------------------------------------------------------
 CHORDS  Am9 | Fmaj7 | C(add9) | G   [Sperren] [Neu] [Rhythmus v] [MIDI]
 BASS    x..x..x.x..x..x.            [Sperren] [Neu] [Rhythmus v] [MIDI]
 LEAD    xx.x...xx.x.....            [Sperren] [Neu] [Rhythmus v] [MIDI]
 PLUCK   xxxxxxxxxxxxxxxx            [Sperren] [Neu] [Rhythmus v] [MIDI]
 -------------------------------------------------------------------------
          [ GENERIEREN ]     [ Variation ]     [ Alles als MIDI ziehen ]
```

## 3. Das „Musik-Gehirn"

### 3.1 Drei Schichten

| Schicht | Was sie weiß | Beispiel |
|---|---|---|
| **1. Theorie-Kern** (gilt immer) | Noten, Skalen und Modi, Akkorde bis zur 13, Funktionen, Stimmführung, Lagen | „In A-Moll ist F-Dur die VI. Stufe." · „Terzen unter ca. C3 klingen matschig." |
| **2. Stil-Profile** (Daten pro Künstler) | Vorlieben als Wahrscheinlichkeiten | „Stil X: oft add9-Akkorde, meist 1 Akkord pro Takt, 120–124 BPM" |
| **3. Generatoren** (pro Spur) | bauen aus 1 + 2 + Zufall (Seed) konkrete Noten | Chords, Bass, Lead, Pluck, später Pad usw. |

### 3.2 Ablauf einer Generierung

```
 Key + Künstler (+ Seed)
   |
   v
 Harmonie -> Voicing -> CHORDS
   |
   +-> BASS    Grundtöne/Umkehrungen + Bass-Rhythmus
   +-> LEAD    Motiv: Akkordtöne auf betonten Zählzeiten, Skalentöne dazwischen
   +-> PLUCK   Akkordtöne als Muster (auf/ab/...)
   |
   v
 Groove (Swing, Timing, Velocity) -> Musik-TÜV -> fertige Noten
```

1. **Harmonie:** Die Progression kommt aus gewichteten Vorlagen und Übergangswahrscheinlichkeiten des Stils. Dazu kommt die Stil-Farbe: Erweiterungen (add9, 7, sus2 …), geliehene Akkorde, Umkehrungen, Orgelpunkt, und der harmonische Rhythmus (z. B. ein Akkord pro Takt).
2. **Voicing:** Lage, eng oder weit, möglichst kleine Bewegungen zwischen den Akkorden und eine schöne Oberstimme.
3. **Bass:** folgt den Grundtönen oder Umkehrungen. Der Bass-Rhythmus kann Rollen vorgeben (Grundton, Oktave, Quinte, Durchgangston).
4. **Lead:** ein kurzes Motiv (1–2 Takte) aus dem Rhythmus-Vokabular des Stils, das wiederholt und variiert wird (Frage–Antwort, AABA).
5. **Pluck/Arp:** Akkordtöne über ein Muster, mit stiltypischer Dichte und Notenlänge.
6. **Groove:** Swing, Mikro-Timing und Velocity-Akzente pro Stil.
7. **Musik-TÜV:** prüft die Spuren gegeneinander. Keine Reibungen auf betonten Zählzeiten, saubere Lagentrennung (Bass < Chords < Lead), und nicht alle Spuren gleichzeitig „busy".

### 3.3 Was ein Stil-Profil enthält

| Bereich | Beispiele |
|---|---|
| Tempo & Groove | BPM-Bereich, Swing, Feel (Four-on-the-floor, 2-Step, Breakbeat, Half-Time) |
| Harmonie | bevorzugte Modi, typische Progressionen mit Gewichten, Akkordfarben (add9, m7, maj7, sus), geliehene Akkorde, Loop-Länge |
| Harmonischer Rhythmus | Akkordwechsel pro Takt, Haltedauer |
| Voicing | Lage, Anzahl Stimmen, eng/weit, Bewegung der Oberstimme |
| Chords-Rhythmus | gehalten (Pad), Stabs oder Pattern; Sidechain-Gefühl |
| Bass | Sub gehalten, Offbeat, synkopiert (UKG), Oktavsprünge; Lage |
| Lead | Tonumfang, Schritte oder Sprünge, Motivlänge, Wiederholungsgrad, „Vocal-Chop"-Modus |
| Pluck/Arp | Muster, Dichte, Oktavbereich, Notenlänge |
| Klang-Tipps | z. B. „warmes Piano, Pad mit Sidechain, viel Hall", für die eingebauten Sounds und als Tipp für deine Synths |
| Varianten | ein Künstler kann mehrere Phasen haben (siehe 3.4) |

### 3.4 Erste Hypothesen zu den drei Künstlern

> Das sind nur Startpunkte. In Phase 0 prüfen wir sie an echten Tracks.

- **Fred again..:** emotionale Loops aus wenigen Akkorden, Piano und Pads mit starkem Sidechain-Pumpen. Der Groove liegt zwischen House, UK Garage/2-Step und Breakbeat. Prägend sind gechoppte, wiederholte, „stotternde" Vocal-Phrasen. Daraus folgt: ein Lead-Modus „Vocal-Chop" (kurze, wiederholte Töne aus wenigen Tonhöhen), Chords meist gehalten und gepumpt.
- **AVAION:** melodischer, emotionaler House mit Pop-Einschlag. Die Spannweite reicht von Deep House/Electro-Pop („COLORS") über Liquid UKG („NEED ME") bis Afro House („WACUKA" mit Sofiya Nzau). Daraus folgen wahrscheinlich 2–3 Varianten.
- **BUNT.:** früher Festival- und Folk-House mit akustischen Instrumenten (Gitarre, Mundharmonika), seit ca. 2022 eher Deep/Stutter House (z. B. „Clouds" feat. Nate Traveller). Daraus folgen die Varianten „Folk-House" und „Deep/Stutter".

**Erkenntnis:** Künstler haben Phasen. Das Profil-System unterstützt deshalb von Anfang an mehrere Varianten pro Künstler.

### 3.5 Beispiel: ein Stil-Profil als Datei

So ein Profil liest und bearbeitet man wie eine Einstellungsliste. Die Werte unten sind Platzhalter; die echten kommen aus der Analyse.

```json
{
  "id": "beispiel-emotional-house",
  "artist": "Beispiel",
  "variant": "Emotional House",
  "tempo": { "min": 122, "max": 128 },
  "groove": { "feel": "four_on_the_floor", "swing": 0.55 },
  "harmony": {
    "modes": { "minor": 0.7, "major": 0.3 },
    "progressions": [
      { "mode": "minor", "degrees": ["i", "VI", "III", "VII"], "weight": 3 },
      { "mode": "minor", "degrees": ["i", "iv", "VI", "v"], "weight": 1 },
      { "mode": "major", "degrees": ["I", "V", "vi", "IV"], "weight": 2 }
    ],
    "colors": { "add9": 0.4, "m7": 0.3, "maj7": 0.2, "sus2": 0.1 },
    "chordsPerBar": 1
  },
  "voicing": { "low": "C3", "high": "C5", "voices": 4, "spread": "close" },
  "lanes": {
    "chords": { "rhythms": ["sustain-pump", "offbeat-stab"] },
    "bass":   { "rhythms": ["sub-hold", "house-offbeat"], "low": "E1", "high": "E2" },
    "lead":   { "mode": "vocal-chop", "motifBars": 1, "repeat": 0.7 },
    "pluck":  { "pattern": "up-down", "rate": "1/16" }
  },
  "soundHints": ["warmes Piano", "Pad mit Sidechain", "viel Hall"]
}
```

### 3.6 Und wo ist die „KI"?

Das Musik-Gehirn ist ein wissensbasiertes System mit Wahrscheinlichkeiten. Es ist gezielt steuerbar,
läuft offline, ist schnell und rechtlich sauber, weil nichts auf fremden Songs trainiert wird.
Ein trainiertes KI-Modell würde am Anfang mehr Probleme bringen (Trainingsdaten, Rechte, Kontrolle)
als es löst. **Später möglich:** KI hilft beim Erstellen neuer Stil-Profile, oder das Plugin lernt
deinen eigenen Stil aus deinen MIDI-Clips.

## 4. Rhythmus-System

**Grundidee:** Ein Rhythmus legt nur fest, wann, wie lang und wie laut gespielt wird. Welche Töne
darauf liegen, entscheidet die Spur. Dadurch passt jeder Rhythmus auf jede Spur.

```json
{
  "id": "2step-stabs-01",
  "name": "2-Step Stabs",
  "tags": ["ukg", "2-step", "chords", "energie-mittel"],
  "bars": 1,
  "grid": "1/16",
  "swing": 0.6,
  "hits": [
    { "step": 0,  "len": 2, "vel": 110 },
    { "step": 3,  "len": 1, "vel": 80 },
    { "step": 6,  "len": 2, "vel": 100 },
    { "step": 10, "len": 1, "vel": 85 },
    { "step": 11, "len": 2, "vel": 95 }
  ]
}
```

Optional können einzelne Schläge **Rollen** haben, z. B. beim Bass Grundton, Oktave oder Quinte,
beim Arp den 1., 2. oder 3. Akkordton und bei Chords „nur Oberstimmen".

**So kommen wir auf „extrem viele" Rhythmen, ohne dass die Qualität leidet:**

1. **Kuratiertes Grundset:** von Hand gebaut und getaggt nach Genre (House, Deep House, UKG/2-Step, Afro House, Breakbeat, Stutter House, Folk-House, Pop …), Spur-Typ und Energie. Start mit ca. 50, Ziel 500+.
2. **Generierte Varianten:** aus jedem Muster automatisch Dutzende, durch Verschieben, Ausdünnen und Verdichten, Ghost-Notes, Swing, Half-/Double-Time und Fills im 4. oder 8. Takt. Dazu kommen euklidische Rhythmen. Ein Filter sortiert Unmusikalisches aus. So kommen **Tausende** zusammen.
3. **Eigene Rhythmen:** Du ziehst einen MIDI-Clip hinein, und das Plugin übernimmt den Rhythmus als Favorit.

**Rhythmus-Browser:** Suche und Tags, Favoriten, „ähnliche Rhythmen" und Vorhören direkt auf den
aktuellen Chords. Wichtig für Einsteiger: Statt Namen auswendig zu kennen, schiebt man die Regler
**Dichte** und **Groove** (Synkopierung).

## 5. Sound & Ausgabe nach FL Studio

| Weg | Wofür | Einschätzung |
|---|---|---|
| **Drag & Drop als MIDI** (Hauptweg) | Spur oder alles in Playlist/Piano Roll ziehen, dann mit eigenen Synths weiter | zuverlässig in FL Studio |
| **Eingebaute Sounds** | sofort hören, ohne Routing | MVP: einfache, angenehme Vorhör-Sounds (Piano, Pad, Pluck, Sub-Bass) |
| **Live-MIDI-Out** an andere Synths | für Fortgeschrittene, läuft live mit | heikel (siehe unten), wird früh getestet |

**Warum Live-MIDI-Out heikel ist:** In FL Studio ist das Weiterleiten von MIDI aus VST3-Plugins laut
Foren-Berichten problematisch. Im Scaler-Forum wird dafür teils die VST2-Version empfohlen, und VST2
können neue Entwickler seit 2018 nicht mehr lizenzieren. FL Studio unterstützt seit Version 2024
(24.1.1) aber auch das CLAP-Format. Beides (VST3 und CLAP) testen wir in Phase 2 mit einem Mini-Plugin.

**Ehrliche Einordnung:** Ein großer Teil eines Stils, gerade bei Fred again.., steckt im Sound:
Vocal-Samples, Texturen, Sidechain, Effekte. MIDI trägt Harmonie, Rhythmus und Melodie. Deshalb gilt:

- Jedes Stil-Profil liefert Klang-Tipps, also was du in deinem Synth einstellen solltest.
- Die eingebauten Sounds werden pro Stil passend gewählt.
- Eine richtige Sound-Engine mit stiltypischen Presets kommt später (ab Phase 4).

## 6. Technik (Empfehlung)

**Grundidee:** Das Musik-Gehirn läuft überall gleich, zuerst im Browser zum schnellen Anhören und
Bewerten, später 1:1 im Plugin.

| Teil | Empfehlung | Warum |
|---|---|---|
| Musik-Gehirn | TypeScript in `engine/`, eigener Theorie-Kern ohne fremde Bibliotheken | schnell zu entwickeln und zu testen, läuft im Browser **und** im Plugin |
| Hör-Labor (Phase 1) | private Webseite (Claude-Artifact) mit Vorhör-Sounds, MIDI-Download (als ZIP), Bewertung und Blindtest | du testest am PC oder Handy, ohne etwas zu installieren; deine Bewertungen fließen in die nächste Runde |
| Plugin-Hülle | C++ mit **JUCE** (aktuell Version 9) → VST3 + Standalone, später AU (Mac), evtl. CLAP | Industriestandard für Audio-Plugins |
| Oberfläche | JUCE-WebView (HTML/CSS); JUCE 9 bringt dafür ein offizielles TypeScript-Paket mit | moderne Optik, Teile aus dem Hör-Labor wiederverwendbar |
| Wiedergabe | in der C++-Hülle: synchron zu FL, auch bei geschlossenem Fenster und beim Export | das Gehirn erzeugt Noten nur auf Klick, abspielen tut die Hülle |
| Daten | Stil-Profile und Rhythmen als JSON | Wissen wächst ohne neuen Code |
| Builds | GitHub Actions baut die Windows-`.vst3` automatisch | du brauchst kein Visual Studio, nur herunterladen und nach `C:\Program Files\Common Files\VST3` kopieren |
| Qualität | Unit-Tests fürs Gehirn, [pluginval](https://github.com/Tracktion/pluginval) für die Plugin-Stabilität, Hörtests durch dich | |

**Kosten zum Start: 0 €.** Laut den JUCE-8-Bedingungen ist die „Starter"-Lizenz bis 20.000 $
Jahresumsatz kostenlos (ohne Splash-Screen), „Indie" geht bis 300.000 $ (40 $/Monat oder 800 $
einmalig). Für JUCE 9 prüfen wir die aktuellen Bedingungen vor einem Verkauf. Das VST3-SDK steht seit
Version 3.8 (Oktober 2025) unter MIT-Lizenz.

**Fallback, falls die Web-Oberfläche in FL Studio Probleme macht:** eine native JUCE-Oberfläche. Das
TypeScript-Gehirn läuft dann in einer eingebetteten JavaScript-Engine (z. B. QuickJS) im Plugin weiter,
neu schreiben müssen wir es also nicht.

### Projektstruktur (Vorschlag)

```
ProjectX/
├─ docs/               Planung, Stil-Analysen, Entscheidungen
├─ engine/             Musik-Gehirn (TypeScript) + Tests
├─ data/
│  ├─ styles/          Stil-Profile (JSON)
│  └─ rhythms/         Rhythmus-Bibliothek (JSON)
├─ lab/                Hör-Labor (Browser-Prototyp)
├─ plugin/             JUCE-Plugin (C++) + Web-Oberfläche
└─ .github/workflows/  automatische Builds und Tests
```

### So arbeiten wir zusammen (Annahme, siehe Frage 2)

- **Du:** Ohren und Geschmack. Du wählst Referenz-Tracks, bewertest Ideen und testest in FL Studio.
- **Ich (Claude):** Code, Stil-Profile, Rhythmen, Builds.
- Alles landet in diesem Repo, und nach jeder Runde bekommst du etwas zum Anhören.

## 7. Roadmap

**Phase 0: Konzept & Stil-Analyse** *(jetzt)*
- Offene Entscheidungen klären ([Abschnitt 11](#11-offene-entscheidungen)).
- Du wählst pro Künstler 10–15 Referenz-Tracks und sortierst sie nach Phase/Variante.
- Wir analysieren sie mit dem Analyse-Bogen ([Anhang A](#anhang-a--analyse-bogen-pro-track)). Tipp: Scaler kann Akkorde aus Audio erkennen (Detect), das hilft hier enorm.
- Ergebnis: Stil-Profil v1 je Künstler und ein Rhythmus-Grundset v1 (ca. 50 Muster).
- ✅ **Fertig, wenn** du bei allen drei Profilen sagst: „Ja, so beschreibt man den Stil."

**Phase 1: Hör-Labor** *(Musik-Gehirn ohne Plugin)*
- Musik-Gehirn: zuerst Chords + Bass, dann Lead + Pluck.
- Hör-Labor im Browser mit Key, Künstler, Generieren, Anhören, MIDI-Download und Bewertung 1–5 mit Kommentar.
- **Blindtest-Modus:** Ein Loop läuft ohne Namen, und du rätst den Künstler. So messen wir, ob der Stil wirklich erkennbar ist.
- Ablauf in Runden: du bewertest, ich passe die Profile an, dann kommt die nächste Version.
- ✅ **Fertig, wenn** die meisten Loops pro Künstler ≥ 4/5 bekommen und du im Blindtest klar über Zufall liegst (Ziel ≥ 60 %; Raten bei drei Künstlern = 33 %).

**Phase 2: Technik-Test in FL Studio** *(kurz)*
- Mini-Plugin „Hallo Akkord": lädt in FL Studio und spielt synchron zum Transport einen Akkord mit eingebautem Sound.
- Wir testen Drag & Drop in Playlist und Piano Roll, Live-MIDI-Out (VST3 und CLAP), die Web-Oberfläche (inkl. Skalierung) und Speichern/Laden im FL-Projekt.
- Den Windows-Build erzeugt GitHub Actions automatisch.
- ✅ **Fertig, wenn** alles in deiner FL-Studio-Version läuft, oder wenn feststeht, welchen Fallback wir nehmen.

**Phase 3: MVP-Plugin** *(erste brauchbare Version, siehe Abschnitt 8)*
- ✅ **Fertig, wenn** du in FL Studio in unter einer Minute eine brauchbare Idee im Stil eines der drei Künstler hast und rübergezogen hast.

**Phase 4: Ausbau**
- Regler für **Energie**, **Stimmung** (dunkel ↔ hell) und **Komplexität** (einfache Dreiklänge ↔ reiche Akkorde)
- Rhythmus-Browser mit generierten Varianten (Tausende) und eigenen Rhythmen aus MIDI
- mehr Künstler und Varianten, weitere Spuren (Pad, Gegenmelodie, Arp, evtl. Drums)
- bessere eingebaute Sounds und stiltypische Presets
- Favoriten, Profi-Ansicht (Akkorde von Hand ändern), Lern-Tipps („warum klingt das so?")
- Spiel-Modus: eine Taste entspricht einem Akkord der Progression, zum Live-Einspielen
- Ideen für später: Song-Teile (Intro/Drop/Breakdown), „eigener Stil" aus deinen MIDI-Clips

**Phase 5: Veröffentlichung** *(nur falls Verkauf)*
- rechtliche Prüfung der Künstlernamen, ggf. neutrale Stil-Namen
- Installer, Lizenz-/Kopierschutz, Mac-Version (AU, Signierung/Notarisierung), Webseite, Beta-Tester

## 8. MVP: drin und nicht drin

**Drin:**
- Key-Auswahl (inkl. „passend zum Künstler"), Länge 4 oder 8 Takte, Tempo aus FL
- 3 Künstler-Profile (Fred again.., AVAION, BUNT.) mit je 1–2 Varianten
- 4 aufeinander abgestimmte Spuren: Chords, Bass, Lead, Pluck
- pro Spur: Sperren, Neu würfeln, Rhythmus wählen (ca. 50–100 Rhythmen), Oktave, Stumm
- Zurück-Taste bzw. Verlauf der letzten Ideen
- einfache eingebaute Sounds, Wiedergabe synchron zu FL
- Drag & Drop pro Spur und komplett
- der Zustand wird im FL-Projekt gespeichert

**Bewusst noch nicht drin:** Drums, Mac-Version, Audio- und Key-Erkennung, KI-Training, eigene
Sound-Engine, mehr als drei Künstler, Song-Arrangement.

## 9. Risiken & Gegenmaßnahmen

| Risiko | Gegenmaßnahme |
|---|---|
| Klingt nicht wirklich nach dem Künstler (**größtes Risiko**) | erst Hör-Labor und Blindtests, dann Plugin; Profile sind Daten und deshalb schnell anpassbar |
| Der Stil steckt stark im Sound, nicht nur in den Noten | Klang-Tipps, passende Vorhör-Sounds, später eine Sound-Engine; Erwartungen klar halten |
| Live-MIDI-Out in FL Studio (VST3) ist heikel | Drag & Drop und eingebaute Sounds als Hauptweg; früher Technik-Test inkl. CLAP |
| Web-Oberfläche macht in FL Probleme | früher Test; Fallback native JUCE-UI, das Gehirn bleibt gleich |
| Das Projekt wird zu groß („massiv", „extrem viele") | klares MVP, Wachstum über Daten, Rhythmus-Varianten werden generiert statt alle von Hand gebaut |
| Rechtliches bei einem Verkauf | siehe Abschnitt 10 |

## 10. Recht (kurz, keine Rechtsberatung)

- **Privat:** Künstlernamen im Plugin sind unproblematisch.
- **Beim Verkauf:** Echte Künstlernamen in Produkt oder Werbung können Marken- und Persönlichkeitsrechte berühren und eine Kooperation suggerieren. Es gibt zwei Optionen: neutrale Stil-Namen (z. B. „Emotional Stutter House", „Melodic Afro House", „Folk House") oder offizielle Kooperationen. Vor einem Release sollte das eine Fachperson prüfen.
- **Urheberrecht:** Akkordfolgen gelten in der Regel nicht als geschützt, Melodien und Samples dagegen schon. Das Plugin erzeugt deshalb neue Melodien und speichert nur Stil-*Tendenzen*, keine Song-Melodien und keine Samples aus Songs.

## 11. Offene Entscheidungen

1. **Ziel:** Nur für dich (und Freunde), oder später verkaufen?
2. **Wer programmiert:** Ich (Claude) schreibe den Code und du testest/hörst? Oder willst du selbst mitprogrammieren, und wenn ja, mit welcher Erfahrung?
3. **Sounds:** Reichen erstmal einfache Vorhör-Sounds plus MIDI für deine Synths, oder ist dir ein guter Eigen-Sound im Plugin früh wichtig?
4. **System:** Nur Windows + FL Studio, oder auch Mac (Logic/Ableton)? Welche FL-Studio-Version hast du?
5. **Künstler & Tracks:** Bleibt es für den Start bei Fred again.., AVAION und BUNT.? Welche 5–10 Tracks pro Künstler sind für dich „typisch"? Welche Phase meinst du bei AVAION (eher Afro wie „WACUKA" oder UKG wie „NEED ME") und bei BUNT. (früher Folk-House oder Deep/Stutter wie „Clouds")?
6. **Drums:** Sollen später auch Drum-Patterns dazukommen, oder nur melodische Spuren?
7. **Repo:** Soll das Plugin hier in `ProjectX` entstehen? (Bisher liegt hier nur `hangout1.lua`, die mit dem Plugin nichts zu tun hat.)

## Anhang A – Analyse-Bogen pro Track

| Feld | Beispiel / Hinweis |
|---|---|
| Künstler · Track · Variante | |
| BPM · Key · Modus | z. B. 126 · A-Moll · äolisch |
| Progression (Stufen) | z. B. i – VI – III – VII |
| Akkordfarben | add9, m7, sus2, Umkehrungen? |
| Harmonischer Rhythmus | Akkorde pro Takt, Loop-Länge |
| Chords-Rhythmus | gehalten / Stabs / Pattern, Sidechain? |
| Voicing & Lage | eng/weit, tief/hoch, Oberstimme |
| Bass | gehalten / Offbeat / synkopiert, Lage, folgt er dem Grundton? |
| Lead / Hook | Tonumfang, Wiederholung, Rhythmus, Vocal-Chop? |
| Pluck / Arp | Muster, Dichte |
| Groove | 4/4, 2-Step, Breakbeat, Half-Time, Swing |
| Prägende Sounds | Piano, Pad, Vocal-Chops, Gitarre … |
| Was macht es typisch? | ein Satz |

## Quellen

- MIDI-Routing von Scaler (VST3) in FL Studio, Scaler-Forum: https://forum.scalermusic.com/t/midi-routing-fl-studio-vst3/60
- CLAP-Support ab FL Studio 24.1.1, Image-Line-Forum: https://forum.image-line.com/viewtopic.php?p=1956185
- JUCE-8-Lizenzstufen: https://forum.juce.com/t/juce-8-is-available-now/61809
- JUCE 9.0.1 (TypeScript-Paket für die WebView): https://forum.juce.com/t/uce-9-0-1-is-out/69269
- VST 3 unter MIT-Lizenz: https://sonicstate.com/news/2025/10/30/vst-3-now-available-under-mit-license
- AVAION: https://www.beatportal.com/articles/1245346-avaion-realeases-sophomore-album-to-make-people-happy · https://www.ticketfairy.com/word/2022/09/13/get-to-know-avaions-dazzling-melodies
- BUNT.: https://en.wikipedia.org/wiki/Bunt_(DJ)
