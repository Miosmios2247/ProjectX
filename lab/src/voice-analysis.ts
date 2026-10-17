// Analysis of a short voice recording (sung or spoken): syllable slices with
// their pitch, and a steady vowel that can be looped and stretched. Pure
// functions on raw samples, so they run in tests without a browser.

export interface VoiceSlice {
  /** Start and end in seconds. */
  start: number;
  end: number;
  /** Fundamental frequency in Hz, 0 when the slice has no clear pitch. */
  f0: number;
  /** Mean level in dB relative to the loudest frame. */
  level: number;
}

export interface VoiceSustain {
  /** The vowel region in seconds; playback starts at `start`. */
  start: number;
  end: number;
  /** Loop points (seconds), a whole number of pitch periods apart. */
  loopStart: number;
  loopEnd: number;
  f0: number;
}

export interface VoiceAnalysis {
  duration: number;
  /** Gain that brings the loudest sample to about -1 dBFS. */
  gain: number;
  slices: VoiceSlice[];
  sustain: VoiceSustain | null;
}

const HOP = 0.01; // envelope hop (s)
const PITCH_RATE = 16000;
const F0_MIN = 70;
const F0_MAX = 900;

function rmsEnvelope(x: Float32Array, rate: number): number[] {
  const hop = Math.max(1, Math.round(HOP * rate));
  const win = hop * 2;
  const env: number[] = [];
  for (let i = 0; i + hop <= x.length; i += hop) {
    let sum = 0;
    const end = Math.min(x.length, i + win);
    for (let j = i; j < end; j++) sum += x[j] * x[j];
    env.push(10 * Math.log10(sum / (end - i) + 1e-12));
  }
  return env;
}

/** Linear resampling after a short moving-average low-pass. */
function resample(x: Float32Array, from: number, to: number): Float32Array {
  if (from === to) return x;
  const ratio = from / to;
  const k = Math.max(1, Math.round(ratio));
  const smooth = new Float32Array(x.length);
  let acc = 0;
  for (let i = 0; i < x.length; i++) {
    acc += x[i];
    if (i >= k) acc -= x[i - k];
    smooth[i] = acc / Math.min(k, i + 1);
  }
  const out = new Float32Array(Math.floor(x.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const p = i * ratio;
    const p0 = Math.floor(p);
    const f = p - p0;
    out[i] = smooth[p0] * (1 - f) + (smooth[p0 + 1] ?? smooth[p0]) * f;
  }
  return out;
}

/**
 * YIN pitch estimate for one frame starting at `at` (samples at PITCH_RATE).
 * Returns f0 = 0 when the frame has no clear periodicity.
 */
export function yinFrame(x: Float32Array, at: number, rate = PITCH_RATE): { f0: number; clarity: number } {
  const tauMin = Math.floor(rate / F0_MAX);
  const tauMax = Math.ceil(rate / F0_MIN);
  const w = tauMax;
  if (at + w + tauMax >= x.length) return { f0: 0, clarity: 0 };
  const d = new Float32Array(tauMax + 1);
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let j = 0; j < w; j++) {
      const diff = x[at + j] - x[at + j + tau];
      sum += diff * diff;
    }
    d[tau] = sum;
  }
  // Cumulative mean normalised difference.
  const c = new Float32Array(tauMax + 1);
  c[0] = 1;
  let running = 0;
  for (let tau = 1; tau <= tauMax; tau++) {
    running += d[tau];
    c[tau] = running > 0 ? (d[tau] * tau) / running : 1;
  }
  let best = -1;
  for (let tau = tauMin; tau <= tauMax; tau++) {
    if (c[tau] < 0.15) {
      while (tau + 1 <= tauMax && c[tau + 1] < c[tau]) tau++;
      best = tau;
      break;
    }
  }
  if (best < 0) {
    let min = Infinity;
    for (let tau = tauMin; tau <= tauMax; tau++) {
      if (c[tau] < min) {
        min = c[tau];
        best = tau;
      }
    }
    if (min > 0.3) return { f0: 0, clarity: 1 - min };
  }
  // Parabolic interpolation around the minimum.
  const a = c[best - 1] ?? c[best];
  const b = c[best];
  const e = c[best + 1] ?? c[best];
  const den = a - 2 * b + e;
  const shift = den !== 0 ? (0.5 * (a - e)) / den : 0;
  const tau = best + Math.max(-1, Math.min(1, shift));
  return { f0: rate / tau, clarity: 1 - b };
}

function median(v: number[]): number {
  const s = [...v].sort((p, q) => p - q);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}

const cents = (f: number, ref: number) => 1200 * Math.log2(f / ref);

/** Frame-wise pitch track of a region (seconds), sampled every 20 ms. */
function pitchTrack(low: Float32Array, start: number, end: number): number[] {
  const out: number[] = [];
  const hop = Math.round(0.02 * PITCH_RATE);
  for (let i = Math.round(start * PITCH_RATE); i < Math.round(end * PITCH_RATE); i += hop) {
    const { f0 } = yinFrame(low, i);
    out.push(f0);
  }
  return out;
}

