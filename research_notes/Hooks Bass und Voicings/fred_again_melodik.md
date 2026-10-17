# Fred again..: melodic and rhythmic DNA of hooks, keys and basslines

> **Method and source-access note (read first).**
> - **No page could be opened directly.** WebFetch failed with DNS errors, and the proxy refused curl for hooktheory.com, chordify.net, attackmagazine.com, musicradar.com, reddit.com, youtube.com, wikipedia.org and archive.org. Everything web-based below therefore comes from **search-engine summaries of the cited pages**. These summaries are accurate most of the time but not always. Where two summaries of the same page disagree, both values are given.
> - **The only symbolic (note-level) data found are Hooktheory TheoryTab statistics** for 5 Fred tracks: Kammy, Delilah, ten, Winny and leavemealone. They cover melody range, % diatonic, % chord tones, contour type and the site's 0–100 metrics. **No onset positions or individual notes** were obtainable for any track.
> - **The baseline figures are my own computation.** I took the public Sheet Sage Hooktheory dataset (Donahue et al., CC BY-NC-SA 3.0; 26,175 TheoryTab annotations, file dated June 2022; SHA-256 checked against the README) and measured 13,798 songs and 23,348 sections. This tells you how unusual Fred's numbers are next to the TheoryTab population, which is mostly pop. The dataset contains **no Fred again.. tabs** and none of his sampled source songs (I checked). My chord-tone method (is the note's pitch class in the annotated chord at the note's onset, counted per note) may differ from Hooktheory's own on-site formula.
> - The report "Stilanalyse Fred again AVAION BUNT.md" already covers harmony archetypes, tempo templates, the 909/double-16th kick, the hum, Reese and sine bass modes, the raw→chopped→pitched vocal states, chops of ≤1–2 bars and the 16th-note pluck on chord roots. These are only referenced below, not repeated.
> - Scale degrees are given in both readings, the minor key and its relative major (e.g. "♭3 of G minor = 1 of B♭ major"), because Fred's keys sit on that ambiguity.

## 1. Vocal-chop / vocal-hook melodies: pitch set, range, contour, rhythm, repetition, relation to the chord

### Takeaway
In all five TheoryTabs plus one remake transcript (Marea), Fred's hook lines are **tiny and deliberately "off" the chords**. They use **2–5 distinct pitches**, span a **4th or 5th (5–7 semitones) in 3 of 5 tabs** and at most an octave in the other two, are **98–100 % diatonic**, move **mostly by step**, and carry **chord-melody tension of 82–99 (database average = 50) in 4 of 5 tabs**. In three tabs only 33–52 % of notes are chord tones, against a population median of 65 %. That fits a **fixed pitch cell held over a changing loop**, a common-tone strategy, and argues against transposing the chop with every chord. Rhythm is the weakest part of the evidence. All five tabs score very low on Hooktheory's melodic-complexity metric (7–14, ten = 31). That metric includes rhythmic complexity and syncopation, so the rhythms are likely simple and repetitive. No source gives onset grids.

### Cited Findings

**a) Hooktheory TheoryTab statistics for Fred again.. (via search summaries of the pages)**

