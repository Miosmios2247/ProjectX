# Modern trap / melodic hip-hop beat craft (2015–2026): implementable rules for a 16-step MIDI idea generator

> **Grid convention.** One 4/4 bar = 16 sixteenth-note steps, **0-indexed**. Beats fall on steps 0, 4, 8, 12. Unless stated otherwise, the grid is the *written double-time* grid (about 130–170 BPM), where the half-time snare/clap lands on **step 8**. Sources that write in half-time (snare on 2 and 4 at about 65–85 BPM) were converted: one half-time bar = two double-time bars, and half-time step *k* (0–15) maps to double-time step 2k within a 32-step (2-bar) span. **[INF]** marks my own inference or a proposed generator default. Everything not marked [INF] is tied to a source.
>
> **How the sources were read (affects weighting).** Fetching pages directly was blocked in this session: DNS refused native-instruments.com, musicradar.com, image-line.com, productionmusiclive.com and serato.com. So every finding comes from web-search extracts. Most searches were limited to one publisher's domain so each claim can be tied to that publisher. Quoted fragments are as the extracts returned them and may be lightly paraphrased. When an extract blended several pages and I could not tell which page a claim came from, I mark it "page-level attribution uncertain" and link the candidate pages. Most sources are producer-education blogs and plugin or sample vendors, so they give practitioner opinion, not measurements. The most authoritative sources are the Image-Line FL Studio manual and the Sound On Sound "Inside Track" articles. Most extracts showed no publication date; dates are given where they were visible.

## 1. Tempo: BPM conventions and how producers set the grid

### Takeaway
Producers write trap at about 130–170 BPM (single sources range from 130 to 200), and **140 BPM is the most common working default**. Listeners feel it at half that speed (about 65–90 BPM) because each bar has only one backbeat, on beat 3 (step 8), while the hi-hats run at the full written rate. Descriptions of "snare on 2 and 4" are the same rhythm written at the half-time tempo (the "tempo octave").