/** Splits [a, b) (frame indices) at clear dips of the envelope (syllables). */
function splitSyllables(env: number[], a: number, b: number, out: [number, number][]): void {
  const maxLen = 45; // 450 ms
  if (b - a <= maxLen) {
    out.push([a, b]);
    return;
  }
  let best = -1;
  let bestDepth = 4;
  for (let i = a + 8; i < b - 8; i++) {
    const v = (env[i - 1] + env[i] + env[i + 1]) / 3;
    let left = -Infinity;
    let right = -Infinity;
    for (let j = Math.max(a, i - 12); j < i; j++) left = Math.max(left, env[j]);
    for (let j = i + 1; j <= Math.min(b - 1, i + 12); j++) right = Math.max(right, env[j]);
    const depth = Math.min(left, right) - v;
    if (depth > bestDepth) {
      bestDepth = depth;
      best = i;
    }
  }
  if (best > 0) {
    splitSyllables(env, a, best, out);
    splitSyllables(env, best, b, out);
    return;
  }
  // No dip: even chunks of about 300 ms.
  const parts = Math.ceil((b - a) / 30);
  const size = (b - a) / parts;
  for (let k = 0; k < parts; k++) out.push([Math.round(a + k * size), Math.round(a + (k + 1) * size)]);
}

/** Nearest rising zero crossing to sample `i` within `range` samples. */
function risingZero(x: Float32Array, i: number, range: number): number {
  for (let k = 0; k <= range; k++) {
    for (const j of [i + k, i - k]) {
      if (j > 0 && j < x.length && x[j - 1] <= 0 && x[j] > 0) return j;
    }
  }
  return i;
}

export function analyzeVoice(data: Float32Array, rate: number): VoiceAnalysis {
  const duration = data.length / rate;
  let peak = 0;
  for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
  const gain = peak > 0 ? Math.min(30, 0.89 / peak) : 1;
  const env = rmsEnvelope(data, rate);
  const top = Math.max(...env);
  const threshold = Math.max(top - 32, -60);

  // Active regions, small gaps merged, very short blips dropped.
  const regions: [number, number][] = [];
  let i = 0;
  while (i < env.length) {
    if (env[i] < threshold) {
      i++;
      continue;
    }
    let j = i;
    while (j < env.length) {
      if (env[j] >= threshold) j++;
      else {
        let k = j;
        while (k < env.length && env[k] < threshold && k - j < 4) k++;
        if (k < env.length && env[k] >= threshold && k - j < 4) j = k;
        else break;
      }
    }
    if (j - i >= 7) regions.push([i, j]);
    i = j + 1;
  }
  const frames: [number, number][] = [];
  for (const [a, b] of regions) splitSyllables(env, a, b, frames);

  const low = resample(data, rate, PITCH_RATE);
  const slices: VoiceSlice[] = [];
  const tracks: number[][] = [];
  for (const [a, b] of frames.slice(0, 48)) {
    const start = a * HOP;
    const end = Math.min(duration, b * HOP + HOP);
    const len = end - start;
    const track = pitchTrack(low, start + len * 0.15, end - len * 0.15);
    const voiced = track.filter((f) => f > 0);
    const f0 = voiced.length >= Math.max(1, track.length * 0.4) ? median(voiced) : 0;
    let lv = 0;
    for (let k = a; k < b; k++) lv += env[k];
    slices.push({ start, end, f0, level: lv / Math.max(1, b - a) - top });
    tracks.push(voiced);
  }

  // The steadiest long vowel becomes the sustain region.
  let sustain: VoiceSustain | null = null;
  let bestScore = 0;
  slices.forEach((s, k) => {
    if (s.f0 <= 0) return;
    const len = s.end - s.start;
    const spread = tracks[k].length > 1 ? Math.max(...tracks[k].map((f) => Math.abs(cents(f, s.f0)))) : 100;
    const steadiness = Math.max(0.15, 1 - spread / 300);
    const loud = Math.pow(10, s.level / 20);
    const score = Math.min(len, 0.8) * steadiness * loud;
    if (score <= bestScore) return;
    // Grow over neighbouring slices of the same held note (one long vowel).
    let first = k;
    let last = k;
    const same = (o: VoiceSlice | undefined, edge: number) =>
      !!o && o.f0 > 0 && Math.abs(cents(o.f0, s.f0)) < 50 && Math.abs(edge) < 0.03;
    while (same(slices[first - 1], slices[first].start - (slices[first - 1]?.end ?? 0))) first--;
    while (same(slices[last + 1], (slices[last + 1]?.start ?? 0) - slices[last].end)) last++;
    const a = slices[first].start;
    const b = slices[last].end;
    const from = a + Math.min(0.12, (b - a) * 0.25);
    const to = Math.min(b - Math.min(0.08, (b - a) * 0.15), from + 0.6);
    const period = rate / s.f0;
    const loopStart = risingZero(data, Math.round(from * rate), Math.round(period / 2));
    const periods = Math.max(1, Math.floor((to * rate - loopStart) / period));
    const loopEnd = risingZero(data, Math.round(loopStart + periods * period), Math.round(period / 4));
    if (loopEnd <= loopStart) return;
    bestScore = score;
    sustain = { start: from, end: to, loopStart: loopStart / rate, loopEnd: loopEnd / rate, f0: s.f0 };
  });

  return { duration, gain, slices, sustain };
}

