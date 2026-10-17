# Genre Craft Rules for a Style-Based MIDI Generator: Hooks, Vocal Chops, Basslines, Chord Voicings, Interplay and Humanization (Emotional/Melodic House, Stutter House, UKG/2-Step, Afro House, DnB)

> **Method note (read first):** In this session WebFetch could not resolve any hostname, and the egress proxy refused direct downloads (for example attackmagazine.com returned `connect_rejected`). **No full page could be read.** Every finding below comes from search-engine excerpts and summaries of the cited pages. Exact numbers from Attack Magazine and MusicRadar articles should be checked against the originals before they are hard-coded. Markers used:
> - **‡** means the search summary pooled several pages, so the claim can be tied to that set of pages but not reliably to the one URL listed first.
> - **[INF]** marks an inference, an algorithm translation, or a proposed default. Numeric weights and probabilities in the Inferences sections are **proposed defaults, not sourced statistics**, unless a citation is given.
>
> **Grid convention used throughout:** 4/4, 16 steps per bar, **0-indexed**. Beats = steps {0,4,8,12}. "Strong" steps = {0,8}, "medium" steps = {4,12}, 8th-offbeats ("&") = {2,6,10,14}, 16th-offbeats ("e"/"a") = odd steps. One 16th lasts 15000/BPM ms (121 ms at 124 BPM, 115 ms at 130, 86 ms at 174).
>
> **Pitch convention:** MIDI 60 = C4 (scientific). Several sources (Sweetwater, and probably the MusicRadar tutorials, which use DAW naming) use **C3 = middle C**. Their note names are converted where flagged. Normalizing this is critical for implementation.

---

## 1. Hook / topline writing in dance music (phrase forms, motif length, repetition vs variation, range, step/leap, leap recovery, chord tones vs non-chord tones, anticipation, phrase endings, pickups)

### Takeaway
The best-supported, implementable core: a short cell (around 1 bar) is repeated with **AAAB** (three statements, variation on the fourth) or period-like A/A′ endings. The cell is mostly stepwise, with the interval distribution peaking at about 2 semitones, and stays within about an octave. Chord tones sit on strong beats, passing and neighbor tones go on weak positions, and there is frequent **anticipatory syncopation** (notes pushed just ahead of strong beats). For leap recovery, corpus research says that "regression toward the median pitch" models the data better than a strict gap-fill rule. Modern pop melodies do **not** show step inertia.

### Cited Findings