### Cited Findings
- Native Instruments: "A good tempo for a trap beat ranges from 130 to 200 BPM". The NI trap walkthrough sets its project to 140 BPM. — [Native Instruments, "How to make a trap beat" (Tim Cant)](https://blog.native-instruments.com/how-to-make-a-trap-beat/)
- An NI trap drum-pattern example uses a 130 BPM project tempo with Battery 4's "808 Multiple Kit". The search extract did not name the page; it is most likely NI's drum-patterns article. — [Native Instruments, "7 drum patterns every producer should know"](https://blog.native-instruments.com/drum-patterns/)
- Tidal Magazine calls the half-time feel a "tempo octave". Producers usually set the project to about 140–180 BPM, but listeners feel a pulse at about 70–90 BPM: "Trap beats are unusual because we can 'feel' the music at half-speed or double-speed." Listeners who hear the track fast put the snare on **beat 3**; listeners who feel it slow hear it on beat 2. Snares and claps are sparser than the hi-hats, which play busier, straighter subdivisions. — [Tidal, "What Makes Trap … Trap?"](https://tidal.com/magazine/article/what-makes-trap-trap/1-72722)
- Hooktheory tempo data points (crowd-sourced transcriptions, some several years old): Fetty Wap "Trap Queen" 148 BPM, A minor; Drake "Trophies" 140 BPM, C minor, 4/4; Miguel ft. Travis Scott "Sky Walker" 145 BPM, D♯ minor, 4/4. — [Hooktheory: Trap Queen](https://www.hooktheory.com/theorytab/view/fetty-wap/trap-queen); [Hooktheory: Trophies](https://www.hooktheory.com/theorytab/view/drake/trophies); [Hooktheory: Sky Walker](https://www.hooktheory.com/theorytab/view/miguel/sky-walker-ft-travis-scott)
- One extract drew on several pages (page-level attribution uncertain). Its claims:
  - Trap beats "typically range from 130 to 170 BPM, with 140 BPM being the most common".
  - At 140 a beat "often feels like 70 BPM"; snare and kick "sit where they would in a 70–75 BPM beat".
  - Template: "Kick: 1 / Snare: 3 / Feels: Like half the tempo"; hi-hats are "Constant 16th or 32nd notes with rolls".
  - Practical start: 140 BPM, kick on 1, snare on 3, then hat subdivisions, with occasional ghost snares or a clap layered with the snare.

  — candidates: [SampleFocus, "Everything You Need to Know About 140 BPM"](https://samplefocus.com/blog/everything-you-need-to-know-about-140-bpm); [BeatsToRapOn, "Five Main Types of Trap Beats"](https://beatstorapon.com/blog/top-five-types-of-trap-beats/); [Violet Recording, "The Best Drum Patterns for Trap"](https://violetrecording.com/best-drum-patterns-for-trap/)
- Rage (sub-style): a production wiki suggests a 152–160 BPM project tempo with a half-time feel, saying "a 155 BPM project hits its backbeat at the weight of roughly 77 BPM". Another extract, with no attributable page, gives 130–150 BPM with 140 common. — [Music Production Wiki, "How to make rage beats"](https://musicproductionwiki.com/articles/how-to-make-rage-beats)
- Pluggnb: "130-150 BPM, which is typical for Pluggnb beats". — [SampleFocus, "Make pluggnb beats"](https://samplefocus.com/blog/make-pluggnb-beats-samples/)
- Conflicting outlier: a generic BPM mood guide lists "modern trap" at 95–110 BPM. That does not fit the double-time convention and is unreliable for setting the grid. — [Rapchat BPM mood guide](https://web.rapchat.me/tools/bpm-mood-guide)
- Older, general hip-hop background (pre-trap Sound On Sound series): a 16th-note-triplet feel (applied with over-quantise) plus a slower tempo turns a rock pattern into a hip-hop one. — [Sound On Sound, "Effective Drum Programming: Part 1"](https://www.soundonsound.com/techniques/effective-drum-programming-part-1)

### Inferences
- [INF] **Grid rule:** always write at double-time. Default 140 BPM; allowed range 130–170, with about 150–165 as a "rage/bouncy" preset. Use 16 steps per bar with the main backbeat on step 8 only. Show "felt BPM = BPM/2" in the UI and metadata (140 → 70).
- [INF] **Normalising reference tempi:** if a reference song is listed at 65–85 BPM, double it before using it as a preset.
- [INF] **Step durations** (ms = 60000 / BPM / notes per beat). At 140 BPM: quarter 428.6, 8th 214.3, **16th (one step) 107.1**, 16th triplet 71.4, 32nd 53.6, 32nd triplet 35.7, 64th 26.8. One step is 115.4 ms at 130 BPM and 93.75 ms at 160 BPM.
- [INF] **Tick resolution:** rolls need 16th triplets (6 per beat), 32nds (8), 32nd triplets (12) and 64ths (16) on top of 16ths (4). The lowest common multiple is 48 ticks per beat. Use PPQ 96, 480 or 960 (all divisible by 48) so every roll type lands exactly on a tick.
- [INF] Hats run at the written tempo, which is what makes the half-time backbeat read as trap. If the generator ever runs on a half-time (70 BPM) grid, the hats would have to be 32nds there, so keep the double-time grid internally.

### Gaps
- I found no primary statistics on BPM distribution for 2015–2026 trap releases (for example chart or streaming-API analyses). The ranges above are practitioner consensus plus three Hooktheory data points.
- The upper limits conflict: NI says 200 BPM, Tidal 180 and the multi-page extract 170. I could not open NI's page to see the context of its figure.
- I found no source for producer-specific tempo habits (Metro Boomin, Pierre Bourne, OZ).

## 2. Drums: kick, snare/clap, hi-hats and rolls, open hats, percussion, velocity

### Takeaway
The skeleton:
- **Kick** on step 0 plus a few syncopated kicks.
- **Clap/snare:** one per bar, on step 8.
- **Hi-hats** at a steady 8th or 16th rate, with rolls dropped in as accents. Roll types are 16th triplets, 32nds, 32nd triplets and 64th "ratchets". Rolls usually sit in the slot just before the snare or at the end of the bar, with shaped velocity (a crescendo, or softer middle notes) and sometimes a pitch ramp.
- **Open hats and percussion** are sparse accents.
- **Variation** comes every 4 or 8 bars.

### Cited Findings
**Kick**
- Start with a kick on beat one of every bar, then add extra kicks between the main beats. "Many producers will place kicks just before the third beat". Try offbeat kicks. Change the pattern every four or eight bars, for example by dropping the kick or adding a double snare hit. — [eMastered, "Trap Drum Patterns: The Ultimate Guide"](https://emastered.com/blog/trap-drum-patterns)
- "Kick on 1, snare on 3" at 140 BPM appears as the practical starting point in the multi-page extract (see Section 1). — [SampleFocus 140 BPM](https://samplefocus.com/blog/everything-you-need-to-know-about-140-bpm); [Violet Recording](https://violetrecording.com/best-drum-patterns-for-trap/)

**Snare / clap**
- The snare is on beat 3 when the track is heard at the written (fast) tempo, and on beat 2 in the slow feel. — [Tidal](https://tidal.com/magazine/article/what-makes-trap-trap/1-72722)
- eMastered's trap guide describes the main snares on beats 2 and 4 with ghost-style snares on off-beats "such as the 'and' between beats two and three". It also suggests layering claps or snaps on the stronger beats, such as the fourth. This is written in the half-time frame. — [eMastered, Trap Drum Patterns](https://emastered.com/blog/trap-drum-patterns); [eMastered (DE version)](https://emastered.com/de/blog/trap-drum-patterns)
- Conflict within the same publisher: eMastered's future-bass article says the snare is often on beat 3 and that this is "also true of trap and dubstep". The two eMastered statements are the same rhythm at two tempo octaves (see Section 1). — [eMastered, "What is Future Bass?"](https://emastered.com/blog/what-is-future-bass)
- Keep claps and snares short and snappy: in Battery, select Clap 808 2, "turn the Sustain all the way down and set the Decay to around 280ms". — [Native Instruments](https://blog.native-instruments.com/how-to-make-a-trap-beat/)
- "Triplet snare rolls" are often placed at the ends of bars as fills or transitions. — [eMastered, "5 Best Trap Hi Hat Patterns"](https://emastered.com/blog/trap-hi-hat-patterns)

**Hi-hats: base rate and rolls**
- Classic approach: eighth-note closed hats, then 16th- and 32nd-note trills among sparse snares. — [MusicRadar, "How to program 6 classic hip-hop, trap and grime beats"](https://www.musicradar.com/how-to/how-to-program-6-classic-hip-hop-trap-and-grime-beats)
- Trap hats switch between slow and fast, and between straight and triplet feels, often several times per bar. MusicRadar builds this by changing the grid resolution and dragging notes slightly early or late. — [MusicRadar, "How to program mixed-resolution, trap-style hi-hat patterns"](https://www.musicradar.com/how-to/how-to-program-mixed-resolution-trap-style-hi-hat-patterns)
- MusicRadar's "10 tricks" (an older tutorial): "A common trick is to keep the main speed at 1/4 or 1/8, then quickly shift to triplets or dotted notes at the end of every bar or so, displacing the groove to create buzzes, rolls and fills." Another trick is to hold one long MIDI note on a closed 808 hat, run it through an arpeggiator and automate the rate. — [MusicRadar, "10 tricks every trap producer should know"](https://www.musicradar.com/tuition/tech/10-tricks-every-trap-producer-should-know-638684)
- Experiment with triplet timing and heavy swing, and zoom in to program hats faster than 1/16. — [MusicRadar, "The beginner's guide to: trap"](https://www.musicradar.com/news/beginners-guide-to-trap)
- A Cubase tutorial programs a steady 8th-note hat part, then adds rolls "in selected places": "Rolls can use thirty-second notes, thirty-second-note triplets, sixty-fourth notes, and so on." Its example uses 32nd-note triplets. — [Sleepfreaks, Cubase Pro 10 music seminar](https://sleepfreaks-dtm.com/en/produce-recipe/cubase-pro-10-musicseminar-1)
- DAW naming differs: Cubase's "1/48" setting is the 1/32 triplet. — [Steinberg forum](https://forums.steinberg.net/t/quick-trap-hats-in-cubase/107830)
- eMastered on hat rolls:
  - Get triplets from a 1/8T or 1/16T grid, used "in selected spots".
  - Producers place rolls "either just before snare hits or at the end of a bar", on a fine grid (32nd or 64th notes), adjusting roll length and speed to taste.
  - Build "a small crescendo" so the roll doesn't sound mechanical.
  - MIDI controllers' "ratchet" (note-repeat) modes offer 8ths, 16ths or 16th triplets.
  - Pitch-shift hats during rolls or at the end of a loop, and add swing.

  — [eMastered, "5 Best Trap Hi Hat Patterns"](https://emastered.com/blog/trap-hi-hat-patterns)
- NI: "use hat rolls as accents. Set your MIDI editor's grid size to 32nd notes, and replace the fourth closed hat on each bar with a roll of three 32nd notes. To get a smoother, rolling sound, turn down the velocity of the middle notes slightly to 94 or so." — [Native Instruments](https://blog.native-instruments.com/how-to-make-a-trap-beat/)
- Unison (blog posts dated 2024–25):
  - Shape velocity across a roll: lower at the start and end, higher in the middle (crescendo, then decrescendo).
  - "drop the second hat in a triplet to 65 velocity" for a more human feel.
  - Use pitch as a ramp, up or down, on a triplet roll before a turnaround; for build-ups, raise pitch 2–3 semitones over four bars.
  - Triplet rolls on 1/8T or 1/16T "sound best when programmed in triplet timing, yet spaced out over the course of a few bars". They also work at the end of a bar to build tension before a drop.
  - Arpeggiator method: rate 1/64 or 1/8T, velocity about 40–100%.

  — [Unison, "Hi-Hat Rolls"](https://unison.audio/hi-hat-rolls/); [Unison, "How to Create Hi-Hat Rolls"](https://unison.audio/how-to-create-hi-hat-rolls/)
- Sound On Sound's review of the Roland TR-08 (about 2017–18) describes a second trigger layer offset by half a step, i.e. a 32nd-note "sub-step". It makes fast hat rolls, shuffles and triplets easier to program, and the reviewer ties it to trap and hip-hop. — [SOS, Roland TR-08 review](https://www.soundonsound.com/reviews/roland-tr-08-rhythm-composer)
- Humanising (older SOS series): keep the kick and snare fixed and change only the hats to shift the feel. Add a little hat swing, slight timing and velocity randomisation, and 16th-note "frills". — [SOS, Effective Drum Programming Pt 1](https://www.soundonsound.com/techniques/effective-drum-programming-part-1)
- House/techno practice (Attack Magazine's "Beat Dissected" series; transferable but not trap-specific; page within the series uncertain):
  - Lock the closed hats to the grid as the reference point.
  - Slightly vary the velocity of every other hat; Ableton's Velocity device with random set to about 15 adds variation.
  - High-pass the hats below about 350 Hz.
  - Open 808 hats on the offbeats (a house convention).

  — [Attack Magazine, Beat Dissected (e.g. "Dusted Deep House")](https://www.attackmagazine.com/technique/beat-dissected/dusted-deep-house/)

**Open hats**
- One trap guide (page-level attribution uncertain) advises: "Use the Open Hi-Hat sparingly. Place it on step 9 or step 15 to add a breathing, sizzling accent. The open hat should contrast with the closed hats, not replace them. One or two hits per loop is enough." A related extract: "Producers typically use at least two hi-hat samples: a closed hat for the main rhythmic pattern and an open hat for accents." That guide's step-indexing is unknown; read as 1-indexed, its 9 and 15 would be 0-indexed 8 and 14. — candidates: [Industry Hackerz](https://industryhackerz.us.com/blog/how-to-make-trap-beats-online); [Audeobox hi-hat glossary](https://www.audeobox.com/learn/glossary/hi-hat/)
- Open hats on every offbeat are documented as a 1970s disco/dance convention ("it became very popular in the seventies to use an open hi-hat on the off-beats … for disco and dance-based tracks"), not a trap one. Page-level attribution uncertain. — candidates: [MusicRadar drum lesson on accents](https://www.musicradar.com/tutorials/drum-lessons/acccents-beats-drum-week); [Toontrack](https://www.toontrack.com/?p=2486794)

**Percussion and typical elements**
- The instrumental of Future's "Draco" (mixed by Seth Firkins) arrived as separate 808, kick, snare, clap, open hat and hat tracks. — [SOS, Inside Track: Future 'Draco'](https://www.soundonsound.com/techniques/inside-track-future-draco)
- Some trap beats are "just an 808, hi-hats, the occasional snare, and a couple of synth tracks". — [SOS, Inside Track: NF 'The Search'](https://www.soundonsound.com/techniques/inside-track-nf-search)
- Layer claps or snaps on the strong backbeats for texture and emphasis. — [eMastered (DE)](https://emastered.com/de/blog/trap-drum-patterns)
- Rimshots: I found only a generic articulation definition (rim and head struck at once for a sharp tone), with no trap placement rule. — [Mixwave articulation overview](https://support.mixwave.com/help/drum-library-articulation-overview)

**Named producers (weakly documented)**
- eMastered contrasts Metro Boomin's hats ("tight and precise") with Southside's "more aggressive" patterns. This is a secondary characterisation with no verified examples. — [eMastered, 5 Best Trap Hi Hat Patterns](https://emastered.com/blog/trap-hi-hat-patterns)
- Metro Boomin's team on *Heroes & Villains* (SOS article, April 2023) uses outboard gear including an E-mu SP-1200, a Roland TR-808 and guitar pedals. — [SOS, Inside Track: Metro Boomin 'Heroes & Villains'](https://www.soundonsound.com/techniques/inside-track-metro-boomin-heroes-villains)
- A 2015 Razer video shows Metro Boomin sequencing drums and layering hats with 808s and snares. I did not retrieve its content. — [Hypebeast (2015)](https://hypebeast.com/2015/10/metro-boomin-production-razer)

### Inferences
- [INF] **Converting the half-time descriptions.** If eMastered writes in the half-time frame, its "kicks just before the third beat" becomes steps 14–15 of bar 1 at double-time (a pickup into bar 2). If it writes in the double-time frame, the same phrase means steps 6–7 (a pickup into the snare). Both placements are idiomatic, so support both. A half-time "ghost on the and of 2" maps to step 12 of the first double-time bar.
- [INF] **NI roll recipe.** "Replace the fourth closed hat on each bar with three 32nds" fits an 8th-note hat base best. The fourth 8th hat is step 6, so the roll lands at 6.0, 6.5 and 7.0, leading into the snare at step 8. That matches eMastered's "just before snare hits". On a 16th base, the fourth hat would be step 3.
- [INF] **Default one-bar drum template** (double-time, 140 BPM, 0-indexed):

```
step      0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15
kick      X . . o . . o o . . o  o  .  .  o  o    X = always; o = candidate (pick 1–3 per bar)
clap/snr  . . . . . . . . X . .  .  .  .  .  .    step 8 every bar; optional ghost at 11/13/15
hat 8ths  x . x . x . R . x . x  .  x  .  R  .    R = roll slot (replaces/extends that hat)
open hat  . . . . . . . . . . .  .  .  .  .  .    0–1 per bar on an offbeat, never on step 8
```

- [INF] **Kick:** step 0 has probability 1.0 in sections where the drums play.
  - Pre-snare pickup: step 7 (p ≈ 0.35) or step 6 (≈ 0.15).
  - Post-snare syncopation: step 10 or 11 (≈ 0.4 each, mutually exclusive).
  - Pickup into the next bar: step 14 or 15 (≈ 0.25). Step 3: ≈ 0.2.
  - Cap at 2–4 kicks per bar, and keep step 8 free of kicks by default.
  - Re-roll or mutate the pattern every 4 or 8 bars.
- [INF] **Snare/clap:** step 8 in every bar at velocity 110–127. Optional ghost at step 11, 13 or 15 at velocity 40–60 (p ≈ 0.2 per bar). Once every 4–8 bars, add a variant: a double clap (8+9 or 8+11) or a triplet snare run in the last beat of the phrase (6 hits of 16th triplets across steps 12–15).
- [INF] **Hi-hat base:** choose 8ths (steps 0, 2, …, 14) or 16ths (all steps), about 50/50 per beat preset.
  - Accent on beat positions (0, 4, 8, 12) at about 100–110.
  - Other 8ths at about 85–95.
  - Odd 16ths at about 65–80.
  - Add ±5–8 random velocity.
- [INF] **Roll vocabulary**, as sub-step events (position → hit times in steps):
  - `32x2` (one step, 2 hits: s, s+0.5)
  - `32x3` (NI recipe: s, s+0.5, s+1)
  - `16Tx3` (two steps, 3 hits: s, s+0.667, s+1.333)
  - `32Tx3` (one step, 3 hits: s, s+0.333, s+0.667)
  - `64x4` ratchet (one step: s, s+0.25, s+0.5, s+0.75)
  - `16Tx6` run (one beat, 6 hits)
- [INF] **Where rolls go:** about 1 roll per bar on average, 0–1 in odd bars and 1–2 in even bars and phrase ends. Preferred slots are steps 6–7 (into the snare) and 14–15 (into the next bar), with occasional slots at 2–3 or 10–11.
- [INF] **Roll dynamics:** either a crescendo into the target (velocity ramps about 60 → 105) or NI-style smoothing (middle notes about 94, outer notes higher). Apply a pitch ramp of ±1–3 semitones on about 25% of rolls; this needs a per-note pitch parameter in preview playback.
- [INF] **Open hat:** at most 1 per bar and 2 per 4-bar loop, on an offbeat (steps 2, 6, 10 or 14, with 14 the safest). A closed hat on the next hit chokes it (same choke group). Do not use house-style offbeat open hats on every beat.
- [INF] **Percussion** (rim, snap, perc, shaker) is unsourced, so keep it sparse: 1–2 hits per bar on odd 16ths not shared with the kick (for example 3, 11, 13), velocity 70–90. Layer a snap on the step-8 clap in about 30% of presets. Toms only as phrase-end fills.
- [INF] **Swing:** default 0% (straight), with an optional "swing" flag at 52–58% 16th-note swing applied to hats only. Rolls stay on their own exact grids.

### Gaps
- I found no trap-specific source for open-hat positions beyond one guide of uncertain origin and unknown indexing. Percussion placement (rims, toms, shakers) and hat levels relative to the snare are also unsourced.
- I found no primary interviews about hat or kick programming by Metro Boomin, Southside, Pierre Bourne or OZ. The Fader 2016 documentary and the 2015 Razer video were not retrievable. Adjacent style-analysis notes should cover this.
- The hat base rate in NI's roll recipe was not visible in the extract.

## 3. 808: rhythm against the kick, glides/slides, octave jumps, note lengths, tuning, distortion, kick interplay

### Takeaway
The 808 is the bass line, and its rhythm mostly shares the kick's: the safest start is an 808 under every kick, then thin it out or add a few independent notes. It plays mostly chord roots with fifth and octave jumps, rings long, and glides into selected notes. FL Studio offers two ways to glide:
- per-note slide or portamento flags in the piano roll; or
- channel **Mono** mode with overlapping notes, where the channel **SLIDE** (portamento time) knob sets the glide time.

The 808 must be tuned to the key and is usually saturated so it is audible on small speakers. It is separated from the kick by a short kick, a kick-triggered dynamic-EQ notch, or a short duck, not by rhythmic pumping.

### Cited Findings
**Rhythm relative to the kick**
- Splice: trap "is best known for its use of 808 basslines", and kick plus 808 together create its hard-hitting sound. The guide shows two approaches: one bass line tightly locked to the kick and one that moves more independently. "Slides across intervals like octaves and fifths can also add energy in short bursts." — [Splice, "How to Write a Bassline for Different Genres"](https://splice.com/blog/how-to-make-basslines/)
- Splice's FL Studio trap guide: "Your bassline can largely follow the root notes of the chord progression", with some connecting phrases and fifth and octave jumps. — [Splice, "How to Make a Trap Beat in FL Studio"](https://splice.com/blog/how-to-make-trap-beat-fl-studio/)
- Roland and Reason Studios (search limited to those two domains; the Reason article's URL carries a Feb-2019 campaign tag, so it probably dates from 2019 or earlier [INF]):
  - Producers use the 808 "as a sub-bass oscillator, writing patterns that sound more like synth bass lines than kick patterns".
  - Start with a basic four-note pattern, then vary the rhythms and note lengths. "Experimenting with sustain length can dramatically emphasize the booming effect." For faster beats, a shorter decay keeps hits tight; one Roland example sets decay to 4.
  - "Strong intervals make tonal shifts easier to hear, while highly chromatic patterns may only be audible with reduced decay, though that takes away some power."
  - Changing pitch at each kick trigger turns the kick's sustain into a bass line.
  - Smoothing the attack removes the transient but keeps the body.

  — [Roland, "Production Hacks: Creating 808 Basslines"](https://articles.roland.com/production-hacks-creating-808-basslines/); [Reason Studios, "How to Make 808 Bass Lines"](https://reasonstudios.com/blog/tutorials/808-bass-lines/)
- Drake's "What's Next": the bass line doubles the kick pattern while playing the root note B. — [Roland, ZENOLOGY: "What's Next" by Drake](https://articles.roland.com/capturing-synth-sounds-with-zenology-whats-next-by-drake/)
- A multi-page extract (page-level attribution uncertain) says:
  - Trap 808s generally follow the kick pattern: "Placing an 808 hit under every kick is the most dependable first move, since it guarantees the two lock together and gives instant weight."
  - The 808 doesn't need a note on every kick, but ideally lands on a drum hit (kick, snare, rimshot or clap). It need not follow every melodic movement: "one or two notes per bar is often enough. Keep it sparse."
  - Program the kick first, then the 808 rhythm, and only then the pitches.
  - The 808 can align with the kick, sit slightly behind it, or use a different rhythm. Sidechaining is a common way to stop the two clashing.

  — candidates: [Violet Recording, "How to Make 808 Patterns"](https://violetrecording.com/how-to-make-808-patterns/); [Audeobox, trap beats in Ableton](https://www.audeobox.com/learn/ableton/how-to-make-trap-beats-in-ableton/); [Amped Studio, 808 bass](https://www.ampedstudio.com/blog/secrets-of-808-bass/)
- In the session behind Chris Brown's "Heat", the 808 serves as the kick. — [SOS, Inside Track: Chris Brown 'Heat'](https://www.soundonsound.com/techniques/inside-track-chris-brown-heat)
- A long-decay 808 kick can be pitched up and down to play a melodic bass line. — [MusicRadar, beginner's guide to trap](https://www.musicradar.com/news/beginners-guide-to-trap)
- NI's 808 example uses Massive X's "Essential Eight" preset with "a simple bass line that plays C2 and G2 notes", i.e. root and fifth. — [Native Instruments, trap beat](https://blog.native-instruments.com/how-to-make-a-trap-beat/); see also [NI, "What are 808 beats?"](https://blog.native-instruments.com/808-beats/)

**Glides and slides: FL Studio (official manual)**
- Piano-roll **slide notes** create glissandos, and a slide note "must overlap the note[s] they slide". The slide note's length sets how fast the pitch moves, and a slide note on its own is silent. **Portamento** notes give a glide from the previous note into the flagged note; the effect is most audible over larger intervals. Click-and-hold while drawing a note cycles through the slide and portamento modes. Both features work only with native FL Studio instruments; for VSTs the manual suggests automating the channel pitch instead. — [Image-Line, FL Studio manual: Piano roll](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/pianoroll.htm)
- An Image-Line forum thread describes portamento as "basically a fast slide, only at note transitions". — [Image-Line forum](https://forum.image-line.com/viewtopic.php?t=45474)
- Channel settings (the authoritative mechanics for glides made from overlapping notes):
  - "SLIDE - Portamento Time (SLIDE) is used to set the slide length when portamento is turned on."
  - **Mono:** "maximum one note played at a time. In this mode, when two notes overlap (the overlap amount does not matter) they will 'slide' one to another." Other note properties (cutoff, resonance, panning) move along with the pitch.
  - Mono overrides "Max poly": Max poly cuts the oldest notes immediately, while Mono lets the current notes move into their release stage.
  - The **Porta** button turns portamento on for the channel. **Full porta** makes portamento notes ignore the Gate setting and play their full length.
  - "Portamento and sliding of overlapping notes is not supported by VST/AU instruments."
  - Mono applies to each slide colour group separately, so using four colours allows up to 4 voices.

  — [Image-Line, Miscellaneous Channel Settings](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/chansettings_misc.htm)
- In Harmor, "Portamento is a polyphonic mode that slides between overlapping notes", while "Legato is a monophonic mode that slides pitch between overlapping notes". — [Image-Line, Harmor manual](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/plugins/Harmor.htm)
- In the Fruity and Producer editions, the Articulate tool applies portamento, staccato and legato presets. — [Image-Line, Piano roll Articulate tool](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/pianoroll_articulate.htm)

**Glides: synth and sampler practice**
- Set the synth to mono, raise the glide time, and play overlapping notes in high and low octaves. — [MusicRadar, 10 tricks](https://www.musicradar.com/tuition/tech/10-tricks-every-trap-producer-should-know-638684)
- Lowering the portamento makes the glide tighter and quicker between notes. — [MusicRadar, Drake "Burning Bridges" recreation](https://www.musicradar.com/artists/how-to-re-create-drakes-smooth-burning-bridges-sound-using-plugins)
- Unison:
  - Set the sample's amp envelope so that glides happen on release without retriggering the sample.
  - Use a glide or portamento setting for sliding notes.

  — [Unison, hip-hop production tips](https://unison.audio/hip-hop-production-tips/); [Unison, how to make trap beats](https://unison.audio/how-to-make-trap-beats/)
- In legato mode the pitch bends only when the target note starts before the previous note ends; a gap gives two separate hits with no slide. Another general guide: overlap the end of the first 808 note with the start of the second, enable glide, and set the glide time to control slide speed. Page-level attribution uncertain. — candidates: [Audeobox glossary: glide](https://www.audeobox.com/learn/glossary/glide/); [Violet Recording, "How to Make 808 Slides"](https://violetrecording.com/how-to-make-808-slides/)

**Tuning, register, distortion, kick separation**
- Tune 808s to the song's key, or at least make sure they "never feel out of tune". Further iZotope advice:
  - Keep only the kick's initial punch, because "Too much decay in the kick will overlap with the 808, and they will mask each other."
  - Put a dynamic EQ on the 808 at the kick's fundamental (their example uses 62 Hz), triggered from the kick, so only that frequency ducks.
  - Alternatively, duck the whole 808 from the kick with a low threshold, medium ratio and short release, so "the early pop of the kick ducks the 808 out of the way, but lets the 808 take over as it resolves".
  - Feed the kick to a "dead patch" aux with no output and use it as the sidechain source.
  - High-pass the harmonic instruments if the 808 is huge.

  — [iZotope, "How to Mix 808s for a Powerful Low End"](https://www.izotope.com/en/learn/how-to-mix-808s)
- Unison (vendor advice; the sound-design article is dated 2025):
  - Tune the 808 to the track's key, and automate pitch per section so it follows chord changes.
  - Tune the kick and 808 to different notes (for example G and D) to separate them.
  - Push the gain until the 808 starts to buzz, then back off 1–2 dB.
  - Layer a copy an octave up, high-passed around 200 Hz, with slight distortion.
  - Saturation adds harmonics so the 808 comes through on small speakers.
  - Another Unison post says to program 808s an octave higher if they need to sound in tune.

  — [Unison, 808 sound design](https://unison.audio/808-sound-design/); [Unison, "808"](https://unison.audio/808/); [Unison, hip-hop production tips](https://unison.audio/hip-hop-production-tips/)
- 21 Savage "A Lot" (Sound On Sound, mixer Maddmix):
  - The 808 is the main headroom problem because it tends to overload the mix bus.
  - Drum mixing starts by setting the 808 and kick levels.
  - For small-speaker harmonics, the 808 is duplicated, the copy heavily compressed or distorted, and blended back in.

  — [SOS, Inside Track: 21 Savage 'A Lot'](https://www.soundonsound.com/techniques/inside-track-21-savage)
- Future "Draco": the mixer notched a resonance out of the 808 with FabFilter Pro-Q2. — [SOS, Inside Track: Future 'Draco'](https://www.soundonsound.com/techniques/inside-track-future-draco)
- 808 samples are sold labelled by key. One drill pack includes "EUD_808_glide_backout_C#m.wav". — [Splice, Capsun ProAudio "EURO DRILL"](https://splice.com/sounds/packs/capsun-proaudio/euro-drill/samples)

### Inferences
- [INF] **808 onsets:** copy each kick onset with p ≈ 0.85–1.0. Add 0–2 extra onsets per bar on non-kick steps, preferring steps with another drum hit (hat or clap) and pickups at 14–15. Every bar where the 808 plays gets an onset on step 0 (or on its first kick). Rest the 808 in intros and in drop-out bars (see Section 5).
- [INF] **808 pitches:** use the root of the chord sounding at the onset; aim for at least 60% roots per loop. Use the fifth (+7) and the octave (±12) for jumps, and an occasional approach note one step below the next root (the ♭7 into the root, or ♭2→1 in Phrygian presets). Avoid chromatic runs: Roland notes they are hard to hear unless the decay is cut. Keep each 2–4-bar loop to at most about 4 distinct pitch classes.
- [INF] **Register:** put the root octave so the fundamental is about 35–70 Hz (about D1–C♯2 in scientific pitch, 36.7–69.3 Hz; NI's example uses C2/G2). Octave jumps go up to about 70–140 Hz. Note that DAW octave naming differs (FL Studio's C5 = MIDI 60, while many tools use C4 or C3 = 60), so store MIDI numbers, not names.
- [INF] **Note lengths:** treat the 808 as mono and legato. A note lasts until the next 808 onset, capped at 8–16 steps. When the next note does not slide, end it 1 tick before the next onset so it retriggers cleanly. An optional "punchy" style truncates the note at step 8 so the clap lands in a gap. One 808 note per bar is valid (sparse style).
- [INF] **Glides:**
  - Mark 0–2 glides per 2 bars.
  - Glide targets are mostly octave jumps (+12 or −12) and fifths, placed at bar ends (steps 12–15) or into the next downbeat. Splice's "short bursts" suggests not gliding on every note.
  - **Encoding for export:** overlap the previous note into the target by ≥1 tick. In FL Studio this works with any native instrument in Mono mode, where overlap length does not matter and the channel SLIDE knob sets glide time; on a VST, use its legato/portamento mode. FL piano-roll slide notes are FL-specific: their length sets glide speed and they make no sound themselves, so do not rely on them for portable MIDI.
  - **Preview synthesis:** exponential pitch glide of about 40–150 ms (roughly 0.5–1.5 steps at 140 BPM) from the old pitch to the new, with no amplitude retrigger.
- [INF] **Tuning in preview:** use a synthesized 808 (sine with a short pitch-drop attack and long amplitude decay) tuned exactly by MIDI note. If the preview uses a sample, store its root note and transpose by the semitone difference.
- [INF] **Kick handling in preview:** keep the kick short (decay at most about 120–150 ms). Where kick and 808 start together, duck the 808 by about 3–6 dB with fast attack and about 60–120 ms release. In an optional "808-as-kick" style, the kick is omitted under 808 onsets.
- [INF] **Saturation in preview:** add mild soft-clip saturation, or a high-passed octave-up layer at about −12 dB, so the 808 is audible on laptop and phone speakers. Both the Unison and SOS (21 Savage) sources motivate this.

### Gaps
- No source gave numeric glide times (ms) typical of trap 808s, or a typical overlap length beyond FL's "overlap amount does not matter" in Mono mode.
- I found no source on how often 808 notes are placed off-kick versus on-kick, or on typical 808 note lengths in steps.
- No source documents how FL slide notes export to standard MIDI files; this needs a test in FL Studio.
- The idea of tuning the kick to a different note than the 808 (Unison) comes from a single vendor.

## 4. Melody loops, counter-melodies, arps, chord habits, samples

### Takeaway
Minor-family harmony dominates:
- natural minor is the default;
- harmonic minor adds raised-7th drama and a major V;
- Phrygian and Phrygian dominant add ♭2 darkness.

Progressions are short (2–4 chords, often only two) and centred on the tonic; i, VI, v/V and iv recur. Melodies are short repeating motifs over 1-, 2-, 4- or 8-bar loops, kept simple to leave room for the 808 and vocals. A counter-melody is a newly written line in the same key with a contrasting rhythm, often in another register, timbre and pan position. Simple arpeggios behind the chords add motion.

### Cited Findings
**Scales and mood**
- Most trap melodies are based on one of three scales: natural minor, harmonic minor and Phrygian.
  - Minor-scale melodies "are mostly moody and dark".
  - Harmonic minor differs only by a raised seventh, which "makes melodies sound a bit more interesting".
  - Phrygian (flattened second) "allows you to create tension between the second and first steps".
  - The PML article is about eight years old (about 2018).

  — [Production Music Live, "Trap Beat Guide: Melodies – 3 Essential scales"](https://www.productionmusiclive.com/blogs/news/trap-beat-guide-melodies-3-essential-scales-for-making-melodies)
- The flat second is "where the dark, gnarly tension comes from". This is said in the context of tech house and afro tech. — [PML, "Musical Modes and their Emotions"](https://www.productionmusiclive.com/blogs/news/musical-modes-and-their-emotions-characteristics-for-edm)
- On note choice, the PML blog (exact article uncertain) says the 6th, 2nd and 4th degrees generate the most tension, the 5th and 1st are the most stable, chord tones are safe and non-chord tones are tense. — [PML (blog)](https://www.productionmusiclive.com/blogs/news/trap-beat-guide-melodies-3-essential-scales-for-making-melodies)
- The trap chord guides (search limited to eMastered and Unison; which guide said what is uncertain) say:
  - Trap progressions "lean heavily into minor chords and minor modes, especially the natural minor scale (Aeolian), the harmonic minor scale for extra tension, and darker major scale modes like Dorian or Phrygian".
  - Producers rely on triads and seventh chords, and "you won't find many long chord chains or complex key changes".
  - Common keys named: C, D, E, F and G minor in one list; Em, Bm and Fm in another.

  — [eMastered, "Trap Chord Progressions: A Beginner's Guide"](https://emastered.com/blog/trap-chord-progressions); [Unison, "Trap Chord Progressions: Top 8"](https://unison.audio/trap-chord-progressions/)
- Splice describes trap's origins (early-2000s Atlanta) as fusing hip hop with prominent 808 basslines, rapid-fire hi-hats and "cinematic minor-key melodies". This is from a Splice genre page; the exact page is uncertain. — [Splice, Trap genre page](https://splice.com/sounds/genres/trap/samples)
- A single flatted note can give a motif a darker mood. — [Splice, "How to develop a melody"](https://splice.com/blog/how-to-develop-a-melody/)

**Chord vamps**
- eMastered's recipe: start on a minor tonic, move to the major VI, drop to a minor v or iv, and loop back. Examples: Cm–A♭–Gm–Cm and Am–F–Em–Am. — [eMastered, Trap Chord Progressions](https://emastered.com/blog/trap-chord-progressions)
- Two more patterns from the eMastered/Unison guides (which guide said what is uncertain):
  - i–VI–V: Fm–D♭–C.
  - An A harmonic-minor i–V–VI–iv, Am–E–F–Dm. Quote: "It capitalizes on the exotic and tense resolution from the V (Emaj) back to the i (Amin), thanks to the raised seventh note characteristic of the harmonic minor scale."
  - At least one of these guides has spelling errors (an E♭-minor example with a C♭ chord).

  — [Unison, Trap Chord Progressions](https://unison.audio/trap-chord-progressions/); [eMastered](https://emastered.com/blog/trap-chord-progressions)
- Most-used chords in Hooktheory transcriptions: "Trap Queen" v; "Trophies" i; "Sky Walker" VI. These are crowd-sourced. — [Hooktheory: Trap Queen](https://www.hooktheory.com/theorytab/view/fetty-wap/trap-queen); [Hooktheory: Trophies](https://www.hooktheory.com/theorytab/view/drake/trophies); [Hooktheory: Sky Walker](https://www.hooktheory.com/theorytab/view/miguel/sky-walker-ft-travis-scott)
- One multi-page extract (low confidence; page-level attribution uncertain) adds:
  - Most trap progressions use 3–4 chords, and a loop may sit on just two minor chords to leave room for the 808 and vocals.
  - The Andalusian cadence (i–♭VII–♭VI–V) is "a staple of dark trap and drill crossovers".
  - For a trap beat in a major key, "throw in some minor chords".

  — candidates: [eMastered](https://emastered.com/blog/trap-chord-progressions); [musicbusiness.vercel.app, "Trap chord progressions"](https://musicbusiness.vercel.app/trap-chord-progressions); [RouteNote, "The importance of melody in trap beats"](https://create.routenote.com/blog/the-importance-of-melody-in-trap-beats/)
- Splice's FL Studio guide: "Minor chord progressions work best for trap". Run a simple arpeggio behind the chords for movement. "Copy sections and make small changes, rather than over-engineering it." — [Splice, How to Make a Trap Beat in FL Studio](https://splice.com/blog/how-to-make-trap-beat-fl-studio/)

**Loop length, motif and repetition**
- Loops are usually 1, 2, 4 or 8 bars so they repeat cleanly. — [Violet Recording, "What Is a Bar in Music?"](https://violetrecording.com/what-is-a-bar-in-music/)
- For a hook, write a short two-bar melody and lock its rhythm to the words. — [Violet Recording, "What Is a Hook in a Song?"](https://violetrecording.com/what-is-a-hook-in-music/)
- Loop two to four simple chords under the melody so the melody stays prominent, and add a counter-melody or second layer for movement. "A four-bar loop is not a song": vary each repeat with small changes, such as a new hat pattern or an extra melody note. — [Violet Recording, "How to Make a Melody for a Beat"](https://violetrecording.com/how-to-make-a-melody-for-a-beat/)
- "If we want to write a memorable melody, it's important to incorporate some degree of repetition": start from a short motif. — [Splice, How to develop a melody](https://splice.com/blog/how-to-develop-a-melody/)
- Humming melodies first tends to keep them singable and within a reasonable range. — [Splice, "6 Creative Songwriting Techniques"](https://splice.com/blog/creative-songwriting-techniques/)
- Toplining: loop a groove or chord progression and write the melody over it; "looping also enforces scarcity, which can help promote creativity." — [Splice, "How to Make Music with Loops"](https://splice.com/blog/how-to-make-music-with-loops/)

**Counter-melody, arps, layering**
- RouteNote on counter-melodies:
  - A counter-melody is a secondary line that complements the main melody rather than competing with it.
  - It needs newly written MIDI, not just a different sound on the same notes.
  - Keep it in the same key but use different intervals and rhythms; for example, pair a faster, rhythmic line with a slow main melody.
  - Pan the two layers to different sides.

  — [RouteNote Create blog (beat-making guide)](https://create.routenote.com/blog/wp-json/wp/v2/posts/16002)
- Cymatics (a vendor):
  - Arpeggiators, unique synths and stabs add interest, but don't cram in too many elements or the track gets busy.
  - Its trap loops are made to sit above the 808s and drums and leave room for vocals and top lines (from a pack preview page; page uncertain).
  - Pitching, reversing and chopping can turn one loop into many different tracks.

  — [Cymatics, "How To Make Trap Music: 12 Essential Tips"](https://cymatics.fm/blogs/production/how-to-make-trap-music); [Cymatics, free trap melody loops](https://cymatics.fm/blogs/production/free-trap-melody-loops); [Cymatics, RIPPLE preview](https://cymatics.fm/pages/ripple-preview)
- Octave layering: I found only older looping-forum posts (a loop played an octave down as a bass line under the melody, or the melody repeated a few bars later an octave lower). These are not specific to beat-making. — [Looper's Delight archive](https://loopersdelight.com/LDarchive/201206/msg00136.html)

**Samples, chops, texture**
- For a "smoked-out, hazy effect you sometimes find in some trap beats", the producer pitched a fuller sample down "and drowned it all in reverb". — [Splice, Sounds of KSHMR Vol. 3](https://splice.com/blog/making-tracks-with-sounds-of-kshmr-vol-3/)

### Inferences
- [INF] **Scale presets and weights:**

  | Preset | Weight | Note |
  |---|---|---|
  | Natural minor | 45% | default |
  | Harmonic minor | 25% | raised 7th used mainly on the V chord and on leading-tone melody notes before i |
  | Phrygian | 15% | ♭2 as a neighbour to 1 in the melody; ♭II chord rare |
  | Phrygian dominant | 5% | |
  | Dorian | 5% | |
  | Minor pentatonic | 5% | melody-only safety mode, no 2nd or 6th |

  Phrygian dominant (1 ♭2 3 4 5 ♭6 ♭7) is natural minor with the 2nd lowered and the 3rd raised; this is standard theory, not a trap source. Keys: favour the minor keys named above, plus C♯/F♯ minor for "dark" presets. The C♯/F♯ choice is unsourced; check it against adjacent style notes.
- [INF] **Chord-loop templates** (one chord per bar unless noted):

  | Template | Chords |
  |---|---|
  | 2-chord vamp | i–VI (2 bars each, or alternating per bar) |
  | 2-chord vamp | i–iv |
  | 2-chord vamp | i–v |
  | 4-chord loop | i–VI–v–i |
  | 4-chord loop | i–VI–iv–v |
  | 3-chord loop (harmonic minor) | i–VI–V (3rd chord held for 2 bars) |
  | 4-chord loop (harmonic minor) | i–V–VI–iv |
  | Andalusian (low confidence) | i–♭VII–♭VI–V |
  | Pedal-tonic | i for 4 bars with melody-only motion |

  Voice chords as triads or 7ths, mostly between C3 and C5 (C4 = 60), so they stay clear of the 808 band. The 808 plays the chord roots.
- [INF] **Melody loop:**
  - Default length is 4 bars (2 bars minimal, 8 bars for A–A′–A–A″). Build it from a 1- or 2-bar motif repeated with a variation in the last 2–4 beats (an answer phrase).
  - Range within about a 10th.
  - Rhythm is mostly 8ths and 16ths, with 2–4 rests or long notes per bar so a vocal has room.
  - Put chord tones on steps 0 and 8 and allow tension degrees (2, 4, 6) on weak steps (follows PML).
- [INF] **Counter-melody:**
  - A new line in a different register (an octave above the lead for bells or plucks, or below for pads), with roughly half the note density of the lead or a faster ostinato against a slow lead.
  - It plays in the lead's gaps (call-and-response); avoid unisons on strong steps.
  - Pan about ±20–40% opposite the lead (follows RouteNote).
  - Enter it in hooks first (see Section 5).
- [INF] **Arp layer:** chord tones in 16ths or 16th triplets (up, down or up-down), one octave above the chord voicing. Accent steps 0, 4, 8 and 12; velocity 70–100.
- [INF] **Dark vs. bright switch.** "Dark" means Phrygian or harmonic minor, the ♭2 neighbour, low-mid register and minor v. "Bright" means natural minor or Dorian with VI–VII lifts, a higher register, more 3rds and 6ths, and major-key loops that borrow minor chords. Bright melodic trap styles (plugg, Pierre Bourne-type) are not covered by my sources (see Gaps).
- [INF] **Hook doubling:** double the lead melody an octave up (or add the counter-melody) in hooks to separate hook from verse, matching the arrangement sources' "add what you held back".

### Gaps
- I found no academic music-theory analysis of trap harmony; the sources are producer blogs and vendors.
- Hooktheory "Trends" data aggregated for trap or melodic rap was not available in the extracts.
- No source quantified typical melody loop lengths, note densities or ranges for "type beats". The "type beat" conventions themselves (titling, loop-first workflow) were not documented in the sources found.
- Bright or major-leaning melodic trap (plugg, pluggnb, Pierre Bourne-style synth leads) is undocumented here; only the tempo range for pluggnb was found.
- I found no reliable source on how melodic samples are chopped (chop lengths, re-sequencing on the 16-step grid); SampleFocus's Metro Boomin sampling article was listed but not retrievable.
- I found no source for pentatonic use in trap melodies.

## 5. Arrangement: section lengths, drop-outs, filtered intros, beat switches

### Takeaway
A rap-ready beat runs intro (4–8 bars) → hook (8 bars, sometimes 16) → verse (16 bars) → hook → verse → hook → outro (4–8 bars), with an optional 4–8-bar bridge or breakdown before the last hook. That is about 64–96 bars, or 2–3 minutes. Sections differ by adding and removing elements:
- **Intro:** the melodic loop alone or with light hats, often low-pass filtered.
- **Verse:** full drums and 808, with the melody pulled back slightly.
- **Hook:** everything, plus held-back layers.

The 808 (or the drums) drops out for the last bar or two before a hook. Beat switches are a recognised device, but I found no how-to.

### Cited Findings
- Serato Studio's trap tutorial lists the order Intro–Hook–Verse–Hook–Verse–Hook–Outro. — [Serato, "How to make a trap beat"](https://serato.com/studio/tutorials/how-to-make-a-trap-beat)
- Violet Recording's template (adjustable) is intro, verse, hook, verse, hook, bridge, hook, outro. — [Violet Recording, "How to Structure a Beat"](https://violetrecording.com/how-to-structure-a-beat/)
- Violet Recording section lengths:
  - Intro: 4–8 bars, drums and bass stripped back, or "just hats and a filtered version of the beat".
  - Hook: about 8 bars with the full melody and the strongest energy.
  - Breakdown: 4–8 bars, dropping the drums or 808 before the final hook.

  — [Violet Recording, "How to Make a Beat Without Instruments"](https://violetrecording.com/how-to-make-a-beat-without-instruments/)
- Verse: "16 bars" is the workhorse length in hip-hop, and a verse is usually 8 or 16 bars. — [Violet Recording, "How Long Is a Verse in a Song?"](https://violetrecording.com/how-long-is-a-verse/)
- A hook is a smaller unit than a chorus, and intro, verse and chorus hooks can all exist. Pull the arrangement back before the hook hits. — [Violet Recording, "What Is a Hook in a Song?"](https://violetrecording.com/what-is-a-hook-in-music/)
- Layout intro–verse–hook–verse–hook–outro, with contrast created by adding and removing elements. Automate a filter across the arrangement for variation without adding instruments. — [Violet Recording, "How to Make a Beat"](https://violetrecording.com/how-to-make-a-beat/)
- A multi-page extract (page-level attribution uncertain; it agrees with the Violet pages above) says:
  - The intro works best as the melody alone or the melody with light hats; "a lot of trap intros simply feature the melodic loop and minimal percussion".
  - "run your hook melody through a low-pass filter for the intro, then open the filter as the drums drop".
  - Verse: "full drums and 808, but pull the melody back a little" so a vocal has room.
  - Hook: add the held-back elements, "a countermelody, extra percussion, a wider pad, a doubled 808"; hook length is "8-16 bars" or "usually 8 bars".
  - Bridge: "often just 4 or 8 bars", which "breaks the pattern before the final hook". Outro: 4–8 bars of ad-libs, a repeated hook or a fade.
  - A full beat typically runs 2–3 minutes, or 64–96 bars.
  - "if your verse and hook feel identical, the hook won't land"; "a great two-bar loop is not a song".

  — candidates: [Violet Recording, "How to Structure a Beat"](https://violetrecording.com/how-to-structure-a-beat/); [Violet Recording, "How Long Should a Beat Be?"](https://violetrecording.com/how-long-should-a-beat-be/); [HipHopMakers, song arrangements](https://hiphopmakers.com/how-to-make-beats-song-arrangements); [BeatKey, trap beat guide](https://beatkey.pages.dev/how-to-make-a-trap-beat)
- Pre-hook drop-out: "drop the 808 for the final two bars before the hook while hats continue, then restore full low end on the hook entrance". This comes from an AI-music prompt guide: concrete but low authority. — [Jack Righteous, Trap Prompt Vault](https://jackrighteous.com/de/blogs/vip-prompt-support/trap-prompt-vault-808-flows-hooks-arrangement)
- An EDM-trap build and drop: "By cutting out all of the drums at the start of an eight-bar section … we leave an unexpected gap before throwing the parts back in on the third beat." — [MusicRadar, "How to create a trap-style build and drop"](https://www.musicradar.com/tuition/tech/how-to-create-a-trap-style-build-and-drop-582038)
- A general (not trap-specific) arrangement guide: before a chorus or drop, "Add a riser; Remove the kick for 4-8 bars; Add snare rolls that speed up", plus a brief pause right before the drop. — [Flowstate, "Arranging songs"](https://flowstate-learn.pages.dev/guides/arranging-songs)
- A sound-design guide puts risers in the last bar before the hook (about 0.5–2 s) and keeps impacts for turnarounds rather than every snare. Low authority. — [MegaMix AI blog](https://megamixai-mvp-backend.onrender.com/blogs/sound-effects-for-hip-hop-and-trap-production)
- Vary the drum pattern every four or eight bars. — [eMastered, Trap Drum Patterns](https://emastered.com/blog/trap-drum-patterns)
- Beat switch: a sudden change in the instrumental partway through a track. Sources call it hip-hop's equivalent of the EDM bass drop or the metal breakdown, describe it as "somewhat common in hip-hop/rap" but say it needs a reason to exist, and trace it to DJ culture (Grandmaster Flash's 1981 "Wheels of Steel"; N.W.A.'s "The New Style"). I found no production how-to. Page-level attribution between these sources is uncertain. — [District Magazine, "A brief history of the beat switch"](https://districtmagazine.ie/music/a-brief-history-of-the-beat-switch-in-hip-hop); [Seattle Spectator, "Appreciating Beat Switches"](https://seattlespectator.com/2019/04/17/the-music-scoop-7/); [Complex, "Best Hip-Hop Beat Switches"](https://www.complex.com/music/a/dimassanfiorenzo/best-hip-hop-beat-switches-of-all-time)

### Inferences
- [INF] **Default full-beat map** (72 bars ≈ 2:03 at 140 BPM; bar duration = 4 × 60/140 ≈ 1.714 s):

  | Bars | Section | Elements |
  |---|---|---|
  | 1–8 | Intro | melody (low-pass filtered) + optional hats from bar 5; no kick or 808 |
  | 9–16 | Hook | everything + counter-melody / octave double |
  | 17–32 | Verse 1 | full drums + 808 + main melody at −2 to −3 dB; no counter |
  | 33–40 | Hook | |
  | 41–56 | Verse 2 | optional beat switch here (new kick/hat template, same key) |
  | 57–64 | Hook | |
  | 65–72 | Outro | melody alone, filter closing |

  A "short loop pack" mode outputs a 4- or 8-bar loop only.
- [INF] **Pre-hook rule:** in the final 1–2 bars before every hook, remove the 808 and kick while hats and melody continue (from the Jack Righteous guide). Optionally mute everything for the final beat (steps 12–15 of the last bar) and land the hook's first 808 + kick on step 0. Fill the gap with a 64th hat ratchet or a 16th-triplet snare run on that beat.
- [INF] **Intro filter:** low-pass the melody bus at about 500–1000 Hz during the intro, and open it fully on the hook downbeat or sweep it over the last 2 bars. Optionally, the intro can be a 4-bar "melody only" version for very short previews.
- [INF] **Verse vs. hook contrast:** the verse uses a simpler hat (8ths, fewer rolls) and no counter-melody. The hook uses 16th hats with more rolls, the counter-melody or octave double, and the open hat and percussion layer. Re-roll the drum variation every 4 bars.
- [INF] **Beat switch** (unsourced implementation): at a section boundary, keep tempo and key but swap to a contrasting drum template (for example 8th → 16th/triplet hats, a new kick pattern, or an 808 in a different rhythm). Optionally swap the melody loop for a variant or a different scale preset of the same tonic.

### Gaps
- I found no source on bar counts specific to modern streaming-era rap songs (for example shorter 2:00–2:30 songs, or 8-bar verses in melodic rap), and no data on how often beat switches occur.
- I found no trap-specific how-to for beat switches.
- The low-pass intro rule is supported by Violet Recording and an unattributed multi-page extract; no primary producer source was found.

## 6. Mix conventions that matter for preview playback

### Takeaway
The 808 and kick form the loudest, headroom-defining layer and are set first. The kick is kept short so it doesn't mask the 808. Any kick-to-808 sidechain is a short duck or a dynamic-EQ notch for clarity, not a house-style rhythmic pump. I found no source that explicitly rules pumping out; the iZotope method shows the intended behaviour. The 808 is saturated for small-speaker audibility. Hats and harmonic layers are high-passed and sit under the drums. Melodic layers carry the reverb and haze, while vocals (and by extension the core drums) stay fairly dry. Intros are low-pass filtered.

### Cited Findings
- iZotope on separating kick and 808 (details in Section 3):
  - Shorten the kick's tail.
  - Use a kick-triggered dynamic-EQ notch at the kick's fundamental (62 Hz in their example).
  - Or apply a short-release full-band duck that "lets the 808 take over as it resolves".
  - Use a dead-patch sidechain source.
  - High-pass the other harmonic instruments under a big 808.
  - General sidechain advice: start with "a relatively conservative ratio, and then tweak threshold, followed by attack and release".

  — [iZotope, How to Mix 808s](https://www.izotope.com/en/learn/how-to-mix-808s)
- 21 Savage "A Lot" mix:
  - The 808 tends to overload the mix bus, and the engineer starts the drum mix by setting the 808 and kick levels.
  - A heavily compressed or distorted 808 copy is blended in for small speakers.
  - Vocals were kept fairly dry, with only a subtle small-room reverb (Slate VerbSuite Classics, UAD Lexicon 480).

  — [SOS, Inside Track: 21 Savage 'A Lot'](https://www.soundonsound.com/techniques/inside-track-21-savage); [page 2](https://www.soundonsound.com/techniques/inside-track-21-savage?page=2)
- Metro Boomin "Heroes & Villains" (April 2023): reverb is ducked by a compressor keyed from the lead vocal. — [SOS, Inside Track: Metro Boomin 'Heroes & Villains'](https://www.soundonsound.com/techniques/inside-track-metro-boomin-heroes-villains)
- Future "Draco": a resonance was notched out of the 808 (FabFilter Pro-Q2), and the beat came as separate kick, 808, snare, clap, hat and open-hat stems. — [SOS, Inside Track: Future 'Draco'](https://www.soundonsound.com/techniques/inside-track-future-draco)
- Chris Brown "Heat": the 808 serves as the kick, and the mix bus has its own plug-in chain. — [SOS, Inside Track: Chris Brown 'Heat'](https://www.soundonsound.com/techniques/inside-track-chris-brown-heat)
- Saturation makes the 808 audible on small speakers. Push the gain until it buzzes, then back off 1–2 dB. An octave-up layer high-passed at about 200 Hz with slight distortion also helps. — [Unison, 808](https://unison.audio/808/); [Unison, 808 sound design](https://unison.audio/808-sound-design/)
- High-pass hats below about 350 Hz (house/techno context). — [Attack Magazine, Beat Dissected](https://www.attackmagazine.com/technique/beat-dissected/dusted-deep-house/)
- For a hazy trap texture, pitch the melodic sample down and drown it in reverb. — [Splice, Sounds of KSHMR Vol. 3](https://splice.com/blog/making-tracks-with-sounds-of-kshmr-vol-3/)
- Use a filtered intro and filter automation for variation. — [Violet Recording, How to Make a Beat Without Instruments](https://violetrecording.com/how-to-make-a-beat-without-instruments/); [Violet Recording, How to Make a Beat](https://violetrecording.com/how-to-make-a-beat/)
- Melody loops are meant to sit above the 808s and drums and leave room for vocals and top lines. — [Cymatics, RIPPLE preview](https://cymatics.fm/pages/ripple-preview)
- Sidechaining is described as "a common way to keep the kick and 808 from clashing" (multi-page extract; page-level attribution uncertain). — candidates: [Violet Recording, How to Make 808 Patterns](https://violetrecording.com/how-to-make-808-patterns/); [Amped Studio](https://www.ampedstudio.com/blog/secrets-of-808-bass/)

### Inferences
- [INF] **Preview gain staging** (peak, relative to the 808 at 0 dB):

  | Layer | Level |
  |---|---|
  | 808 | 0 dB |
  | Kick | −1 to −3 dB |
  | Clap/snare | −3 to −6 dB |
  | Closed hats | −10 to −14 dB (roll notes follow their velocity curve) |
  | Open hat | −12 to −16 dB |
  | Percussion | −12 to −18 dB |
  | Lead melody | −8 to −12 dB |
  | Counter-melody / arp | −12 to −16 dB |
  | Chords / pads | −14 to −18 dB |

  End with a soft limiter on the master. All values are unsourced starting points.
- [INF] **No pumping:** never sidechain melody, chords or pads to the kick. The only sidechain is an optional 808 duck from the kick: 3–6 dB, attack 0–5 ms, release 60–120 ms, active only when kick and 808 start together.
- [INF] **Effects in preview:**
  - Lead and counter-melody: plate or hall reverb, 1.5–3 s decay, 15–30% wet, 20–40 ms pre-delay, with the reverb return high-passed at about 200–300 Hz.
  - Optional tempo-synced delay (1/8 dotted or 1/4; 20–35% feedback, high- and low-passed) on the lead or bells.
  - Counter-melody bells wetter than the lead.
  - 808, kick and snare dry.
  - High-pass everything except kick and 808 at about 100–150 Hz (hats at about 300–400 Hz).
- [INF] **808 audibility:** use tanh or soft-clip saturation on the 808 bus and/or a −12 dB octave-up harmonic layer, high-passed at about 200 Hz. Without it, laptop and phone previews lose the bass line.
- [INF] **Intro low-pass:** 12–24 dB/oct with low resonance, cutoff 500–1000 Hz, fully open on the hook downbeat.

### Gaps
- No source states explicitly that trap avoids house-style sidechain pumping. The inference rests on iZotope's short-release, kick-only ducking method and the absence of any pumping guidance in trap sources.
- I found no source quantifying 808 vs. kick vs. hat levels, or reverb and delay settings on trap melodies. Every number above is an unsourced default to tune by ear.
- Mix-bus and loudness conventions (LUFS for beat previews or type-beat uploads) were not covered by the sources found.
