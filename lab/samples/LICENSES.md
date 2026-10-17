# Sample licenses

The audio samples in this folder are used by the Hör-Labor preview sounds.

## FluidR3 GM (piano, epiano, guitar, nylon, strings, trumpet, harmonica, kit)

MP3 renders from the FluidR3 GM SoundFont, taken from the npm package
`soundfont-for-samplers` (v0.0.3, MIT).

FluidR3 SoundFont, Copyright (c) 2000-2002, 2008, 2013 Frank Wen <getfrank@gmail.com>.
Licensed under the MIT License:

> Permission is hereby granted, free of charge, to any person obtaining a copy of this
> software and associated documentation files (the "Software"), to deal in the Software
> without restriction, including without limitation the rights to use, copy, modify, merge,
> publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
> to whom the Software is furnished to do so, subject to the following conditions:
> The above copyright notice and this permission notice shall be included in all copies or
> substantial portions of the Software.
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

## GeneralUser GS (vox: "oohs", "aahs")

Voice samples extracted (loops unrolled, resampled to 24 kHz mono) from GeneralUser GS
v1.471 by S. Christian Collins (npm package `generaluser`). License v2.0, excerpt:

> You may use GeneralUser GS without restriction for your own music creation, private or
> commercial. This SoundFont bank is provided to the community free of charge. Please feel
> free to use it in your software projects, and to modify the SoundFont bank or its
> packaging to suit your needs.

The author notes that the origin of some samples cannot be fully guaranteed; check again
before using these samples in a commercial product.

## Salamander Grand Piano V3 (grand-soft, grand-hard)

Piano samples by Alexander Holm, licensed under
[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)
(source: archive.org/details/SalamanderGrandPianoV3). Taken from the npm packages
`@audio-samples/piano-mp3-velocity4` (soft layer) and `@audio-samples/piano-mp3-velocity12`
(hard layer), v1.0.5 by Jan Forst (packaging MIT). Changes: every third semitone from A1 to C7
(C, D#, F#, A), cut to 5 seconds with a fade-out, mono, re-encoded as MP3. The files are named
with flats (`Eb4.mp3` = D#4, `Gb4.mp3` = F#4).

## Sonic Pi samples (kit5, texture)

Drum one-shots and the vinyl crackle from the Sonic Pi sample library, released under
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) (public domain). Taken from the
npm package `supersonic-scsynth-samples` (v0.91.0, CC0-1.0); its PROVENANCE.md lists the
Freesound originals, also CC0. Changes: cut, faded out, peak-normalised to −1 dBFS, mono MP3.

| File | Sonic Pi sample | Original on freesound.org |
|---|---|---|
| kit5/kick-haus.mp3 | bd_haus | Rodrigo The Mad, sound 137722 |
| kit5/kick-tek.mp3 | bd_tek | DWSD, sound 171104 |
| kit5/kick-klub.mp3 | bd_klub | zgump, sound 83262 |
| kit5/kick-pure.mp3 | bd_pure | EKVelika, sound 209571 |
| kit5/kick-gas.mp3 | bd_gas | menegass, sound 89460 |
| kit5/hat-gem.mp3 | hat_gem | IanStarGem, sound 273186 |
| kit5/hat-cab.mp3 | hat_cab | cabled_mess, sound 363203 |
| kit5/hat-zap.mp3 | hat_zap | TheEndOfACycle, sound 674295 |
| kit5/hat-star.mp3 | hat_star | IanStarGem, sound 269720 |
| kit5/hat-acoustic.mp3 | drum_cymbal_closed | menegass, sound 100053 |
| kit5/hat-gump.mp3 | hat_gump | zgump, sound 96144 |
| kit5/hat-open-acoustic.mp3 | drum_cymbal_open | menegass, sound 100055 |
| kit5/snare-dub.mp3 | sn_dub | Adriak909, sound 173142 |
| kit5/snare-dolf.mp3 | sn_dolf | Dolfeus, sound 57534 |
| kit5/snare-generic.mp3 | sn_generic | hullum, sound 415582 |
| kit5/snare-elec.mp3 | elec_snare | looppool, sound 13146 |
| kit5/snap.mp3 | perc_snap | SoundCollectah, sound 109400 |
| kit5/crash.mp3 | drum_splash_hard | menegass, sound 100060 |
| kit5/impact.mp3 | perc_impact1 | hullum, sound 415578 |
| texture/vinyl.mp3 | vinyl_hiss | veezay, sound 130393 |
