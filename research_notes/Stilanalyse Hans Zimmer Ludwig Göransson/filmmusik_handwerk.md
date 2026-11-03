# Cinematic / film-score craft as rules for a MIDI idea generator (chords, bass, lead, counter-line/ostinato, drums; 4/4, 16 steps per bar)

> **Scope.** This file covers general film-score craft (orchestral, epic/trailer, hybrid) and turns it into rules for a MIDI idea generator. The generator writes five separate MIDI files (chords, bass, lead melody, counter-line/ostinato, drums) for non-musicians who open them in FL Studio. It is the shared craft layer under the composer-specific notes in this folder (Zimmer, Göransson).
> **Source access.** Direct page fetches failed with DNS errors (`getaddrinfo ENOTFOUND`, meaning the host is outside this session's allowed network domains) on **www.midi.org** and **en.wikipedia.org**. The tool's guidance is to stop after two such failures, so I did not retry, did not try other hosts, and did not use mirrors. IPFS and other Wikipedia mirrors appeared in results; none was used or cited. **So every finding below comes from search-engine extracts (WebSearch result summaries), not from full pages.** Some extracts did not say which page in their result set made a claim. There I list the candidate pages and mark the claim "attribution not isolated". Nothing was fetched from GitHub. The Sheet Sage dataset was not touched. No melody or transcription is reproduced.
> **Conventions.**
> - MIDI note numbers use **C4 = 60** (C1 = 24, C2 = 36, C3 = 48, C5 = 72, C6 = 84, C7 = 96).
> - Ranges are **sounding pitch** unless marked "written".
> - GM program numbers are **1–128**, as printed in GM tables. The byte sent in a Program Change message is one lower (0–127).
> - Grid: 16 steps per 4/4 bar. Step 1 is the downbeat; steps 5, 9 and 13 are beats 2, 3 and 4. Odd steps are 8th-note positions and even steps are 16th offbeats. One step lasts 15000/BPM ms (125 ms at 120 BPM). At 480 PPQ one step is 120 ticks.
> - "st" = semitones.
> - **Labels.** Items under *Inferences* are mine, derived from the cited findings. Anything from my own background knowledge that I could not check in this session is marked **unverified**.

---

## 1. Registers and ranges (MIDI note numbers) and where each instrument sounds best

### Takeaway
Converted to MIDI, the sourced ranges are:
- violins 55–100, violas 48–93, cellos 36–79, double basses 28–~58 (sounding)
- horns ~35–77/79, trumpets ~52–84/86, trombones 40–70 (77 for professionals), tuba 26–65
- SATB choir about 60–81 / 55–74 / 48–69 / 40–60
- organ manuals 36–96, with pedal stops reaching 24 (16') or 12 (32')
- piano 21–108, flute 60–96, timpani 38–57 (60 with a 20" drum)

Sources agree on the bottom notes but differ by 2–4 st at the top, especially for brass. The generator should therefore write inside the narrower working zones in the Inferences table, not at the extremes.

### Cited Findings
**Pitch-number convention**
- Most references call middle C (MIDI 60) C4, but at least one forum chart labels it C5, so always check which convention a chart uses. — [Range (music), Wikipedia (search extract)](https://en.wikipedia.org/wiki/Range_(music)); [Notation Software forum](https://notation.com/vb-forum/showthread.php?p=7113)
- An 88-key piano runs from **A0 = MIDI 21 to C8 = MIDI 108**, with middle C = C4 = MIDI 60. — [Piano key frequencies, Wikipedia (search extract)](https://en.wikipedia.org/wiki/Piano_key_frequencies); [Zoe Blade: Pitches](https://notebook.zoeblade.com/Pitches.html)
- One university orchestration handout uses a different middle-C convention, so its numbers are not directly comparable. It gives the rule of thumb **"highest pitch = 15ma above highest open string"**, i.e. about two octaves above the top open string. — [Stevens HMU 397 notes 03a](https://personal.stevens.edu/~abrick/orchestration1/files/HMU397_notes_03a.html)

**Strings**
- One composer resource lists:

  | Instrument | Range | MIDI |
  |---|---|---|
  | Violin | **G3–E7** | 55–100 |
  | Viola | **C3–A6** | 48–93 |
  | Cello | **C2–G5** | 36–79 |
  | Double bass | **E2–B♭4** | |

  My reading: the bass figure is the *written* range (the double bass sounds an octave below written), so it sounds E1–B♭3 (28–58). — [Young Composers range sheet (attachment)](https://www.youngcomposers.com/applications/core/interface/file/attachment.php?id=11423)
- A standard four-string double bass bottoms out on **E1**, the same pitch as a bass guitar's low string (MIDI 28). Some sample libraries extend lower. — [Sound On Sound, "The Sampled Orchestra, Part 2"](https://www.soundonsound.com/techniques/sampled-orchestra-part2)
- A user-made flashcard deck gives the violin E string as MIDI 76–100 and the double-bass C extension as MIDI 24–32. — [Brainscape "Instrument Ranges"](https://www.brainscape.com/flashcards/instrument-ranges-380475/packs/819723) (study cards, secondary)

**Brass (sources conflict)**
- **Transposition.** B♭ trumpet sounds a major 2nd below written. Horn in F sounds a perfect 5th below written. Trombone, bass trombone and tuba sound as written. — [Praxis study guide 6.4](https://open-exam-prep.com/study-guides/praxis-music/theory-written-composition/ranges-transposition-orchestration); [Rising Software: brass family](https://risingsoftware.com/lessons/brass-family)
- **Flashcard ranges (MIDI).** **Horn 35–79** (B1–G5), **trumpet 52–86** (E3–D6), **tuba 26–65** (D1–F4), B♭ clarinet 50–92, piccolo 74–108. — [Brainscape](https://www.brainscape.com/flashcards/instrument-ranges-380475/packs/819723) (secondary)
- **Two web orchestration guides (attribution not isolated).**
  - Guide A: trombone **E2–F5**, horn **F♯2–C6**, tuba **D1–F4**. The horn figure is probably *written*: a 5th lower gives B1–F5, 35–77 sounding.
  - Guide B: horn B2–F5, trumpet **E3–C6**.
  - Sources: [Beat Kitchen "Writing for brass"](https://beatkitchen.io/guides/orchestral/08-writing-for-brass/); [soundtrack.academy brass article (SlideShare copy)](https://www.slideshare.net/JonathanArmandary1/brass-instruments-orchestration)
- **Praxis guide.** Trombone **E2–B♭4** (40–70), tuba **D1–D4** (26–62). These are school-level figures, and the guide's trumpet entry contradicts itself. — [Praxis study guide](https://open-exam-prep.com/study-guides/praxis-music/theory-written-composition/ranges-transposition-orchestration)
- **VI-Control.** Brass ranges "are rather variant from one source to another". The general trombone tessitura bottoms out at B♭2 (46), with G2 (43) as the recommended bottom. — [VI-Control: brass instrument ranges, especially the low end](https://vi-control.net/community/threads/brass-instrument-ranges-especially-the-low-end.144812/)
- **Authoritative tables not visible.** Kennan/Grantham (*Technique of Orchestration*, ch. 7 horn, ch. 8 trumpet/trombone/tuba) and Adler (*Study of Orchestration*, ch. 9–10) hold the authoritative range tables. No extract showed their numbers. — [Routledge: Technique of Orchestration, 7th ed.](https://www.routledge.com/The-Technique-of-Orchestration/Kennan-Grantham/p/book/9780367655594); [Yale orchestration syllabus](https://musicorchestration.yale.edu/?p=1425)

**Choir (SATB)**
- **Comfortable ranges (arranging guide).** Soprano **C4–A5 (60–81)**, alto **G3–D5 (55–74)**, tenor **C3–A4 (48–69)**, bass **E2–C4 (40–60)**. — [Songscription: arrange a song for choir](https://www.songscription.ai/blog/arrange-a-song-for-choir); [Simply: how to write choir music](https://www.hellosimply.com/blog/?p=9107) (attribution not isolated)
- **"More or less standard" ranges.** Bass D2–C4 (38–60), tenor C3–A4 (48–69), alto F3–F5 (53–77), soprano C4–A5 (60–81). The same library also has a narrower "conservative" table. — [hmt library, Music.Theory.Instrument.Choir](https://hackage.haskell.org/package/hmt-0.15/docs/src/Music-Theory-Instrument-Choir.html)
- **Strict SATB textbook ranges.** Soprano C4–G5 (60–79), alto G3–D5 (55–74), tenor C3–G4 (48–67), bass F2–D4 (41–62). Spacing rules: no more than an octave between soprano–alto and alto–tenor, no more than a 12th between tenor–bass, and no voice crossing. — [Open Music Theory: chords in SATB style](https://viva.pressbooks.pub/openmusictheory/chapter/chords-in-satb-style/)
- **Top of the range.** First-tenor and first-soprano top notes are "very penetrating". If a section cannot divide, avoid the "firsts only" range. — [Young Composers wiki: Writing for vocal ensembles](https://wiki.youngcomposers.com/Writing_for_vocal_ensembles); [Radius Music: voices](https://www.radiusmusic.org/study/voices/) (attribution not isolated)

**Pipe organ**
- An organ contract lists a **61-note manual compass (C–c4)** and a **32-note pedal compass (C–g1)**. — [Pipe Organ Database (Hillgreen-Lane 1923 contract; exact page among the database results not isolated)](https://www.pipeorgandatabase.org/instruments/36977)
- Wicks and Holtkamp specifications also list 61-note manuals. — [Wicks Sonatina stoplist](https://pipeorgandatabase.org/stoplists/7843); [Incarnate Word Holtkamp spec](https://www.esm.rochester.edu/uploads/Incarnate-Word-Holtkamp-spec.pdf)
- English-style specifications write the same 32-note pedal compass as "CCC–G". — [Westminster Abbey Harrison specification](https://prod-v7-archive.westminster-abbey.org/media/8171/harrison-harrison-organ-specification-april-2018.pdf); [AGO console standard (Scribd)](https://www.scribd.com/document/466271149/agoconsole-pdf)
- Examples of pedal stops by organ size:
  - A small Wicks organ's pedal has only a **16'** Subbass (32 notes).
  - Larger organs add **32'** stops: Westminster Abbey has a 32' Double Open Wood, and Third Presbyterian has a 32' Resultant and a 32' Subbass.
  - Sources: [Wicks Sonatina](https://pipeorgandatabase.org/stoplists/7843); [Westminster Abbey](https://prod-v7-archive.westminster-abbey.org/media/8171/harrison-harrison-organ-specification-april-2018.pdf); [Third Presbyterian Austin spec](https://esm.wdev.rochester.edu/uploads/Third-Pres-Austin-spec.pdf)

**Flute, piccolo, recorder**
- The concert flute's practical range is **C4–C7 (60–96)**. Piccolo is written in the same range and sounds an octave higher (C5–C8 = 72–108). — [Dynamic Music Room: range of flute](https://dynamicmusicroom.com/range-of-flute); [Musopen: flute](https://musopen.org/education/instrument/flute); [Brainscape (Trinity ranges)](https://brainscape.com/flashcards/instrument-voice-ranges-according-to-tri-17179905/packs/22369512) (attribution not isolated)
- Recorder sizes are named after voice ranges, not after their sounding pitch.
  - Soprano recorder tessitura is **C5–C7 (72–96)**.
  - Sopranino, soprano and bass recorder parts are notated an octave below sounding pitch. Alto and tenor parts are notated at pitch.
  - No source stated the alto's range directly. Because alto parts are notated at pitch, its usual written bottom note F4 would sound F4 (65); that step is the search tool's inference, not a sourced fact. A historical table lists "Medieval Alto F4–G6" but uses a conflicting transposition, so the alto's top note is uncertain.
  - Sources: [Recorder, Wikipedia (search extract)](https://www.Wikipedia.org/wiki/Flauto_dolce); [Scribd: Range of Instruments](https://www.scribd.com/document/535974936/Range-of-Instruments) (attribution of the medieval table not isolated)

**Timpani**
- Standard drum sizes:

  | Drum | Range | MIDI |
  |---|---|---|
  | 32" | D2–A2 | 38–45 |
  | 29" | F2–C3 | 41–48 |
  | 26" | B♭2–F3 | 46–53 |
  | 23" | D3–A3 | 50–57 |
  | 20" (optional) | F3–C4 | 53–60 |

  — [Karlyn Mason: 7 things band directors should know about timpani](https://karlyn-mason.squarespace.com/blog/tag/band); [DrumSpy: timpani ranges](https://drumspy.com/timpani-ranges/)
- Prout's treatise gives F2–C3 for a large drum and B♭2–F3 for a small one. — [Prout ch. XI (timbreandorchestration.org)](https://timbreandorchestration.org/treatises/figures/prout/volume-1/chapter-xi)
- A drum can reach the bottom of its smaller neighbour's range, but its own lowest pitch sounds poor. For example, play B♭2 on the 29" rather than the 26". — [Free Percussion Lessons: timpani ranges](https://freepercussionlessons.com/timpani-ranges)

**Where each register sounds best**
- **String pads.** Keep **tension notes above G3 (55)**. The chord's **3rd can go as low as E3 (52)**. — [Berklee: Writing String Pads](https://www.berklee.edu/node/2436901)
- **Violin melody.** Violins keep "a nice warm tone" when the melody stays in their lower range. — [VI-Control: two beautiful examples for lush string sound](https://vi-control.net/community/threads/orchestration-question-two-beautiful-examples-for-lush-string-sound.104750/)
- **Horn chords.** Use three or four horns in close position, **in the range of the alto voice**. — [Stevens HMU 397 notes 11](https://personal.stevens.edu/~abrick/orchestration1/files/HMU397_notes_11.html)

### Inferences
**Generator register table.**
- *Full range* is the sourced range converted to MIDI, taking the conservative end where sources disagree.
- The other columns are my choice. The **melody zone** avoids the bottom ~4 st and the top ~7–12 st of each range, where sources disagree and sample libraries get thin. The **pad zone** follows the Berklee thresholds (no tensions below 55, no chord 3rd below 52) and the interval floors in section 2. The **bass zone** is the instrument's lowest octave and a half.

| Instrument | Full range | Lead / melody zone | Pad / chord-voice zone | Bass zone |
|---|---|---|---|---|
| Violins I | 55–100 | 62–88 (lower = warmer) | 67–84 (top voices) | – |
| Violins II | 55–100 | 60–81 (counter-line) | 60–79 | – |
| Violas | 48–93 | 55–74 (counter-line, ostinato) | 52–69 | – |
| Cellos | 36–79 | 48–72 (tenor melody) | 43–60 (root, 5th) | 36–55 |
| Double basses | 28–58 | – | – | 28–48 (an octave under cellos) |
| Horns | 35–77 | 53–74 | 55–72 (close position, alto range) | – |
| Trumpets | 52–84 | 60–81 | 60–79 (stabs) | – |
| Trombones | 40–70 (77) | 48–67 | 46–65; open spacing below 46 | 40–52 |
| Tuba | 26–65 | – | – | 28–50 (doubles the bass line at the octave) |
| Choir S / A / T / B | 60–81 / 55–74 / 48–69 / 40–60 | S 62–79 | "aah" pad: S 64–76, A 57–69, T 50–64, B 43–55 | B 40–55 |
| Organ (manual / pedal keys) | 36–96 / 36–67 | 60–84 | 48–79 | pedal keys 36–55 (sound 24–43 with a 16' stop) |
| Piano | 21–108 | 60–96 | 48–79 | 28–48 in octaves |
| Flute | 60–96 | 67–93 | 72–88 (high doubling) | – |
| Alto / soprano recorder | 65–~91 / 72–96 | 67–88 / 74–93 | – | – |
| Timpani | 38–57 (60) | – | – | tonic and 5th of the key inside 38–55 |

- **Organ numbers.** The 61-note manual C–c4 at 8' pitch is C2–C7 = 36–96. The 32-note pedal C–g1 at 8' pitch is C2–G4 = 36–67. A 16' stop sounds an octave lower (24–55) and a 32' stop two octaves lower (12–43). The English "CCC" name for the pedal's bottom key reflects the 16' sounding octave. (Inference from the cited compasses; how sample libraries and GM organs map this is **unverified**.)
- **Range check by rule of thumb.** The handout's "about two octaves above the top open string" rule predicts the sourced top notes:
  - violin E5 (76) + 24 = 100 ✓
  - viola A4 (69) + 24 = 93 ✓
  - cello A3 (57) + 24 = 81, against the sourced 79
  - bass G2 (43) + 24 = 67 sounding, so treat everything above ~58 as solo territory.
- **Write sounding pitch, never written transpositions.** That means no horn-in-F or B♭-trumpet shift, no 8vb for the bass, no 8va for piccolo or soprano recorder. Sample libraries and GM synths play the pitch of the MIDI key. (Inference; not checked for every library.)
- **Fold, don't drop.** If a generated note falls outside its part's full range, move it by octaves into range rather than deleting it. Notes outside a sampled range are usually silent in sample libraries. (Inference.)
- **Default role mapping for the five files.**
  - chords → string pad (or brass, choir or organ)
  - bass → cellos plus basses in octaves (or tuba, or organ pedal)
  - lead → violins I, horns, trumpet, flute or choir soprano
  - counter-line/ostinato → violas, violins II or cellos
  - drums → percussion

  (Inference.)

### Gaps
- No authoritative (Kennan/Adler) brass table was visible. Top notes for horn, trumpet and trombone are uncertain by 2–4 st, and no bass-trombone range was found.
- No source gives a "best register" per instrument for melody, pads and bass beyond the three points above, so the working zones are inferred.
- Not found: the alto recorder's top note, the piccolo's practical top, and the clarinet and other winds in detail. Harp and keyboard percussion were out of scope.
- **Unverified:** FL Studio's piano roll is generally said to label MIDI 60 as "C5", an octave above the C4 convention used here. If true, tell non-musicians that "C5 in FL = C4 in these notes". I could not confirm this in this session.

---

## 2. Orchestral chord voicing: open vs. close, doubling, low-interval limits, voice count, brass and string spacing, sus chords, pedal points

### Takeaway
Intervals must get wider the lower they sit. Keep seconds above about E3 (52) and thirds above about B♭2 (46), and don't let fifths start below about B♭1 (34). Double the bass in octaves: cellos with basses, tuba with bass trombone.

Brass and strings are spaced differently:
- **Brass.** Horns in close position in the alto range. Trombones in open position in their low register. Trumpets thin out when spread wide.
- **String pads.** Open at the bottom and close at the top, with tensions only above G3 (55). To add a note, divide the cellos first.

### Cited Findings
**Low-interval limits (LIL)**
- LILs are "the lowest positions where intervals can be played together without muddiness". They are guidelines, not rules. A perfect 5th can sit lower than a minor 2nd. When checking a voicing, assume the root is present even if it isn't written, because a bass instrument may be playing it. — [Robin Hoffmann: Low Interval Limits](https://www.robin-hoffmann.com/dfsb/low-interval-limits)
- Berklee-style values from arranging-course flashcards:
  - **minor 2nd: lowest E3–F3 (52–53)**
  - **major 3rd: lowest B♭2–D3 (46–50)**
  - **perfect 5th: lowest B♭1–F2 (34–41)**

  — [Brainscape: Arranging, writing for small and large ensemble](https://www.brainscape.com/flashcards/section-2-arranging-writing-for-small-an-11091130/packs/19701633) (user-made study cards)
- Sweetwater's table is much lower (m2 E2–F2, M3 B1–D♯2, P5 C♯1–G♯1), which **conflicts** with the flashcards; see Inferences. — [Sweetwater: Low interval limit](https://www.sweetwater.com/insync/low-interval-limit/)
- The sources agree on the principle: the larger the interval, the lower it can go, "due to the increased difference in frequencies of the pitches". — [Sweetwater: Low interval limit](https://www.sweetwater.com/insync/low-interval-limit/); [Robin Hoffmann: Low Interval Limits](https://www.robin-hoffmann.com/dfsb/low-interval-limits) (attribution not isolated)
- Loud brass voicings turn muddy faster than soft strings. Doubling cellos and basses at the octave is the standard safe choice. A tuba or contrabassoon placed a step or two above low basses gets muddied. — [Sweetwater: make orchestrations sound more balanced](https://www.sweetwater.com/insync/make-orchestrations-sound-more-balanced/); [Robin Hoffmann](https://www.robin-hoffmann.com/?p=4170) (attribution of the dynamics point not isolated)
- A C–E third played as low as possible on piano is muddy, but an octave works down to the lowest A. A left hand voiced root–5th–7th (third out of the bass) avoids the problem. — [Piano With Willie: big chords](https://pianowithwillie.com/big-chords-progressions-fills/)
- Forum opinion: some low-register mud comes from equal temperament, which live players correct on the fly. — [VI-Control: fat orchestral brass voicings](https://vi-control.net/community/threads/for-anyone-struggling-with-fat-orchestral-brass-voicings-and-instrument-choices-my-new-fav-youtuber.137875/)

**Brass chords**
- Use three or four horns **in close position, in the alto range**. "Sometimes the fourth horn doubles the first, an octave lower." — [Stevens HMU 397 notes 11](https://personal.stevens.edu/~abrick/orchestration1/files/HMU397_notes_11.html)
- For brass chords it is usually better to stay in close position than open. — [Robin Hoffmann: Close vs. Open Position Chords in Brass](https://robin-hoffmann.com/?p=4143)
- Trombones get muddy in too-close position in their lowest register. One VI-Control thread puts the practical limit around "the B♭ an octave+1 below middle C" (B♭2 = 46) and says open position is more stable in tutti. — [Robin Hoffmann](https://robin-hoffmann.com/?p=4143); [VI-Control: 3-player voicings for winds/brass](https://vi-control.net/community/threads/3-player-voicings-for-winds-brass-with-second-player-in-between-1-and-3-why.133662/) (attribution not isolated)
- "Trumpets sound oddly empty in wide spacing; trombones … sound full in both open and closed positions." When horns and trombones share a register, the trombones dominate unless the writer compensates. — [Stevens HMU 397 notes 11](https://personal.stevens.edu/~abrick/orchestration1/files/HMU397_notes_11.html); [timbreandorchestration.org: brass scoring](https://timbreandorchestration.org/isfee/extreme-orchestration/brass/scoring) (attribution not isolated)
- An analysis of Strauss names octaves between the timbrally matched trumpets and trombones as the strongest brass doubling. The tuba often sits an octave below them "to provide the sturdiest of bass lines". — [timbreandorchestration.org](https://timbreandorchestration.org/isfee/extreme-orchestration/brass/scoring)
- A practical brass foundation: tuba and bass trombone in octaves, with the trombones in open voicing on the 5th and 3rd. — [Boulder Brass: my best chord](https://www.boulderbrass.org/single-post/2017/08/24/my-best-chord)
- Film scores often use 6 horns, 4 trumpets, 4 trombones and 2 tubas. — [Orchestration Deep Reference (compiled page; low confidence)](https://compendium-01j.pages.dev/Arts-and-Energy/Music/orchestration-deep)

**String pads and divisi**
- The basic string structure doubles cellos and basses in octaves while the rest of the strings fill in the chord. Strings need fewer notes than a keyboard voicing. — [ARRORCH String Writing II (Scribd)](https://www.scribd.com/document/827431300/ARRORCH-String-Writing-II)
- A classic lush texture puts basses, cellos and violas in open voicing and gives the violins the melody, kept low for a warm tone. "The celli are also divisi holding pedal tones an octave below, which is very soft at first." — [VI-Control: lush string sound](https://vi-control.net/community/threads/orchestration-question-two-beautiful-examples-for-lush-string-sound.104750/)
- Low-pad example from a forum post: root in cellos (divisi B), 5th in cellos (divisi A), 3rd in violas. — [VI-Control string-writing thread](https://vi-control.net/community/threads/how-to-improve-this-string-piece.156669/) (attribution not isolated)
- Keep tension notes above G3 (55). The 3rd can go as low as E3 (52). — [Berklee: Writing String Pads](https://www.berklee.edu/node/2436901)
- When a pad needs an extra note, split sections from the bottom up and divide the cellos first. — [VI-Control: Claus Ogerman divisi techniques](https://vi-control.net/community/threads/claus-ogerman-divisi-techniques.162399/)
- "Basses rarely use divisi, it's mostly just violins." — [Bradford College composing resource](https://digitalspace.bradfordcollege.ac.uk/10629259/?p=2137)
- Doubling the basses an octave below the cellos adds weight. — [Young Composers: "does this work"](https://www.youngcomposers.com/t32251/does-this-work)
- For choir chords, see the SATB spacing rules in section 1 (≤ octave between adjacent upper voices, ≤ 12th between tenor and bass). — [Open Music Theory](https://viva.pressbooks.pub/openmusictheory/chapter/chords-in-satb-style/)

**Pedal points**
- Divided cellos can hold a pedal tone an octave below the texture. — [VI-Control: lush string sound](https://vi-control.net/community/threads/orchestration-question-two-beautiful-examples-for-lush-string-sound.104750/)
- An analysis of Zimmer ostinatos suggests building an ostinato on only one or two repeating pitches (see section 3). Treating that as a pedal-like anchor is the search tool's gloss, not the source's wording. — [HZ Ostinatos analysis (Scribd)](https://www.scribd.com/document/713679699/HZ-Ostinatos) (attribution not isolated)

### Inferences
- **The two LIL tables roughly agree once octave naming is aligned.** Sweetwater's figures look like they use "C3 = middle C" naming, which puts every note an octave lower in name. Shifted up an octave, its m2 (E3–F3) matches the flashcards exactly, its M3 (B2–D♯3) is within a semitone, and its P5 (C♯2–G♯2) is stricter. The generator should use the flashcard (Berklee-style) floors. (Inference.)
- **LIL floor rule for the generator.** For any two *adjacent* voices of a chord, where i is the interval in semitones and n is the lower note:
  - i = 1–2: n ≥ 52 (sourced m2)
  - i = 3–6: n ≥ 46 (sourced M3; m3, 4th and tritone interpolated)
  - i = 7: n ≥ 34 (sourced P5)
  - i = 8–11: n ≥ 41 (interpolated, conservative)
  - i ≥ 12: allowed down to the instrument's floor

  Tighten each floor by about 2 st for loud brass, which muddies faster than soft strings. (Inference; only the m2, M3 and P5 floors are sourced.)
- **Bass and doubling.** Put the bass note (root, or the inversion's bass) in basses at 28–43 and double it an octave up in cellos at 40–55. Add a 5th directly above the lowest note only if that note is ≥ 34 (the P5 floor). A 5th above the cello octave (≥ 40) is always safe. Climax variant: tuba plus bass trombone on the same octave pair. (Inference from the cited doubling rules and the P5 floor.)
- **Voice count.** Bass octave (2 notes) plus 3–4 upper voices gives 5–6 notes in total. More notes come from doubling, not from more pitch classes, because strings need fewer notes than a keyboard. (Inference.)
- **String-pad template**, bottom to top:
  - basses: root (28–43)
  - cellos: root an octave up, or root plus 5th when divided (36–55)
  - violas: 3rd (≥ 52) or 5th (48–69)
  - violins II and I: close-position upper tones (60–84)

  Spacing is open at the bottom (≥ a 5th between the lowest voices) and close at the top (≤ a 4th between adjacent upper voices). Tensions (add9, sus2, sus4, 6, maj7) go only at ≥ 55. (Inference.)
- **Brass-chord template.** Tuba root (28–45) with bass trombone an octave up. Trombones in open spacing (root–5th–10th) at 40–65. Horns in a close-position triad at 55–72. Trumpets close at 60–81, or doubling the melody in octaves. Never put trombones in close position below 46. (Inference.)
- **Voice leading.** Hold common tones and move the other voices by the smallest step, so the top voice moves by ≤ 2 st where possible. This is standard practice; the extracts did not cover it. (Inference.)
- **Sus chords.** Use sus2 and sus4 as colour in the chords file. Either resolve sus4→3 after 4–8 steps, or leave it unresolved for an "open" sound. Keep sus tones ≥ 55 (Berklee tension rule). (Inference; no film-specific source.)
- **Pedal points.** Hold the tonic (or the 5th) in basses, organ pedal or low synth while the chords change above it for 2–8 bars, especially in build sections. Change only when the pedal clashes as a ♭9 against a new chord tone. (Inference from the cited cello pedal tones and one- or two-pitch ostinatos.)
- **GM preview patches.** 49 String Ensemble 1 for pads (50 has a slower attack), 62 Brass Section for brass chords, 53 Choir Aahs, 20 Church Organ (see section 8).

### Gaps
- The full LIL chart (minor 3rd, 4th, tritone, 6ths, 7ths, 9ths) was not visible in any extract. My **unverified** recollection of the commonly circulated Berklee-style chart, to check before use:
  - minor 3rd: C3–E♭3 (48–51)
  - perfect 4th: B♭2–E♭3 (46–51)
  - tritone: B2–F3 (47–53)
  - minor/major 6th and minor/major 7th: lower note F2 (41)
  - minor 9th: E2–F3 (40–53); major 9th: E♭2–F3 (39–53)
- No source covered sus-chord usage or pedal-point lengths in film scoring.
- No source gave voice counts for typical film chords beyond "3–4 horns" and "strings need fewer notes than keyboard".

---

## 3. Ostinatos: rhythms, shapes, behaviour on chord changes, length, spiccato vs. legato

### Takeaway
The sourced craft:
- Build ostinatos from chord tones, or from just one or two repeating pitches as a pedal anchor.
- Keep the rhythm and contour when the chord changes and swap in the new chord tones.
- Typical cinematic shape: spiccato 16ths moving as a broken triad over progressions like i–VI–III–VII.
- Mix short and slurred notes (e.g., 2 slurred + 2 spiccato per beat) so the line doesn't sound stiff, and split roles between sections (16ths high, 8ths low).
- Keep ostinatos off the big wet percussion layers.

No source documents the rhythm cells (8ths, 16ths, dotted, 3+3+2) or the 1–2-bar lengths; those are given as inferences.

### Cited Findings
- "Made popular by the music of Hans Zimmer, an Ostinato is a repeating rhythmic figure used to add drive and propulsion to a piece." — [Cinematic Composing: "Marines Return" ostinatos](https://old.cinematiccomposing.com/courses/viewTopic/356); [Bax-shop: compose for film like Hans Zimmer](https://www.bax-shop.co.uk/blog/studio-recording/how-to-compose-for-film-like-hans-zimmer/) (attribution not isolated)
- Zimmer writes ostinatos for strings "to create tension or a heartbeat-like pulse", and they suit a minimalist approach. — [Bax-shop](https://www.bax-shop.co.uk/blog/studio-recording/how-to-compose-for-film-like-hans-zimmer/)
- **Chord-tone rule.** An analysis of Zimmer ostinatos says the ostinato "is mostly made up of just notes found in the underlying chord/harmony". He keeps using it throughout but "tweaks the notes in the subsequent repetitions", keeping the shape as the harmony changes. A related suggestion, probably from the same analysis, is to write an ostinato using only one or two repeating pitches. — [HZ Ostinatos (Scribd)](https://www.scribd.com/document/713679699/HZ-Ostinatos) (attribution of the last point not isolated)
- **Broken-triad 16ths.** A forum discussion of Zimmer's style describes "spiccato 16th's moving in a broken triad, often following a i–VI–III–VII pattern". — [VSL forum](https://forum.vsl.co.at/post/230623) (exact post among the VSL results not isolated)
- **Articulation mix.** "Staccato all the way could easily sound too overbearing and too stiff", so mix in spiccato. — [VI-Control: music for an action scene](https://vi-control.net/community/threads/music-for-an-action-scene.122051/)
- Groups of four 16ths written as "2 legato notes and 2 staccato/spiccato notes" are more idiomatic and easier to play. — [Young Composers critique](https://www.youngcomposers.com/t43301/passion-short-orchestral-sketch/)
- **Role split.** Example texture: "shimmering sul tasto 16th-note violin chords over cello spiccato eighth notes". — [Sound On Sound: Spitfire Symphonic Motions review](https://www.soundonsound.com/reviews/spitfire-audio-symphonic-motions)
- **Recording 16ths by hand.** Play groups 1 and 3 of a bar's four 16th-groups, rest on the others, then fill in groups 2 and 4 on a second pass. This sounds more realistic. — [VSL forum](https://forum.vsl.co.at/post/230624)
- **Not on big hits.** Big wet hits (timpani and tom ensembles with lots of reverb) connect sections; overusing ostinatos on those layers muddies the mix. — [Cinematic Composing: How to Write Epic Percussion](https://learn.cinematiccomposing.com/blog/how-to-write-epic-percussion)
- **Trailer/hybrid usage.** Stock-library descriptions show:
  - "a hybrid orchestra—heavy on aggressive, staccato string ostinatos and blaring brass stabs—and gritty, distorted electronic elements"
  - in the build, "a relentless, driving rhythmic section begins, layering staccato elements"

  — [Warner Chappell PM playlist](https://de.warnerchappellpm.com/playlist/label-special-glory-oath-blood/MzAyMDk4MS00MmQzOTQ); [Sascha Ende: Cinema Blockbuster Trailer 22](https://ende.app/en/song/12570-cinema-blockbuster-trailer-22) (attribution not isolated)
- **Dedicated tools exist:**
  - Heavyocity *Ostinato Textures*: 140 presets, layers up to 3 articulations at a time — [Heavyocity](https://heavyocity.com/ostinato-textures)
  - Sonokinetic *Ostinato* strings (Kontakt Player) — [Native Instruments: Ostinato](https://www.native-instruments.com/en/pricing/ostinato)
  - Steve Barden's book *String Ostinato Patterns: 100 Stimulating Ideas* — [Hal Leonard](https://www.halleonard.com/product/2098544/string-ostinato-patterns)

### Inferences
**16-step ostinato pattern library.** Degrees are relative to the current chord: R = root, 3, 5, 8 = octave, ' = an octave up. Step lists are 1–16.

| Name | Onsets (steps) | Pitches / contour | Use |
|---|---|---|---|
| Pedal alternation (16ths) | all 16 | odd steps = pedal (R, low); even steps cycle 5, 8, 3', 8 | build, action |
| Two-note shuttle (16ths or 8ths) | all 16, or odd steps only | alternate R and 5 (minor: R and ♭6) | tension, pulse |
| Broken triad (16ths) | all 16 | per beat R-3-5-8, then 8-5-3-R (up/down) | classic spiccato drive |
| 8th pulse | 1,3,5,7,9,11,13,15 | one pitch (R or 5), accents on 1 and 9 | heartbeat / clock pulse |
| Gallop | 1,3,4, 5,7,8, 9,11,12, 13,15,16 | R on the 8th, 5 and 8 on the two 16ths | action |
| 3+3+2 in 16ths (per half bar) | 1,4,7, 9,12,15 (lengths 3,3,2) | R, 5, 8 / R, 5, ♭7 | epic drive |
| 3+3+2 in 8ths (per bar) | 1,7,13 (lengths 6,6,4) | R, R, 5 (low strings or brass) | big "tresillo" swing |
| Dotted-8th chain | 1,4,7,10,13 (+16 or reset at the bar) | R-5-8 cycle | cross-rhythm against straight drums |
| Accented 16ths | all 16, accents on 1,4,7,9,12,15 | broken triad or pedal | 3+3+2 accents over continuous motion |

- **Length.** Default 1 bar (16 steps). Use 2 bars (32 steps) when the figure needs an "answer", varying the last beat of bar 2. Loop the pattern for the whole section. (Inference.)
- **On chord change** (from the cited Zimmer analysis): keep the onsets, accents and contour. Re-map each note's chord role (R/3/5/8) onto the new chord, choosing the octave nearest the previous pitch. In "pedal" patterns, keep the pedal pitch if it is a chord tone, 9th or sus tone of the new chord; otherwise move it by the smallest step. (Inference.)
- **Register and role split.** 16th figures go in violas/violins II (55–76). 8th figures go in cellos/basses (36–55), an octave or two below. (Inference from the SOS role-split example.)
- **Short-note writing.** For spiccato/staccato patches, set note length to 50–75 % of a step and never overlap notes. Velocity 80–110, with +15–20 on group starts. For the "2 slurred + 2 short" variant, give the slurred pair full step length plus a small overlap (see section 6). (Inference.)
- **Tempo fit.** 16th spiccato ostinatos sit naturally at 100–150 BPM (the stock action range, section 9). Above ~160 BPM switch to 8ths; below ~90 BPM use 16ths only in high, quiet layers. (Inference; no source on playability limits.)
- **Drums.** Drum "ostinatos" belong on dry, tight layers. Big reverberant hits stay sparse. (Inference from Cinematic Composing.)

### Gaps
- No sourced data on how common 3+3+2 or dotted ostinatos are, on 1- vs 2-bar length, or on tempo limits for spiccato.
- No note-level transcriptions were used, and none should be reproduced.

---

## 4. Melody for film themes: motif length, intervals, long notes, suspensions, repetition and development, range

### Takeaway
- **Opening.** Start with a strong rising interval: a perfect 5th is the classic heroic gesture, a rising 4th also reads as heroic, and a semitone sounds menacing.
- **Motif.** Build it on one short repeated rhythmic cell ("the simpler the better") and lean on the 5th degree rather than resting on the tonic.
- **Long notes.** Use long sustained notes for grandeur or sadness.
- **Phrase form.** Shape 8-bar phrases as a sentence (2-bar basic idea, its repeat, then a continuation) or a period (antecedent ending weakly, consequent ending strongly).
- **Returns.** Change the instrument, harmony or orchestration every time the theme comes back.

No source covered theme range or suspensions.

### Cited Findings
- **Rising 5th.** "The rising perfect 5th in major keys" is the classic heroic gesture, as in the Star Wars and Superman themes. — [Film Music Notes: Meaning in Theme Openings](https://filmmusicnotes.com/meaning-in-theme-openings-the-power-of-melodic-gestures/)
- **Rising 4th and semitone.** A GCSE teaching resource says a rising perfect 4th sounds "heroic" and a semitone can sound "menacing". It also lists long sustained notes and a conjunct (stepwise) melody as mood tools, in the context of sad scenes. — [Highsted Grammar music unit (PDF)](https://www.highsted.kent.sch.uk/wp-content/uploads/2026/02/Music-Year-11-Terms-3-4.pdf); [Prezi: film music](https://prezi.com/xverneyhv47l/copy-of-film-music/) (attribution not isolated)
- **Rhythmic cell.** A memorable heroic theme has "a repeated rhythmic 'cell' which defines the theme", and "the simpler the better". — [I Can Compose](https://icancompose.com/?p=23471)
- **Lean on the 5th.** In many heroic themes the important pitch is the 5th rather than the tonic, which propels the melody forward instead of resting at home. — [Medium: favourite movie themes not by John Williams](https://medium.com/@composerchris/favorite-movie-themes-not-by-john-williams-4484dce05149)
- **Change every return.** Film music repeats material but "tends to change each time a theme plays": a new instrument joins, or the harmony or orchestration changes more dramatically. — [Vantage Music (Luis Andrei Cobo)](https://www.vantagemusic.org/?p=1023); [VI-Control: variation in John Williams's film themes](https://vi-control.net/community/threads/the-use-of-variation-in-john-williamss-film-music-themes-midi-included.128432/); [MusicRadar: quick guide to creating a soundtrack](https://www.musicradar.com/tuition/tech/the-quick-guide-to-creating-a-soundtrack-156113) (attribution not isolated)
- **Phrase structure is under-studied.** Richards' corpus study notes that "the phrase structure of film music themes remains virtually unexplored". He classifies themes by how the second half relates to the first, using the classical archetypes of sentence (acceleration) and period (return). — [Richards, "Film Music Themes: Analysis and Corpus Study", Music Theory Online 22.1](https://www.mtosmt.org/issues/mto.16.22.1/mto.16.22.1.richards.html); [ProQuest abstract](https://www.proquest.com/docview/1777977226)
- **Period.** At least one antecedent ("question") and one consequent ("answer") phrase, "totaling about 8 measures". The consequent reuses the antecedent's opening and differs in its cadence. The antecedent ends with a weak cadence, the consequent with a strong one. — [Lumen Learning: Form – Phrases](https://courses.lumenlearning.com/vccs-tcc-music-rford/chapter/melodic-phrases/); [Sharp or Flat: How to Listen (Classically), Part II](https://sharporflat.substack.com/p/how-to-listen-classically-part-ii)
- **Sentence.** "Normatively an eight-measure structure" that opens with "a two-measure basic idea" and develops it by repetition and continuation. — [UC Irvine: Theme Form (PDF)](https://music.arts.uci.edu/abauer/5.3/downloads/Theme_Form.pdf)

### Inferences
- **Motif.** One basic idea = 2 bars (32 steps) with 3–6 notes, built on one rhythmic cell that repeats in bar 2. Example cells: long–short (12 + 4 steps), dotted (6 + 2), long–short–short (8 + 4 + 4). (Inference from the rhythmic-cell and sentence findings.)
- **Intervals.**
  - First interval: rising P5 (+7 st) or P4 (+5 st), typically 1→5 or 5→1'.
  - Then mostly stepwise (≤ 2 st), with at most one more leap ≤ a 6th per phrase.
  - Follow a leap by a step back in the opposite direction.
  - Land on degree 5 at the end of bar 2 (open) and on degree 1 only at the final cadence.
  - Use a semitone neighbour (e.g., 5–♭6–5 in minor) for menace.

  The leap-recovery rule is standard melodic practice, **unverified** here.
- **Long notes.** End every 2-bar unit on a note ≥ 8 steps (a half note) and every 8-bar phrase on ≥ 16 steps. At 60–90 BPM, keep most theme notes at 4–8 steps. (Inference.)
- **8-bar forms on the grid.**
  - *Sentence:* bars 1–2 basic idea; bars 3–4 the same idea moved to fit the new chord; bars 5–6 fragments of 1 bar or less; bars 7–8 cadence.
  - *Period:* bars 1–4 antecedent ending on degree 2 or 5; bars 5–8 consequent with the same first 2 bars, ending on 1.

  (Inference from the cited forms.)
- **A A' B A** (32 bars, made of the 8-bar units above). A = sentence or period; A' = the same with a changed ending or reharmonisation; B = contrast in a new register or relative key, with shorter motif fragments; final A = return in fuller orchestration, often an octave higher. This puts the cited "change something each return" into practice. (Inference; AABA is not sourced.)
- **Range.** Keep a theme within an octave plus a 3rd (≤ 15 st) inside the lead instrument's melody zone (section 1). Place the single highest note once, in B or the last A. (Inference; this matches comfortable choir ranges of about 1.5 octaves.)
- **Suspensions.** On a chord change, hold the previous melody note across the barline when it forms a 4th or 9th over the new root, then resolve it down by step (4→3, 9→8) after 4–8 steps. Put suspensions on strong steps (1 or 9). (Standard harmony practice; **unverified** here.)
- **Development moves for repeats.**
  - transpose to the new chord or key
  - augmentation (double all lengths) for an emotional restatement
  - reharmonise under the same notes
  - hand the motif to a different section (horns → strings → choir)
  - fragment it into the counter-line or ostinato

  (Inference consistent with the cited "change each time" rule.)

### Gaps
- No source on typical theme ranges, interval statistics, or how suspensions are used in film themes. Richards' corpus statistics were not visible in the extract.
- No source confirmed A A' B A as the common film-theme layout.

---

## 5. Percussion: epic/trailer drums, timpani, cymbals, patterns, builds, when to use none

### Takeaway
- **Layers.** Taiko/tom ensembles, timpani, a clean sub "boom", and cymbals.
- **Programming.** Vary every velocity, accent the downbeats, and nudge stacked hits apart so they don't land at exactly the same time.
- **Sections.** Big wet hits (not ostinatos) mark section joins. Rolls and cymbal swells crescendo into one hard hit.
- **No drums at the start.** The quiet first act of a trailer-style cue (piano/strings) has no drums.

No source gave step-level patterns, so all 16-step patterns below are inferences.

### Cited Findings
- **Layer roles (Cinematic Composing).**
  - Big wet hits (timpani and tom ensembles with plenty of reverb) connect sections.
  - Don't put ostinatos on those layers.
  - The guide's layer list includes taiko and tom layers plus a "Low Sub Boom (keep it as clean as possible, no reverb)".

  — [Cinematic Composing: How to Write Epic Percussion](https://learn.cinematiccomposing.com/blog/how-to-write-epic-percussion)
- **Programming taiko (MusicRadar).**
  - "The semiquaver taiko sounds far too robotic, so we work through the notes, varying the velocities of each, then apply a velocity-controlled filter."
  - "No two or three taiko hit at exactly the same time": stacked notes are dragged slightly off the grid.
  - Positions and velocities are humanised again in a later pass.

  — [MusicRadar: How to program a pounding cinematic drum part](https://musicradar.com/how-to/how-to-program-a-pounding-cinematic-drum-part)
- **Toms and taiko played in (Computer Music via MusicRadar).**
  - Play the tom and taiko pattern on a keyboard for a real dynamic feel, then tweak velocities, "accenting significant beats (such as downbeats)".
  - A taiko sample set should include centre and rim hits, rimshots, flams, crescendo rolls, and both choked and sustained endings.

  — [MusicRadar/Computer Music: cinematic beats, p. 2](https://www.musicradar.com/how-to/produce-cinematic-beats-hollywood-epic/2)
- Layer an 808-style kick or a single taiko hit under the deepest slams for impact on big systems. — [Future Music (PressReader)](https://www.pressreader.com/australia/future-music-9629/20171214/283820033926800)
- A single sample at varying velocities isn't enough. A multisampled kit lets low velocities trigger gently played samples. — [MusicRadar: MIDI drums](https://www.musicradar.com/tutorials/music-production-tutorials/midi-drums-program-drum-week)
- **Suspended-cymbal roll.** A single-stroke roll on the cymbal's edge with soft mallets; the sound is "shrill and eerie", which suits film. A variant puts the cymbal upside down on a timpani head while the pedal moves. — [Suspended cymbal, Wikipedia (search extract)](https://en.wikipedia.org/wiki/Suspended_cymbal)
- **Rolls and swells (vendor copy).** A timpani roll grows from quiet to loud and ends on one hard strike, and it reads as "scale and occasion". A cymbal swell is a soft shimmer rising to a crash, "the classic build into a hit". — [Morphic: swell sound effects](https://morphic.com/resources/sounds/swell-sound-effects); [Morphic: drum roll](https://morphic.com/es/resources/sounds/drum-roll-sound-effect)
- **Trailer acts.** Act 1 is built on piano or strings, act 2 adds rhythm and brass, and act 3 brings choir, percussion and impacts. — [Tunee: trailer music (AI-generator page; low confidence)](https://tunee.ai/music-generator/trailer-music). The quiet-to-big arc is confirmed by a practitioner thread. — [VI-Control: trailer music, hybrid orchestral approach](https://vi-control.net/community/threads/trailer-music-style-composition-hybrid-orchestral-approach.164783/)
- **Libraries.** Libraries such as Epic Percussion 3 ship separate taiko-ensemble and epic-tom patches, with a stage tool to move instruments closer or further away. — [Pulse Audio: Epic Percussion 3](https://pulse.audio/product/epic-percussion-3-by-splash-sound)
- Timpani ranges are in section 1. GM/GS drum notes, taiko (GM 117) and timpani (GM 48 and the GS/GM2 orchestra kit) are in section 8.

### Inferences
**Layer names and notes.**
- LOW = big taiko / bass drum / low floor tom (GM drum notes 35, 36, 41)
- MID = tom ensemble (43, 45, 47)
- HIGH = high taiko / snare-like (48, 50, or 38/40)
- TIMP = timpani: GM program 48 on a melodic channel at 38–57, or GS/GM2 kit notes 41–53
- CYM = crash (49, 57)
- SWELL = reverse cymbal (GM program 120) or a suspended-cymbal roll

The drum-note names are **unverified** in this session (see section 8).

**16-step drum patterns** (steps 1–16; v = velocity):

| Pattern | LOW | MID | HIGH | Other | Use / tempo |
|---|---|---|---|---|---|
| P1 Heartbeat | 1 (v110), 3 (v80), 9 (v110), 11 (v80) | – | – | TIMP root on 1 every 2 bars | intro tension, 60–90 BPM |
| P2 Half-time epic | 1 (v120), 11 (v90) | 15, 16 (v60–75) | 9 (v115) | CYM on bar 1 of the section | epic, 80–100 BPM, or 120–140 felt in half time |
| P3 Driving 8ths | 1, 9 (v120) | 3, 5, 7, 11, 13, 15 (v80–95; 5 and 13 v105) | 13–16 16th fill every 4th bar | – | action, 120–150 BPM |
| P4 3+3+2 war drums | 1, 4, 7 (v120/100/110); 9, 12, 15 (v115/95/105) | 14, 16 (v70) | – | – | epic drive |
| P5 Gallop | 1, 9 | 1,3,4, 5,7,8, 9,11,12, 13,15,16 (v110/70/80 per group) | – | – | chase |
| P6 Build roll (last 1–2 bars before a section) | – | all 16 steps, velocity ramp 40→127 | same, or 16ths from step 9 | TIMP 16ths on the root with the same ramp; SWELL starts 1–2 bars early and peaks on step 16 | into the hit |
| P7 Hit | step 1 of the new section: LOW + CYM + TIMP at v127 | – | – | brass or braam stab (section 7) | section downbeat |
| P8 Drop-out | rest on steps 13–16 of the bar before the hit | | | | sharpens the hit |

- **Velocity and timing.**
  - Accents 110–127, normal 85–100, ghosts 50–70.
  - Humanise ±8 velocity on every non-accent hit.
  - Offset stacked layers by 1–10 ms (about 1–10 ticks at 480 PPQ and 120 BPM) so no two land together.
  - Make every repeat of a bar slightly different in velocity.

  (Inference from the MusicRadar advice; the numbers are mine.)
- **Timpani.** Roots and 5ths of the key only, inside one drum set (38–57). Use rolls as repeated 16ths with a CC11 or velocity ramp. Write the hit on step 1 of a section. (Inference.)
- **When to use no drums.**
  - intros and the first theme statement (act 1)
  - emotional/intimate cues (50–80 BPM)
  - the release/outro
  - the last 1–4 steps before a big hit (P8)

  Drums enter in the build (act 2: half-time P2 or heartbeat P1), reach full layering in the climax (act 3: P3/P4 plus hits), and drop out in the release. (Partly cited via the trailer-act model; the rest is inference.)
- **Build over 8 bars.** Bars 1–4: P1 or P2 with LOW only. Bars 5–6: add MID. Bar 7: P3. Bar 8: P6 roll plus swell. Next bar: P7 hit. (Inference.)

### Gaps
- No source gave step-level taiko, tom or timpani patterns, velocity numbers, or tempo-specific drum rules.
- No scoring text on "when to drop the drums" was found beyond the trailer-act model.

---

## 6. Building a cue: layering and crescendo across sections; velocity, CC1, CC11; legato overlap

### Takeaway
- **Shape.** A trailer-style cue runs in 3 (sometimes 4) acts over 2–3 minutes: sparse intro (piano/strings), build (add rhythm and brass), climax (choir, percussion, impacts), and a release. Section joins are marked with risers into hits.
- **CC1 (dynamics).** In orchestral libraries CC1 crossfades between sampled dynamic layers. Shape long notes per phrase with it, e.g. 20–30 → 80–100 → back.
- **CC11 (expression).** Plain volume, used to fade to silence.
- **Velocity.** Velocity carries the dynamics of short notes.
- **Legato.** Legato patches trigger a transition when consecutive notes overlap (VSL also accepts gaps up to ~50 ms). Velocity often chooses the transition speed, e.g. Spitfire SSO below 99 = slow, above 100 = hard.

### Cited Findings
**Cue structure**
- Trailer cues have "3, or sometimes 4, different 'acts'" and run 2–3 minutes in total. They start quiet and sparse, grow in intensity in the middle, and go big at the end. A common critique is "the 3rd act doesn't sound big enough", "the foremost challenge most trailer composers struggle with". — [VI-Control: trailer music, hybrid orchestral approach](https://vi-control.net/community/threads/trailer-music-style-composition-hybrid-orchestral-approach.164783/)
- Act 1 piano/strings, act 2 adds rhythm and brass, act 3 choir, percussion and impacts. — [Tunee: trailer music (AI-generator page; low confidence)](https://tunee.ai/music-generator/trailer-music)
- **Risers and hits.** Risers mark section boundaries: "riser into huge first hit", and "synth riser" climbing to a "distorted hit" at the end. The build-and-hit lands on an edit point, giving the editor a clean cut. Driving pulses enter in the build. — [filmmusic.io: Most Shocking Halloween Trailer 19](https://filmmusic.io/nl/song/12658-the-most-shocking-halloween-trailer-19); [Sascha Ende: Cinema Blockbuster Trailer 36](https://ende.app/cs/song/12615-cinema-blockbuster-trailer-36) (stock descriptions; attribution not isolated)

**CC1, CC11 and velocity**
- **Spitfire defaults.** "Dynamics – CC1, Vibrato – CC21, Expression – CC11." Dynamics are controlled by the mod wheel (CC1). — [Spitfire support: Dynamics, Vibrato and Expression](https://support.spitfireaudio.com/en/articles/11816091-what-is-the-difference-between-dynamics-vibrato-and-expression); [older Spitfire Zendesk copy](https://spitfireaudio.zendesk.com/hc/en-us/articles/360010385433-What-is-the-difference-between-Dynamics-Vibrato-and-Expression)
- **What each controller does.** CC1 fades "between sampled dynamic layers or artificial dynamics programmed into the instrument". CC11 is "generally just volume adjustment". — [VI-Control: rant about CC1, CC11 and velocity](https://vi-control.net/community/threads/rant-about-cc1-cc11-and-velocity.168479/); [NI community: Expression vs Dynamics](https://community.native-instruments.com/discussion/36085/expression-vs-dynamics) (attribution not isolated)
- **Using both.** Some composers ride CC11 together with CC1 to extend the dynamic range; others use CC1 alone. Spitfire libraries "all basically require two sliders" for CC1 and CC11. — [VI-Control poll: how do you use dynamics and expression](https://vi-control.net/community/threads/poll-how-do-you-use-dynamics-and-expression.101377/); [Gearspace: MIDI control](https://gearspace.com/threads/midi-control.1313563/) (attribution not isolated)
- **BBC Symphony Orchestra (BBCSO).**
  - Long notes use CC1. Staccato and other shorts "use note velocity for the dynamics (plus CC11)".
  - CC11 "is just an extra volume slider … doesn't change the dynamics at all".
  - The Core manual maps dynamics to CC1 and CC11 over 1–127; default CC mappings are in its Appendix C.
  - Sources: [Steinberg forum: BBCSO staccato volume](https://forums.steinberg.net/t/bbcso-staccato-volume-dorico-3-5/154328); [VI-Control: BBCSO expression vs dynamics vs velocity](https://vi-control.net/community/threads/bbcso-expression-vs-dynamics-vs-velocity.103333/); [BBCSO Core manual v2.0 (Scribd)](https://www.scribd.com/document/617483122/BBCSOCore-Manual-v2-0)
- **Shorts are usually velocity-driven.** "The majority of virtual instruments use velocity and ignore CC1 for the short articulations"; a small group (e.g., VSL) defaults to CC1. Some libraries can build a crescendo from velocity alone "while preserving the accent structure". — [VI-Control: continuous controller and velocity](https://vi-control.net/community/threads/continous-controller-and-velocity-how-to-use-most-effectively-whilst-increasing-dynamic-range.103627/); [VI-Control: favourite MIDI orchestration tip](https://vi-control.net/community/threads/your-favorite-midi-orchestration-tip.56385/page-14) (attribution not isolated)
- In a free string library, velocity controls "the quickness of the bowstroke", while CC1 or CC11 controls volume and tone. — [Zynthian: SCC Expressive Strings readme](https://os.zynthian.org/factory_sfz/Strings/SCC%20Expressive%20Strings/readme.txt)
- **Swell numbers.** Start "CC#1 low (value 20-30)", swell "up to value 80-100 at the peak of the phrase", then taper back down. Use "CC#11 (Expression) … to taper the ends of notes to silence (Niente) without changing the timbre". — [Haolingsheng: MIDI orchestration realism](https://www.haolingsheng.com/music-production/midi-orchestration-realism.html) (blog of uncertain authority; attribution likely but not certain)
- **Note ends and re-bows.** Small CC1 dips at the ends of chords mask bumps and give a more musical ending. A quick, steep "mountain peak" CC1 curve on sustain/legato patches fakes a re-bow. — [Production Expert: realism in orchestral mock-ups](https://www.production-expert.com/production-expert-1/how-to-improve-realism-in-orchestral-mock-ups); [VI-Control: favourite MIDI orchestration tip](https://vi-control.net/community/threads/your-favorite-midi-orchestration-tip.56385/page-14) (attribution not isolated)
- **Shape phrases, not notes.** Think in phrases instead of single notes. A straight ascending CC1 line won't convince because "the shape of cc1 is too static". — [VI-Control: guidelines to make strings sound better](https://vi-control.net/community/threads/guidelines-rules-of-thumb-to-make-strings-sound-better.134834/)

**Legato transitions (note overlap)**
- Spitfire: overlapping notes tell the engine you want "a 'legato transition' or 'interval'". VSL: keep any gap between notes under ~50 ms and legato still triggers. — [Spitfire: Legato insights](https://support.spitfireaudio.com/en/articles/11815898-legato-insights-legendary-low-strings-and-sparkling-woodwinds); [VSL forum](https://forum.vsl.co.at/post/128737) (exact post not isolated)
- **Spitfire Symphony Orchestra interval types.**
  - **slow**: "notes below 99 velocity, playing at normal speed"
  - **hard**: "notes over 100 velocity, or playing at faster speeds"
  - **runs**: very fast successions only

  Each type has a fixed timing offset, so you know "how much negative delay to apply". The manual does not define "fast"; users guess it depends on the length of the preceding note. — [VI-Control: Spitfire Symphony Orchestra, p. 30](https://vi-control.net/community/threads/spitfire-symphony-orchestra.149319/page-30)
- Uneven velocities between notes affect legato results, and making them uniform helped. Long held notes can trigger a new legato transition when the next note starts, which is why libraries also ship separate sustain patches. — [VSL forum](https://forum.vsl.co.at/post/114816) (exact post not isolated)
- **Cinematic Studio Strings (CSS) legato delays.**
  - Velocity **0–64 = slow legato (~300 ms)**; a control-panel script gives 330 ms as the slow default.
  - **65–100 = medium (~250 ms)**.
  - Another post gives offsets of −90 ms (medium) and −70 ms (fast) in Low Latency mode, and −220 ms (slow) in Expressive mode.
  - The first note of a legato phrase has about 100 ms of attack, and fast transitions are also near 100 ms.
  - Sources: [VI-Control: CSS control panel, p. 9](https://vi-control.net/community/threads/css-cinematic-studios-control-panel-css-csss-csb-csw-legato-delay-solution-other-features-1-8-now-with-winds.70174/page-9); [same thread, p. 30](https://vi-control.net/community/threads/css-cinematic-studios-control-panel-css-csss-csb-csw-legato-delay-solution-other-features-1-8-now-with-winds.70174/page-30); [VI-Control: Cinematic Studio Strings, p. 28](https://vi-control.net/community/threads/cinematic-studio-strings.54192/page-28) (velocity thresholds differ between posts)
- Because the delay varies with velocity, one fixed negative track delay can't line up every note. An FL Studio forum thread discusses negative track delay. — [VI-Control: articulation set delays](https://vi-control.net/community/threads/trying-to-argue-to-daw-devs-that-they-can-fully-implement-something-to-address-articulation-set-delays-lol.146244/); [Image-Line forum: negative track delay](https://forum.image-line.com/viewtopic.php?p=2000488)

### Inferences
**Section template (the 64-bar sizes are examples).**

| Section | Bars | Chords | Bass | Lead | Ostinato | Drums | CC1 / velocity |
|---|---|---|---|---|---|---|---|
| Intro | 8 | string pad, open voicing | pedal root | none, or a motif fragment | optional, alone, quiet | none | CC1 30–50; vel 50–70 |
| Build | 16 | pad + horns in the last 4 bars | root octaves | theme A | enters (16ths or 8ths) | P1 → P2 | CC1 ramps 50 → 90 across the section; vel 70–95 rising |
| Riser | last 1–2 bars of the build | sustained, CC1 to 127 | pedal | holds | 16ths | P6 + swell | ramps |
| Climax | 16 | strings + brass + choir, full voicing | octaves + tuba | theme A' an octave up, or in horns/trumpets | full | P3/P4, hits every 4–8 bars | CC1 100–127; vel 100–127 |
| Release | 8 | pad only | long root | motif fragment in augmentation | out | out | CC1 → 30; CC11 → 0 over the last 2 bars |

- **Making the climax bigger.** Answer the "third act not big enough" problem by adding register (octave doublings up and down, brass and choir) and density, not just velocity. (Inference.)
- **CC housekeeping.** Write an initial CC1 and CC11 at tick 0 of every file (e.g., CC1 = 64, CC11 = 100), so the plugin doesn't start from a stale or zero value. Write CC curves at least once per step. Fade only with CC11. (Inference.)
- **Phrase swell.** Within one phrase, CC1 rises from the section's base value to base + 30–40 over the first ~60 % of the phrase, then falls back over the last 40 %. Add a small dip (−10) at each chord change on held pads. (Inference from the cited 20–30 → 80–100 shape and the chord-end dips.)
- **Where the dynamics live.** The ostinato and drum files carry their dynamics in **velocity**, because shorts are velocity-driven. The chords, bass and lead files carry them in **CC1**, and velocity there mostly sets the attack and the legato speed. Also give long notes a sensible velocity, because GM synths and some players ignore CC1. (Inference.)
- **Velocity for legato speed.** Lyrical lines: ≤ 64 (CSS slow) and ≤ 98 (SSO slow). Fast runs: ≥ 101. Keep velocities within ±5 inside one legato phrase. (Inference from the cited thresholds.)
- **Overlap rule for legato lines** (lead, legato counter-line):
  - end each note 1/8–1/4 step after the next note starts (≈ 15–30 ms at 120 BPM, i.e. 15–30 ticks at 480 PPQ)
  - never overlap repeated same-pitch notes; shorten the first by 1/4 step instead
  - start a new phrase with a gap ≥ 1/2 step (well over 50 ms)
  - keep chords out of legato patches; use sustain or pad patches

  (Inference from the cited overlap triggers, the ~50 ms rule and the held-note warning.)
- **Latency.** Legato lines in some libraries sound 100–330 ms late (CSS). The generator can't fix that inside a library-agnostic MIDI file. Tell users to apply a negative offset (FL Studio has some form of track-delay setting) or to nudge the whole part earlier. (Inference; the FL Studio setting is not confirmed.)

### Gaps
- No official CC tables for BBC SO Discover or Spitfire LABS were seen.
- Not found: an FL Studio-specific negative-delay procedure, recommended CC write density, and legato thresholds for LABS and Discover.
- The section-length proportions for non-trailer film cues are not sourced.

---

## 7. Trailer and hybrid tropes: braam, risers, hits, Shepard tones, pulses, synth-orchestra hybrids

### Takeaway
The core vocabulary:
- the **braaam**: a huge, likely synth-layered low-brass blast, popularized by the 2010 *Inception* trailers, with earlier precedents in the 2007 *Transformers* and *District 9* trailers
- **risers into hits** on edit points
- **Shepard-tone** "endless rise" illusions, which shaped *Dunkirk* and are built from octave-stacked tones
- **pulses**, such as Dunkirk's ticking pocket watch turned into a synth sound
- **hybrid textures**: staccato string ostinatos with brass stabs and distorted electronics

Each can be sketched in MIDI: low brass with fast CC1 swells, rising lines with CC ramps, octave stacks with crossfaded CC11, and one-pitch 8th or 16th pulses.

### Cited Findings
- **Braaam origin.** Mike Zarin worked on Inception's first teaser. Zack Hemsey wrote the music for the third trailer, which included "a likely synthesized horn BRAAAM sound that became popular on the internet for its volume". Hemsey "did not claim credit for inventing the sound", but believed his innovation was to include it as part of the music rather than as an effect. — [BRAAAM, Wikipedia (search extract)](https://en.wikipedia.org/wiki/BRAAAM)
- **Earlier examples.** "Most accounts suggest the first example of BRAAAM can be found in the first Transformers movie trailer (2007)"; the District 9 trailer "predates the Inception trailers by almost a year". — [Northwestern "Hundredth Mile": the origins of braaam](https://sites.northwestern.edu/hundredthmile/the-origins-of-braaam); [Epic Stock Media: a brief history of braaam](https://epicstockmedia.com/a-brief-history-of-braaam/) (attribution not isolated)
- **Zimmer on it.** Zimmer has said the Inception music "became the blueprint for all action movies, really", and he reportedly feels "horrible" when his Inception braams are used in trailers. — [The Playlist](https://theplaylist.net/?p=92087); [Loop Insight: "BRAAAM!", the sound that invaded the Hollywood soundtrack](https://www.loopinsight.com/2016/12/10/braaam-the-sound-that-invaded-the-hollywood-soundtrack/); [Hollywood Reporter: BRAAAMs for beginners](https://www.hollywoodreporter.com/news/braaams-beginners-how-a-horn-793220) (quote attribution not isolated)
- **Shepard tone in trailers.** "An auditory illusion of a continually ascending or descending pitch", "frequently used to create tension". — [Soundcy: what is the trailer sound](https://soundcy.com/article/what-is-the-trailer-sound); [Morphic: braam sound effects](https://morphic.com/resources/sounds/braam-sound-effects) (attribution not isolated)
- **Dunkirk.**
  - Nolan: "There's an audio illusion … called a 'Shepard tone' … It's always going up and up and up but it never goes outside of its range. And I wrote the [Dunkirk] script according to that principle."
  - The tone is made by "stacking sine waves that are an octave apart and moving the bass note upward or downward".
  - Nolan recorded his own pocket watch, and Zimmer had the ticking turned into a synthesizer sound. The recording also became the basis for the first teaser.
  - Zimmer's demo "was rising constantly", which couldn't be edited like ordinary cues, so he had to rework it.
  - Sources: [Business Insider India](https://www.businessinsider.in/christopher-nolan-explains-the-audio-illusion-that-created-the-unique-music-in-dunkirk/amp_articleshow/59742153.cms); [CBC q: Zimmer explains the audio trickery](https://www.cbc.ca/radio/q/blog/hans-zimmer-explains-the-audio-trickery-that-made-dunkirk-audiences-nauseous-1.4311684); [National Post (PressReader)](https://www.pressreader.com/canada/national-post-latest-edition/20170728/281522226160019) (attribution of individual details not isolated)
- **Trailer arc.** Three or four acts over 2–3 minutes, risers into hits, pulses entering in the build (see section 6). — [VI-Control](https://vi-control.net/community/threads/trailer-music-style-composition-hybrid-orchestral-approach.164783/)
- **Hybrid vocabulary in stock descriptions.**
  - "hybrid orchestra—heavy on aggressive, staccato string ostinatos and blaring brass stabs—and gritty, distorted electronic elements"
  - "menacing braams, powerful percussive hits, dark synth textures, and dramatic risers"
  - distorted synth hits and processed vocals

  — [filmmusic.io: Halloween Trailer 19](https://filmmusic.io/nl/song/12658-the-most-shocking-halloween-trailer-19); [Warner Chappell PM playlist](https://de.warnerchappellpm.com/playlist/label-special-glory-oath-blood/MzAyMDk4MS00MmQzOTQ) (attribution not isolated)
- **Hits in FL Studio.** Image-Line's UVI FLEX packs include "playable orchestral hits", licensed inside the FL Studio licence. — [Image-Line: UVI FLEX packs](https://www.image-line.com/specials/uvi-flex-deal)

### Inferences
- **Braam (chords + bass files).**
  - Pitches, all within the low-interval floors: root at 28–40 (tuba, low synth), root + 12, the 5th above that, and root + 24 (trombones/horns). Optionally add a ♭2 or ♭6 above E3 for menace (semitone = menacing, section 4).
  - Timing: starts on step 1 of a section and lasts 1–2 bars.
  - Velocity 127. CC1 ramps 40→127 over the first 2–4 steps, then CC11 decays across the second half.
  - GM layering: 62 Brass Section plus 63 SynthBrass 1 (63 **unverified**).
- **Riser (last 1–4 bars before a hit).**
  - Chromatic or whole-tone line moving every 2–4 steps, in tremolo strings (GM 45) and/or synth.
  - CC1 and CC11 ramp 20→127.
  - Drums play P6 (section 5); the line ends at step 16 and the hit falls on step 1.
  - Optionally a reverse cymbal (GM 120) timed to peak at step 16.
- **Hit (step 1).** LOW drums + crash (GM drum 49/57, **unverified**) + brass stab or braam + optional orchestra hit (GM 56, **unverified**), all at v127. Follow with 1–4 steps of silence or a long tail.
- **Shepard-style riser.**
  - Use 3–4 copies of one line, octaves apart (e.g., starting 48/60/72/84), all rising a semitone every bar (or every 4 steps).
  - On each copy's own channel, CC11 rises from 0 at the bottom of the cycle to its maximum in the middle and back to 0 at the top. When a copy reaches the top, it restarts at the bottom.
  - This needs separate channels per voice for independent CC11.

  (Derived from the cited "octave stack moving upward" description.)
- **Pulse (counter-line file).**
  - One pitch (tonic or 5th) in 8ths or 16ths on a low synth or string spiccato, accents on steps 1 and 9.
  - "Ticking" variant: a short, high, dry note on every 8th (odd steps) at constant velocity, slightly varied.
- **Hybrid doubling.** Double the string ostinato an octave lower on a synth bass, and give the climax chords a synth-pad layer (GM 89–96 range, see section 8). (Inference.)

### Gaps
- No source on standard braam pitch content or voicing, riser lengths, or Shepard-tone voice counts.
- The GM numbers for SynthBrass and Orchestra Hit were not verified.

---

## 8. MIDI and General MIDI: program numbers, drum-map notes, FL Studio and free libraries (velocity / CC1 response)

### Takeaway
**GM as a preview palette.** Program numbers are 1-based; send the value minus 1.
- strings 41–52, choir 53–55, brass 57–64 (some numbers in these blocks are unverified; see the table)
- flute 74, recorder 75, church organ 20
- timpani 48, taiko 117, reverse cymbal 120, pads 89–96
- percussion on channel 10: GM1 key map 35–81; GS/GM2 devices add an orchestra kit (program 49) with chromatic timpani on notes 41–53

**What FL Studio users actually hear.** Most will use FLEX (free stock), Spitfire LABS or BBC SO Discover (both free). Their long patches take dynamics from CC1 (with CC11 as volume) and their short patches from velocity.

**FL Studio import.** FL Studio imports .mid notes, but its manual describes CC data as a separate import into the event editor, and CC1 isn't predefined. So the generator must not rely on CC lanes alone.

### Cited Findings
**GM program numbering and confirmed numbers**
- **Numbering.** Most devices, DAWs and sequencers display GM programs as 1–128; synths often use 0–127 internally. The byte sent is one lower: "117 Taiko Drum" is sent as 116 (hex 74). — [PG Music: GM instrument and drum kit lists](https://www.pgmusic.com/tutorial_gm.htm); [General MIDI, Wikipedia (search extract)](https://en.wikipedia.org/wiki/General_MIDI); [weblio GM2 table](https://www.weblio.jp/content/GM2)
- **Confirmed in extracts (1-based):**
  - **20 Church Organ, 45 Tremolo Strings, 46 Pizzicato Strings, 48 Timpani** — [General MIDI, Wikipedia (search extract)](https://en.wikipedia.org/wiki/General_MIDI)
  - **49 String Ensemble 1** — [Finale PrintMusic: General MIDI Table](https://usermanuals.finalemusic.com/PrintMusic2010Mac/Content/General_MIDI_Table.htm)
  - **53 Choir Aahs** (PG Music spells it "Choir Ahh"), **61 French Horn, 62 Brass Section** — [PG Music](https://www.pgmusic.com/tutorial_gm.htm)
  - **41 Violin, 44 Contrabass, 47 Orchestral Harp, 50 String Ensemble 2** (slower attack than 1), **54 Voice Oohs, 89 Pad 1 (new age)** (a pad stacked with a bell, often derived from a Roland D-50 patch), **117 Taiko Drum, 118 Melodic Tom** — [General MIDI, Wikipedia (search extract)](https://en.wikipedia.org/wiki/General_MIDI); [Finale: GM patch numbers and names](https://usermanuals.finalemusic.com/Finale2012Win/Content/Finale/General_MIDI_Patch_Numbers_F_Names.htm); [LilyPond: MIDI instruments](https://lilypond.org/doc/Documentation/notation/midi-instruments)
  - **100 FX 4 (atmosphere)** — [Finale: GM patch numbers and names](https://usermanuals.finalemusic.com/Finale2010Mac/Content/Finale/General_MIDI_Patch_Numbers_F_Names.htm)
  - **73 Piccolo, 74 Flute, 75 Recorder, 120 Reverse Cymbal** — [PG Music](https://www.pgmusic.com/tutorial_gm.htm)

**GM drum map**
- **GM1 basics.** Channel 10 is reserved for percussion, each key being one sound. A GM1 device must support 47 percussion sounds (key map 35–81). Confirmed: **35 Acoustic Bass Drum, 36 Bass Drum 1, 59 Ride Cymbal 2**. GM1 was superseded by GM2 in 1999 but "is still commonly used". — [Finale: GM percussion map](https://usermanuals.finalemusic.com/PrintMusic2010Mac/Content/General_MIDI_Percussion_Map_Table.htm); [General MIDI, Wikipedia (search extract)](https://en.wikipedia.org/wiki/General_MIDI); [MuseScore: GM percussion key map (PDF)](https://musescore.org/sites/musescore.org/files/2024-10/General%20MIDI%20Standard%20Percussion%20Set%20Key%20Map.pdf)
- **GS/GM2 orchestra kit.** Program 49 on channel 10 is "a collection of concert drums and timpani". In Finale's table, timpani F starts at note 41 and rises chromatically to F at 53, mapping "low F up to the F an octave higher" at notated pitch. Concert Bass Drum = 36, Concert Cymbal 2 = 57, Concert Cymbal 1 = 59. A Kurzweil manual puts concert bass drums around 72–73, so mappings vary by device. — [Finale: GM Orchestral Percussion Map](https://usermanuals.finalemusic.com/Finale2010Mac/Content/Finale/General_MIDI_Orchestral_Percussion_Map_Table.htm); [NoteWorthy forum](https://forum.noteworthycomposer.com/?topic=1280); [Kurzweil PC88 manual, App. C](https://www.manualslib.com/manual/888154/Kurzweil-Pc88.html?page=79); [General MIDI Level 2, Wikipedia (search extract)](https://en.wikipedia.org/wiki/General_MIDI_Level_2)

**Controllers in FL Studio**
- CC1 is the standard Mod Wheel controller, but FL Studio does not predefine CC1 to anything. Use the "Mod Wheel (Wrapper)" control, or link it via Tools > Last Tweaked > Link to Controller. Not every plugin or patch responds to the mod wheel. — [Novation: FLkey support article](https://support.novationmusic.com/hc/en-gb/articles/9062874114706)
- CC11 = Expression and CC1 = Dynamics in Spitfire's defaults (section 6). — [Spitfire support](https://support.spitfireaudio.com/en/articles/11816091-what-is-the-difference-between-dynamics-vibrato-and-expression)

**FL Studio MIDI import**
- FL Studio "only imports .mid format, not .midi". CC data is loaded **separately**: open the event editor for the specific CC target in the pattern that holds the notes, and import the file there with the same import options. Don't use "Realign events", or notes and CC will drift out of sync. The extract also says the import dialog is "available only in Fruity and Producer editions"; that wording is unclear. — [Image-Line FL Studio manual: importing MIDI CC data as automation](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/automation_midiimport.htm)
- Spitfire's FL Studio guide: edit CC1 in the piano roll's event pane, or use an automation clip in the playlist. — [Spitfire: Automating MIDI CC in FL Studio](https://support.spitfireaudio.com/en/articles/11816171-automating-midi-cc-in-fl-studio)
- **Forum reports.** Mod wheel and similar controls are automation targets unique to each generator and aren't copied with the MIDI data. An FL Studio 10-era thread says FL imported notes without mod-wheel data. Both are old or anecdotal. — [KVR forum: copy AT, MW and PB in FL Studio](https://www.kvraudio.com/forum/viewtopic.php?p=8077706); [Image-Line forum](https://forum.image-line.com/viewtopic.php?p=666462)

**FL Studio stock sounds**
- **FLEX.** "A fast, free virtual synth plugin in FL Studio, packed with thousands of pro-sounding presets across a wide range of FLEX Packs". The Core Series has "over 200 new free presets across eight essential packs". One listing names a Core String pack. Other packs cost from $15, or come with FL Cloud Pro (from $12.42/month). FLEX arrived in FL Studio 20.5. — [Image-Line: FLEX](https://www.image-line.com/flex); [Image-Line: FL Cloud FLEX packs](https://www.image-line.com/fl-cloud/flex-packs); [MusicTech: FL Studio 20.5 adds FLEX](https://www.musictech.net/news/gear/image-line-fl-studio-update-flex-synth-plug-in/); [SoftwareOne FLEX listing](https://platform.softwareone.com/product/flex/PCP-2584-5677)
- A forum user says FL Studio's stock plugins are "mostly aimed at electronic music" (opinion). — [VI-Control: does FL Studio have preset instruments](https://vi-control.net/community/threads/does-fl-studio-have-preset-instruments-and-sounds-like-ableton-does.110769/)
- A Packt book, *Music for Film and Game Soundtracks with FL Studio*, has a chapter on "Recommended orchestral tool plugins". Its contents were not visible. — [Packt](https://subscription.packtpub.com/book/business-and-other/9781803233291/6/ch06lvl1sec27/recommended-orchestral-tool-plugins)

**Free orchestral libraries**
- **Spitfire LABS.** "A series of free software instruments presented by Spitfire Audio", in a dedicated plug-in, with string packs such as Scary Strings and Expressive Strings (a LABS+ plug-in is also offered). A Gearspace user recalls ("IIRC") that a LABS program's "Expression" is usually mapped to CC11 and "Dynamics" to CC1; this is unverified. — [AudioTechnology: LABS Scary Strings](https://www.audiotechnology.com/?p=78241); [Spitfire: LABS Expressive Strings](https://www.spitfireaudio.com/expressive-strings-labs); [Gearspace: MIDI control](https://gearspace.com/threads/midi-control.1313563/)
- **BBC Symphony Orchestra Discover.**
  - Now free from Spitfire (VST/AU/AAX, PC and Mac). It used to cost $49, or a questionnaire followed by a 14-day wait.
  - About 200 MB (one later listing says ~240 MB).
  - Spitfire's page lists **34 instruments, 1 mix signal and 47 techniques**; other sources count 33 or 35 instruments.
  - Sources: [Spitfire: BBC SO Discover](https://www.spitfireaudio.com/en-eu/products/bbc-symphony-orchestra-discover); [MusicTech](https://musictech.com/news/gear/spitfire-bbc-symphony-orchestra-discover-free/); [MusicRadar: now free](https://www.musicradar.com/news/spitfire-audio-free-bbc-symphony-orchestra); [MusicRadar: $49 or wait](https://www.musicradar.com/news/spitfire-audios-new-dollar49-bbc-symphony-orchestra-discover-plugin-is-free-if-youre-willing-to-wait-for-it); [Sound On Sound](https://www.soundonsound.com/news/spitfires-bbcso-discover-now-instantly-free)
- A third-party Sibelius soundset page for Discover notes only a "long" and a "staccatissimo" articulation per instrument, and that its playback setup limits volume range to CC1. This describes a Sibelius configuration, not a Spitfire spec. — [sibelius-services (itch.io)](https://sibelius-services.itch.io/bbc-symphony-orchestra-discover)
- **BBCSO family behaviour.** Long notes follow CC1 dynamics; shorts follow velocity, plus CC11 (section 6). — [Steinberg forum](https://forums.steinberg.net/t/bbcso-staccato-volume-dorico-3-5/154328)

### Inferences
**GM table for the generator** (1-based; send value − 1).

| Role | Confirmed in extracts | **Unverified** (standard GM1 from my knowledge) |
|---|---|---|
| Strings | 41 Violin, 44 Contrabass, 45 Tremolo Strings, 46 Pizzicato Strings, 47 Orchestral Harp, 49 String Ensemble 1, 50 String Ensemble 2 | 42 Viola, 43 Cello, 51 SynthStrings 1, 52 SynthStrings 2 |
| Voices | 53 Choir Aahs, 54 Voice Oohs | 55 Synth Voice, 56 Orchestra Hit |
| Brass | 61 French Horn, 62 Brass Section | 57 Trumpet, 58 Trombone, 59 Tuba, 60 Muted Trumpet, 63 SynthBrass 1, 64 SynthBrass 2 |
| Winds | 73 Piccolo, 74 Flute, 75 Recorder | 69 Oboe, 71 Bassoon, 72 Clarinet |
| Keys / organ | 20 Church Organ | 1 Acoustic Grand Piano, 9 Celesta, 10 Glockenspiel, 15 Tubular Bells |
| Percussion (melodic channel) | 48 Timpani, 117 Taiko Drum, 118 Melodic Tom, 120 Reverse Cymbal | 119 Synth Drum |
| Pads / FX | 89 Pad 1 (new age), 100 FX 4 (atmosphere) | 90 Pad 2 (warm), 92 Pad 4 (choir), 93 Pad 5 (bowed), 95 Pad 7 (halo), 96 Pad 8 (sweep), 98 FX 2 (soundtrack) |

- **Default GM patches for the five files.**
  - chords: 49 (50 for slow swells; 62 for brass climax; 53 choir; 20 organ; 89/92 for hybrid pads)
  - bass: 44 (plus 43 cello, unverified; or 59 tuba, unverified)
  - lead: 41 / 61 / 74 / 75 / 53
  - ostinato: 46 pizzicato or 45 tremolo, or short notes on 49 (GM has no spiccato program)
  - drums: channel 10

  (Inference.)
- **Drums file.**
  - Channel 10 (channel index 9 when counting from zero).
  - Low drums 35/36 (confirmed) and 41/43 (unverified).
  - Toms 45/47/48/50, crashes 49/57, Chinese 52, splash 55 (all unverified, standard GM1 values).
  - For pitched timpani, use program 48 on a melodic channel with notes 38–57. On GS/GM2 players, the orchestra kit (program 49 on channel 10) gives timpani F2–F3 on notes 41–53 at pitch; GM1-only players ignore the kit change.
  - Taiko as program 117 on a melodic channel; its pitch depends on the note played.

  (Inference.)
- **FL Studio practicalities.**
  1. Save files as **.mid**.
  2. Give every note a velocity that works on its own, because CC lanes may not arrive on a plain import.
  3. Still write CC1/CC11 into each part file for users who import them, and optionally also export a CC-only .mid per part for the manual's event-editor import.
  4. Tell users that Spitfire plugins (LABS, BBCSO) listen to CC1/CC11 by default, while other plugins need "Mod Wheel (Wrapper)" linking.

  (Inference from the manual, Novation and Spitfire findings.)
- **Library behaviour → file content.** In Spitfire's free libraries, long patches follow CC1 (dynamics) and shorts follow velocity. So the ostinato and drum files should be fully velocity-shaped, and the chords, bass and lead files should carry CC1 swells. (Inference.)
- **Clamp to range.** Free libraries probably sound only within their sampled ranges, so clamp each part to the section 1 zones. (Inference; per-patch ranges not verified.)

### Gaps
- The MIDI Association GM and CC pages could not be reached (DNS failure).
- GM drum-map names for the toms and cymbals and about 25 GM program names remain **unverified**.
- Not seen: official LABS and Discover CC mappings, key ranges and articulation lists.
- Current FL Studio (2024–2025) MIDI-import behaviour for CC data was not confirmed.
- Not researched: whether FL Studio users commonly preview GM files with a SoundFont player, and what FPC's default drum mapping is.

---

## 9. Tempo conventions: BPM ranges for emotional, epic and action cues; half-time and double-time feel

### Takeaway
Only stock-library tags were found:
- action/trailer cues cluster around **100–150 BPM** (one library uses 90–120; pulsing cues reach the 150s–160s)
- emotional/introspective cues sit around **50–90 BPM** (examples at 50, 68 and 83 BPM)

Half-time feel makes a section "heavier, wider, darker, or more dramatic without changing the actual BPM". Double-time feel makes an 80 BPM piece feel like 160. Both change intensity without changing the tempo.

### Cited Findings
- **Action/trailer tags.** Stock-music listings show a 110 BPM action track, a 146 BPM hybrid industrial trailer track and a 130 BPM battle track. Faster, pulsing cues reach the 150s and 160s. The tags are inconsistent (some list 0 BPM). — [Shockwave-Sound: action/chase](https://www.Shockwave-Sound.com/browse/production-type/action-chase); [Shockwave-Sound: music for dramatic trailers](https://Www.Shockwave-Sound.com/browse/genre/music-for-dramatic-trailers) (attribution not isolated)
- One loop library gives 90–120 BPM for its action-trailer cues. — [Loopmasters product 14299](https://www.loopmasters.com/products/14299)
- **Emotional/heroic tags.** A soft, introspective piece at 50 BPM, an "emotional, subtle drama" track at 68 BPM, and a heroic/valiant piece at 83 BPM. — [Shockwave-Sound: heroic/patriotic/valiant](https://www.Shockwave-Sound.com/browse/mood/heroic-patriotic-valiant/stock-music/order-relevance/standard/50/4); [Shockwave-Sound: string section](https://www.shockwave-sound.com/browse/instrument/string-section/stock-music/order-relevance/standard/50/29) (attribution not isolated)
- **Horror (conflicting).** 40–90 BPM per an AI music-generator page versus 90–120 BPM per a soundtrack article. — [Tunee: film music generator](https://www.tunee.ai/music-generator/film); [TMFF: how soundtracks shape the emotion of a film](https://tmff.net/?p=42769)
- **Half-time feel.** The pulse stays the same while "the groove suggests slower large-scale motion by moving the placement of strong rhythmic events rather than the metronome marking". It is "especially useful when a section needs to feel heavier, wider, darker, or more dramatic without changing the actual BPM". — [Mixgraph glossary: half-time](https://www.mixgraph.io/glossary/half-time); [Soundbrenner: half-time feel](https://www.soundbrenner.com/blogs/articles/half-time-feel) (attribution not isolated)
- **Double-time feel.** A song at 80 BPM keeps its chord changes and bar lines while the rhythm section plays as if the groove were 160 BPM. It is a feel change, not a tempo change. — [Soundbrenner: double-time feel](https://www.soundbrenner.com/blogs/articles/double-time-feel)
- Half-time and double-time are the same relationship read from opposite ends. — [No Treble: understanding time-feel terminology](https://www.notreble.com/buzz/2019/04/03/understanding-time-feel-terminology/)

### Inferences
**Tempo presets** (steps per bar fixed at 16):

| Cue type | BPM | Step length | Grid usage |
|---|---|---|---|
| Emotional / intimate | 60–80 (range 50–90) | 250–188 ms | theme in 4–8-step notes; pad changes every 1–2 bars; no drums or P1 |
| Epic / heroic | 80–100 written, or 120–140 with half-time drums | 188–150 ms | half-time drums (backbeat on step 9), 16th ostinato above |
| Action / chase | 120–150 | 125–100 ms | 16th spiccato ostinato, P3/P5 drums, 1 chord per bar |
| Trailer / hybrid | 100–140 | 150–107 ms | act 1 free/no drums, act 2 half-time, act 3 double-time ostinato and full drums |
| Tension / horror | 60–90 (sources conflict) | 250–167 ms | pulses (P1, single-pitch ostinato), long pads |

- **Half-time on the grid.** Move the backbeat from steps 5/13 to step 9. Big drums on step 1 (plus 11 or 15). Keep the ostinato in 16ths, so fast strings run over slow drums. (Inference.)
- **Double-time on the grid.** At the same BPM, change the ostinato from 8ths to 16ths and switch drums from P2 to P3 at a section boundary, while the chord rhythm stays at 1 chord per 1–2 bars. (Inference.)
- **Harmonic rhythm.** One chord per bar (or per 2 bars) at 100–150 BPM; one per bar at 60–80 BPM. (Inference; no source.)

### Gaps
- No composer-guide or textbook source on film-cue BPM norms was found.
- No data on how often film cues use half-time or double-time feel.
- The horror tempo range is contradictory.