#### Phrase forms
- **AAAB form:** "a basic melodic fragment is repeated three times, with variation happening on the fourth iteration". Cited examples are the chorus of Coldplay's "Paradise" and Adele's "Rolling in the Deep". The phrases are short, simple and memorable, and too much repetition can wear on listeners. In AABA the B section is completely different, whereas AAAB keeps the same fragment for three phrases and changes only the last. ‡ — [Secrets of Songwriting: Repetition and the Structure of Good Melodies](https://www.secretsofsongwriting.com/?p=5131); [Secrets of Songwriting: To be Memorable, Song Melodies Need Form](https://www.secretsofsongwriting.com/2010/07/05/to-be-memorable-song-melodies-need-form/); [guitar9](https://guitar9.com/node/5810); [Instructables: AABA song](https://instructables.com/How-to-Write-an-AABA-Song)
- A hook is described as a short phrase with a rhythmic idea that is repeated often, which fits AAAB. ‡ — [guitar9](https://guitar9.com/node/5810)
- **Period:** about 8 bars, made of two 4-bar phrases (antecedent + consequent). In Caplin's definition the antecedent is a 2-bar basic idea plus a 2-bar contrasting idea that ends weakly, and the weak ending is answered later by a fuller close. — [Wikipedia: Period (music)](https://en.wikipedia.org/wiki/Period_(music)); [UCI Theme Form handout](https://music.arts.uci.edu/abauer/5.3/downloads/Theme_Form.pdf)
- The antecedent typically ends on a half cadence and the consequent on a perfect authentic cadence (some theorists accept an imperfect authentic cadence in the antecedent). **Parallel periods**, where both phrases open alike, are the most common type. Contrasting periods give the consequent new material. — [Burstein & Straus excerpt via UCI](https://music.arts.uci.edu/abauer/6.1/notes/Phrase_and_Binary_Form%20_Burstein__Straus_Concise_Introduction_to_Tonal_Harmony.pdf); [Iowa State, Comprehensive Musicianship 8.2](https://iastate.pressbooks.pub/comprehensivemusicianship/chapter/8-2-sentences-and-periods-tutorial/)
- **Sentence vs period:** both are 8-bar, two-phrase forms. A sentence repeats its basic idea and then fragments it. A period sets the basic idea against a contrasting idea. — [Art of Composing](https://artofcomposing.com/question/sentence-vs-period-differences)
- **Call & response** = "a succession of two distinct musical phrases": a call from a leader or instrument, then a response from a group or another instrument. ‡ — [EDMProd: Call & Response](https://www.edmprod.com/using-call-and-response/); [Pause Play Repeat](https://www.pauseplayrepeat.com/blog/musical-conversations-the-power-of-call-and-response-in-production)

#### Repetition and motif economy
- Repetition makes a hook stick: the central melody returns at key structural points such as the start and end of the chorus. Vary the repeats by changing a word, shifting the rhythm or altering the delivery. **Too many melodic ideas dilute each one** and leave the listener nothing to hold onto. ‡ — [Audient: 7 Tips for Writing Toplines](https://audient.com/fr/?p=45886); [MusicTech: Songwriting Part 3, The Art of Melody](https://musictech.com/tutorials/songwriting-3/); [iZotope: Common toplining mistakes](https://www.izotope.com/en/learn/common-toplining-mistakes-to-avoid); [Fast Rhymes: repetition](https://fastrhymes.com/blog/the-power-of-repetition-in-songwriting-how-to-use-it-effectively)

#### Range and contour
- "Many toplines stay within about one octave", because heavy movement makes the hook harder to pin down. Octave leaps can still work when used deliberately. **Approach high notes gradually**: a rising-and-falling sequence up to a peak is easier to follow than a sudden leap. ‡ — [Audient](https://audient.com/fr/?p=45886); [MusicTech](https://musictech.com/tutorials/songwriting-3/); [iZotope](https://www.izotope.com/en/learn/common-toplining-mistakes-to-avoid)
- In most pop songs the chorus is only "a note or two" higher than the verse, and the ranges overlap considerably. Some choruses are lower, because the real principle is higher energy, not higher pitch. — [Secrets of Songwriting: overlapping ranges of verse and chorus](https://www.secretsofsongwriting.com/2020/08/10/the-overlapping-ranges-of-verse-and-chorus-melodies/)
- The failure case is when verse and chorus "spend most of their time giving us the same five or six notes". ‡ — [Secrets of Songwriting](https://www.secretsofsongwriting.com/?p=18770)
- Whole-song melody ranges from Hooktheory examples, for scale only: Ariana Grande "Bye" F3–F5 = 24 semitones; Carly Rae Jepsen "Higher" B3–F♯5 = 19 semitones. These are whole songs, not single hooks. — [Hooktheory: Bye](https://www.hooktheory.com/theorytab/view/ariana-grande/bye); [Hooktheory: Higher](https://www.hooktheory.com/theorytab/view/carly-rae-jepsen/higher)

#### Steps, leaps and leap recovery
- **Vos & Troost (1989):** across melodies, the frequency of intervals between successive tones is Poisson-shaped with a **peak at about 2 semitones**. Citation: *Music Perception* 6, 383–396. Caveat: the corpus used 10–20% of indexed beginnings of mostly instrumental pieces, and another researcher's coding of complete ABC melodies gave a "clearly different" distribution. — [Parncutt, AUDITORY list 1998](https://auditory.org/postings/1998/512.html); [AUDITORY list 2007](https://auditory.org/postings/2007/594.html)
- Most song melodies use stepwise motion more than leaps. "Leap, then step in the opposite direction" is called "a very old but also very useful rule". ‡ — [Secrets of Songwriting: Stepping and Leaping](https://secretsofsongwriting.com/?p=8161); [Robin Hoffmann: Melodic Steps and Leaps](https://www.robin-hoffmann.com/?p=2645)
- **Von Hippel & Huron (2000):** "gap-fill", "registral direction" and "registral return" are largely side effects of tessitura (range) constraints. Skips tend to land near the edges of the range, which leaves little choice but to turn back. — [Why do skips precede reversals? The effect of tessitura on melodic structure](https://labs.sonicfield.org/library/why-do-skips-precede-reversals-the-effect-of-tessitura-on-melodic-structure)
- An MIT lecture reports that Huron's group found **more evidence for regression to the mean than for gap-fill** in folk melodies, with leaps classified by where they start relative to the piece's **median pitch**. This is an informal course transcript. — [MIT OCW 21M.383 transcript](https://www.ocw.mit.edu/courses/21m-383-computational-music-theory-and-analysis-spring-2023/1gSZ2wB7EuCCaAS3LauaWaRKWq21YFnk-_transcript.pdf)
- Post-skip reversals predominate in music, speech and birdsong alike, which suggests a shared constraint. — [TMU: Empirical comparisons of pitch patterns in music, speech and birdsong](https://rshare.library.torontomu.ca/articles/journal_contribution/Empirical_comparisons_of_pitch_patterns_in_music_speech_and_birdsong/25413136)
- **Chiu & Temperley (2024):** strong step inertia in three common-practice corpora, but "modern Western popular music does not reflect step inertia". ‡ — [Music & Science 2024 (DOAJ)](https://doaj.org/article/43b320953f444935a677d6cec2cb74f8)
- Skip-reversal and step-momentum expectations are stronger in music students, which suggests they are learned. — [UT Austin: Expectations as learned heuristics (PDF)](https://lbj.utexas.edu/sites/default/files/file/faculty/Expectations%20as%20learned%20heuristics.pdf)
- **Cenkerová & Parncutt (2015):** after brief exposure to large leaps, listeners showed reduced preference for small intervals, so expectations are style-dependent. ‡ — [Style-dependency of melodic expectation](https://sonicfield.org/library/style-dependency-of-melodic-expectation)

#### Chord tones vs non-chord tones
- In 4/4 the strong beats (1 and 3) are emphasized, and "chord tones often appear on these strong beats, reinforcing the harmony". Weak beats are where passing and neighbor tones usually go. ‡ — [Violet Recording: How to write a melody over chords](https://violetrecording.com/how-to-write-a-melody-over-chords/)
- **Passing tone:** fills the gap between two chord tones by step and can be accented or unaccented. **Neighbor tone:** approached and left by step in opposite directions and returns to the same chord tone; the unaccented form is more common. **Appoggiatura:** approached by leap, resolved by step. **Escape tone:** approached by step, left by leap. ‡ — [LearnMusicTheory.net: Nonchord Tones 1 (PDF)](https://learnmusictheory.net/PDFs/pdffiles/01-05-05-NonchordTones1.pdf); [Andy Brick theory notes](https://personal.stevens.edu/~abrick/theory3/theory3_notes_02.html)
- Hooktheory tracks per-song melody metrics such as % diatonic notes and % chord tones, scored so that 50 = "average song". Example pages show 100% and 95% diatonic. Staff say they keep frequency statistics for chords and scale degrees (about 5,000 songs at the time of the post), and the most common are diatonic. ‡ — [Hooktheory forum](https://forum.hooktheory.com/t/minor-keys-roman-numerals/107/16); [Hooktheory TheoryTab example](https://www.hooktheory.com/theorytab/view/michael-peccorini/creating-a-melody)

#### Syncopation and anticipation
- **Tan, Lustig & Temperley (2019):** anticipatory syncopation (accents just *before* strong beats) is prominent in rock melodies. The authors read this as evidence of an underlying alignment of accents with strong beats, with the surface accent pushed early. — [Anticipatory syncopation in rock: a corpus study](https://sonicfield.org/library/anticipatory-syncopation-in-rock-a-corpus-study)
- **Temperley (2021):** distinguishes second-position from fourth-position syncopation, and the fourth-position type "tends to be anticipatory". — [Cambridge, Popular Music: Origins of syncopation in American popular music](https://www.cambridge.org/core/journals/popular-music/article/origins-of-syncopation-in-american-popular-music/941F3ADA4C6254F1D26025152F4806F3)
- **Rhythm-contrast trick:** a vocal syncopated against the kick in **dotted 8ths** "resolves" into the first hook line as the note rate slows from dotted 8ths to quarters. Note: the search summary credited the song "Shut Up and Dance" to Daft Punk. The well-known song of that name is by Walk the Moon, so the artist is unverified. — [The Mix Review: Shut Up and Dance](https://themixreview.org/reviews/shut-up-and-dance/)

#### Motif development operators
- **Sequence:** repeat the motif at other pitch levels. **Inversion:** same intervals, flipped direction. **Rhythmic displacement:** the metric stress moves to a different note. **Diminution/augmentation:** shorter or longer note values. **Octave displacement:** one step of a stepwise theme leaps an octave instead. ‡ — [FaChords: How to develop a melody](https://www.fachords.com/develop-melody/); [YoungComposers: developmental techniques](https://www.youngcomposers.com/t39097/developmental-techniques/)
- An existing algorithmic model, the openDAW MCP "motif development" tool, takes a 2–8-note motif through these stages: statement → sequence up/down → fragment → inversion → octave shift → expand/compress durations → cadence. This is tool documentation, not a craft authority. — [Glama: openDAW create_motif_development](https://glama.ai/mcp/servers/AMEOBIUS-team/opendaw-mcp/tools/mcp_opendaw_create_motif_development)

### Inferences
All items are [INF]. Numbers are proposed defaults derived from the findings above unless marked "practitioner judgment".

- **H1 Cell size:** the base motif is **1 bar** for chop and synth hooks at 118–138 BPM, and **2 bars** for vocal-style toplines and for DnB (at 174 BPM one bar is about 1.4 s). A 1-bar cell has **3–7 onsets** and **2–5 distinct pitches**: 2–4 for chops, 3–5 for synth leads. At least 25% of the cell's steps should be rests or sustain.
- **H2 Form templates.** For a 4-bar loop pick one of:
  - `AAAB` (default weight 0.4), from the AAAB finding.
  - `A A′ A A″`, same opening with different endings, a mini-period (0.3), from period theory scaled down.
  - `A B A B′`, internal call & response (0.2).
  - `AAAA` with micro-variation only, for stutter-style chop loops (0.1).
  
  For 8 bars use one of:
  - `[AAAB][AAAB′]`, where B′ is the closed version.
  - A period `[a b | a c]`, where b ends open and c ends closed.
  - A sentence `[a a′ | frag frag cadence]`: bars 1–2 basic idea, bars 3–4 repetition, bars 5–8 fragmentation and cadence.
- **H3 Variation budget:** at most **1 B-event per 4 bars**. B changes **≤ 50%** of A's onsets or pitches and keeps A's first 2 onsets identical, so the motif stays recognizable. Equivalently, about 75% of bars are exact or near-exact repeats, which is what AAAB implies.
- **H4 Variation operators**, with proposed selection weights for a B bar:
  - Change only the last 1–3 notes: 0.35
  - Diatonic sequence ±1–2 scale degrees: 0.20
  - Rhythmic displacement or anticipation of one note by ±1 step: 0.15
  - Fragmentation (repeat the first half twice): 0.10
  - Octave displacement of one note: 0.10
  - Inversion: 0.05
  - Augmentation/diminution: 0.05 (mostly for builds)
  
  Apply **one operator per variation**.
- **H5 Range:** hard cap of **12 semitones** for a hook, target **5–9**, chops **≤ 7**. The highest note occurs **once per phrase**, preferably in the second half (bar 3 or 7), and is approached stepwise or by a leap from below followed by a step down.
- **H6 Interval sampler**, absolute semitones between successive notes:
  - P(0, repeated note) = 0.15–0.25
  - P(1–2) = 0.40–0.50
  - P(3–4) = 0.15–0.20
  - P(5–7) = 0.08–0.12
  - P(≥ 8) ≤ 0.03
  - The octave (12) is allowed only as an explicit "octave displacement" event.
  
  This shape is consistent with the Vos & Troost peak at about 2 semitones; the exact numbers are proposals.
- **H7 Leap recovery as regression to the median:** keep a running phrase median. After a leap of 5 semitones or more, or whenever the current note is more than 5 semitones from the median, the next interval moves **toward the median** with P ≈ 0.75–0.8 and is ≤ 2 semitones with P ≈ 0.6. **Do not enforce step inertia** (continuing in the same stepwise direction), since modern pop does not show it.
- **H8 Harmonic placement:**
  - Onsets on steps {0,8}: chord tone with P ≥ 0.9.
  - Onsets on steps {4,12}: chord tone with P ≥ 0.75.
  - Other steps: a non-chord tone is allowed only as a **passing tone** (previous and next notes are chord tones, motion stepwise in one direction) or a **neighbor tone** (step away and back to the same chord tone).
  - At most one appoggiatura per bar, on a strong step, resolving down by step on the next onset.
  - Practitioner judgment: in m7/m9 harmony, prefer the 3rd, 5th, 7th or 9th over the root on strong steps for an "emotional" color.
- **H9 Anticipation:** in each phrase, 1–3 notes are moved **1 step (a 16th) or 2 steps (an 8th) ahead** of a strong step and **held through** it without re-attacking on the beat. Across a chord boundary, the anticipated note must be a chord tone of the **upcoming** chord. Proposed probability per bar-downbeat: UKG and house 0.3–0.5; deep and afro house 0.2. DnB toplines in half-time feel anticipate by an 8th. Derived from the anticipatory-syncopation findings.
- **H10 Phrase endings:**
  - "Open" A-ending: last note on scale degree 2, 5 or 7 (4 is also acceptable in minor), or over a non-tonic chord.
  - "Closed" B or consequent ending: degree 1 or 3 (5 allowed), lasting ≥ 2 steps, landing on step 0 or 8 or anticipated 1–2 steps early.
  
  This is derived from the half-cadence and authentic-cadence mapping. Practitioner judgment: emotional house often prefers "floating" closes on 3, 5 or 9 over a hard 1.
- **H11 Pickups:** in about 30–40% of phrases, add 1–3 notes on steps 13–15 of the previous bar, moving stepwise into the downbeat target, especially leading into the B bar. This is a proposal; no frequency source was found.
- **H12 Tension → release rhythm:** use a dotted-8th chain `{0,3,6,9,12}` or the half-bar tresillo `{0,3,6,8,11,14}` as the "tension" figure (build or A section) and quarters or straight 8ths as the "release" (hook or B section), following the Mix Review trick.
- **H13 Motif economy:** **≤ 2 distinct cells per 8-bar loop** (main cell plus one contrast), following the "too many ideas dilute" advice.
- **H14 Harmonic adaptation of repeats:** when the chord changes under a repeated cell, keep the rhythm and refit each pitch to the nearest chord tone of the new chord with minimal movement. This produces "sequence-like" variation for free.

### Gaps
- No source gives **quantified repetition/variation ratios** or **step/leap percentages for dance-music toplines** specifically. The Vos & Troost per-interval percentages could not be retrieved, only the 2-semitone peak.
- Hooktheory's book and blog statistics (for example the % of chord tones on strong beats, or the scale degrees that phrases end on) were not reachable.
- No data was found on **how often pickups are used** or on **phrase-ending scale-degree distributions in house or UKG**.
- The Ableton "Making Music: Creating Melodies 1: Contour" lesson (https://makingmusic.ableton.com/creating-melodies-1-contour) was located but could not be read.

---

## 2. Vocal chop writing (slicing strategies, rhythm templates, pitch choice vs chords, re-pitching, stutter/retrigger, number of syllables)

### Takeaway
The consensus craft process: slice by syllable or vowel, map the slices to a monophonic sampler, re-sequence them in a simple one-bar loop (start on strong beats, then remove a hit and displace one to an offbeat), repeat the syllable that carries the hook, and re-pitch the chops to the key and chords. Stutter means **16th-note retriggers of one clean syllable, lasting half a beat to one beat, near the end of a line, used only in short windows**, with the word kept intelligible. Stutter house adds gating/tremolo and pitch-shifting of vocals over a four-on-the-floor beat.

### Cited Findings

#### Slicing and sampler handling
- Core workflow: slice a vocal phrase → map the slices across a sampler → re-sequence; pitching and processing come last. Pitched, chopped vocal hooks are "a staple" of house, future bass, tech house, pop and DnB; Flume's "Never Be Like You" is a classic example. — [Vocalfy](https://vocalfy.com/blog/how-to-make-vocal-chops)
- Bassline-house chops: pitch the sample **up about 6 semitones** (chipmunk), slice it into a Drum Rack, then record new patterns from a MIDI controller. — [MusicRadar: bassline house vocal chops](https://musicradar.com/how-to/how-to-create-bassline-house-style-vocal-chops)
- Base chops on a **stable vowel**, since vowels are singable and sound human. — [Sonicbids](https://blog.sonicbids.com/music-production-tutorial-how-to-chop-vocals)
- For a melodic hook, trigger that vowel at several pitches and change the word order. **Repeat the syllable that carries the hook.** — [RysUp: How to make vocal chops](https://rysupaudio.com/blogs/news/how-to-make-vocal-chops)
- Different slices of a vocal carry different consonant sounds, which is more interesting than transposing one sample up and down. Slice mode maps transient-detected slices to keys. — [Yamaha Hub: vocal chops part 2](https://hub.yamaha.com/proaudio/recording/creating-vocal-chops-and-other-sampler-tricks-part-2)
- Use one slice per musical event (a word or a chord) with short fades against clicks; land accents on the beat and snap slices to the key. ‡ — [Violet Recording: How to chop samples](https://violetrecording.com/how-to-chop-samples/); [Vocalfy](https://vocalfy.com/blog/how-to-make-vocal-chops)
- Trim boundaries with the cut tool, add short fades, and **nudge phrases by small fractions of a beat** to lock them to the groove. — [FaderPro](https://blog.faderpro.com/techniques/how-to-create-vocal-chops/)
- Know the sample's key and shift it to the track key. Disable time-stretch when the sample tempo differs a lot from the project, to avoid artefacts. — [MusicTech: pitched vocal chops](https://musictech.com/tutorials/pitched-vocal-chops/)
- Tune the sample to the sampler's root note manually (Simpler does not detect pitch). Chops "aren't chromatically tuned like a normal instrument", so writing with them is trial and error over a beat. — [Loopmasters: create your own vocal chops](https://www.loopmasters.com/articles/4799-How-to-create-your-own-vocal-chops-)
- One-shot mode makes the sampler **monophonic**, which gives the "classic chop sound". ‡ — [Loopmasters](https://www.loopmasters.com/articles/4799-How-to-create-your-own-vocal-chops-)
- Audit samples against the session's key and tempo before committing (vendor blog). — [Output: Vocal Chops 101](https://output.com/blog/vocal-chop-sounds)
- Treat individual syllables as percussion, and automate the formant across a phrase. ‡ — [Samplefocus: 8 creative things to do with a vocal sample](https://samplefocus.com/blog/8-fun-and-creative-things-to-do-with-a-vocal-sample/)
- Pitch and formant shift can be linked (for example in Little Alter Boy). — [eMastered: formant shifting](https://emastered.com/blog/formant-shifting). Shifting the formant without changing pitch alters perceived gender or age without altering the melody. — [Sonarworks](https://www.sonarworks.com/blog/learn/what-are-advanced-techniques-for-manipulating-vocal-formants-and-tone)
- Definition: slicing up and rearranging small snippets ("chops") of a recorded vocal to make a new melody or rhythm. NI provides vowel recordings for practice. — [Native Instruments: vocal chops](https://blog.native-instruments.com/vocal-chops/)

#### Rhythm
- Keep it simple: start with a **one-bar loop**, put **one slice on each strong beat**, then **remove one hit and move another to an offbeat**. — [RysUp](https://rysupaudio.com/blogs/news/how-to-make-vocal-chops)
- Put chops on offbeats or **in the gaps of the hi-hat pattern**. Layer copies an octave up or down for depth. — [RouteNote](https://create.routenote.com/blog/beatmaking-101-mastering-vocal-chops-in-trap-beats/)
- **Swap chops every few bars**, and reverse, re-pitch, or add reverb or delay, to avoid repetition. — [Unison: vocal chops](https://unison.audio/vocal-chops/)
- **Tresillo / 3-3-2:** notated `XooXooXo`, most often grouped 3+3+2, with 3+2+3 and 2+3+3 also possible. It is circular and propulsive, and "extremely common, even in pop music". ‡ — [Wikipedia: Tresillo](https://en.wikipedia.org/wiki/Tresillo_(rhythm)); [Cruise Ship Drummer: three-note syncopation](https://cruiseshipdrummer.com/2018/04/29/three-note-syncopation-rhythms/); [Open Music Theory](https://pressbooks.nebraska.edu/openmusictheory/?p=517)
- A dotted-8th vocal figure against the kick resolves to quarters at the hook (see Q1). — [The Mix Review](https://themixreview.org/reviews/shut-up-and-dance/)

#### Stutter / retrigger
- Pick a **clean syllable near the end of a line** and start with **16th-note repeats running half a beat or one beat**, with a tiny fade on every manual cut. The repeated slice must follow the groove and **the original word must stay intelligible**. Automate the effect so it appears **only in short windows**. — [RysUp: vocal stutter effect](https://rysupaudio.com/blogs/news/how-to-make-vocal-stutter-effect)
- DJ-style stutter edit: cut at bar and 16th boundaries, then copy a **single 8th-note slice** onto the following 8th positions. Spread slices across tracks, pan some hard left and right, and **automate bitcrusher downsampling across successive slices** to build intensity. — [MusicRadar: DJ-style stutter edits](https://musicradar.com/tuition/tech/how-to-create-dj-style-stutter-edits-238074)
- Gated stutter: time-stretch the last word (Complex or Complex Pro warp) and use Auto Pan as a volume gate at **1/16** with phase at 0°. — [Slooply: rhythmic vocal stutters](https://slooply.com/blog/what-are-rhythmic-vocal-stutters/)
- Print the stutter, then EQ, saturate or add reverb. — [Nail The Mix: Stutter Edit](https://nailthemix.com/how-to-use-izotope-stutter-edit-effects)

#### Genre context
- **Stutter house:** chopped vocal samples become percussive *and* melodic elements and often drive the energy. Defining traits are given as intricate chops, emotional resonance and infectious grooves. ‡ — [Magnetic Mag: stutter house](https://magneticmag.com/2024/02/stutter-house/). The sound is described as a four-on-the-floor kick, swinging hats, deep bass and short synth stabs, with vocals processed by **gating, chopping and pitch-shifting**. This page's genre *history* is unreliable; only its sound description is used. — [festt.io](https://festt.io/en/festivals/genre/stutter-house)
- Hypebot uses the label "Stutter/Tremolo House". SoundCloud's Jack Bridges: "I personally don't think it's a genre in itself". He sees it as a moment in a set that can create a build-up, a peak, or a change in direction or energy. — [Hypebot](https://www.hypebot.com/hypebot/2023/04/soundcloud-stutter-house-and-the-power-of-music-micro-genres.html)
- Splice vendor copy traces the roots to early-2010s progressive house and future bass, and credits Fred again.. and BUNT with cementing the sound. — [Splice: Vocal Stutter House 2](https://splice.com/sounds/packs/dropgun-samples/vocal-stutter-house-2/story)
- **UKG:** a "noticeably swung, 2-step rhythm" with "chopped up R&B-esque vocal samples", a weighty bassline and synth stabs. — [MusicRadar: UK garage tutorial](https://musicradar.com/how-to/uk-garage-tutorial). Vocals are often female and R&B-influenced, and a cappellas are processed and cut up. — [Wikipedia: 2-step garage](https://en.wikipedia.org/wiki/2-step_garage). DJs pitched US garage records up toward 130 BPM, which thinned the vocals and tightened the drums. — [Orphiq: UK garage](https://orphiq.com/resources/what-is-uk-garage). A vendor pack offers vocals recorded at 110–120 BPM, intended to be stretched and pitched up to garage tempo, with "sped-up RnB runs". ‡ — [Loopmasters: UK Garage 90s RnB](https://www.loopmasters.com/genres/191-Uk-Garage/products/20905-Uk-Garage-90s-RnB)

### Inferences
All items are [INF].

- **V1 Slicing:** slice at syllable or transient onsets and keep 3–8 candidate slices. A hook uses **2–4 distinct syllables**, and one **carrier syllable takes ≥ 50% of the hits** (from "repeat the syllable that carries the hook"). Vowel-dominant slices go to tonal parts; consonant-heavy slices go to percussive parts.
- **V2 Lengths and playback:**
  - Percussive chop: 1–2 steps. Tonal chop: 2–8 steps. The final chop of a phrase may hold 4–12 steps into its reverb tail.
  - Playback is **monophonic with choke**: a new chop cuts the previous one.
  - Fades of 1–5 ms (sources only say "tiny" or "short").
- **V3 Rhythm templates** (16-step, 0-indexed). Choose one as the A cell and derive B with an H4 operator.
  - `T1 strong-then-displace`: start at `{0,4,8,12}`, delete one of {4,8,12}, then shift one remaining hit by +2 (to the "&") or −1 (anticipation). Example result: `{0,4,10,15}`. From RysUp.
  - `T2 half-bar tresillo`: `{0,3,6, 8,11,14}`.
  - `T3 bar tresillo` (3+3+2 counted in 8ths): `{0,6,12}`, with an optional `14`.
  - `T4 dotted-8th chain` (3-3-3-3-4): `{0,3,6,9,12}`, optionally plus `{14}` or a pickup on 15.
  - `T5 offbeat 8ths`: `{2,6,10,14}`.
  - `T6 hat-gap fill`: if the hats are on `{2,6,10,14}`, use odd steps, for example `{1,3,7,9,13}` (from RouteNote "gaps of the hi-hat").
  - `T7 call-half`: `{0,2,3,6}`, leaving steps 8–15 empty for a response.
  - `T8 2-step chop` (UKG): `{0,3,7,10,14}`. This is a proposal, not sourced.
- **V4 Pitch choice:**
  - Fix a **2–4-pitch set** per hook, preferring common tones across the progression.
  - At each onset, take the nearest chord tone of the sounding chord to the previous chop pitch. Hold a common tone across chord changes as a pedal when possible; otherwise move ≤ 2 semitones.
  - Range ≤ 7 semitones.
  - This applies H8/H14 to chops.
- **V5 Transposition limits:**
  - ±5 semitones is natural-sounding. Beyond that, enable formant preservation.
  - +6 to +12 semitones "chipmunk" only as a deliberate style choice (bassline house, MusicRadar).
  - Optional octave layer (±12) at −6 to −12 dB. The level is a proposal.
- **V6 Stutter rules:**
  - Window: **≤ 1 stutter window per 2–4 bars**, lasting 2–4 steps (half a beat) or 4 steps (one beat), placed on steps 12–15 of bar 4 or 8, or just before a drop.
  - Rate: **1/16** by default, or a ramp from 1/8 to 1/16 to 1/32 over one beat for builds.
  - Material: repeat the onset slice of the line's last syllable. The **final repetition plays the full syllable** for intelligibility.
  - Per-repeat modulation: filter, bitcrush or pitch ramp, from MusicRadar.
  - Gate variant: a 1/16 gate at about 50% duty over a time-stretched sustained vowel, from Slooply.
- **V7 Loop variation:** every 2–4 bars swap one chop, or re-pitch one, or reverse one (≤ 1 reversal per 4 bars). From Unison.
- **V8 Stutter-house mode:** chops serve both percussive and melodic roles. Apply a 1/16 tremolo/gate to held vocals or pads in "stutter" sections. Stutter gestures mark builds and peaks rather than running continuously (from the Hypebot quote).
- **V9 UKG mode:** pitched-up R&B fragment chops (+2 to +5 semitones is a practitioner guess), on syncopated templates T4/T8 with H9 anticipations.

### Gaps
- No source quantifies the **number of distinct syllables** per hook, or how often chop pitches are chord tones compared with tensions.
- The templates T2–T4 (tresillo, dotted 8ths) are standard rhythm cells. No source found tied them **explicitly** to vocal-chop writing.
- No stutter-house-specific technical source was found beyond general stutter edits and genre descriptions; artist practice is covered by the other researchers.
- Typical **semitone transposition ranges for UKG vocal pitching** were not found.

---

## 3. Basslines in house / UKG / afro house / DnB (rhythm templates, octave jumps, approach notes, note lengths, kick interaction and sidechain, sub vs mid)

### Takeaway
Each style's bass is defined by its relation to the kick:
- **House:** off-beat roots or 16th "pockets" around a four-on-the-floor kick, with octave jumps and 16th chord-tone fills.
- **Rolling bass:** near-continuous 16ths using a 3-note set and an accent-rising velocity shape.
- **UKG:** deep sine-sub lines locked to a 2-step kick (beat 1 plus the "and" of 3), sometimes doubled by organ.
- **DnB:** pure-sine sub (low-passed around 80 Hz, mono, sidechained) under a 2-step kick at 174 BPM, with a Reese mid layer.
- **Afro house:** smooth syncopated, sustained sub loops of 1–2 bars on the grid, under swung percussion.

Approach notes come mainly from walking-bass practice: a half step above or below the next root, just before the change.

### Cited Findings

#### House (general, offbeat, rolling)
- **Attack Magazine, "5 tips to improve your synth basslines":** builds an 8-bar bassline over a house progression using expanded note range, fills, rhythmic variation and **dead notes**. "During the first four bars … all three of our root notes are played on off-beats", which contrasts rhythmically with the drums. It adds faster **16th fills using chord tones between the root notes**. Range shapes listed: **1-5-9, 1-7-octave, 1-3-7 and the much-used 1-5-octave**. — [Attack: 5 tips](https://www.attackmagazine.com/technique/passing-notes/5-tips-to-improve-your-synth-basslines/); third-party summary: [ProducerLab](https://producerlab.beehiiv.com/p/5-ways-to-improve-your-basslines)
- **Classic offbeat ("donk") bass:** a single note on every offbeat. A long kick tail clashes even with sidechaining. **Octave-jump bass:** a 1/8 rhythm alternating a low note with the same note an octave higher. The first note of each pair lands on the kick, so sidechain is required, and glide suits the pattern. — [Producer School: 5 essential bass patterns](https://theproducerschool.com/blogs/featured-blogs/5-essential-bass-patterns-that-define-hard-house-and-trance-music)
- Tech house: bass notes "in between, on the offbeat", with velocity linked to filter cutoff so harder notes open the filter more. — [Producer School: modern tech house bass](https://theproducerschool.com/blogs/featured-blogs/master-modern-tech-house-bass-lines-complete-tutorial-guide)
- **Rolling bassline:** plays 16th notes (or close to continuous 16ths) for most of the bar, using a **small interval set of usually 3 notes, occasionally 4**. It varies velocity, note length and timing, and is sidechained tightly to the kick. The rolling character sits at **about 80–250 Hz**, with a sub layer underneath. — [Producer School: rolling bassline (Chris Stussy)](https://theproducerschool.com/blogs/featured-blogs/building-a-rolling-bassline-like-chris-stussy-the-3-note-pattern-that-defines-modern-tech-house)
- Rolling velocity shape: **first 16th very low, second slightly higher, third and fourth full**, varied bar to bar. Built on a plucky amp envelope with short decay. ‡ — [Production Music Live: rolling bassline](https://www.productionmusiclive.com/blogs/news/how-to-make-a-rolling-bassline)
- **Pockets:** treat the kick as the anchor and put bass notes in its gaps, for example **the 16th just after a kick**. With a four-on-the-floor kick, offbeat notes work best with short, staccato sounds. Vary the *rhythm* of a same-pitch line instead of only following roots. Use syncopation on the 16th grid. Use **chromatic approaches, moving one semitone up or down from a chord tone**. ‡ — [EDMProd: 9 tips for bass lines](https://www.edmprod.com/bass-lines-tips/); [Mixed In Key: how to write a bassline](https://mixedinkey.com/captain-plugins/wiki/how-to-write-a-bassline/); [Plugin Boutique: bassline for your chord progression](https://www.pluginboutique.com/articles/2048-How-to-Write-a-Great-Bassline-for-your-Chord-Progression)
- NI's 8-step method (funky house): sound → derive the line from the chords → rhythm → variation → move off the root → expression → longer grooves → sub. — [Native Instruments: How to write a bass line](https://blog.native-instruments.com/how-to-write-a-bassline/)
- **Ghost notes** are more percussive and are placed **in front of groove notes**. A turnaround can be varied by ending on the **5th instead of the root**. — [TalkingBass: funky bass line](https://www.talkingbass.net/how-to-build-a-funky-bass-line/)
- Altering note lengths (shorter and longer) creates variations, as does pitching a few notes up an octave. — [Boombox: tech house bassline loops](https://boombox.io/blog/how-to-make-tech-house-bassline-loops/)
- Call & response inside the bass: split the bassline across two tracks, one holding a repeated note and the other playing the melodic notes. — [Amped Studio](https://ampedstudio.com/create-a-call-response-bassline)

#### Approach notes (walking-bass practice, transferable)
- On beat 4, play a chromatic approach note from a **half step above or below** the next chord's root, resolving on beat 1. A common outline is root (beat 1), 3rd (beat 2), 5th (beat 3), approach (beat 4). — [Fundamental Changes: walking basslines](https://www.fundamental-changes.com/walking-basslines-on-guitar/); [FreeJazzLessons](https://www.freejazzlessons.com/?p=53401)
- Chromatic approach tones **resolve more strongly than diatonic ones** and give forward momentum. — [MalletJazz: Constructing bass lines](https://malletjazz.com/lessons/bassline.html)
- Forum view: half-step motion works especially well over minor ii-V-i; major ii-Vs suit roots and fifths plus chromatic passing tones. — [PianoGroove community](https://community.pianogroove.com/t/practicing-bassline-on-beats-2-4/7831)

#### Kick interaction and sidechain
- Release around **100–150 ms** gives "balanced, rhythmic pumping". Under 50 ms sounds jittery, over 200 ms sluggish. Attack of **1–5 ms** gives a sharper duck; **10–20 ms** lets some bass transient through. — [Unison: sidechain compression](https://unison.audio/side-chain-compression/)
- **20–75 ms** release is best for subtle ducking; slower releases timed to the tempo give obvious pumping. Attack under 10 ms. — [Sonarworks: sidechain](https://www.sonarworks.com/blog/learn/sidechain-compression)
- Forum starting point for dance music: 1 ms attack, about 80–120 ms release. — [Gearspace](https://gearspace.com/threads/another-side-chain-question.511397/)
- Put a bass note on every kick hit, with a compressor keyed to the low frequencies so the kick keeps its space. — [MusicRadar: get your kick and bass working together](https://musicradar.com/how-to/beat-programming-drums-bass-rhythm-section). Another source puts kick hits directly on the main bass notes. — [Computer Music via PressReader](https://www.pressreader.com/australia/computer-music/20200715/282033329486257)

#### UKG / 2-step
- **2-step kick:** beat 1 and "halfway through the third beat", which is step 10. Snares on beats 2 and 4. — [Native Instruments: UK garage](https://blog.native-instruments.com/uk-garage-music/); [Sample Focus: How to produce UK garage](https://samplefocus.com/blog/how-to-produce-uk-garage-music)
- UKG basslines are "deep and locked tight to the drums". Use a bass loop with wobble and filter movement, plus a **clean sine sub 1–2 octaves lower**. Hats are 16ths with **50–60% swing**. — [Sample Focus](https://samplefocus.com/blog/how-to-produce-uk-garage-music)
- "Powerful, rolling basslines, particularly sub-bass lines", which an **organ occasionally doubles**. ‡ — [Native Instruments: UK garage](https://blog.native-instruments.com/uk-garage-music/); [Soundbridge: UK garage](https://www.soundbridge.io/es/uk-garage)
- **Tempo** (sources conflict):
  - 128–135 BPM. ‡ — [Soundbridge](https://www.soundbridge.io/es/uk-garage)
  - 130–135 BPM, and "the two-step groove requires careful attention to swing and velocity". — [Undrgrndsounds](https://undrgrndsounds.com/blogs/news/how-to-produce-speed-garage-the-complete-production-guide)
  - Tutorial set at 136 BPM; about 130 leans classic garage, above 138 feels like speed garage or bassline. — [Producer School: UKG drums](https://theproducerschool.com/blogs/featured-blogs/how-to-program-uk-garage-drums-complete-guide-for-producers)
  - 2-step 130–135 vs bassline 135–145. — [Beatstorapon](https://beatstorapon.com/music/electronic/bassline-2-step)
  - Attack's "rolling 2-step" spec was reported as **122–128 BPM, 60–65% swing**, which conflicts with the other ranges. — [Attack Beat Dissected: rolling 2-step garage](https://www.attackmagazine.com/technique/beat-dissected/rolling-2-step-garage/)
- The UKG sub sits **forward** in the mix; EQ out lows early when blending to avoid mud. — [MixGraph: UK garage mixing guide](https://www.mixgraph.io/mixing-guide/uk-garage)

#### Afro house
- 115–125 BPM, with layered congas, bongos and shakers. — [Beatportal: afro house step-by-step](https://www.beatportal.com/articles/647491-step-by-step-guide-to-creating-an-afro-house-track-keinemusik-black-coffee-caiiro-alex-wann-style). 118–122 BPM with a four-on-the-floor kick. — [Native Instruments: Afro house 101](https://blog.native-instruments.com/afro-house-production-101/)
- A "smooth, subby bass" from a sine wave or low-passed square. Write a **1- or 2-bar loop** that locks with the percussion, and sidechain it to the kick. ‡ — [Futureproof: afro house production](https://futureproofmusicschool.com/blog/afro-house-production-a-producer-s-guide-to-crafting-deep-soulful-grooves)
- Follow the chord roots and use sidechain. — [Producer School: emotional afro house (Adam Port)](https://theproducerschool.com/blogs/featured-blogs/how-to-make-emotional-afro-house-like-adam-port)
- Afro house basslines "tend to roll, **syncopated and sustained**, following the chord root with **passing notes**". Swing only the 16th-note percussion and keep **kick, clap and bass on the grid**. A woody log drum carrying the bass points to amapiano, not afro house. — [Orphiq: What is afro house](https://orphiq.com/resources/what-is-afro-house)
- Roll off the tom loop at about 80 Hz so a separate sub covers the deep end. — [Producer School: Black Coffee style](https://theproducerschool.com/blogs/featured-blogs/how-to-make-afro-house-like-black-coffee-complete-tutorial)
- Keinemusik-style profile: clean low end, toms for groove, piano as harmonic core, and a "one note synth" (rhythmic, morphing). Its harmony is sparser than its peers'. — [PML: Keinemusik producer notes](https://www.productionmusiclive.com/blogs/news/producer-notes-keinemusik-more-love-rampa-me-afro-house-moderat-style-ableton); [Producer School: Afro house in 2026](https://theproducerschool.com/blogs/featured-blogs/afro-house-in-2026-from-adriatique-to-hugel-and-what-the-sound-has-in-common)

#### Drum & bass
- 174 BPM, with kicks on beat 1 and the "and" of 3. The sub is a **pure sine, mono, low-passed at about 80 Hz, sidechained to the kick**. — [Beatportal: DnB step-by-step](https://www.beatportal.com/articles/818379-step-by-step-guide-to-producing-drum-and-bass-like-sub-focus-a-m-c-and-delta-heavy)
- The second kick is "pushed late" to the 8th before the second snare (the "and" of 3), and the second snare is often shifted back or forward by an 8th. Half-time DnB has a single snare on beat 3. Neurofunk moves the second kick to the last 16th before beat 3. — [MusicRadar: 6 jungle & DnB grooves](https://www.musicradar.com/how-to/how-to-program-6-different-jungle-and-drum-n-bass-grooves)
- 172–176 BPM. Write a clean sub under a 2-bar break before adding mid-bass or Reese. — [Violet Recording: DnB](https://violetrecording.com/how-to-make-drum-and-bass/)
- **Reese:** a sustained, detuned saw with phase beating that speeds up as pitch rises. — [Futureproof: Reese](https://futureproofmusicschool.com/blog/reese-bass-sound-design-everything-you-need-to-know). Attack builds it from a sustained saw with short release. — [Attack: Reese bass redux](https://www.attackmagazine.com/technique/tutorials/reese-bass-redux/). Layering a deep sub with a warm Reese mid is the common approach. — [Looperman loop description](https://www.looperman.com/loops/detail/413774/f-sharp-minor-liquid-dnb-sub-and-reese-bassline-free-174bpm-drum-and-bass-bass-synth-loop)

### Inferences
All items are [INF].

- **B0 Kick and snare maps:**
  - House, deep, afro and stutter: kick `{0,4,8,12}`.
  - UKG 2-step: kick `{0,10}`, snare `{4,12}`.
  - DnB 2-step: kick `{0,10}`, snare `{4,12}`. Neurofunk variant: kick `{0,7}`. Half-time: snare `{8}`.
  - Bass rhythm is generated relative to this map.
- **B1 House offbeat:**
  - Notes on `{2,6,10,14}`, 1–2 steps long (staccato), mostly the root.
  - Per bar, one note moves to the octave or 5th, or uses a 1-5-8 / 1-b7-8 / 1-3-7 shape (Attack range shapes).
  - "Donk" variant: identical single-note offbeats.
  - Octave-jump variant: 8ths alternating R (on the beat) and R+12 (offbeat). This variant requires sidechain.
- **B2 Rolling:**
  - 16ths on all non-kick steps `{1,2,3,5,6,7,9,10,11,13,14,15}`, or all 16 steps with tight sidechain.
  - Pitch set of 3: `{R, R+12, R+7 | R+10 | R+3}`.
  - Velocity per beat `[50, 72, 105, 105]` ±5, from the PML shape.
  - Gate 0.5–0.9 of a step.
  - Change one note of the set at chord changes.
- **B3 Pockets:** bass on the 16th after the kick `{1,5,9,13}` or before it `{3,7,11,15}`, staccato. Mix with offbeats for syncopation (from EDMProd).
- **B4 UKG 2-step:**
  - Sine sub, with an optional organ or mid layer +12 doubling it (NI).
  - Root from step 0 lasting 2–4 steps, plus 2–4 syncopated hits chosen from `{3,6,7,10,11,14}`, with at least one hit at 10 or 11 to interlock with the 2-step kick.
  - Octave jumps on offbeats.
  - Tempo 130–138 (resolving the source conflict toward the majority).
- **B5 DnB:**
  - Sub notes start on the kick steps `{0,10}` and sustain **legato** until the next onset, with optional glide.
  - Pitch changes mostly every 1–2 bars, on chord roots.
  - The Reese doubles the sub at +12 with long notes. Rolling variants add hits at `{6,14}`.
  - Sub low-passed at about 80 Hz and mono (Beatportal).
- **B6 Afro house:**
  - A 1–2-bar loop of sustained, syncopated notes on the chord root, with passing notes, placed **on the grid with no swing** (Orphiq).
  - Candidate rhythms: bar tresillo `{0,6,12}` or half-bar tresillo `{0,3,6,8,11,14}`, legato to the next onset, with a passing note on step 14 or 15 before a change.
  - The tresillo choice is speculative.
- **B7 Approach notes:** for each chord change at step 0 of bar n, with P = 0.3–0.5 (proposed), put an approach note on **step 15** (16th) or **step 14** (8th) of bar n−1. Pitch options, with weights:
  - Chromatic −1 semitone below the new root: 0.35
  - Chromatic +1 semitone above: 0.25
  - Diatonic step below or above: 0.25
  - 5th of the new chord: 0.15
  
  Approach notes are short (≤ 1 step for a step-15 approach) and never displace the step-0 root. Derived from walking bass (approach on beat 4, half step either side), scaled to the 16th grid, and EDMProd's chromatic ±1.
- **B8 Fills:** bar 4 with P ≈ 0.5, bar 8 with P ≈ 0.8. Replace steps 12–15 with a 16th chord-tone fill: an ascending R-3-5-8 run or descending 8-5-3-approach (Attack 16th chord-tone fills).
- **B9 Range:** bass part ≤ 15 semitones. Practitioner judgment: the sub fundamental sits between MIDI 28 (E1, 41 Hz) and MIDI 43 (G2, 98 Hz). The mid layer is +12. The rolling character sits at 80–250 Hz (Producer School).
- **B10 Sidechain defaults:** attack 1–5 ms, release 80–150 ms, or tempo-synced to 1/16–1/8 (121–242 ms at 124 BPM; 86–172 ms at 174 BPM). Ducking depth 3–8 dB is practitioner judgment. If the generator avoids kick steps rhythmically, use lighter ducking.
- **B11 Ghost/dead notes:** velocity 20–45, length ≤ 1 step, on the 16th before a groove note. Proposed 0–2 per bar (TalkingBass, Attack "dead notes").
- **B12 Turnaround pitch:** the last bass note of a 4- or 8-bar loop may land on the 5th instead of the root, P ≈ 0.25 (TalkingBass).
- **B13 Pedal bass:** hold one root under 2–4 changing upper chords in about 25–35% of progressions (from Attack's Kerri Chandler pedal-bass progressions; see Q4). The weight is a proposal.

### Gaps
- No **house- or UKG-specific** source quantifies approach-note frequency or placement. The rule is transferred from jazz walking bass.
- **DnB bass rhythm at note level** (how often notes change, rolling vs. long notes, sub vs. Reese rhythm) and **afro house bass patterns** were not found as transcriptions.
- No detail was found on **UKG organ-bass voicing or rhythm**.
- The sub/mid crossover is only partly sourced (DnB low-pass at about 80 Hz; rolling mid at 80–250 Hz).

---

## 4. Chord voicing for emotional/deep house keys; house piano and stab rhythm patterns (incl. M1 organ / piano house)

### Takeaway
Deep house harmony is built from jazz-derived m7/m9/maj7 chords. Typical voicings: **rootless** (the bass takes the root), **7th on the bottom** (third inversion, Kerri Chandler), 5ths replaced by 11ths or 13ths, and close voicings within about one octave for stabs, spread for pads. **Parallel "chord memory" planing** of a fixed shape is idiomatic, as is the **bass re-harmonizing triads into maj7/11 sounds**. Keep 3rds above about B2/C3 (scientific) to avoid mud.

Piano house rhythm: short 16th-length chords on a quarter grid, with selected hits pushed a 16th early. Organ and M1 stabs: short attack, medium decay, no sustain, placed on offbeats.

### Cited Findings

#### Vocabulary and voicings
- Deep house uses jazz-influenced **minor and major 7th chords**, giving a chord-led feel. A 7th chord = root, 3rd, 5th, 7th. — [Attack: Passing Notes, deep house chords](https://www.attackmagazine.com/technique/passing-notes/passing-notes-deep-house-chords/)
- **m9** = C–E♭–G–B♭–D. Moving E♭ and G **up an octave** gives "a brighter, more open sound". The same m9 *shape* is then moved through **Am9 and A♭m9** to fit a C–A–A♭ bassline at 128 BPM. ‡ — [MusicRadar: deep house minor ninth chords](https://musicradar.com/how-to/how-to-create-deep-house-minor-ninth-chords); [Mode Audio: house chords with any synth](https://modeaudio.com/magazine/turn-any-synth-into-a-deep-house-chord)
- **Kerri Chandler voicings:** "the seventh note is at the bottom, followed by the root, third and fifth" (third-inversion 7ths). He often **leaves out roots and fifths** because the bass covers the roots, and **replaces 5ths with 11ths or 13ths**. The bass line is **offset from the stabs**, which "adds a lot of groove through syncopation and small moments of tension". Limiting chords to one octave forces new inversions. "**Parallel motion is very common in house** as it can be easily recreated with a chord trigger MIDI effect." — [Attack: Kerri Chandler chords](https://www.attackmagazine.com/technique/passing-notes/kerri-chandler-chords/); [Attack video: Kerri Chandler's favourite chord](https://www.attackmagazine.com/technique/video-tutorials/passing-notes-kerri-chandlers-favourite-chord/)
- Part 2 covers **pedal-bass progressions**, **different voicings of the same chord in succession**, and the "Rain" progression as complex jazz harmony in house. — [Attack: Kerri Chandler chords part 2](https://www.attackmagazine.com/technique/passing-notes/kerri-chandler-chords-part2/)
- 9th chords for colour in house stabs. — [343 Labs: house chord stabs](https://studio.343labs.com/making-chord-stabs-house)
- Forum tips: maj7 chords with light delay for groove; record a chord an octave up, then play it an octave down in a sampler and filter it for grit. — [Gearspace: stabby chord techniques](https://gearspace.com/threads/stabby-chord-techniques.469442/)
- **Tight close voicings for punchy stabs; wider, spread voicings for long pad chords.** The **Korg M1** produced the "organ piano stab", especially the **"Organ 2" and "Universe"** patches. The shared envelope was "short attack, medium decay, no sustain, fast release", and "the envelope shape was the defining character, not the oscillator content". — [Producer School: chord stabs like modern rave / UKG](https://theproducerschool.com/blogs/featured-blogs/how-to-make-chord-stabs-like-modern-rave-the-hard-house-and-uk-garage-sound)
- Forum guidance: the left hand covers the root and its octave, the right hand the 3rd and colour tones. ‡ — [KVR forum](https://www.kvraudio.com/forum/viewtopic.php?p=5144984). Left-hand chords in the bass register should be **open, with intervals no smaller than a fifth**. — [Renoise forum](https://forum.renoise.com/t/piano-chord-voicings/25098)

#### Register and mud (low interval limits)
- Sweetwater's table uses the **C3 = middle C** convention and puts the lowest usable **major 3rd at B1–D♯2**, which is **B2–D♯3 scientific (MIDI 47–51)**. The limits are guides, "not absolutes". — [Sweetwater: Low Interval Limit](https://www.sweetwater.com/insync/low-interval-limit/)
- Octaves and 5ths can go lowest; 3rds and 4ths cannot go as low. ‡ — [Piano With Willie](https://pianowithwillie.com/big-chords-progressions-fills/)
- A perfect 5th can sit lower than a minor 2nd. Mud depends on dynamics and on harmonic content. When checking, "assume the root is present even if another instrument plays it". — [Robin Hoffmann: Low Interval Limits](https://www.robin-hoffmann.com/dfsb/low-interval-limits)
- Keep notes well apart and avoid upper chord tones and the 3rd in the very low register. ‡ — [Sweetwater: balanced orchestrations](https://www.sweetwater.com/insync/make-orchestrations-sound-more-balanced/)

#### Rhythm patterns
- **Chicago house spread piano (about 124 BPM):**
  - C major on **G2–C3–E3**. MusicRadar most likely uses DAW naming, which would be G3–C4–E4 scientific (MIDI 55/60/64); this is unverified.
  - Each chord lasts **one 16th**, copied across **8 beats over 2 bars** (a quarter-note grid).
  - The **4th chord in each bar is nudged a 16th earlier**, the others are shifted by **two or three 16ths**, and **the 3rd chord's length is doubled**.
  - The progression continues with B♭ major, first-inversion C minor, then F major.
  - Left hand: the lowest note of each chord is copied into a bass part on **C1, E♭1, A♭1, F1**. These new bass notes turn the harmony into **C – B♭11 – A♭maj7 – F**. For example, C minor first inversion over A♭ = A♭maj7.
  - — [MusicRadar: Chicago house spread piano chords](https://www.musicradar.com/how-to/make-chicago-house-chords)
- Classic house piano stabs on a **swung** groove at about 127 BPM. — [Attack: house piano chords with EZKeys](https://www.attackmagazine.com/technique/tutorials/creating-house-piano-chords-with-toontracks-ezkeys/). A follow-up on making stabs more melodic and dynamic, moving past "overused voicings and patterns". — [Attack: chord stab variations](https://www.attackmagazine.com/?p=111276)
- Deep house Beat Dissected: sample a **m7 or m9 chord, shorten its envelope, and place it on the first offbeat of each bar**, at about 120–125 BPM. The search summary reported **70–80% swing**, which is unusually high; the scale (Ableton groove amount?) is unclear. ‡ — [Attack: Dusted deep house](https://www.attackmagazine.com/technique/beat-dissected/dusted-deep-house/)
- Put a **filtered stab on the offbeats (the "&" counts)** for tension against kick and snare. Build syncopation one element at a time. **Short, bright stabs with quick decay** sit best. — [Thinking Aloud newsletter](https://thinking-aloud-newsletter-9fcd48.beehiiv.com/p/the-off-beat-sweet-spot-why-syncopation-makes-people-move-19b26f6f882dfcec)
- Tresillo can be used in chords, melody or bass (forum). — [Scaler forum](https://forum.scalermusic.com/t/do-you-like-tresillo-rhythm/8027); definition — [Wikipedia: Tresillo](https://en.wikipedia.org/wiki/Tresillo_(rhythm))
- Introduce a chord stab that lands as a **response to the bassline**. — [Future Music: 6 quick composition tips (PressReader)](https://www.pressreader.com/australia/future-music-9629/20220208/282016150725103)

### Inferences
All items are [INF].

- **C1 Chord vocabulary** for minor-key emotional or deep house, proposed weights (practitioner judgment, unsourced):
  - m7 0.25, m9 0.25
  - maj7/maj9 0.20
  - add9/sus2 0.15
  - m11 or 7sus4 ("11") 0.10
  - dominant 9/13 0.05
- **C2 Voicing families**, 4–5 voices; pick per chord and keep a family for a whole loop:
  - `CHANDLER_INV3`: `[7, R, 3, 5]` close, with the 7th at the bottom (Attack).
  - `ROOTLESS_m9`: `[b3, 5, b7, 9]`, which sounds like the relative maj7 when the bass holds the root.
  - `ROOTLESS_maj9`: `[3, 5, 7, 9]`.
  - `FIFTH_SWAP`: replace the 5th with the 11th (minor chords) or the 13th (major and dominant chords) (Attack).
  - `UPPER_TRIAD`: a triad in the keys over a bass that turns it into a richer chord (MusicRadar Chicago). A triad over a bass a **major 3rd below its root** gives maj7 (Cm/A♭ = A♭maj7). A triad over a bass a **5th below its root** gives a sus/11 sound (B♭/E♭, "B♭11").
  - Pads: `SPREAD` = the m9 voicing with the 3rd and 5th raised an octave (MusicRadar "brighter, more open").
- **C3 Register constraints** (MIDI, scientific):
  - The keys' lowest note is ≥ 48 (C3) whenever the interval to the next voice up is ≤ 4 semitones. A major-3rd floor of about 47 follows from Sweetwater's B2–D♯3.
  - The lowest note may go down to about 43 only if it is a 5th or octave from the next voice.
  - Top voice 67–84 (G4–C6).
  - Stab span ≤ 14 semitones (close, about one octave per Attack's "within one octave" exercise). Pad span 15–28 semitones.
  - Assume the bass root sounds when checking mud (Hoffmann).
  - The minor-3rd and 5th floors are practitioner estimates, since Sweetwater's full table was not retrieved.
- **C4 Voice-leading modes.** Pick per style.
  - **SMOOTH:** choose the inversion or voicing that minimizes Σ|Δ semitones| across voices. The **top voice moves ≤ 2 semitones or holds a common tone** (P ≈ 0.8), no voice crossing, and at most one voice may move up to 5 semitones.
  - **PLANING / chord memory:** keep one interval shape and transpose it with the bass root (Attack's parallel motion; MusicRadar's m9 shape moved Cm9 → Am9 → A♭m9). Choose the octave of each transposition so the top-voice jump is ≤ 7 semitones.
  - Proposed P(planing): classic or deep house 0.5, UKG organ/M1 stabs 0.6, emotional/piano house 0.3, afro house 0.3.
- **C5 Re-voice on repeat:** when a chord lasts 2 bars or more, or repeats, change the inversion or top note on the repeat with P ≈ 0.3 (Chandler's "different voicings of the same chord in succession").
- **C6 Keys rhythm templates** (16-step, 0-indexed):
  - `K1 CHICAGO` (from MusicRadar):
    1. Start from `{0,4,8,12}` per bar, each 1 step long.
    2. Move hit 4 from 12 to **11** (a 16th early).
    3. Move hits 2 and 3 by ±2 or ±3 steps.
    4. Double the length of hit 3.
    5. Keep the downbeat hit on 0, or anticipate it on step 15 of the previous bar.
    
    One plausible realization is `{0, 6(len2), 9, 11}`. This is a reconstruction, not taken from the article; verify it.
  - `K2 OFFBEAT`: `{2,6,10,14}`, length 1–2 steps (organ, deep).
  - `K3 FIRST-OFFBEAT`: `{2}` per bar, optionally plus `{10}` (Attack dusted deep house, sparse).
  - `K4 TRESILLO`: `{0,3,6,8,11,14}`, `{0,6,12}`, or 3-3-3-3-4 `{0,3,6,9,12}`.
  - `K5 PUSHED CHANGE`: move the chord change to step 14 (8th early) or 15 (16th early) of the previous bar, P = 0.3–0.5 per change (from the MusicRadar 16th nudge plus the anticipation research).
  - `K6 PAD`: hold 15–16 steps and re-attack on changes. In stutter-house mode, apply a 1/16 gate (V8).
  - **Stab lengths:** piano house 1 step; organ/M1 1–2 steps (short A, medium D, zero S, fast R); deep house stab 1–3 steps.
- **C7 Bass–keys relation:** drop the root (and optionally the 5th) from the keys while the bass plays the root. At least 50% of stab hits should **not** coincide with bass onsets, for the Chandler-style offset and syncopation. The weight is a proposal.
- **C8 Pedal mode:** a bass pedal under changing upper chords (Chandler part 2) in about 25–35% of generated progressions (proposal).

### Gaps
- No source quantifies **top-voice motion size** or how often common tones are kept in house keys. The ≤ 2-semitone rule is a proposed default.
- The exact 16th positions in the MusicRadar Chicago pattern could not be read; only the transformation description was obtained. The octave convention in MusicRadar's note names is unverified.
- No source gives **M1 piano-house or organ-house rhythm patterns** beyond envelope description, or **frequency data on chord anticipation in house**.
- The Attack "dusted deep house" swing value of 70–80% is suspicious or uses a different scale; it needs checking.

---

## 5. Interplay and arrangement inside a 4–8-bar loop (call & response, register separation, density balance, turnarounds/fills in bar 4/8, variation across repeats)

### Takeaway
Sources agree on four points:
- Call & response works best when the parts **alternate rather than overlap** and differ in timbre, register (often an octave) or timing.
- Chord stabs can answer the bassline.
- A slow call & response can run **across bars** (bass in one bar, chords in the next).
- Phrase boundaries every **8 or 16 bars** get a fill. This can be a short one (the last 1–2 beats) or up to a bar, a 16th snare roll, a kick dropout, or a reverb throw.

Density rules are only qualitative in the sources ("limit ideas", "sparse harmony").

### Cited Findings
- **Call & response:**
  - Pair a lead synth (call) with a softer piano (response). Contrast pitch (an octave higher or lower) or use harmonizing notes. Separate instruments are not required but help. — [EDMProd: Call & Response](https://www.edmprod.com/using-call-and-response/)
  - "Many arrangements, particularly in Pop and Dance music", use a single figure followed by an answering one, "rather than the two happening at once". — [Future Music via PressReader: arrangement and mix space](https://www.pressreader.com/australia/future-music-9629/20161215/282144995976445)
  - Introduce a chord "stab" that lands as a **response to the bassline**. — [Future Music via PressReader: 6 composition tips](https://www.pressreader.com/australia/future-music-9629/20220208/282016150725103)
  - Calls are "almost always rhythmic in nature". Answering a bass part with chords **on a different bar** creates a slow-moving call & response. — [Brett Works: call and response workflows](https://brettworks.com/2019/02/08/production-workflows-working-with-call-and-response/)
  - Synthesis: contrasting timbre, register and timing make the exchange clear, and call and response should alternate rather than overlap. ‡ — [EDMProd](https://www.edmprod.com/using-call-and-response/); [Pause Play Repeat](https://www.pauseplayrepeat.com/blog/musical-conversations-the-power-of-call-and-response-in-production); [Brett Works](https://brettworks.com/2019/02/08/production-workflows-working-with-call-and-response/)
- **Fills and turnarounds:**
  - Fills usually mark the end of 8- or 16-bar sections. At these "anchor points" they can be **up to a bar long**, depending on how much the arrangement is building. For uneventful transitions, **a fill of the last beat or two** is enough. A bar-long fill plus a riser also works. In house, a **16th 909 snare roll** is often faded up at the end of 8- or 16-bar sections. ‡ — [Computer Music via PressReader: Drum fills](https://www.pressreader.com/australia/computer-music/20160518/281526520271381); [Computer Music via PressReader: Where, how long and how much?](https://www.pressreader.com/australia/computer-music/20160518/282759175885333)
  - Non-fill variation: **add or remove kick notes at the end of every 8 or 16 bars**; send the last-beat snare or clap to a long reverb that carries into the next section; drop percussion for sparseness or add rides to lift energy. ‡ — [Future Music via PressReader: six beat programming tips (2017)](https://www.pressreader.com/australia/future-music-9629/20170629/282041917130241)
  - Programmed fills need notes moved off the grid and velocity tweaks. ‡ — [Future Music via PressReader: programming fills and turnarounds](https://www.pressreader.com/australia/future-music-9629/20180503/282076277479477)
  - Elektron conditional trigs (1:2, 2:2 and so on) place a fill on the last bar of an 8-bar cycle without a separate pattern. — [Elektronauts](https://www.elektronauts.com/t/drum-fills-on-8th-bar/193320)
- Bass-side turnaround: 16th chord-tone fills between roots in an 8-bar bassline. — [Attack: 5 tips basslines](https://www.attackmagazine.com/technique/passing-notes/5-tips-to-improve-your-synth-basslines/)
- Vocal chops: swap them every few bars. — [Unison: vocal chops](https://unison.audio/vocal-chops/)
- Motif economy: too many melodic ideas dilute each one. ‡ — [Audient](https://audient.com/fr/?p=45886); [iZotope](https://www.izotope.com/en/learn/common-toplining-mistakes-to-avoid)
- Bass offset from the stabs creates syncopation and tension between parts. — [Attack: Kerri Chandler chords](https://www.attackmagazine.com/technique/passing-notes/kerri-chandler-chords/)
- "Less is more" in an afro house context: Keinemusik uses sparser harmonic content than its peers and a "one note synth" carrying rhythm. — [Producer School: Afro house in 2026](https://theproducerschool.com/blogs/featured-blogs/afro-house-in-2026-from-adriatique-to-hugel-and-what-the-sound-has-in-common); [PML: Keinemusik notes](https://www.productionmusiclive.com/blogs/news/producer-notes-keinemusik-more-love-rampa-me-afro-house-moderat-style-ableton)
- Register cues: DnB sub low-passed at about 80 Hz; rolling mid-bass at 80–250 Hz; 3rds should not sit below about B2/C3 (see Q4); UKG blends should EQ out lows early. — [Beatportal DnB](https://www.beatportal.com/articles/818379-step-by-step-guide-to-producing-drum-and-bass-like-sub-focus-a-m-c-and-delta-heavy); [Producer School rolling bass](https://theproducerschool.com/blogs/featured-blogs/building-a-rolling-bassline-like-chris-stussy-the-3-note-pattern-that-defines-modern-tech-house); [Sweetwater LIL](https://www.sweetwater.com/insync/low-interval-limit/); [MixGraph UKG](https://www.mixgraph.io/mixing-guide/uk-garage)

### Inferences
All items are [INF].

- **I1 Register lanes** (MIDI, scientific; practitioner defaults):
  - Sub 28–43; mid-bass 40–55; keys/chords 48–84 (stabs mostly 55–79); pluck 60–84; lead/chops 64–91.
  - Constraint: the lead's median pitch is ≥ the keys' top-voice median + 3 semitones, **or** the lead alternates in time with the keys.
  - No unison collision: if the lead pitch equals a keys voice on the same step, revoice the keys.
- **I2 Rhythmic complementarity:**
  - At most **2 melodic onsets per step** (bass plus one other), except on steps 0 and 8.
  - If the hook has ≥ 5 onsets per bar, the keys drop to ≤ 3 hits per bar or a pad. If the hook rests (for example beats 3–4), the keys or pluck **answer** in that space.
  - Derived from "alternate rather than overlap".
- **I3 Call & response scheduler.** Pick one per loop:
  - (a) **intra-bar**: hook on steps 0–7, answer on 8–15.
  - (b) **inter-bar**: hook in bars 1 and 3, answer in bars 2 and 4 (Brett Works).
  - (c) **bass→stab**: stabs placed only in bass rests (Future Music).
  - (d) **lead→keys tail echo**: the keys repeat the last 2–3 notes of the call ±12 or harmonized in 3rds/6ths (EDMProd).
- **I4 Response transform:** a different timbre plus an octave shift, *or* a harmonized version of the call's tail, *or* a rhythmic echo with 1–2 pitches changed. The response is never denser than the call.
- **I5 Phrase markers:**
  - **Bar 4** (light): exactly 1 event from {bass 16th chord-tone fill, chop stutter window (V6), open-hat or crash on step 14/15, hook B-ending}.
  - **Bar 8** (strong): 2–3 events from {drum fill over the last 1–2 beats (16th snare roll), kick removed on beat 4, reverb throw on the last clap, bass fill, hook closed ending (H10), keys pushed change (K5)}.
  - 16-bar boundary: a fill up to 1 bar plus a riser.
- **I6 Variation across loop repeats:** at most one part changes per 4 bars, and exactly one element is added, removed, swapped or re-voiced per 8 bars. Never change the hook cell and the chord voicing family in the same bar.
- **I7 Space ("less is more"):** each melodic layer leaves ≥ 1 beat per bar empty (or sustained). Total distinct melodic ideas per 8 bars ≤ 3 across all parts (hook cell, contrast cell, one keys or bass motif).
- **I8 Style density presets:**
  - Afro house: harmony ≤ 1 chord per 2 bars or a one-note synth; toms and percussion carry the groove.
  - DnB: harmonic rhythm 1 chord per 1–2 bars with legato sub.
  - UKG: busy syncopated bass and chops, sparse stabs.
  - Emotional or melodic house: keys in mid-density with the lead in call & response.

### Gaps
- No source gives **quantified density limits** (onsets per bar per part), **register-lane allocations** for dance arrangements, or rules for **how many loop repeats before a variation**. All of these are proposed defaults.
- "Less is more" appears only as qualitative advice.

---

## 6. Humanization (velocity accent patterns, timing offsets including laid-back keys, ghost notes, swing)

### Takeaway
Use **small, structured, non-random** deviations:
- Keep kick and snare tight and leave hats looser.
- Accent offbeat hats above the filler 16ths.
- Partial quantize at 50–65% for played parts.
- Give the swing style-specific values: UKG 16th swing at **about 50–65%** (MPC-style). Afro house swings only the percussion and keeps kick, clap and bass on the grid.
- Do not copy one bar's variations to every bar.

Microtiming research gives scale: laid-back drummers delay the snare by about **17 ms** at 96 BPM, and laid-back strokes are **softer**. No keys-specific laid-back measurements were found.

### Cited Findings
- Drummers told to play "laid-back" with a click at 96 BPM delayed snare attacks by **about 17.4 ms on average**. A study of 21 electric guitarists found laid-back strokes had **lower striking velocity** and longer movement duration than on-beat or pushed strokes. ‡ — [Câmara, UiO thesis (PDF)](https://duo.uio.no/bitstream/handle/10852/79965/MP3801_01_Camara.pdf?sequence=1); [UiO RITMO TIME project](https://www.uio.no/ritmo/prosjekter/flaggskipprosjekter/time/)
- Listener sensitivity is often put at **about 2.5% of the beat length**. Musicians respond subliminally to deviations as small as 1.5 ms at 92–100 BPM. This is a forum summary of studies. — [MusicPlayer forum: microtiming studies](https://forums.musicplayer.com/topic/154367-microtiming-studies-rhythmic-feel-swing-rhythm)
- Commentary asks whether discrepancies under 10 ms play an expressive role. — [MTO: Benadon commentary](https://mtosmt.org/issues/mto.07.13.1/mto.07.13.1.benadon.php)
- **General MIDI humanizing** (‡ across the pages below):
  - "±10 ticks can add a subtle life".
  - Behind-the-beat feels "loose/relaxed/impactful", while **pushing hats ahead and kicks behind often sounds sloppy**. One user's timing bias is about 0–10%.
  - Ardour example: a flat velocity of 97 randomized to 94–101.
  - Partial quantize at **50–65% strength** for chords and melodies. **Keep kick and snare tight, hats looser.**
  - **Don't copy one bar's variations across the whole pattern**, because listeners pick up on repeated variations.
  - A real drummer's microtiming is not random, so a consistent swing may sound more natural than random offsets.
  - Velocity variation mainly prevents hits from sounding like identical samples.
  - — [VI-Control: REAPER humanize](https://vi-control.net/community/threads/reapers-humanize-notes-some-tips-or-guidelines.124794/); [Ardour discourse](https://discourse.ardour.org/t/how-do-i-humanize-a-midi-track/100123); [Unison: humanize MIDI](https://unison.audio/how-to-humanize-midi/); [Splice: humanize MIDI drums](https://splice.com/blog/?p=5091); [Mixelite: humanizing MIDI drums](https://mixelite.com/blog/humanizing-midi-drums/)
- **Hi-hat accents** (‡ across the pages below):
  - Test a straight 16th bar by dropping every other hit's velocity.
  - Keep offbeats and key notes louder than the filler 16ths. Raise the offbeat hat and ramp the neighbouring 16ths around it.
  - Moving some offbeats to an **open hat** is standard; an open hat on *every* offbeat pushes toward disco. The offbeat open hat creates the house "pump".
  - Drop the hat when the snare lands, as a live drummer would.
  - Classic house tolerates a more mechanical result.
  - In an Attack breakdown, velocity changes, small off-grid nudges and automated attack times on the closed and mid hats made a stiff disco pattern feel organic.
  - — [Gearspace: programming hi-hats](https://gearspace.com/threads/programming-hi-hats.671505/); [Future Music via PressReader: Velocity 101](https://www.pressreader.com/australia/future-music-9629/20180503/282020442904629); [Pro Tools Expert: drumming clichés](https://www.pro-tools-expert.com/production-expert-1/6-drumming-cliches-to-embrace-and-how-to-subvert-them); [Unison: hi-hats](https://unison.audio/hi-hats/); [Attack: live hi-hats](https://www.attackmagazine.com/technique/beat-dissected/live-hi-hats/)
- **Swing values:**
  - UKG 16th swing at about **50–60%** (Logic). — [MusicRadar: UK garage tutorial](https://musicradar.com/how-to/uk-garage-tutorial)
  - 50–60%. — [Sample Focus](https://samplefocus.com/blog/how-to-produce-uk-garage-music)
  - Attack's "rolling 2-step" reported at **60–65%**. — [Attack](https://www.attackmagazine.com/technique/beat-dissected/rolling-2-step-garage/)
  - MPC 57–62% as the classic hip-hop pocket, with "around 16–25%" suggested for most electronic genres. The latter is on an unclear scale, likely a DAW groove amount. — [Thinking Aloud newsletter](https://thinking-aloud-newsletter-9fcd48.beehiiv.com/p/the-secret-weapon-your-beats-are-missing-755990e3080d66b2)
  - 50% = straight. Some argue 50–52% is effectively zero and swing starts at 53%. The MPC1000 rounds 60% 16th swing to whole ticks. — [MPC Forums](https://www.mpc-forums.com/viewtopic.php?p=546929)
- **Afro house:** swing only the 16th percussion and keep kick, clap and bass on the grid. — [Orphiq](https://orphiq.com/resources/what-is-afro-house). Apply swing or a triplet groove to the percussion, and use simple 3-against-4 patterns between shaker and clave. ‡ — [Futureproof: afro house](https://futureproofmusicschool.com/blog/afro-house-production-a-producer-s-guide-to-crafting-deep-soulful-grooves); [NI: Afro house 101](https://blog.native-instruments.com/afro-house-production-101/)
- **Bass:** rolling lines vary velocity, length and timing so they never sound like a programmed loop. — [Producer School: rolling bass](https://theproducerschool.com/blogs/featured-blogs/building-a-rolling-bassline-like-chris-stussy-the-3-note-pattern-that-defines-modern-tech-house). Ghost notes go in front of groove notes. — [TalkingBass](https://www.talkingbass.net/how-to-build-a-funky-bass-line/). The 2-step groove "requires careful attention to swing and velocity". — [Undrgrndsounds](https://undrgrndsounds.com/blogs/news/how-to-produce-speed-garage-the-complete-production-guide)

### Inferences
All items are [INF]. Numbers are proposed defaults.

- **U1 Swing per style**, on the MPC-style % scale applied to 16ths:
  - House 52–56; deep house 54–60; UKG/2-step **56–64** (sources span 50–65)
  - Afro house: percussion 54–60, kick, clap and bass at 50
  - Stutter house 50–56; DnB 50–53
  
  **Conversion:** delay of each even 16th = (S − 50)/50 × one 16th. Example: S = 58 at 124 BPM gives 0.16 × 121 ms ≈ **+19 ms**. Store swing as ms or ticks internally, because DAW "%" scales differ (MPC % vs Ableton groove amount).
- **U2 Microtiming offsets** (+ = late):
  - Kick 0; clap/snare 0 to +3 ms.
  - Closed hats ±3 ms plus swing; open hat 0 to +5 ms.
  - **Keys and stabs +4 to +12 ms (laid back)**. Basis: 17.4 ms at 96 BPM is about 2.8% of the beat, which scales to about 13 ms at 124 BPM; the keys use the lower half of that.
  - Bass 0 to +4 ms (rolling bass ±3 ms jitter); chops −3 to +5 ms; pads +10 to +25 ms.
  - Random jitter σ stays well below the about 2.5%-of-beat perceptibility threshold (about 12 ms at 124 BPM), so use σ = 2–5 ms.
  - Never put the hats early *and* the kick late (the "sloppy" combination).
- **U3 Velocity templates** (0–127):
  - **Hats (16ths):** steps {2,6,10,14} 100–115; {0,4,8,12} 75–90; odd steps 50–70; ±4 random. Open hat on chosen offbeats 95–110. Drop the hat on snare steps with P ≈ 0.5.
  - **Kick** 115–127 ±2; **clap/snare** 100–115 ±3; **ghost snares** 30–55.
  - **Keys stabs:** base 85–105, **+8 to +15 on anticipated or syncopated hits and on the first hit of the bar**. Top voice +5 to +10 above the inner voices for voicing balance (practitioner judgment).
  - **Bass:** rolling beat shape `[50,72,105,105]` ±5; offbeat house 95–110, alternating ±8; ghost notes 25–45.
  - **Chops:** 90–110, last chop of a phrase −10. Stutter repeats ramp +3 to +5 per repeat (crescendo into a drop) or decrescendo (fade-out gesture).
  - **Lead/pluck:** a velocity arch with about +10 at the phrase climax (H5).
- **U4 Laid-back coupling:** when a note is delayed by ≥ 5 ms, lower its velocity by 3–8, following the UiO finding that laid-back strokes are softer.
- **U5 Deterministic groove:** generate one groove template per loop (an offset and velocity per step) and reuse it, adding small per-bar variation (σ ≤ 2 ms, ±3 velocity). Never paste identical micro-variations into every bar, and never use pure white-noise randomization.
- **U6 Partial quantize:** for any "performed" input or seed, apply 50–65% quantize strength to keys and lead and 90–100% to kick and snare.
- **U7 Tick math:** ms per tick = 60000 / (BPM × PPQ). At 124 BPM and 960 PPQ, one tick ≈ 0.5 ms, so "±10 ticks" ≈ ±5 ms. At 96 PPQ, ±10 ticks ≈ ±50 ms, which is far too much. Always specify humanization in ms, or normalize PPQ first.

### Gaps
- No measurements were found for **laid-back keyboard or piano timing** in house; the keys offset is scaled from drum and guitar studies.
- There are no sourced **velocity values** for house keys, stabs or chops. All velocity numbers are proposals.
- Swing % conventions differ between MPC, Logic and Ableton, and the sources rarely say which scale they use. The Attack values (60–65% UKG; 70–80% deep house) need to be checked against the original articles.
- No study was found that measures **ghost-note density** in UKG or house basslines or hats.
