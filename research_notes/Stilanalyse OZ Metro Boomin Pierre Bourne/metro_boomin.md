# Metro Boomin (Leland Wayne): production-style facts for a style-based MIDI idea generator

*Method note (research run 2026-11-03):* WebFetch was blocked by the session's network allowlist for songbpm.com, hooktheory.com, en.wikipedia.org, vice.com and melodics.com. Every finding below therefore comes from **search-engine result snippets and summaries** of the cited URLs, not from full-page reads. Treat exact wording and numbers as snippet-level. Automated key/BPM sites (AcousticBrainz, klang.io, SFR Beats, musiciwant, Audiokeychain) often disagree with each other, and conflicts are shown inline. **[INF]** marks my own inferences and proposed generator defaults. No melodies are transcribed; only chord symbols, scale degrees and short descriptive facts are given.

---

## 1. Best-known productions: tempo and key (half-time vs double-time readings)

### Takeaway
Almost every Metro Boomin production with a key reading is minor. C♯ minor comes up most often, followed by D, E♭, F, B♭, B and A minor. The only major-key hit found is "Congratulations" (F♯/G♭ major). Tempos fall into two clusters:
- **Trap cluster, about 140–150 BPM.** These are double-time numbers that analyzers often halve to 70–76.
- **Melodic/R&B/pop crossover cluster, about 90–127 BPM.**

"Like That" is an outlier at about 162 BPM.

### Cited Findings

**BPM and key per track.** Sources are given for each reading. "Half" means a reading that is half the other one (a half-time interpretation).