/** Playback rate that moves `f0` to `target`, folded into ±6 semitones by octaves. */
export function foldedRate(target: number, f0: number): number {
  if (f0 <= 0) return 1;
  let r = target / f0;
  while (r > Math.SQRT2) r /= 2;
  while (r < Math.SQRT1_2) r *= 2;
  return r;
}

/** Semitones that move `f0` to the pitch class of `targetMidi`, folded into ±6 by octaves. */
export function foldedShift(targetMidi: number, f0: number): number {
  if (f0 <= 0) return 0;
  const d = targetMidi - (69 + 12 * Math.log2(f0 / 440));
  let s = ((d % 12) + 12) % 12;
  if (s > 6) s -= 12;
  return s;
}

/** Indices of the clearest syllables (voiced, loud, 0.1–0.5 s long), best first. */
export function bestSlices(a: VoiceAnalysis, count = 10): number[] {
  const score = (s: VoiceSlice) => {
    const len = s.end - s.start;
    return (s.f0 > 0 ? 1 : 0.3) + Math.max(-1, s.level / 30) - Math.abs(len - 0.25) * 1.5;
  };
  return a.slices
    .map((s, i) => ({ i, v: score(s) }))
    .sort((p, q) => q.v - p.v)
    .slice(0, count)
    .map((x) => x.i);
}

/**
 * Pitch marks of a voiced region (sample indices): one per period on the
 * waveform's peaks, followed period by period so slow pitch drifts are kept.
 */
export function pitchMarks(x: Float32Array, rate: number, start: number, end: number, f0: number): number[] {
  const period = rate / f0;
  const a = Math.max(0, Math.round(start * rate));
  const b = Math.min(x.length, Math.round(end * rate));
  let first = a;
  let best = -Infinity;
  for (let i = a; i < Math.min(b, a + Math.round(period)); i++) {
    if (x[i] > best) {
      best = x[i];
      first = i;
    }
  }
  const marks = [first];
  const reach = Math.max(1, Math.round(period * 0.2));
  let m = first;
  while (m + period < b) {
    const guess = Math.round(m + period);
    let peak = guess;
    let value = -Infinity;
    for (let i = Math.max(m + 1, guess - reach); i <= Math.min(b - 1, guess + reach); i++) {
      if (x[i] > value) {
        value = x[i];
        peak = i;
      }
    }
    if (peak <= m) break;
    marks.push(peak);
    m = peak;
  }
  return marks;
}

/**
 * TD-PSOLA: the region [start, end) in seconds moved by `semitones`, keeping its
 * length and its vowel colour (no "chipmunk" voice). Each period is cut out with
 * a two-period window and laid down again at the new period spacing. Regions
 * without a pitch come back unchanged.
 */
export function psola(x: Float32Array, rate: number, start: number, end: number, f0: number, semitones: number): Float32Array {
  const a = Math.max(0, Math.round(start * rate));
  const b = Math.min(x.length, Math.round(end * rate));
  const n = Math.max(0, b - a);
  if (f0 <= 0 || Math.abs(semitones) < 0.01 || n < 8) return x.slice(a, b);
  const marks = pitchMarks(x, rate, start, end, f0);
  if (marks.length < 3) return x.slice(a, b);
  const period = rate / f0;
  const hop = period / Math.pow(2, semitones / 12);
  const half = Math.max(2, Math.round(period));
  const out = new Float32Array(n);
  const norm = new Float32Array(n);
  let k = 0;
  for (let t = marks[0] - a; t < n + half; t += hop) {
    const at = t + a;
    while (k + 1 < marks.length && Math.abs(marks[k + 1] - at) <= Math.abs(marks[k] - at)) k++;
    const c = marks[k];
    const center = Math.round(t);
    for (let j = -half; j <= half; j++) {
      const src = c + j;
      const dst = center + j;
      if (src < a || src >= b || dst < 0 || dst >= n) continue;
      const w = 0.5 + 0.5 * Math.cos((Math.PI * j) / half);
      out[dst] += x[src] * w;
      norm[dst] += w;
    }
  }
  // Even out the overlap of the windows; the edges keep the original sound.
  for (let i = 0; i < n; i++) out[i] = norm[i] > 0.25 ? out[i] / norm[i] : x[a + i];
  return out;
}