| Track (HT key, BPM) | Melody range (span) | Diatonic | Chord tones | Chord-melody tension | Melodic complexity | Chord complexity | Other | Source |
|---|---|---|---|---|---|---|---|---|
| Kammy (like i do) (G minor, 132) | A♯3–F4 (7 st) | 100 % ("fully diatonic") | "about a third" (~33 %) | 99 all sections / 98 chorus | 8 (another summary: 9) | 17 (another summary: 21) | "moves mostly stepwise"; Chord Progression Novelty 10 (chorus 13); Chord-Bass Melody 82; most-used chord = "i with the 3rd and 5th omitted" (bare root); mood tags "tense, simple, classic, moody" (another summary gives the same tags for ten, so they may belong to only one of the two) | [Hooktheory Kammy](https://www.hooktheory.com/theorytab/view/fred-again/kammy-(like-i-do)) |
| Delilah (pull me out of this) (B♭ major, 134) | A4–D5 (5 st) | 100 % | 67 % | 51 all / 52 "Instrumental" section | 12 (another summary: 12–14) | 42 | Chord-Bass Melody 73; most-used chord IV; mood "bright" | [Hooktheory Delilah](https://www.hooktheory.com/theorytab/view/fred-again/delilah-(pull-me-out-of-this)) |
| ten (B minor, 128) | A4–A5 (12 st) | 100 % | not reported | 85 all / 82 "Instrumental" | 31 (another summary: 31–32) | 10 | tagged "stepwise motion"; labelled instrumental (no verse/chorus split); most-used chord VI; important chords Bm, Em, F♯m | [Hooktheory ten](https://www.hooktheory.com/theorytab/view/fred-again/ten) |
| Winny (C♯ minor, 140) | G♯3–G♯4 (12 st); another summary: A3–G♯4 (11 st) | 98 % | 52 % | 90 | 9 (chorus); unlabelled values 30 and 34 also on page | 84 | tagged "stepwise motion"; main chords i, iv, VI | [Hooktheory Winny](https://www.hooktheory.com/theorytab/view/fred-again/winny) |
| leavemealone feat. Baby Keem (A minor, 174) | C4–F4 (5 st) | 100 % ("fully in key") | "about 40 %" | 85 | 7 ("below average") | 5 | most-used chord VI | [Hooktheory leavemealone](https://www.hooktheory.com/theorytab/view/fred-again/leavemealone-feat-baby-keem) |

- Only these five Fred TheoryTabs turned up in searches. No TheoryTab was found for Marea, Jungle, Turn On The Lights again.., adore u, Danielle or Kyle — [Hooktheory search results](https://www.hooktheory.com/theorytab/artists/f/fred-again)
- One summary of the Kammy page lists the main chords as "G minor, C minor, D minor (i, iv, VI)". That is internally inconsistent, because Dm is v, not VI, in G minor. Chordify reads the loop as E♭(7)–F–Gm–Dm — [Hooktheory Kammy](https://www.hooktheory.com/theorytab/view/fred-again/kammy-(like-i-do)); [Chordify Kammy](https://chordify.net/chords/fred-again-songs/kammy-like-i-do-chords)
- Delilah's tab reports its stats over "all analyzed melody sections, so it may include instrumental notes", which means the "melody" may be a chop or instrument line rather than a sung verse — [Hooktheory Delilah](https://www.hooktheory.com/theorytab/view/fred-again/delilah-(pull-me-out-of-this))
- TheoryTabs "reveal the structure of a song in the form of chords and melody, but are not meant to be a transcription", and their playback is always piano — [Scaler forum on TheoryTab](https://forum.scalermusic.com/t/theorytab-database-by-hooktheory-a-great-free-resource-and-compliment-to-scaler/10173)

**b) What the Hooktheory metrics mean**
- Scores are relative to the whole database, where **50 = "average song"**, and each score also comes with a percentile — [Hooktheory song metrics](https://www.hooktheory.com/song-metrics/about)
- **Chord-Melody Tension** "measures how much the melody notes clash or harmonize with the underlying chords" — [Hooktheory song metrics](https://www.hooktheory.com/song-metrics/about)
- **Melodic Complexity** "measures the range, intervallic variety, and rhythmic complexity of the melody". One per-song description words it as "use of notes outside the key and rhythmic syncopation" — [Hooktheory song metrics](https://www.hooktheory.com/song-metrics/about); [Hooktheory Delilah](https://www.hooktheory.com/theorytab/view/fred-again/delilah-(pull-me-out-of-this))
- **Chord Complexity** tracks how far a song goes beyond triads, through added tones (7ths, add9) or notes borrowed from outside the key — [Hooktheory song metrics](https://www.hooktheory.com/song-metrics/about)
- **Chord-Bass Melody** was described in one summary as rating "how smoothly the bass moves between chords, favoring stepwise motion over root-position jumps". I could not verify this definition independently — [Hooktheory Kammy](https://www.hooktheory.com/theorytab/view/fred-again/kammy-(like-i-do))

**c) Population baseline (own computation on the Sheet Sage Hooktheory dataset, 13,798 songs / 23,348 sections)** — [Sheet Sage README & dataset](https://github.com/chrisdonahue/sheetsage)
- Melody range per song (all sections): **median 15 semitones**, 10th percentile 8, 90th percentile 29. **Only 2.8 % of songs span ≤ 5 st**, 7.6 % ≤ 7 st, 23.1 % ≤ 11 st and 36.7 % ≤ 12 st. Per section, the median is 12 st, with 4.7 % ≤ 5 st and 12.1 % ≤ 7 st.
- Chord-tone share: **median 65 %**. 2.6 % of songs are at ≤ 34 %, 4.9 % at ≤ 40 %, 17.6 % at ≤ 52 % and 55.2 % at ≤ 67 %.
- 57.5 % of songs are 100 % diatonic, so Fred's 98–100 % is ordinary.
- Intervals: median share of steps (1–2 st) is 43 %, median share of repeated notes 19 %.
- **Only 4.9 % of sections never use the tonic pitch class** (5.8 % of the 9,455 minor-mode sections). This and the next figure use the 23,033 sections that have a single key and at least 8 melody notes.
- **8.7 % of sections use ≤ 4 distinct pitches**, and 20.1 % use ≤ 5.

**d) Song-level descriptions of hooks and leads**
- **Marea (we've lost dancing):** Samplesound's remake transcript puts the track in G♯ (= A♭) major. It describes an **8-bar progression with four chords, "one every two bars", labelled "4-5-6-1"**, with the sub-bass on each chord root. The riff is "built on rhythm more than melody". Its author says "really only two [notes] — C and A♯ — make ninety percent of the total". He also advises **staccato notes with pauses** and **no quantization**. The note list comes from an auto-generated transcript — [Samplesound Academy](https://www.samplesoundmusic.com/blogs/academy/make-fred-again-ft-the-blessed-madonna-marea-weve-lost-dancing-riff-in-ableton-luca-mucci)
- Marea's lead sound has "noticeable brass and flute nuances" (Serum saws, low-pass filter, filter envelope, unison) — [Samplesound Academy](https://www.samplesoundmusic.com/blogs/academy/make-fred-again-ft-the-blessed-madonna-marea-weve-lost-dancing-riff-in-ableton-luca-mucci). Sonic Academy's Protoculture course rebuilds it as a "retro brass lead" in ANA 2 — [Sonic Academy Tutorial 818](https://www.sonicacademy.com/courses/tech-tips-volume-82-with-protoculture/tutorial-818-lead-from-marea-we-ve-lost-dancing)
- Key conflict for Marea: Samplesound says G♯ major, Chordify A♭, and commercial templates F minor at 123 BPM. This is the same relative-key ambiguity as in the report — [Samplesound](https://www.samplesoundmusic.com/blogs/academy/make-fred-again-ft-the-blessed-madonna-marea-weve-lost-dancing-riff-in-ableton-luca-mucci); [Sounds Mania](https://soundsmania.com/products/fred-again-the-blessed-madonna-marea-we-ve-lost-dancing-ableton-remake); [Topmusicarts](https://topmusicarts.com/products/fred-again-marea-weve-lost-dancing-ableton-template-deep-house)
- **Kammy (like i do):** Kamille's voice "stutters and returns for a final burst" around **2:30**, the track's climax — [Muumuse](https://www.muumuse.com/2022/10/fred-again-kamille-kammy-like-i-do.html/). The vocal treatment is "understated" over a percussive rhythm — [Dancing Astronaut](https://dancingastronaut.com/2022/10/fred-again-continues-string-of-surprise-actual-life-3-singles-with-kammy-like-i-do/). One user review praises an **"arpeggio top line that kicks in after a couple of minutes"** and calls the track "more trance than anything" (a single user, low weight) — [RYM](https://rateyourmusic.com/release/single/fred-again/kammy-like-i-do/)
- **Delilah:** the hook is one line from Delilah Montagu singing "Lost Keys" in an Instagram video, placed at the centre of the production. The drums are constant, with only a brief break midway — [The Indiependent](https://www.indiependent.co.uk/track-review-delilah-pull-me-out-of-this-fred-again/)
- **Jungle:** "catchy vocal chops from 'Immortal' along with an electro-heavy bassline" — [EDMTunes](https://www.edmtunes.com/2022/07/07/fred-again-drops-brand-new-track-jungle/). The track is built on the "constant repetition of some of the song's lines" — [Jenesaispop](https://jenesaispop.com/2022/08/13/439365/fred-again-jungle/)
- **Turn On The Lights again..:** built on Future's repeating "Turn On The Lights" vocal, which Fred took from a video clip he was streaming — [Uproxx](https://uproxx.com/indie/fred-again-future-turn-on-the-lights-again-swedish-house-mafia/). The sample (vocals/lyrics) is taken from 1:02 of the original — [WhoSampled](https://www.whosampled.com/sample/968675/Fred-Again..-Swedish-House-Mafia-Future-Turn-on-the-Lights-Again..-Future-Turn-on-the-Lights/). Critics single out Future's Auto-Tune on the source vocal — [The Singles Jukebox](https://thesinglesjukebox.com/future-turn-on-the-lights/). My gloss: Auto-Tune is pitch correction, so the sampled pitches are already snapped to a scale. No source says whether Fred re-pitched or chopped it.
- **Danielle (smile on my face):** samples 070 Shake's "Nice To Have" in a "moody but briskly vibrating dance track" — [The Fader](https://www.thefader.com/2022/09/14/fred-again-actual-life-3-danielle-smile-on-my-face-070-shake). Sonic Academy has a separate tutorial on "Vocal from Danielle", but its content was not visible — [Sonic Academy Tutorial 820](https://www.sonicacademy.com/courses/tech-tips-volume-82-with-protoculture/tutorial-820-vocal-from-danielle-smile-on-my-face)
- **Kyle (i found you):** Fred opened his Tiny Desk set by **recreating the song's melody on marimba**. The setlist credits him with piano, vibraphone and marimba — [NPR Tiny Desk](https://www.npr.org/2023/04/10/1167158933/fred-again-tiny-desk-concert)
- **Rumble:** a "pitched-up voice" (Elley Duhé, uncredited) sits over an **ascending bridge** before the drop — [NPR](https://www.npr.org/sections/now-playing/2023/01/05/1147104279/skrillex-fred-again-flowdan-rumble); [Songfacts](https://www.songfacts.com/facts/skrillex/rumble)
- **adore u:** reviewers describe an opening "mesmerizing, spacey synth", "bubbly sound effects" and a beat that "comes in and out" unconventionally. No review describes chopped or pitched vocals. The summary did not say which outlet wrote each phrase — [OnesToWatch](https://www.onestowatch.com/en/blog/fred-again-adore-u); [Euphoria](https://www.euphoriazine.com/blog/2023/08/music/tracks-fred-again-obongjayar-adore-u/); [Stereogum](https://stereogum.com/2232817/fred-again-adore-u-feat-obongjayar/music)
- The Marea lead is "often described as evoking a rhythmic flute-like timbre". This comes from an AI-generated wiki and is low reliability — [Grokipedia](https://grokipedia.com/page/Marea_(We've_Lost_Dancing))

**e) How the hooks are built: process and repetition**
- Fred describes hearing a cadence in a stranger's voice on social media and then **playing piano over it** on his laptop — [NPR](https://www.npr.org/2022/11/12/1136054396/how-fred-again-transforms-the-sounds-of-social-media-into-rave-worthy-beauty). A secondary blog says he "finds the pitch inside a speaking voice", loops it at the right moment, keeps grain and room noise, and plays piano against the clip to find its "chord centre" — [Tensormix](https://tensormix.com/blog/fred-again-voice-memos-actual-life)
- He set fragments beside soft piano and percussion and **"repeated a few words until they became a chorus"**, with "Billie (loving arms)" given as the example — [Routenote](https://routenote.com/radar/what-genre-is-fred-again-his-sound-explained/). The combined summary listed NPR, NME, Routenote and yespress as its sources, so the exact attribution is uncertain; moderate confidence.
- Phrases are "deconstructed, processed and rearranged in a piecemeal way". The tutorial's steps include **"messing with the pitch and formant"** and building repetition around "the rhythmic or melodic hook". This contradicts the report's line that no source mentions formant, though here it is a tutorial suggestion, not a confirmed Fred workflow — [MusicRadar](https://www.musicradar.com/artists/the-best-feeling-is-when-you-play-back-the-thing-youve-made-that-day-and-you-actually-feel-good-about-it-thats-the-drug-im-chasing-every-day-unlocking-the-production-tricks-that-fred-again-swears-by)
- A Fred-style chop tutorial recommends working on audio rather than MIDI to see how the chops sit against the bar lines, and names **pitch-shifting and reversing** as key tools — [Touchloops](https://touchloops.com/blogs/news/how-to-sound-like-fred-again)
- Pitch the sample close to the key first. Large upward shifts turn "chipmunk", so make small shifts and fine-tune each slice, and reverse some slices for variation (generic, not Fred-specific) — [MusicTech](https://musictech.com/tutorials/pitched-vocal-chops/)
- One short tutorial uses **Ableton groove extraction to swing the chops** "in a Fred again style" — [YouTube short](https://www.youtube.com/shorts/h5yEjNtK1fQ)
- A remixer of Fred's "the floor" says "a lot of that stuttering vocal stuff I do manually", i.e. stutters are hand-placed edits, not a plugin (HAAi on her own remix) — [MusicTech](https://musictech.com/features/interviews/how-we-remixed-fred-again-tips-from-haai-oppidan-and-hamdi/)
- Generic chop advice: change the chop loop "every few bars", and reverse or re-pitch chops to avoid monotony — [Unison](https://unison.audio/?p=1069795)
- A vocal chop "behaves like a synth line, not a voice: pitched, locked to the grid, and able to clash where a sung phrase would not" (genre glossary) — [Mixgraph](https://www.mixgraph.io/glossary/vocal-chop)
- In a 12-song analysis, MyPart calls his melodies "warm and comforting, almost naive", and says the craft lies in "repetition and simplicity" — [MyPart](https://www.mypart.ai/post/the-simply-sophisticated-fred-again)

### Inferences
*(All my own derivations from the findings above.)*

**Pitch sets in scale degrees.** I derived these from each tab's range plus its % diatonic. A 100 %-diatonic line inside the stated range can only use the in-key notes between the two boundaries.

| Track | Possible pitches | Max distinct pitches | Minor-key degrees | Relative-major degrees | Minor tonic present? | Largest possible leap |
|---|---|---|---|---|---|---|
| Marea riff (~90 % of notes) | C, B♭ | 2 (dominant dyad) | 5, 4 (F minor) | 3, 2 (A♭) | no (for the 90 %) | M2 |
| leavemealone | C D E F | 4 | ♭3 4 5 ♭6 (A minor) | 1 2 3 4 (C) | **no** | P4 |
| Delilah | A B♭ C D | 4 | 2 ♭3 4 5 (G minor) | 7 1 2 3 (B♭) | **no** (major tonic B♭ is present) | P4 |
| Kammy | B♭ C D E♭ F | 5 | ♭3 4 5 ♭6 ♭7 (G minor) | 1 2 3 4 5 (B♭) | **no** | P5 |
| Winny | G♯3…G♯4 (98 % diatonic) | ≤ 8 | 5…5 (or ♭6…5) | — | possible | octave |
| ten | A4…A5 | ≤ 8 | ♭7…♭7 (B minor) | 5…5 (D) | possible | octave |

- **Rule (pitch count): use 2–5 distinct pitches; allow up to 8 only in "instrumental lead" mode.** Three of five tabs fall in a group that only 20 % of pop sections reach (≤ 5 pitches), and Fred's figure is song-level, which is stricter still.
- **Rule (range): default 5–7 semitones (a 4th to a 5th); ceiling one octave.** Fred's 5-st tabs sit in the bottom ~3 % of the population and Kammy's 7 st in the bottom ~8 %. ten and Winny reach exactly an octave, with the same degree at both ends (♭7–♭7, 5–5), which suggests octave-displaced repeats of an anchor note. That last point is speculative; the span alone does not prove octave jumps.
- **Rule (register and tonic avoidance): place the cell on ♭3–♭7 or 2–5 of the minor key, and make the minor tonic optional.** In 3 of 5 tabs, plus the Marea riff's main dyad, the minor tonic cannot occur. In the population only ~5–6 % of sections avoid the tonic altogether. The cell often starts on ♭3 of the minor key, which is 1 of the relative major (Kammy, leavemealone). This feeds the major/minor ambiguity that the report already notes in the key databases.
- **Rule (contour): mostly steps and repeats, with leaps ≤ P4/P5.** All tabs are "stepwise". As a starting calibration, not measured for Fred: repeat 30–40 %, step 45–55 %, third ~10 %, ≥ 4th ≤ 5 %. The pop baseline is 43 % steps and 19 % repeats, and Fred's tiny ranges force more of both.
- **Rule (chord relation, the key finding): keep the hook's pitch set fixed across the whole loop and let each chord recolour it.** Target a 35–55 % chord-tone share, or about 65 % for a "bright" Delilah-type track. Worked examples:
  - **Marea:** the dyad C/B♭ is maj7/13 over D♭maj7, 6/5 over E♭, 5/11 over Fm and 3/9 over A♭. Exactly one note of the dyad is a chord tone on every chord.
  - **Delilah:** B♭ and D are chord tones of E♭maj7, Gm7 and Gm, while A and C act as #11/9 and 13/11 colours. A hook weighted toward B♭/D lands at about two-thirds chord tones, which matches the tab's 67 %.
  - **leavemealone:** over its most-used chord F (VI), C and F are chord tones and D/E are 6/maj7 colours, which is consistent with 40 %.
  - **Kammy:** with a bare-root "i" (G only) and no G in the range, almost every note counts as a non-chord tone. Its tension of 98–99 is therefore partly an artefact of how the tab is annotated, but the underlying behaviour is real: the hook is not built from chord tones.
  - **Correction to the report's table:** the report's slice map says "Transposition pro Akkord" (transposition per chord). The data favours **no per-chord transposition by default**. Transpose only for whole-section pitch-ups (raw → chopped → pitched state, Rumble's pitched-up bridge).
- **Rule (where the 7th/9th colour comes from):** in ten and leavemealone the tab's chords are near-triadic (chord complexity 10 and 5), yet tension is 82–85. Chordify hears Gmaj7–Bm7–F♯m7–Dmaj7 for ten. The "7th-chord sound" therefore partly comes from the hook adding 9/maj7/11 over triads, so the generator can get it either from 4-note voicings or from triads plus hook tones.
- **Rule (rhythm), weakly grounded:**
  - All melodic-complexity scores are low (7–14; ten 31), and the metric includes rhythmic complexity and syncopation. Default to simple, repetitive onset patterns and few syncopations within the cell.
  - Use **short, staccato notes with rests** (Marea), with **humanised timing** (unquantised, or groove-extracted swing shared with the drums).
  - In "speech mode" the word rhythm decides (report).
  - Treat 16th/32nd stutter retriggers as an arrangement-layer event at phrase ends and at the climax (Kammy ~2:30), not as the hook's basic rhythm.
  - Onset-grid shares (on-beat vs. off-16th) are **unknown**. If a number is needed, start at ~60–70 % of onsets on the 8th-note grid and 30–40 % on off-16ths, and calibrate by ear. This number is a placeholder and has no source.
- **Rule (repetition):** a 1–2-bar cell (report) is repeated until it functions as the chorus (Routenote, Jungle, Turn On The Lights again..). A plausible default, typical of the genre but not documented for Fred, is AAA A′ over 4 bars or (AAA B)×2 over 8 bars, where B is a stutter, reversal or octave/pitch shift rather than new pitches. A cell rendered with rests also leaves space for call/response with the found vocal.
- **Rule (sources):** prefer already-tuned or sung sources. Auto-Tuned Future and sung Delilah/Kamille/Duhé lines give stable pitches. In speech mode, pitch the clip so its natural cadence lands inside the 2–5-note set.

### Gaps
- **No onset or position data for any Fred hook:** no TheoryTab note lists, MIDI or transcriptions were reachable. On-beat vs. off-16th shares, note lengths, rest ratios, exact phrase lengths and AAAB-type structures are therefore unmeasured. A direct pass over the TheoryTab JSON or the Hookpad export would answer this.
- **Some tracks have no symbolic data at all:** Marea's full hook (beyond the riff's 2-note dyad), Jungle, Turn On The Lights again.., adore u, Danielle and Kyle, plus the rest of Ten Days.
- **Conflicting Hooktheory values** (Kammy melodic complexity 8 vs 9 and chord complexity 17 vs 21; Winny range G♯3 vs A3; Kammy's main-chord labels) could not be resolved without opening the pages.
- **No primary source** gives Fred's pitch-shift amounts, octave-jump practice, formant use or retrigger rates. The formant mention is a MusicRadar tutorial step only.
- **Leads not followed:** the public GitHub repo `jmhuer/music_data` contains "fred-again" in an `artists.txt`, possibly a Hooktheory scrape list. Session policy does not allow attaching repositories the user has not asked for, so I did not open it. Paid sources with note-level content (Sonic Academy Tutorial 822 "Vocal Chops", the Patreon Delilah MIDI, Musicnotes sheets) were not accessible.

## 2. Piano / keys parts: rhythm, voicing, top note

### Takeaway
No source documents Fred's actual piano voicings, top notes or rhythms note by note. Evidence comes from three places: texture descriptions ("flurry of looped piano keys", an "arpeggio top line" in Kammy, a marimba-playable melody in Kyle), Hooktheory chord-complexity scores (Delilah 42, Winny 84, Kammy 17–21, ten 10, leavemealone 5) and the documented process, in which **piano is improvised over the found voice**. Taken together with Q1, this points to a hook-first harmonisation: the keys accompany a fixed vocal pitch cell, and their top voice should share pitches with it.

### Cited Findings
- Fred hears a cadence in a voice and then **plays piano over it** — [NPR](https://www.npr.org/2022/11/12/1136054396/how-fred-again-transforms-the-sounds-of-social-media-into-rave-worthy-beauty). He plays piano against the clip to find its chord centre (secondary blog) — [Tensormix](https://tensormix.com/blog/fred-again-voice-memos-actual-life)
- He moved from "a flurry of looped piano keys" into "Delilah" at Tiny Desk (already in the report). Kyle's melody was performed on marimba, and he played piano, vibraphone and marimba in that set — [NPR Tiny Desk](https://www.npr.org/2023/04/10/1167158933/fred-again-tiny-desk-concert)
- Kammy has an "arpeggio top line" that enters after a couple of minutes (single user review) — [RYM](https://rateyourmusic.com/release/single/fred-again/kammy-like-i-do/)
- Chord complexity, i.e. use of 7ths/add9s/borrowed notes: Delilah 42, Kammy 17 (or 21), ten 10, leavemealone 5, and Winny 84, which is high and consistent with the ♭II noted in the report — [Hooktheory Delilah](https://www.hooktheory.com/theorytab/view/fred-again/delilah-(pull-me-out-of-this)); [Hooktheory Kammy](https://www.hooktheory.com/theorytab/view/fred-again/kammy-(like-i-do)); [Hooktheory ten](https://www.hooktheory.com/theorytab/view/fred-again/ten); [Hooktheory leavemealone](https://www.hooktheory.com/theorytab/view/fred-again/leavemealone-feat-baby-keem); [Hooktheory Winny](https://www.hooktheory.com/theorytab/view/fred-again/winny)
- Delilah's chords on Chordify are E♭maj7–Gm7–Dm7–Gm, with an "E♭7" elsewhere on the page — [Chordify Delilah](https://chordify.net/chords/fred-again-songs/delilah-pull-me-out-of-this-chords)
- Kyle transcriptions disagree on whether the A♭ chord is A♭7 or A♭maj7, and on whether Gm/A♭m appear (E♭, A♭7, Cm, B♭ vs. E♭, A♭, Gm, Cm, A♭m) — [Chordify Kyle](https://chordify.net/chords/fred-again-kyle-i-found-you-piano-tutorial-orangesaren-tfruit); [ChordU Kyle](https://chordu.com/chords-tabs-fred-again-kyle-i-found-you--id_sMLNYE6e4EU)
- The Sonic Academy course "Dissecting Fred Again..'s Sound" (10 videos, about 1 h 30) has tutorials on drums, wobble bass, the Marea lead, the Danielle bass and vocal, "Ambient Drones" and vocal chops, but **no piano/chord tutorial** — [Sonic Academy](https://www.sonicacademy.com/courses/tech-tips-volume-82-with-protoculture); [Tutorial 821 Ambient Drones](https://www.sonicacademy.com/courses/tech-tips-volume-82-with-protoculture/tutorial-821-ambient-drones)
- Style tutorial: a "simple 4-bar chord pattern" on a free melancholic piano, in the same key as the 808 bass, with a 16th-note pluck following the chord roots (already in the report) — [MusicRadar](https://www.musicradar.com/news/make-a-fred-again-style-track-free-samples)

### Inferences
- **Order of generation:** create the hook cell (Q1) first, then choose or voice the chords so that each chord contains 1–2 of the cell's pitches. This mirrors his documented "piano over the voice" process and fits the high-tension, common-tone data.
- **Top voice:** hold one or two common tones as the top of the voicing across the loop (pedal). Examples: B♭ or D across E♭maj7–Gm7–Dm7 for Delilah, C across D♭maj7–Fm–A♭ for Marea. Inner voices carry the maj7 and m7. This is untested against audio.
- **Voicing density by sub-style:**
  - "bright/emotional" (Delilah type, chord complexity ~40): four-note maj7/m7 voicings.
  - "club/bass" type (Kammy, leavemealone, ten: chord complexity 5–21): triads, dyads or a bare root, with colour coming from the hook.
  - Winny type: one borrowed chord plus 7ths.
- **Keys rhythm:** the evidence supports three patterns, all as inference.
  - (a) A looped, repeated figure in 8ths/16ths, as in the Delilah "flurry".
  - (b) An arpeggiated top line entering late, as a second-half layer (Kammy).
  - (c) Long drones or pads (Sonic Academy "Ambient Drones").
  - Block stabs on every quarter are not documented for Fred.

### Gaps
- No source on close vs. spread voicing, inversions, the top note, or whether the piano part is played or arpeggiated in specific studio tracks. Note-level sources exist only behind paywalls or blocked hosts (Patreon "The Theorist" Delilah MIDI, YouTube piano tutorials, Musicnotes).
- The "electrifying piano chords" phrase for Delilah appeared in a search summary without a traceable outlet, so it is not used.

## 3. Basslines: rhythm, note choice, lengths

### Takeaway
Basslines are documented only by tutorials and reviews. Five patterns emerge:
- **House (Marea):** sub on chord roots, changing every 2 bars.
- **Garage (Danielle):** a 16th-note saw-pluck bass.
- **Turn On The Lights again..:** a wobble bass whose rhythm comes from a syncopated filter LFO.
- **Rumble:** a minimal sub riff with swells.
- **135–140 tracks:** a two-note Reese (Attack, already in the report).

Hooktheory's above-average Chord-Bass Melody scores (Kammy 82, Delilah 73) suggest smoother, more stepwise bass motion than the average pop tab.

### Cited Findings
- **Marea:** the sub-bass plays the root of each chord, with the four chords changing "one every two bars" over an 8-bar loop (IV–V–vi–I in A♭ = D♭–E♭–Fm–A♭) — [Samplesound Academy](https://www.samplesoundmusic.com/blogs/academy/make-fred-again-ft-the-blessed-madonna-marea-weve-lost-dancing-riff-in-ableton-luca-mucci). The loop order matches Chordify's D♭maj7 → E♭ → Fm → A♭ — [Chordify Marea](https://chordify.net/chords/fred-again-the-blessed-madonna-songs/marea-we-ve-lost-dancing-chords)
- **Danielle:** Sonic Academy rebuilds "the **16th-note bassline**" from Danielle in ANA 2 — [Sonic Academy Tutorial 819](https://www.sonicacademy.com/courses/tech-tips-volume-82-with-protoculture/tutorial-819-bass-from-danielle-smile-on-my-face). A Serum preset shared as the "Danielle bass" is categorised as **UK Garage bass** — [PresetShare](https://presetshare.com/p5047). A tutorial calls it a saw "bass pluck" — [YouTube](https://www.youtube.com/watch?v=3Vc1GdRYrcA); see also [YouTube](https://www.youtube.com/watch?v=JPFaOFmZxYU)
- **Turn On The Lights again..** (listed as "Turn Out The Lights"): a wobble bass designed in ANA 2 "with a **syncopated LFO on a filter**" — [Sonic Academy Tutorial 816](https://www.sonicacademy.com/courses/tech-tips-volume-82-with-protoculture/tutorial-816-wobble-bass-turn-out-the-lights?autoplay=1)
- **Rumble:** "centred around a lean, mean and minimal sub-bass riff", with "menacing bass swells" punctuating a steady groove. The search summary credited these to two different outlets without naming which. The candidates in the results were [MusicRadar](https://www.musicradar.com/news/skrillex-fred-again-rumble), [The Fader](https://thefader.com/2023/01/04/skrillex-rumble-feat-fred-again-flowdan), [Dork](https://readdork.com/track/skrillex-rumble) and [Rolling Stone](https://www.rollingstone.com/music/music-news/skrillex-new-song-rumble-fred-again-flowdan-1234655967/)
- **Jungle:** "electro-heavy bassline" — [EDMTunes](https://www.edmtunes.com/2022/07/07/fred-again-drops-brand-new-track-jungle/). The hum-sample origin is already in the report; MusicTech's note-pattern section was truncated in search — [MusicTech](https://musictech.com/tutorials/tips/how-to-recreate-fred-again-s-jungle-bass-sound/)
- **Reese:** "a simple two-note monophonic bassline will suffice" at 135 BPM. This is generic tutorial advice, not a Fred transcription (already in the report) — [Attack Magazine](https://www.attackmagazine.com/technique/synth-secrets/fred-again-inspired-reese-basslines-with-twin-3/)
- **Hooktheory Chord-Bass Melody:** Kammy 82 ("above average"), Delilah 73 — [Hooktheory Kammy](https://www.hooktheory.com/theorytab/view/fred-again/kammy-(like-i-do)); [Hooktheory Delilah](https://www.hooktheory.com/theorytab/view/fred-again/delilah-(pull-me-out-of-this)). Kammy's most-used "chord" is a bare root (report) — [Hooktheory Kammy](https://www.hooktheory.com/theorytab/view/fred-again/kammy-(like-i-do))
- Remixers of Fred's USB002 material built their basses in Serum (two bass synths, Oppidan) and from a d&b bass sound with a "formant-like quality" (Hamdi). This is remix practice, not Fred's — [MusicTech](https://musictech.com/features/interviews/how-we-remixed-fred-again-tips-from-haai-oppidan-and-hamdi/)

### Inferences
- **Bass modes for the generator,** extending the report's three modes:
  - **H "house roots" (123–128):** root on each chord, held or re-struck once per bar, ducked. Harmonic rhythm **2 bars per chord** in Marea-type loops. The report's "1 chord per bar" default is therefore not universal; offer 1 or 2 bars per chord.
  - **G "garage 16ths" (130–135):** a continuous 16th-note saw-pluck line. Note choice is undocumented; a plausible default is root plus octave, with gaps under the kick.
  - **W "wobble":** long notes on the root, with rhythm generated by a filter-cutoff LFO automation in a syncopated rate (e.g. dotted-8th or 3-3-2 shapes). The exact rate is not in the summaries.
  - **R "Reese two-note" (135–140):** root and one neighbour (♭6/♭7 or octave), in long notes (report).
  - **S "sample bass":** hum or noise re-pitched (report).
- **Note choice across modes:** prefer smooth, stepwise root motion (VI–VII–i rises; Chord-Bass Melody 73–82), and use a root pedal under changing upper chords (Kammy). Approach notes before chord changes are undocumented, so keep them rare.
- **Danielle's 16th bass** and the report's 16th pluck on chord roots may be the same rhythmic idea, a continuous 16th motor in bass or pluck. Don't run both at full density at once (inference).

### Gaps
- No note-level bass transcription for any Fred track: rhythms within the bar, octave usage, approach or passing notes, note lengths.
- The Danielle 16th-note pattern's pitch content, the wobble LFO rate in Turn On The Lights again.. and the Jungle bass's note sequence were all behind paywalls or truncated.

## 4. Drum / groove specifics (new beyond the report)

### Takeaway
There is little new information. Delilah keeps a constant beat with a single short break midway; groove extraction is used to swing vocal chops like the drums; Sonic Academy has a drum tutorial for Turn On The Lights again.., but its content was not visible. No new data on ghost notes or velocities.

### Cited Findings
- Delilah: the drum "provid[es] a constant throughout the track, only briefly taking respite midway through before restoring the beat" — [The Indiependent](https://www.indiependent.co.uk/track-review-delilah-pull-me-out-of-this-fred-again/)
- Groove extraction applied to the chops — [YouTube short](https://www.youtube.com/shorts/h5yEjNtK1fQ). The report already covers Attack's break-derived swing on the drums.
- "Drums (Turn Out The Lights)": drums built from scratch in that track's style, about 11 minutes — [Sonic Academy Tutorial 814](https://www.sonicacademy.com/courses/tech-tips-volume-82-with-protoculture/tutorial-814-drums-turn-out-the-lights)
- Kammy's opening is defined by "frenetic finger drumming" (already in the report) — [Attack Magazine](https://www.attackmagazine.com/technique/beat-dissected/breaking-down-how-to-make-beats-inspired-by-fred-again/)

### Inferences
- Apply **one shared groove template** to drums, chops and the 16th pluck or bass, so that everything swings together.
- Arrangement default for a Delilah-type track: drums run through the whole track, with one 2–8-bar drop-out near the midpoint.

### Gaps
- No source on ghost-note placement, hat velocity curves or kick-pattern variants per track beyond what the report already holds.