| Track (artist, project, year) | BPM readings | Key readings | Notes |
|---|---|---|---|
| "Jumpman" (Drake & Future, *What a Time to Be Alive*, 2015) | **142** ([SongBPM](https://songbpm.com/@drake/jumpman); [AcousticBrainz](https://acousticbrainz.org/98c670cf-5348-481c-acb4-10a2d3e9ff1d)); 71 ([Audiokeychain](https://www.audiokeychain.com/track/pgL/drake-future-jumpman)); 95, AI estimate ([musiciwant](https://musiciwant.com/song/jumpman-drake)) | C♯/D♭, mode not shown in snippet ([SongBPM](https://songbpm.com/@drake/jumpman)); A♭m ([Audiokeychain](https://www.audiokeychain.com/track/pgL/drake-future-jumpman)); A♯m at ~52% confidence ([AcousticBrainz](https://acousticbrainz.org/98c670cf-5348-481c-acb4-10a2d3e9ff1d)) | Key unresolved |
| "X" (21 Savage & Metro Boomin ft. Future, *Savage Mode*, 2016) | **149** (Mixmeister, [cs.uwaterloo listing](https://cs.uwaterloo.ca/~dtompkin/music/track/CHRRADIO_369/CHRRADIO_369-09.html); [AcousticBrainz](https://acousticbrainz.org/289ea42a-6802-4b1e-b49f-96f2ff786574)); 75, published tempo ([cs.ubc listing](https://www.cs.ubc.ca/~davet/music/track/CHRRADIO_369/CHRRADIO_369-09.html)); 74.5 ([Karaoke Version](https://www.karaoke-version.com/mp3-backingtrack/future/x.html)) | Bm ([Karaoke Version](https://www.karaoke-version.com/mp3-backingtrack/future/x.html)); C♯m (Mixmeister, [cs.uwaterloo](https://cs.uwaterloo.ca/~dtompkin/music/track/CHRRADIO_369/CHRRADIO_369-09.html)); A♯ major at 42% ([AcousticBrainz](https://acousticbrainz.org/289ea42a-6802-4b1e-b49f-96f2ff786574)) | First single from *Savage Mode*, released July 14, 2016 ([Wikipedia](https://wikipedia.com/wiki/X_%2821_Savage_and_Metro_Boomin_song%29)); track 3 of 9, 4:18 ([AcousticBrainz](https://acousticbrainz.org/289ea42a-6802-4b1e-b49f-96f2ff786574)) |
| "Bad and Boujee" (Migos ft. Lil Uzi Vert, 2016) | **127** ([Wikipedia, citing Tunebat](https://en.wikipedia.org/wiki/Bad_and_Boujee); [AcousticBrainz](https://acousticbrainz.org/50987d55-b4cf-4ff6-b953-e5c228da664e)); 129 ([GetSongBPM](https://getsongbpm.com/song/bad-and-boujee-featpoint-lil-uzi-vert/RlNBDE)) | **E♭ minor** ([Wikipedia/Tunebat](https://en.wikipedia.org/wiki/Bad_and_Boujee)); D minor ([Hooktheory](https://www.hooktheory.com/theorytab/view/migos-ft-lil-uzi-vert/bad-and-boujee)); A♯m at 58% ([AcousticBrainz](https://acousticbrainz.org/50987d55-b4cf-4ff6-b953-e5c228da664e)) | A Wikipedia talk-page comment also says the tonic is E♭ ([Talk page](https://www.wikipedia.com/wiki/Talk:Bad_and_Boujee)). A Medium analyst says he "should have written this in Eb minor" ([Medium](https://medium.com/that-good-you-need/weekly-billboard-theory-bad-and-boujee-a6b3723efe8b)) |
| "Congratulations" (Post Malone ft. Quavo, 2016) | 110 ([Wikipedia](https://en.wikipedia.org/wiki/Congratulations_%28Post_Malone_song%29)); 107 ([Beatport](https://www.beatport.com/track/congratulations/12108519)); 122 ([klang.io](https://songs.klang.io/en/s/Post%20Malone/Congratulations/SC4xMk98Pdc)); 123 ([cs.ubc listing](https://www.cs.ubc.ca/~davet/music/track/CHRRADIO_389/CHRRADIO_389-06.html); [AcousticBrainz](https://acousticbrainz.org/a614fca3-0339-49a8-9348-175acae56bdb?n=8)); 124 ([Medium](https://medium.com/that-good-you-need/weekly-billboard-theory-congratulations-451db13f96e1)); 140 ([musiciwant](https://musiciwant.com/song/congratulations-post-malone)); 61, half ([SFR Beats](https://sfrbeats.com/tools/artist/post-malone)) | **F♯ major** ([Wikipedia](https://en.wikipedia.org/wiki/Congratulations_%28Post_Malone_song%29)) = G♭ major ([Beatport](https://www.beatport.com/track/congratulations/12108519)); A♯m at 61% ([AcousticBrainz](https://acousticbrainz.org/a614fca3-0339-49a8-9348-175acae56bdb?n=8)) | The only major-key hit found |
| "Mask Off" (Future, *FUTURE*, 2017) | **150** (Mixmeister, [cs.uwaterloo listing](https://cs.uwaterloo.ca/~dtompkin/music/track/CHRRADIO_380/CHRRADIO_380-07.html); [AcousticBrainz](https://acousticbrainz.org/09a613f7-5f9d-414a-9c4a-5c318dfe6b9a?n=4)); 76, half ([SFR Beats](https://sfrbeats.com/tools/bpm/future/mask-off)) | **D minor** ([SFR Beats](https://sfrbeats.com/tools/bpm/future/mask-off); Mixmeister, [cs.uwaterloo](https://cs.uwaterloo.ca/~dtompkin/music/track/CHRRADIO_380/CHRRADIO_380-07.html); [Hooktheory](https://hooktheory.com/theorytab/view/future/mask-off)); AcousticBrainz key estimate A♯ major at 73%, but its chord-based key is D minor ([AcousticBrainz](https://acousticbrainz.org/09a613f7-5f9d-414a-9c4a-5c318dfe6b9a?n=4)) | Peaked at No. 5 on the Billboard Hot 100 ([Wikipedia](https://en.wikipedia.org/wiki/Mask_Off)) |
| "Bank Account" (21 Savage, *Issa Album*, 2017) | 75 ([klang.io](https://songs.klang.io/en/s/21%20Savage/Bank%20Account/H1KBHFXm2Bg); [SFR Beats](https://sfrbeats.com/tools/bpm/21-savage/bank-account)); 150 ([AcousticBrainz](https://acousticbrainz.org/1d8be937-3bf8-49f3-a1ec-cf8210e77435?n=13)) | G♯m ([SFR Beats](https://sfrbeats.com/tools/bpm/21-savage/bank-account)); C♯m ([klang.io](https://songs.klang.io/en/s/21%20Savage/Bank%20Account/H1KBHFXm2Bg)); A♯m at 52% ([AcousticBrainz](https://acousticbrainz.org/1d8be937-3bf8-49f3-a1ec-cf8210e77435?n=13)) | Minor in every source; exact tonic unresolved |
| "Space Cadet" (Metro Boomin ft. Gunna, *Not All Heroes Wear Capes*, 2018) | 109 ([GetSongBPM](https://getsongbpm.com/artist/metro-boomin/vxBA8)) | F minor, from an AcousticBrainz entry whose track identity could not be confirmed ([AcousticBrainz](https://acousticbrainz.org/6b46fe50-a007-483b-9f99-0048308818b6)) | From *Not All Heroes Wear Capes* (2018), not *Heroes & Villains*; released as a single in 2019; 3:23 ([Wikipedia](https://en.wikipedia.org/wiki/Space_Cadet_%28song%29)) |
| "Runnin" (21 Savage & Metro Boomin, *Savage Mode II*, 2020) | **143**; half-time 72 ([SongBPM](https://songbpm.com/@21-savage/runnin)) | A♯/B♭ minor ([SongBPM](https://songbpm.com/@21-savage/runnin)); A♯ major at 58% ([AcousticBrainz](https://acousticbrainz.org/67f51a73-f2be-40cf-a928-f158e5239e60)) | 3:16 ([Wikipedia](https://en.wikipedia.org/wiki/Runnin_%2821_Savage_and_Metro_Boomin_song%29)) |
| "Superhero (Heroes & Villains)" (Metro Boomin, Future, Chris Brown, 2022) | 117 ([Chosic](https://www.chosic.com/artist/metro-boomin/0iEtIxbK0KxaSlF7G42ZOp/)) | F minor ([Chosic](https://www.chosic.com/artist/metro-boomin/0iEtIxbK0KxaSlF7G42ZOp/)) | Single source |
| "Trance" (Metro Boomin, Travis Scott, Young Thug, 2022) | 119 ([Chosic](https://www.chosic.com/artist/metro-boomin/0iEtIxbK0KxaSlF7G42ZOp/)); 120 ([12notez](https://12notez.in/song/artist/metro-boomin)) | C♯ minor (both sources) | |
| "Creepin'" (Metro Boomin, The Weeknd, 21 Savage, 2022) | **98** ([Chosic](https://www.chosic.com/artist/metro-boomin/0iEtIxbK0KxaSlF7G42ZOp/); [Karaoke Version, "same as the original tempo"](https://www.karaoke-version.com/mp3-backingtrack/21-savage/creepin.html); [klang.io](https://songs.klang.io/en/s/Metro%20Boomin/Creepin%27%20%28with%20The%20Weeknd%20%26%2021%20Savage%29/6DWjiWEmxME)); outliers of ~85 (blog) and 64 (tab listing) | **C♯ minor** ([Chosic](https://www.chosic.com/artist/metro-boomin/0iEtIxbK0KxaSlF7G42ZOp/); [klang.io](https://songs.klang.io/en/s/Metro%20Boomin/Creepin%27%20%28with%20The%20Weeknd%20%26%2021%20Savage%29/6DWjiWEmxME)) | Peaked at No. 3 on the Hot 100 ([Variety via Yahoo](https://ca.news.yahoo.com/metro-boomin-anthemic-superhero-creepin-190000351.html)) |
| "I Can't Save You (Interlude)" (Future, Metro Boomin, Don Toliver, 2022) | 143 ([Beatport](https://www.beatport.com/track/i-cant-save-you-interlude/21381663)) | E♭ minor ([Beatport](https://www.beatport.com/track/i-cant-save-you-interlude/21381663)) | |
| "Am I Dreaming" (Metro Boomin, A$AP Rocky, Roisee, *Across the Spider-Verse* soundtrack, 2023) | 90 ([Chosic](https://www.chosic.com/artist/metro-boomin/0iEtIxbK0KxaSlF7G42ZOp/)) | A minor ([Chosic](https://www.chosic.com/artist/metro-boomin/0iEtIxbK0KxaSlF7G42ZOp/)) | |
| "Annihilate" (*Across the Spider-Verse* soundtrack, 2023) | 146 ([Chosic](https://www.chosic.com/artist/metro-boomin/0iEtIxbK0KxaSlF7G42ZOp/)) | B minor ([Chosic](https://www.chosic.com/artist/metro-boomin/0iEtIxbK0KxaSlF7G42ZOp/)) | |
| "Type Shit" (Future, Metro Boomin, Travis Scott, Playboi Carti, *We Don't Trust You*, 2024) | 145, "same as the original tempo" ([Karaoke Version](https://www.karaoke-version.com/mp3-backingtrack/future/type-shit.html)) | Not found | Released March 22, 2024; 3:48 ([Wikipedia](https://en.wikipedia.org/wiki/Type_Shit)) |
| "Like That" (Future, Metro Boomin, Kendrick Lamar, *We Don't Trust You*, 2024) | "variable (around 162 BPM)" ([Karaoke Version](https://www.karaoke-version.com/mp3-backingtrack/future/like-that.html)); 81, half ([klang.io](https://songs.klang.io/en/s/Future/Like%20That/N9bKBAA22Go)) | C♯m ([Karaoke Version](https://www.karaoke-version.com/mp3-backingtrack/future/like-that.html)); "F♯" ([klang.io](https://songs.klang.io/en/s/Future/Like%20That/N9bKBAA22Go)) | Released as a single March 26, 2024; 4:27 ([Wikiwand](https://www.wikiwand.com/en/articles/Like_That_%28Future,_Metro_Boomin_and_Kendrick_Lamar_song%29)). Topped the Hot 100 a second time ([99Jamz](https://www.99jamzmiami.com/news/future-metro-boomin/3BWVMF5WTBHSMZNKH3N6ZTBZGM/)) |

**Context on reach and credits:**
- All 15 songs from *Heroes & Villains* entered the Billboard Hot 100 ([Yahoo/Billboard](https://sports.yahoo.com/metro-boomin-sends-15-songs-181812522.html)).
- "Superhero" peaked at No. 8 according to [Variety via Yahoo](https://ca.news.yahoo.com/metro-boomin-anthemic-superhero-creepin-190000351.html). A Wikipedia mirror puts its peak at No. 7, so the two conflict.
- "Mask Off" credits disagree. Wikipedia credits Metro Boomin as sole producer, with Future, Leland Wayne and Tommy Butler as songwriters ([Wikipedia](https://en.wikipedia.org/wiki/Mask_Off)). Hypebeast's 2017 list credits "Metro Boomin, Southside & Frank Dukes" ([Hypebeast](https://hypebeast.com/2017/3/atlanta-flute-beats-metro-boomin-zaytoven-mike-will-made-it)), and XXL calls it "a Metro Boomin and Southside-produced single" ([XXL](https://www.xxlmag.com/terrace-martin-future-mask-off-remix/)).

### Inferences
- **[INF] Tempo clusters.**
  - Trap/double-time grid at 140–150 BPM: Jumpman 142, Runnin 143, I Can't Save You 143, Type Shit 145, Annihilate 146, X 149, Mask Off 150, Bank Account 150.
  - Melodic/R&B crossover at 90–127 BPM: Am I Dreaming 90, Creepin' 98, Space Cadet 109, Congratulations ~110–124, Superhero 117, Trance 119–120, Bad and Boujee 127.
  - Fast outlier: Like That ~162.
  - Analyzers routinely report half values (71, 75, 76, 81, 61). The generator should store the double-time number and place drums half-time.
- **[INF] Triplet grid.** Jumpman's 95 BPM AI reading is about 2/3 of 142 (94.7). That points to a strongly triplet-weighted hat/flow grid that fooled the tempo detector.
- **[INF] Proposed tempo default:**
  - p≈0.60: uniform 140–150 BPM, with half-time snare.
  - p≈0.30: 95–127 BPM, for the melodic/R&B "Heroes & Villains" mode.
  - p≈0.10: 155–165 BPM, for the "Like That" mode.
- **[INF] Proposed key default.** Minor in about 95% of outputs. Suggested tonic weights: C♯m 0.22, Dm 0.14, E♭m 0.12, Fm 0.12, B♭m 0.10, Bm 0.10, Am 0.08, G♯m 0.07. Major mode about 0.05, modeled on "Congratulations" (F♯/G♭).
- **[INF] AcousticBrainz bias.** AcousticBrainz returns A♯ (major or minor) for five different tracks at 42–73% confidence. That looks like an algorithm bias, so give its key readings the lowest weight.

### Gaps
- Tunebat, Musicstax, SongBPM and Hooktheory pages could not be opened (network allowlist), so their full numbers were not read. Bad and Boujee's Tunebat values are known only through Wikipedia.
- No BPM or key found for "Too Many Nights". No key found for "Type Shit". "Space Cadet"'s key is unverified. "Superhero" and "Annihilate" have a single source each.
- Not verified in this session: G Koop as co-producer of "Bad and Boujee", Frank Dukes and Louis Bell on "Congratulations", and 21 Savage co-producing "Bank Account".
- Not researched within the tool budget: "Low Life", "Father Stretch My Hands Pt. 1", "No Complaints", "Ric Flair Drip", "BBL Drizzy" and most *We Still Don't Trust You* tracks.

---

## 2. Harmonic and melodic signatures (scales, chord loops, vamps, voicings, samples, counter-melodies, register)

### Takeaway
The documented harmony is simple, diatonic minor (Aeolian): short loops of 2–4 chords, with "Mask Off" analyzed in D minor as i–VI–v–i or i–iv–VII–i. Melodic identity comes from timbre more than harmonic complexity:
- flute loops
- bells and music boxes
- eerie piano and "howling" synths
- since 2022, orchestral strings and choirs

He also leans heavily on samples and interpolations: soul (Diana Ross), 70s musical theatre (Tommy Butler), Kanye West, 80s rap (Rodney-O & Joe Cooley) and 2000s R&B (Mario Winans). By his own account he usually starts a beat from synths or chords, not drums.

### Cited Findings

**Process: melody first**
- In a Vice/Noisey interview, Metro says he rarely starts with drums. He begins with synths or chords, adds drums midway, then layers more sounds, and says he puts "a lot of melodies" into his beats ([Vice interview](https://www.vice.com/da/article/metro-boomin-interview-metro-thuggin/); interview date not verified, c. 2014–15).

**"Mask Off" (2017): harmony and the flute sample**
- Medium's "Weekly Billboard Theory" puts it in **D minor** with a **i–VI–v–i** progression ([Medium](https://medium.com/that-good-you-need/weekly-billboard-theory-mask-off-2d33c60cf37f)).
- A user-submitted Ultimate Guitar tab gives **Dm, Gm, C**, with intro and outro **Dm–Gm–C–Dm** ([Ultimate Guitar](https://tabs.ultimate-guitar.com/tab/future/mask-off-chords-1984805)). This conflicts with Medium's i–VI–v.
- Hooktheory lists the song in D minor and calls it more basic than the typical song, with below-average complexity scores ([Hooktheory](https://hooktheory.com/theorytab/view/future/mask-off)). Its line that the chords on the 1st, 4th and 5th degrees "are all minor chords" (Dm, Gm, Am) appears to be generic text about the key, not the song's actual loop. [INF]
- **The flute loop is a sample of "Prison Song".** Tommy Butler wrote and produced it, Carlton Williams sang it, and it comes from *Selma Album: A Musical Tribute to Dr. Martin Luther King Jr.* Butler received an additional writing credit ([Wikipedia](https://en.wikipedia.org/wiki/Mask_Off)).
- The year conflicts: 1976 per [Wikipedia](https://en.wikipedia.org/wiki/Mask_Off) and [Songfacts](https://www.songfacts.com/facts/future/mask-off), 1978 per [Revolt](https://www.revolt.tv/article/2017-03-31/25969/futures-mask-off-spawns-the-maskoffchallenge).
- Search-surfaced coverage describes the sample as "a simple four-bar flute solo (sampled from the 1976 musical Selma)". The snippet's outlet is either the [Vice flute-history piece](https://www.vice.com/en/article/a-brief-history-of-that-kickass-flute-sample-on-futures-mask-off) or [NPR](https://www.npr.org/transcripts/522232681); which one was not confirmed.
- Future said in his 2019 Apple Music documentary *The WIZRD* that the song came out before the flute sample was cleared ([Wikipedia](https://en.wikipedia.org/wiki/Mask_Off)).
- The flute melody spawned the #MaskOffChallenge of flutists' covers ([Wikipedia](https://en.wikipedia.org/wiki/Mask_Off); [Revolt](https://www.revolt.tv/article/2017-03-31/25969/futures-mask-off-spawns-the-maskoffchallenge)).
- Hypebeast (2017) framed flute samples as an Atlanta trend across Metro Boomin, Zaytoven and Mike Will Made-It ([Hypebeast](https://hypebeast.com/2017/3/atlanta-flute-beats-metro-boomin-zaytoven-mike-will-made-it)).

**"Creepin'" (2022): interpolation and R&B minor harmony**
- Metro rebuilds Mario Winans' 2004 "I Don't Wanna Know" "from the ground up" ([Variety via Yahoo](https://ca.news.yahoo.com/metro-boomin-anthemic-superhero-creepin-190000351.html)).
- A guitar chord page lists Key Am with capo on the 4th fret (sounding C♯m), using the shapes Am, Em, F, C and E ([GuitarTabsExplorer](https://www.guitartabsexplorer.com/metro-boomin/creepin-chords)).
- An automated chord list gives C♯m with chords "C, G, E, A, G♯m, C♯m, B, G♯, Em, D♯m, C♯, F♯" ([klang.io](https://songs.klang.io/en/s/Metro%20Boomin/Creepin%27%20%28with%20The%20Weeknd%20%26%2021%20Savage%29/6DWjiWEmxME)). This is noisy.
- Johan Lenox is credited with keyboards and strings ([Universal Music credits](https://www.universalmusic.it/popular-music/album/creepin_36258892317/)). His "soaring orchestral sweep and choral vocal swell" opens the song and the album.
- Lenox: "My goal with 'Creepin'' and this album was to saturate it with as many orchestral sounds and choral vocal intros and outros as I could" ([Variety via Yahoo](https://ca.news.yahoo.com/hitmaker-month-johan-lenox-brings-195348458.html)).

**"Superhero (Heroes & Villains)" (2022)**
- Variety describes "propulsive beats and a Kanye West sample that references *The Dark Knight*". The track first surfaced online in 2021 ([Variety via Yahoo](https://ca.news.yahoo.com/metro-boomin-anthemic-superhero-creepin-190000351.html)).
- Allen Ritter found the key sample and played it to Metro during a studio visit ([Variety via Yahoo](https://ca.news.yahoo.com/metro-boomin-anthemic-superhero-creepin-190000351.html)).
- Wikipedia's sample credits list Kanye West's "So Appalled". Producers are Metro Boomin, with Allen Ritter and David x Eli co-producing ([Wikiwand](https://www.wikiwand.com/en/articles/Superhero_%28Heroes_%26_Villains%29)).
- The Boominati Worldwide credits page instead lists "Constellation" (Simon Park, De Wolfe library) and may be mixing up tracks ([Boominati Worldwide](https://www.boominatiworldwide.com/?p=364)).
- It includes a voice-over from Homelander of *The Boys* ([Daily Targum](https://dailytargum.com/article/2023/03/metro-boomin-hero-we-needed-villain-we-didnt-expect)).
- One review calls the production horn-heavy and orchestral ([Ratings Game Music](https://ratingsgamemusic.com/2022/12/02/metro-boomin-heroes-villians-album-review)).

**"Am I Dreaming" (2023): a major-key orchestral idea**
- Metro said the song began at the gym, when he conceived a **major string progression** with a "grand champion" feel ([Variety via Yahoo](https://uk.news.yahoo.com/producer-metro-boomin-says-spider-220000941.html)).
- Peter Lee Johnson made the string-quartet sample, and Metro worked with Mike Dean to add synths to it ([Wikipedia](https://en.wikipedia.org/wiki/Am_I_Dreaming_%28Metro_Boomin,_ASAP_Rocky_and_Roisee_song%29)).
- Chosic still reads the finished track as A minor at 90 BPM ([Chosic](https://www.chosic.com/artist/metro-boomin/0iEtIxbK0KxaSlF7G42ZOp/)).

**Soul and other sample sources**
- "Runnin" (2020) turns Diana Ross's 1976 "I Thought It Took a Little Time" into a "haunting" loop over an "ominous" set of drums ([HotNewHipHop](https://www.hotnewhiphop.com/937773-metro-boomin-best-beats-2020s-ranked-hip-hop-news); [Wikipedia](https://en.wikipedia.org/wiki/Runnin_%2821_Savage_and_Metro_Boomin_song%29)).
- Metro also sampled Diana Ross on a 2017 Big Sean and Travis Scott collaboration ([Crack Magazine](https://crackmagazine.net/2017/12/metro-boomin-samples-diana-ross-big-sean-travis-scott-collaboration/)).
- **"Like That" (2024)** uses a sped-up sample of Rodney-O & Joe Cooley's "Everlasting Bass" (1988 per Wikipedia, 1986/87 elsewhere) and samples Eazy-E's "Eazy-Duz-It" ([Wikiwand](https://www.wikiwand.com/en/articles/Like_That_%28Future,_Metro_Boomin_and_Kendrick_Lamar_song%29)).
  - Metro asked Rodney-O for permission to use the sped-up sample ([Complex](https://www.complex.com/music/a/markelibert/rodney-o-metro-boomin-cleared-sample-like-that)).
  - Rodney-O sued on May 13, 2025. Metro's camp says it cleared the sample and paid $50,000 ([Black Enterprise](https://www.blackenterprise.com/rodney-o-sues-kendrick-lamar-future-metro-boomin)).
  - Barry White's estate filed a separate copyright suit over the "Everlasting Bass" material ([Black Enterprise](https://www.blackenterprise.com/barry-white-estate-copyright-infringement/amp/)).
- *We Don't Trust You* (2024) ranges "from trap to warped soul samples", and "Everyday Hustle" sits on a pared-down soul sample ([Clash](https://www.clashmusic.com/reviews/future-metro-boomin-we-dont-trust-you/)).

**Melodic timbres by era**
- **2015 (*DS2*).** A review describes a "heavy drone baseline propelled forward by keys, 808s and some of Metro's typically-haunting aesthetic". The outlet is one of the *DS2* reviews surfaced in search ([XXL](https://www.xxlmag.com/future-dances-devil-ds-2-review/) / [HeadStuff](https://headstuff.org/?p=16503)); which one was not confirmed. Reviewers called the beats massive-sounding and moody; AllMusic called the production monotonous (via [DS2 Wikipedia](https://en.wikipedia.org/wiki/DS2_%28album%29)).
- **2017 (*Without Warning*)**
  - HotNewHipHop: "big bells, eerie piano, reverby bass, and sci-fi synths", plus music boxes ([HotNewHipHop](https://www.hotnewhiphop.com/75586-21-savage-offset-and-metro-boomin-without-warning-review-news)).
  - Vice: synth patches processed to sound like "howling winds instead of pianos or organs" ([Vice](https://creators.vice.com/en/article/j5jgg3/metro-boomin-21-savage-and-offsets-surprise-ep-is-a-gory-delight)).
  - Apple Music: "uncanny synth lines" ([Apple Music](https://music.apple.com/us/album/without-warning/1303426031?uo=4)).
  - Fantano: a conscious "trap take on 80s horror movie soundtracks like Halloween or Nightmare on Elm Street" ([The Needle Drop](https://rosetta.to/u/theneedledrop/21-savage-offset-metro-boomin-without-warning-album-review)).
- **2022 (*Heroes & Villains*)**
  - Variety: the album "elevated his dark sound by incorporating orchestral elements into his trap-inflected beats" ([Variety via Yahoo](https://sg.news.yahoo.com/metro-boomin-stellar-heroes-villains-210745332.html)).
  - 4ZZZ: "ominous choir samples layered with recurring vocals, pianos, and claps" ([4ZZZ](https://4zzz.org.au/reviews/album/metro-boomin-heroes-villains)).
  - 30rap: reads "more like a full score than a set of beats" ([30rap](https://30rap.com/metro-boomin-heroes-villains)).

### Inferences
- **[INF] Harmonic default: natural minor (Aeolian) with a minor v.** Both "Mask Off" readings use minor v or VII, with no leading tone. Allow a major V (harmonic-minor raised 7th) as an R&B-mode color. The "Creepin'" capo-4 shapes Am–Em–F–C–E sound as C♯m–G♯m–A–E–G♯: i, v, VI, III and a major V.
- **[INF] Phrygian.** No source found for ♭II/Phrygian use. Include it only as a low-weight "dark" option, around 5%.
- **[INF] Proposed chord-loop templates.** Use 4-bar loops with one chord per bar, or one chord per two bars over 8 bars:
  1. i–VI–v–i (Mask Off per Medium)
  2. i–iv–VII–i (Mask Off per UG)
  3. i–iv two-chord vamp
  4. i drone with only the bass moving (the *DS2* "drone bassline" idea)
  5. i–v–VI–III with V-major at bar 4 (Creepin'-style R&B)
  6. Major mode, about 5%: "triumphant" string progression (Am I Dreaming / Congratulations type); exact progressions unsourced
- **[INF] Voicings and register.**
  - Chords: close-position triads plus root octave, C3–C5, for strings, choir and pad.
  - Piano: whole- and half-note block chords.
  - Extensions: avoid 7ths and 9ths except in R&B mode (min7/add9).
  - Lead: bells, music box and glockenspiel C5–C7; flute D4–D6; eerie synth lead C4–C6.
- **[INF] Lead loop.** A 1–2 bar motif repeated to fill 4 bars, varied in bar 4 (a "sample-like" loop). Use 3–6 pitch classes from Aeolian or minor pentatonic, a range of about an octave or less, and plenty of rests.
- **[INF] Counter-melody.** Answer the lead in its rests, an octave below (C4–C5), with pizzicato, pluck or piano. Alternatively use a sustained choir "ooh" pad. In *Heroes & Villains* mode, use an 8th-note string ostinato on root and 5th.
- **[INF] Role split.** The generator's "lead" should usually be the hook-bearing sample-like loop: flute, bells, soul-vocal-style synth or string figure. The rapper or singer carries the foreground, consistent with Grantland's note that Metro "falls somewhere in the middle" (see section 5).

### Gaps
- No verified chord progressions for "Superhero", "Like That", "Type Shit", "Space Cadet", "Bad and Boujee", "Jumpman" or "X". The Hooktheory pages exist, but their chord data could not be read.
- The "I Don't Wanna Know" → Enya "Boadicea" sample chain behind "Creepin'" was not verified in this session.
- No source documents melody register, interval content or how often octave-doubling is used. Those defaults are [INF].
- "So Appalled" vs "Constellation" as the "Superhero" sample source is unresolved.

---

## 3. Drums and 808 programming (hats, snares/claps, kick–808, glides, percussion, tags, FX, drops)

### Takeaway
The sources agree on a formula: an 808 underpinning, "skittering" or "fluttering" hi-hats, "familiar" clap/snare patterns, and "buzzing" or "reverby" 808s. Drum programming is called "deceptively simple", and one critic found the drums similar from track to track. No bar-level transcription of his hat or 808 patterns, 808 glides, reverse cymbals or beat stops was found, so concrete patterns below are [INF] genre-consistent defaults. His two voice tags are documented: Young Thug's "Metro Boomin want some more" and Future's "If Young Metro don't trust you…". Describe them as tags; do not copy them.

### Cited Findings

**Process and formula**
- A 2015 Vice/Broadly piece on Metro making a beat (as *What a Time to Be Alive* executive producer) describes his usual formula as an 808 underpinning, skittering hi-hats and familiar clap and snare patterns, and shows him building drums in real time ([Vice/Broadly](https://broadly.vice.com/en/article/kb5vvx/watch-future-and-drakes-wattba-executive-producer-metro-boomin-make-a-beat)).
- **Razer FL Studio tutorial series, Oct 2015.** The first episode gives "pointers on how to make an 808 drum loop hit and swing in the right places" ([FACT](https://factmag.com/2015/10/05/watch-metro-boomin-make-a-beat)).
  - He walks through drum sequencing and layering loops with 808s, drums, hi-hats, snares and claps ([Hypebeast](https://hypebeast.com/2015/10/metro-boomin-production-razer)).
  - It was a series of basic FL Studio tutorials ([ProducerGrind](https://producergrind.com/blogs/blog/metro-boomins-first-fl-studio-tutorial-video-808-drum-basics)).
  - The first video is a roughly five-minute drum-programming tutorial ([DJcity](https://news.djcity.com/tag/fl-studio/)).
- Drums typically enter midway through his process, after chords and synths ([Vice interview](https://www.vice.com/da/article/metro-boomin-interview-metro-thuggin/)).
- Secondary source: his drum programming is "often deceptively simple", and its foundation "traces back to the Roland TR-808" ([Internet Tattoo](https://www.internettattoo.com/blog/what-vst-plugins-does-metro-boomin-use)).

**Track and album descriptions**
- *Without Warning* (2017):
  - Apple Music: "creeping, buzzing 808s" ([Apple Music](https://music.apple.com/us/album/without-warning/1303426031?uo=4)).
  - HotNewHipHop: "reverby bass", plus horror sound effects such as laughs, chainsaws, gunshots and wolf howls ([HotNewHipHop](https://www.hotnewhiphop.com/75586-21-savage-offset-and-metro-boomin-without-warning-review-news)).
  - The Collegian says Metro tends to "litter the instrumental with fluttering hi-hats and other production edits" ([Collegian](https://collegian.com/?p=193627)).
  - Uproxx says the drums are "so similar from track to track that they blur together" ([Uproxx](https://uproxx.com/music/21-savage-offset-metro-boomin-without-warning-review)).
- "Runnin" (2020): a "haunting" sample loop built around an "ominous" set of drums ([HotNewHipHop](https://www.hotnewhiphop.com/937773-metro-boomin-best-beats-2020s-ranked-hip-hop-news)).
- *Heroes & Villains* (2022): claps layered with choir samples and pianos ([4ZZZ](https://4zzz.org.au/reviews/album/metro-boomin-heroes-villains)); "strings and percussion" going hard on one track (user review, [AOTY](https://www.albumoftheyear.org/user/ander-1/reviews/1/)).
- "Jumpman" (2015): a database-style page describes "a pitched vocal chop sample, hard trap drums, Metro Boomin minimalist arrangement, punchy 808s" ([song database page](https://dashboard-ruddy-beta.vercel.app/explore/songs/131103)). Low reliability.

**General trap context (not specific to Metro)**
- MusicRadar's walkthrough of "mixed-resolution, trap-style hi-hat patterns" documents the genre convention of switching hat note values within a bar ([MusicRadar](https://www.musicradar.com/how-to/how-to-program-mixed-resolution-trap-style-hi-hat-patterns)).

**Tags (voice drops; describe only)**
- "Metro Boomin want some more…" is voiced by Young Thug and comes from Young Thug's 2013 song "Some More". A FADER video post dated Nov 2013 is cited for it ([Wikipedia mirror](https://en.wikipedia.com/wiki/Metro_Boomin); [The Source](https://thesource.com/2014/03/26/metro-boomin-young-thug-give-us-the-first-leak-off-collaborative-album/)). It has been called possibly "the most recognizable thing about him" ([DBK News](https://dbknews.com/2016/03/07/hip-hop-producer-tags)).
- "If Young Metro don't trust you, I'm gon' shoot you" comes from Future's verse on Uncle Murda's 2015 track "Right Now", produced by Metro, who then used the clip as a tag ([XXL](https://www.xxlmag.com/metro-boomin-origin-of-im-gon-shoot-you-phrase/)).
  - It spread through "Jumpman" and Kanye West tracks ([BET](https://www.bet.com/article/ydj871/metro-boomin-details-the-origin-of-his-untrustworthy-tag); [Rolling Out](https://rollingout.com/2016/03/14/metro-boomin-talks-origins-tag-young-metro-dont-trust)).
  - Metro explained its origin on DJ Drama's StreetzIsWatchin radio (2016) ([HotNewHipHop](https://hotnewhiphop.com/462565-metro-boomin-speaks-on-the-origin-of-his-if-young-metro-dont-trust-you-tag-news)).
  - The phrase inspired the 2024 album title *We Don't Trust You* ([XXL](https://www.xxlmag.com/metro-boomin-origin-of-im-gon-shoot-you-phrase/)).
- Spoken and non-musical drops also appear inside tracks, such as the Homelander voice-over on "Superhero" ([Daily Targum](https://dailytargum.com/article/2023/03/metro-boomin-hero-we-needed-villain-we-didnt-expect)).

### Inferences
- **[INF] Grid.** In the 140–150 BPM cluster, write drums in half-time: one snare/clap per bar on beat 3, equivalent to a 2-and-4 backbeat at 70–75 BPM. In the 90–110 BPM R&B mode ("Creepin'"), use a 2-and-4 backbeat. At 115–130 BPM ("Bad and Boujee", "Superhero"), make half-time vs backbeat a parameter. Not transcribed; genre default.
- **[INF] Hi-hats ("skittering"/"fluttering").**
  - Base: straight 1/8 notes at the written 140–150 BPM (16ths in half-time feel).
  - Variation: per 4-bar loop, insert 2–4 ornaments, chosen from 1/16 bursts, 1/32 rolls and 1/16-triplet runs, placed mostly on beat 4 and the bar's last half-beat. Optionally pitch-step them up or down.
  - Dynamics: velocity accents on quarter notes, ghosted in-between hits, and occasionally an open hat on the "and" of 4.
- **[INF] Kick and 808 ("hit and swing in the right places").**
  - The kick lands on beat 1 plus 1–3 syncopated 8th or 16th hits per bar, and the 808 shares most kick onsets.
  - The 808 plays the chord root, sustains until the next onset and sits in E1–A2.
  - Add 1–2 glides (portamento about 60–120 ms) per 4-bar loop, usually an octave up or a step to the next root on the last 8th of a bar.
  - Distortion/saturation should be a parameter, for "buzzing" 808s; reverb only on the "Without Warning" preset ("reverby bass").
- **[INF] Density.** Keep total drum density moderate ("deceptively simple") and get variety from hat ornaments rather than new kick or snare patterns. This matches the Uproxx complaint that drums stay similar across tracks.
- **[INF] Percussion and FX.**
  - Optional rimshot or shaker on off-beats.
  - In a "horror" preset (*Without Warning*), add a sparse one-shot FX lane in place of melodic percussion: bell hits, a music-box line, wind-like synth swells.
  - Reverse cymbals and risers into section changes and 1–2 beat "beat stops" (mute drums and 808 before a hook downbeat) are plausible but **unsourced**. Keep them low-probability options.
- **[INF] Tag slot.** If the generator offers a "producer tag" slot, leave it empty or user-defined. Do not imitate either Metro tag.

### Gaps
- No primary transcription or written breakdown of Metro's actual hat, snare, kick or 808 patterns. The 2015 Razer tutorial videos exist but their content was not transcribed in any source found.
- No source on 808 glide or slide usage, 808 tuning practice, reverse cymbals, risers or "beat stops" in his work specifically.
- No information on his drum-kit samples. A "Metro Boomin drum kit" collection on SampleFocus is a third-party pack, not his kit.

---

## 4. Sounds, tools and collaborators (DAW, plugins, orchestral elements, melody partners)

### Takeaway
FL Studio is his long-time core DAW, confirmed indirectly by his 2015 Razer FL Studio tutorial series. Plugin lists come only from secondary blogs: Omnisphere, Nexus and Kontakt for melodic sounds; Gross Beat, HalfTime and ShaperBox for warping. Since 2022 the sound is heavily orchestral and choral through classically trained collaborators, Johan Lenox (strings and choir) and Peter Lee Johnson (strings, piano, violin). Melodic and sample starting points often come from co-producers such as Allen Ritter, Southside, Prince85, David x Eli and Mike Dean.

### Cited Findings

**DAW and hardware**
- FL Studio has been his main DAW since his teenage years ([Melodics](https://melodics.com/blog/metro-boomin-producer-deep-dive); [RouteNote](https://create.routenote.com/blog/producer-profile-metro-boomin/)). Razer released his "basic FL Studio tutorials" in 2015 ([ProducerGrind](https://producergrind.com/blogs/blog/metro-boomins-first-fl-studio-tutorial-video-808-drum-basics)).
- Secondary claim: he also uses an Akai MPC and does final mixes and arrangements in Pro Tools ([Melodics](https://melodics.com/blog/metro-boomin-producer-deep-dive)).
- *Heroes & Villains* credits list Metro Boomin for "programming" and Ethan Stevens for mixing on all tracks ([Wikipedia](https://en.wikipedia.org/wiki/Heroes_%26_Villains)).

**Plugins (all secondary sources)**
- **Omnisphere:** a Razer Music listing reportedly cites Omnisphere 2 ([Internet Tattoo](https://www.internettattoo.com/blog/what-vst-plugins-does-metro-boomin-use)).
- **Kontakt, Nexus 3 and Omnisphere** are named as primary sources of melodic elements ([RouteNote](https://create.routenote.com/blog/producer-profile-metro-boomin/)).
- **Gross Beat, HalfTime and ShaperBox** are named for rhythmic chopping and time manipulation. RouteNote says he renders melodies to audio and reshapes them with Gross Beat or HalfTime for a "warped, dreamlike" quality ([RouteNote](https://create.routenote.com/blog/producer-profile-metro-boomin/)).
- **Also listed:** Trilian, Stylus RMX, Serato Sample, Guitar Rig 6, Valhalla reverb and RC-20 ([RouteNote](https://create.routenote.com/blog/producer-profile-metro-boomin/)).
- **Sytrus and ElectraX:** claimed only by a page selling "inspired-by" Sytrus presets. Low reliability ([search summary of preset-seller page, via Internet Tattoo results](https://www.internettattoo.com/blog/what-vst-plugins-does-metro-boomin-use)).

**Orchestral and choral collaborators**
- *Heroes & Villains* credits:
  - Johan Lenox: strings composition and arrangement on tracks 1 and 10, background vocals on track 1, keyboards on track 10.
  - Peter Lee Johnson: strings on tracks 1, 10 and 12; piano on 5; violin on 6; synthesizer on 10; bass on 12 ([Wikipedia track credits](https://en.wikipedia.org/wiki/Heroes_%26_Villains)).
  - [INF, from tracklist memory, verify] Track 1 is "On Time", 5 "Umbrella", 6 "Trance", 10 "Creepin'" and 12 "Walk Em Down".
- **Johan Lenox**
  - Yale School of Music, undergraduate and graduate study in orchestral composition ([Wikipedia](https://en.wikipedia.org/wiki/Johan_Lenox)).
  - Known for the "supple grandeur" he brings as a producer, arranger and composer. He did the orchestral and choral arrangements on Travis Scott's *Astroworld* and Nas' *Nasir*. His strings and choral stacks are also on his solo mixtapes ([Variety via Yahoo](https://ca.news.yahoo.com/hitmaker-month-johan-lenox-brings-195348458.html)).
  - Credited as additional producer and background vocalist on "On Time" (feat. John Legend) ([Boominati Worldwide](https://www.boominatiworldwide.com/?p=364)).
- **Live orchestra.** Red Bull Symphonic (Nov 2023, Dolby Theatre): conductor Anthony Parnther and musical director Laura Escudé took the orchestra through 29 tracks from his catalogue in 90 minutes ([Red Bull](https://www.redbull.com/int-en/metro-boomin-red-bull-symphonic); [Grammy.com](https://grammy.com/news/how-metro-boomin-became-in-demand-rap-producer-2024-grammys)).
- Variety named him 2023 Hitmakers Producer of the Year ([Variety via Yahoo](https://sg.news.yahoo.com/metro-boomin-stellar-heroes-villains-210745332.html)).

**Melody and co-production partners (credits found)**
- **Allen Ritter**
  - Co-produced much of Travis Scott's 2015 album (*Rodeo*) with Metro ([Wikipedia](https://en.wikipedia.org/wiki/Allen_Ritter)), including "3500" and "Nightcrawler" ([production discography](https://www.wikipedia.com/wiki/Metro_Boomin_production_discography)).
  - Co-produced "Superhero" and brought its sample ([Variety via Yahoo](https://ca.news.yahoo.com/metro-boomin-anthemic-superhero-creepin-190000351.html)).
  - With Peter Lee Johnson, produced "Seen It All" on *We Don't Trust You* ([Discogs](https://www.discogs.com/release/30191456-Future-4-Metro-Boomin-We-Dont-Trust-You)).
- **Southside (808 Mafia)**
  - On many Metro credits ([production discography](https://www.wikipedia.com/wiki/Metro_Boomin_production_discography)) and on *DS2* (via [DS2 Wikipedia](https://en.wikipedia.org/wiki/DS2_%28album%29)).
  - Credited on "Mask Off" by Hypebeast and XXL (see section 1).
  - On *We Don't Trust You*: "Magic Don Juan" with Boi-1da, Honorable C.N.O.T.E. and Deputy, and "GTA" with Wheezy ([Discogs](https://www.discogs.com/release/30191456-Future-4-Metro-Boomin-We-Dont-Trust-You); [Wikipedia](https://en.wikipedia.org/wiki/We_Don%27t_Trust_You)).
- **Peter Lee Johnson:** made the "Am I Dreaming" string-quartet sample ([Wikipedia](https://en.wikipedia.org/wiki/Am_I_Dreaming_%28Metro_Boomin,_ASAP_Rocky_and_Roisee_song%29)).
- **Mike Dean:** synths on "Am I Dreaming" (same source); co-producer on "Young Metro" and "Type Shit" ([Wikipedia](https://en.wikipedia.org/wiki/We_Don%27t_Trust_You); [Complex](https://www.complex.com/music/a/tracewilliamcowen/future-metro-boomin-we-dont-trust-you-album-credits); [Wikipedia: Type Shit](https://en.wikipedia.org/wiki/Type_Shit)).
- **David x Eli:** "Superhero" ([Wikiwand](https://www.wikiwand.com/en/articles/Superhero_%28Heroes_%26_Villains%29)) and "Young Metro" ([Complex](https://www.complex.com/music/a/tracewilliamcowen/future-metro-boomin-we-dont-trust-you-album-credits)).
- **Prince85:** co-producer of the *We Don't Trust You* title track, with Chris XZ and D. Rich also credited per Discogs ([Wikipedia](https://en.wikipedia.org/wiki/We_Don%27t_Trust_You); [Discogs](https://www.discogs.com/release/30191456-Future-4-Metro-Boomin-We-Dont-Trust-You)).
- **D. Rich:** "Type Shit" ([Wikipedia](https://en.wikipedia.org/wiki/Type_Shit)).
- **Other *We Don't Trust You* credits:** Will A Fool on "Claustrophobic"; Zaytoven, lil88 and Outta Town on "Ain't No Love"; G Koop on "Where My Twin @" ([Discogs](https://www.discogs.com/release/30191456-Future-4-Metro-Boomin-We-Dont-Trust-You); [Complex](https://www.complex.com/music/a/tracewilliamcowen/future-metro-boomin-we-dont-trust-you-album-credits)).
- **Earlier regulars:** Sonny Digital, 808 Mafia, Zaytoven, Young Chop, DJ Spinz and Tay Keith (Wikipedia-derived list in search results, [production discography](https://www.wikipedia.com/wiki/Metro_Boomin_production_discography)). Zaytoven and Sonny Digital also contributed to *DS2* ([DS2 Wikipedia](https://en.wikipedia.org/wiki/DS2_%28album%29)).
- The FADER's 2016 documentary shows a studio session in Atlanta with Southside and 21 Savage ([The FADER](https://www.thefader.com/2016/04/12/metro-boomin-documentary-video-interview)). On *The Life of Pablo*, Kanye "would give him different records to work with" ([The FADER](https://www.thefader.com/2016/03/07/metro-boomin-talks-working-with-kanye-west-and-kendrick-lamar)).

### Inferences
- **[INF] General MIDI patch palette** (1-based GM numbers) for a MIDI-only generator:

| Part | Patches |
|---|---|
| Lead loop | Flute 74; Music Box 11; Glockenspiel 10; Celesta 9; Tubular Bells 15; Acoustic Grand 1 (eerie high piano); Lead 2 (saw) 82 for sci-fi lines |
| Chords | String Ensemble 1 49; Choir Aahs 53; Voice Oohs 54; Pad 4 (choir) 92; Pad 2 (warm) 90; Church Organ 20 (rare) |
| Counter-melody / pluck | Pizzicato Strings 46; Orchestral Harp 47; Acoustic Grand 1; Tremolo Strings 45 (tension) |
| Brass ("Superhero" horn-heavy) | Brass Section 62; French Horn 61 |
| 808 | Synth Bass 1 39, or a dedicated sine/808 sampler with glide |
| Horror preset FX | FX 6 (goblins) 102; FX 7 (echoes) 103 |

- **[INF] Era presets.**
  - *2014–16 "Future/Thug"*: dark keys or bell loop plus drone/808, minimal.
  - *2016–17 "Savage Mode/Mask Off"*: one sample-like lead (flute or bell) over a single-minor-chord or i–iv vamp, very sparse.
  - *2017 "Without Warning" horror*: music box, bells, eerie piano, wind-like pad, FX lane, reverb-heavy 808.
  - *2018–20 "NAHWC/Savage Mode II"*: soul-sample-style looped phrase (pitched vocal-like lead) plus cinematic pads.
  - *2022–23 "Heroes & Villains/Spider-Verse"*: strings and choir chords, piano, brass hits, choral intro and outro.
  - *2024 "We Don't Trust You"*: warped soul or 80s-rap-style sample loops (sped-up feel) plus classic trap drums.
- **[INF] Who writes the melody.** Credits suggest the melodic seed often comes from collaborators: a Ritter sample, a Peter Lee Johnson string quartet, Lenox strings and choir. Metro's own process still starts with chords or synths. The generator can model this as "seed loop" and "Metro arrangement" stages.

### Gaps
- No first-party, interview-confirmed plugin or sample-library list. Omnisphere, Nexus, Kontakt, Electra and Gross Beat claims are secondary or commercial.
- No primary source on specific presets, sound libraries, or how often he uses live players vs virtual orchestras outside *Heroes & Villains* and the Red Bull show.
- Prince85's and Peter Lee Johnson's exact roles on *We Don't Trust You* (melody vs drums) are not documented.

---

## 5. Arrangement habits and how they change across eras (intros, beat switches, drops, tension)

### Takeaway
Metro's stated philosophy is album-level cohesion: albums should sound like "one idea or one complete thought". He favors restraint ("less is often more"; leave room for the rapper) and builds tension through atmosphere rather than busy arrangement. The documented devices are:
- narrated or spoken intros and between-song bumpers (Morgan Freeman on *Savage Mode II*)
- choral and orchestral intros and outros (*Heroes & Villains*)
- horror sound design (*Without Warning*)
- mid-track beat switches that sometimes hand off to the next track (*Heroes & Villains*)

### Cited Findings

**Philosophy**
- Vice headline: Metro "explains why many hip hop albums aren't as good anymore: they don't sound like one idea or one complete thought" ([Vice](https://www.vice.com/en/article/metro-boomin-explains-why-many-hip-hop-albums-arent-as-good-anymore-they-dont-sound-like-one-idea-or-one-complete-thought/)).
- On the Full Send podcast he describes starting from a basic idea, then having artists and other producers add to it, focusing on what the track lacks (secondary write-up: [Medium](https://medium.com/@HowToRap/metro-boomin-teaches-how-to-make-beats-in-5-steps-bd7b054aca62)).
- In Rolling Stone's "Musicians on Musicians" with Timbaland, the two agree that in beatmaking "less is often more". Timbaland notes "Work It" had only three sounds, and Metro calls it "one of the hardest beats of all time to me" ([Rolling Stone AU](https://au.rollingstone.com/?p=69937); [MusicRadar](https://www.musicradar.com/artists/producers-engineers/timbaland-metro-boomin-pharrell)).
- Secondary: he is "known for making a big impact using space and silence" ([RouteNote](https://create.routenote.com/blog/producer-profile-metro-boomin/)).
- On *What a Time to Be Alive*, most notably "Jumpman", Grantland says Metro "falls somewhere in the middle", leaving room for the rappers ([Grantland](https://grantland.com/hollywood-prospectus/a-note-on-jumpman-by-metro-boomin-ft-drake-and-future)).

**2013–2016: Future and Young Thug era**
- Young Thug's "Some More" (2013) supplied the "want some more" tag ([Wikipedia mirror](https://en.wikipedia.com/wiki/Metro_Boomin)).
- In 2014 Metro and Thug started a collaborative project, *Metro Thuggin* ([The Source](https://thesource.com/2014/03/26/metro-boomin-young-thug-give-us-the-first-leak-off-collaborative-album/)).
- *DS2* (released July 17, 2015):
  - Metro was producer and executive producer; his tracks include "Thought It Was a Drought", "Where Ya At" (ft. Drake) and "Freak Hoe" ([DS2 Wikipedia](https://en.wikipedia.org/wiki/DS2_%28album%29)).
  - The Source said he "once again provided the perfect soundscape for Future" ([The Source](https://thesource.com/2015/12/21/the-source-presents-the-20-best-hip-hoprap-albums-of-2015/19)).
  - AllMusic called the production monotonous (via [DS2 Wikipedia](https://en.wikipedia.org/wiki/DS2_%28album%29)).
- *What a Time to Be Alive* (2015) and "Jumpman" ([Grantland](https://grantland.com/hollywood-prospectus/a-note-on-jumpman-by-metro-boomin-ft-drake-and-future)); *Savage Mode* (2016), with "X" as first single ([Wikipedia](https://wikipedia.com/wiki/X_%2821_Savage_and_Metro_Boomin_song%29)).

**2017–2020: 21 Savage, *Savage Mode*, *Without Warning* era**
- "Mask Off" (2017): a sample-loop-driven single ([Wikipedia](https://en.wikipedia.org/wiki/Mask_Off)).
- *Without Warning* (surprise EP, reviewed Nov 2017):
  - Horror framing with sound effects (laughs, chainsaws, gunshots, wolf howls, music boxes) ([HotNewHipHop](https://www.hotnewhiphop.com/75586-21-savage-offset-and-metro-boomin-without-warning-review-news); [Vice](https://creators.vice.com/en/article/j5jgg3/metro-boomin-21-savage-and-offsets-surprise-ep-is-a-gory-delight); [Cavalier Daily](https://www.cavalierdaily.com/article/2017/11/21-savage-offset-and-metro-boomin-drop-ghoulish-without-warning)).
  - The closer "Darth Vader" was singled out as spacy and atmospheric ([Collegian](https://collegian.com/?p=193627)).
- *Not All Heroes Wear Capes* (2018) includes "Space Cadet" ([Wikipedia](https://en.wikipedia.org/wiki/Space_Cadet_%28song%29)).
- *Savage Mode II* (Oct 2020):
  - Opens with Morgan Freeman narration, which returns mid-album ([NME](https://www.nme.com/reviews/21-savage-metro-boomin-savage-mode-2-review-2776201)).
  - The narration covers the intro, "bumpers between songs" and an interlude about the street code on snitches ([The Needle Drop](https://rosetta.to/u/theneedledrop/21-savage-metro-boomin-savage-mode-ii-album-review)).
  - Slant: "the principal focus of Savage Mode II is Metro Boomin's production" ([Slant](https://www.slantmagazine.com/music/review-21-savage-and-metro-boomins-savage-mode-ii-is-a-dark-robust-sequel)).
  - Exclaim! found it less "game-changing or innovative" ([Exclaim!](https://exclaim.ca/amparticle/21_savage_metro_boomin_savage_mode_2_album_review)).

**2022: *Heroes & Villains***
- Lenox aimed to saturate the album with "orchestral sounds and choral vocal intros and outros" ([Variety via Yahoo](https://ca.news.yahoo.com/hitmaker-month-johan-lenox-brings-195348458.html)).
- Beat switches:
  - One track "starts with a gospel-sounding beat and shifts to a classic eerie Metro Boomin beat about halfway through" ([Ramapo News](https://www.ramaponews.com/?p=11727)).
  - A mid-song switch "makes sense in the transition to the next track" ([Highlander](https://thehighlandernews.com/30438/arts-ent/heroes-villains-album-review)).
- Sequencing praised as a "cinematic experience" (user review, [AOTY](https://www.albumoftheyear.org/user/ander-1/reviews/1/)); "more like a full score" ([30rap](https://30rap.com/metro-boomin-heroes-villains)).
- Dissent: "the most skeletal Metro has delivered", with some tracks "excessively subdued" ([Mic Cheque](https://miccheque.com/2022/12/07/metro-boomin-heroes-and-villains-review)). Fantano gave it 7/10 for "consistent production" blending trap with orchestral additions ([The Needle Drop](https://rosetta.to/u/theneedledrop/metro-boomin-heroes-villains-album-review)).
- Variety coverage frames *Heroes & Villains* as part of an ongoing album series following *Not All Heroes Wear Capes* ([Variety via Yahoo](https://sg.news.yahoo.com/metro-boomin-stellar-heroes-villains-210745332.html)).

**2023: *Across the Spider-Verse***
- "Am I Dreaming" was among the last songs written for the film and started from a major string idea ([Variety via Yahoo](https://uk.news.yahoo.com/producer-metro-boomin-says-spider-220000941.html)).

**2024: *We Don't Trust You* / *We Still Don't Trust You***
- Reviews describe a "cinematic expansion of his trap formula" ([Nuance Magazine](https://thenuancemagazine.com/nuance-news-feed/album-review-we-dont-trust-you-by-future-metro-boomin)), with inventive beats and an ominous tone throughout ([Medium](https://medium.com/modern-music-analysis/we-dont-trust-you-by-future-metro-boomin-album-review-ed41e1013f39)).
- Slant: Future seems to be "set dressing" for Metro's elaborate production ([Slant](https://www.slantmagazine.com/music/future-and-metro-boomin-we-dont-trust-you-album-review/)).
- Clash: the album ranges from trap to warped soul samples ([Clash](https://www.clashmusic.com/reviews/future-metro-boomin-we-dont-trust-you/)).
- Metacritic: 64 from seven critics ([Wikipedia mirror](https://wiki.riteme.site/wiki/WTFYM)).
- A second Medium review covers the April 2024 follow-up *We Still Don't Trust You* ([Medium](https://medium.com/modern-music-analysis/we-still-dont-trust-you-by-future-metro-boomin-album-review-bb4b9931d0b3)). Its release date was not verified here.

**2025–2026**
- The only item found is the "Like That" sample lawsuit filed May 13, 2025 ([Black Enterprise](https://www.blackenterprise.com/rodney-o-sues-kendrick-lamar-future-metro-boomin)). No new production-style material for 2025–26 surfaced.

### Inferences
- **[INF] Proposed song-form template** (bars at the written double-time BPM):
  1. **Intro (4–8 bars):** chords and lead loop only, no drums or 808. Optional filtered start; in *Heroes & Villains* mode, a choir or string swell. Leave a silent slot where narration or a tag would go (no voice content).
  2. **Hook A (16 bars):** full drums and 808.
  3. **Verse (16 bars):** same chord loop, with a thinned lead (drop the lead every other 4 bars, for "space") and hat ornament variation.
  4. **Hook A (16 bars).**
  5. **Optional beat switch at ~60–70% of length** (*Heroes & Villains* mode): new 2–4 chord loop, or a key change to the relative or parallel minor, or a texture swap (gospel/orchestral ↔ eerie trap), sometimes with half the drum density.
  6. **Outro (4–8 bars):** drums out, strings and choir sustain, or a lead-only fade.
- **[INF] Tension devices.** Low-probability beat stops: mute drums and 808 for the last 1–2 beats before a hook. Sustained choir or strings crescendo over the final 2 bars of the intro. A filtered-to-open lead on the intro. Only the beat switches and orchestral or choral intros and outros are directly sourced; the rest are genre defaults.
- **[INF] Minimalism constraint.** Cap simultaneous melodic layers at 3 (lead, chords, counter or pad) plus drums and 808. This follows the "less is more" and three-sounds discussion and Hooktheory's "below-average complexity" for "Mask Off".

### Gaps
- No bar-by-bar arrangement maps (section lengths, where drums drop) for any Metro track were found.
- No source documents reverse cymbals, risers or "beat stops" as Metro habits.
- Which *Heroes & Villains* tracks the reviewers' beat-switch remarks refer to was not identified in the snippets.
- 2025–2026 projects and any stylistic shift are undocumented in the results.

---

## 6. Transcriptions and chord charts (Hooktheory, Chordify, tabs, sheet music)

### Takeaway
A few public analyses exist:
- Hooktheory TheoryTabs for "Mask Off" and "Bad and Boujee"
- an Ultimate Guitar tab for "Mask Off"
- Medium "Weekly Billboard Theory" posts on "Mask Off", "Bad and Boujee" and "Congratulations"
- a capo-based guitar chart and published piano arrangements for "Creepin'"
- automated chord lists from klang.io

They agree on minor tonalities and simple loops but disagree on exact chords. No Chordify page was found.

### Cited Findings
- **Hooktheory "Mask Off"** TheoryTab: D minor, below-average complexity ([Hooktheory](https://hooktheory.com/theorytab/view/future/mask-off)). The page itself could not be opened.
- **Hooktheory "Bad and Boujee"** TheoryTab: D minor ([Hooktheory](https://www.hooktheory.com/theorytab/view/migos-ft-lil-uzi-vert/bad-and-boujee)). This conflicts with Tunebat's E♭ minor (see section 1).
- **Ultimate Guitar "Mask Off"** (user tab): Dm, Gm, C; intro and outro Dm–Gm–C–Dm ([Ultimate Guitar](https://tabs.ultimate-guitar.com/tab/future/mask-off-chords-1984805)).
- **Medium "Weekly Billboard Theory"**
  - "Mask Off": D minor, i–VI–v–i ([Medium](https://medium.com/that-good-you-need/weekly-billboard-theory-mask-off-2d33c60cf37f)).
  - "Bad and Boujee": the author used an "open key" but says it should be E♭ minor ([Medium](https://medium.com/that-good-you-need/weekly-billboard-theory-bad-and-boujee-a6b3723efe8b)).
  - "Congratulations": 124 BPM ([Medium](https://medium.com/that-good-you-need/weekly-billboard-theory-congratulations-451db13f96e1)).
  - A separate post says "Bad and Boujee" has more variation in its longer musical ideas than "Tunnel Vision", with an especially rhythmic chorus ([Medium](https://medium.com/that-good-you-need/weekly-billboard-theory-tunnel-vision-958b3c28a841)).
- **"Creepin'" guitar chords:** Key Am with capo 4 (sounding C♯m); shapes Am, Em, F, C, E ([GuitarTabsExplorer](https://www.guitartabsexplorer.com/metro-boomin/creepin-chords)).
- **"Creepin'" published piano arrangements** with chords: [Sheet Music Plus](https://www.sheetmusicplus.com/en/product/creepin-22672725.html), [Musicnotes](https://api.musicnotes.com/sheetmusic/kimbo/creepin/MN0267132) and [Sheet Music Direct (easy piano)](https://www.sheetmusicdirect.com/se/ID_No/1464896/Product.aspx). Contents were not inspected.
- **klang.io automated chord lists:**
  - "Like That": D♯m, F♯, E, C♯, C♯m, B, F♯m, D♯ ([klang.io](https://songs.klang.io/en/s/Future/Like%20That/N9bKBAA22Go)). This conflicts with Karaoke Version's C♯m.
  - "Creepin'": C, G, E, A, G♯m, C♯m, B, G♯, Em, D♯m, C♯, F♯ ([klang.io](https://songs.klang.io/en/s/Metro%20Boomin/Creepin%27%20%28with%20The%20Weeknd%20%26%2021%20Savage%29/6DWjiWEmxME)).
  - These are noisy machine outputs.
- **Karaoke Version backing tracks** state the original tempo and key: "Creepin'" 98 BPM; "Like That" ~162 BPM in C♯m; "Type Shit" 145 BPM; "X" 74.5 BPM in Bm ([Creepin'](https://www.karaoke-version.com/mp3-backingtrack/21-savage/creepin.html); [Like That](https://www.karaoke-version.com/mp3-backingtrack/future/like-that.html); [Type Shit](https://www.karaoke-version.com/mp3-backingtrack/future/type-shit.html); [X](https://www.karaoke-version.com/mp3-backingtrack/future/x.html)).

### Inferences
- **[INF]** For a degree-based generator, the reliable common ground is a minor tonic with 2–4 diatonic chords per loop (i, iv, v, VI, VII, III), optionally a major V for R&B color. Use the chord-loop templates in section 2. Do not rely on any single site's exact chord spelling.
- **[INF]** Klang's chord lists contain both C♯m and C♯ and both F♯m and F♯. This suggests modal mixture or misdetection, so they should not be used to infer borrowed chords.

### Gaps
- No Chordify page was found. Hooktheory chord and melody data for "Mask Off" and "Bad and Boujee" could not be read (host blocked). No TheoryTab was found for "Superhero", "Creepin'", "Like That", "Type Shit", "Space Cadet" or "Jumpman".
- No melody transcriptions are included, by design (copyright constraint). Lead-loop defaults in section 2 are generic [INF] rules, not derived from specific Metro melodies.
