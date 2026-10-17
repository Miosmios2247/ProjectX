// Reference comparison: a song the rater loads stays in the browser; only a few
// numbers about its sound are measured and compared with the idea (loudness,
// tonal balance, tempo, how much it pumps). Pure functions, tested in lab/test.

export interface MixProfile {
  /** Ungated K-weighted loudness (LUFS). */
  lufs: number;
  /** Share of the energy per band (dB relative to the whole), see BANDS. */
  bands: number[];
  /** Tempo estimate (beats per minute), null if unclear. */
  bpm: number | null;
  /** Depth (dB) of the level dip that follows each beat above 300 Hz: the sidechain pump. */
  pump: number;
}

export const BANDS: { name: string; lo: number; hi: number }[] = [
  { name: "Sub-Bass", lo: 20, hi: 60 },
  { name: "Bass", lo: 60, hi: 250 },
  { name: "Mitten", lo: 250, hi: 2000 },
  { name: "Präsenz", lo: 2000, hi: 6000 },
  { name: "Höhen", lo: 6000, hi: 16000 },
];

function biquad(x: Float32Array, b: number[], a: number[]): Float32Array {
  const y = new Float32Array(x.length);
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = (b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2) / a[0];
    x2 = x1;
    x1 = x[i];
    y2 = y1;
    y1 = v;
    y[i] = v;
  }
  return y;
}

/** Ungated ITU-R BS.1770 loudness of one or two channels. */
export function loudness(chs: Float32Array[], rate: number): number {
  const G = 3.999843853973347;
  let Q = 0.7071752369554196;
  let fc = 1681.974450955533;
  const A = 10 ** (G / 40);
  let w0 = (2 * Math.PI * fc) / rate;
  let alpha = Math.sin(w0) / (2 * Q);
  let c = Math.cos(w0);
  const hsB = [A * (A + 1 + (A - 1) * c + 2 * Math.sqrt(A) * alpha), -2 * A * (A - 1 + (A + 1) * c), A * (A + 1 + (A - 1) * c - 2 * Math.sqrt(A) * alpha)];
  const hsA = [A + 1 - (A - 1) * c + 2 * Math.sqrt(A) * alpha, 2 * (A - 1 - (A + 1) * c), A + 1 - (A - 1) * c - 2 * Math.sqrt(A) * alpha];
  Q = 0.5003270373238773;
  fc = 38.13547087602444;
  w0 = (2 * Math.PI * fc) / rate;
  alpha = Math.sin(w0) / (2 * Q);
  c = Math.cos(w0);
  const hpB = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
  const hpA = [1 + alpha, -2 * c, 1 - alpha];
  let sum = 0;
  let n = 0;
  for (const ch of chs) {
    const k = biquad(biquad(ch, hsB, hsA), hpB, hpA);
    for (let i = 0; i < k.length; i++) sum += k[i] * k[i];
    n = Math.max(n, k.length);
  }
  return -0.691 + 10 * Math.log10(sum / Math.max(1, n) + 1e-12);
}

/** In-place radix-2 FFT (re, im of length 2^k). */
function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let j = 0; j < len / 2; j++) {
        const ar = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci;
        const ai = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr;
        re[i + j + len / 2] = re[i + j] - ar;
        im[i + j + len / 2] = im[i + j] - ai;
        re[i + j] += ar;
        im[i + j] += ai;
        const t = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = t;
      }
    }
  }
}

/** Energy share per band (dB relative to all bands), from averaged spectra. */
export function bandBalance(x: Float32Array, rate: number): number[] {
  const N = 4096;
  const energy = BANDS.map(() => 0);
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  for (let at = 0; at + N <= x.length; at += N) {
    for (let i = 0; i < N; i++) {
      re[i] = x[at + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N));
      im[i] = 0;
    }
    fft(re, im);
    for (let k = 1; k < N / 2; k++) {
      const f = (k * rate) / N;
      const p = re[k] * re[k] + im[k] * im[k];
      BANDS.forEach((b, i) => {
        if (f >= b.lo && f < b.hi) energy[i] += p;
      });
    }
  }
  const total = energy.reduce((a, b) => a + b, 0) || 1;
  return energy.map((e) => 10 * Math.log10(e / total + 1e-12));
}

/** Short-time energy envelope (dB) in frames of `hop` seconds. */
function envelope(x: Float32Array, rate: number, hop: number): number[] {
  const n = Math.max(1, Math.round(hop * rate));
  const out: number[] = [];
  for (let at = 0; at + n <= x.length; at += n) {
    let s = 0;
    for (let i = at; i < at + n; i++) s += x[i] * x[i];
    out.push(10 * Math.log10(s / n + 1e-12));
  }
  return out;
}

/** Tempo from the autocorrelation of the onset strength (rises of the envelope), 70–180 BPM. */
export function estimateTempo(x: Float32Array, rate: number): number | null {
  const hop = 0.01;
  const env = envelope(x, rate, hop);
  const onset = env.map((v, i) => (i ? Math.max(0, v - env[i - 1]) : 0));
  const mean = onset.reduce((a, b) => a + b, 0) / Math.max(1, onset.length);
  const o = onset.map((v) => v - mean);
  let best = 0;
  let bestLag = 0;
  for (let bpm = 70; bpm <= 180; bpm += 0.5) {
    const lag = 60 / bpm / hop;
    let s = 0;
    for (let i = 0; i + lag * 2 < o.length; i++) {
      const a = Math.round(i + lag);
      const b = Math.round(i + lag * 2);
      s += o[i] * (o[a] + 0.5 * o[b]);
    }
    // House sits at 115–135 BPM: a mild preference keeps half or double tempo out.
    const prior = bpm >= 110 && bpm <= 140 ? 1.08 : 1;
    if (s * prior > best) {
      best = s * prior;
      bestLag = lag;
    }
  }
  return bestLag ? Math.round((60 / (bestLag * hop)) * 10) / 10 : null;
}

/**
 * Pump depth: the envelope above 300 Hz (the kick taken out) folded onto one
 * beat; how far its dip falls below its typical level (dB). A steady pad gives
 * about 0, a pad ducked by every kick several dB.
 */
export function pumpDepth(x: Float32Array, rate: number, bpm: number): number {
  const w0 = (2 * Math.PI * 300) / rate;
  const alpha = Math.sin(w0) / (2 * 0.7071);
  const c = Math.cos(w0);
  const b = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
  const a = [1 + alpha, -2 * c, 1 - alpha];
  const hp = biquad(biquad(x, b, a), b, a);
  const hop = 0.005;
  const env = envelope(hp, rate, hop);
  const beat = 60 / bpm / hop;
  const bins = 24;
  const sums = new Array(bins).fill(0);
  const counts = new Array(bins).fill(0);
  // The fold is circular, so its depth does not depend on where the beats start.
  env.forEach((v, i) => {
    const phase = (i % beat) / beat;
    const b = Math.min(bins - 1, Math.floor(phase * bins));
    sums[b] += v;
    counts[b] += 1;
  });
  const fold = sums.map((s, i) => (counts[i] ? s / counts[i] : -120));
  // Smooth over neighbouring bins (circular) so single hits do not count as a pump.
  const smooth = fold.map((_, i) => (fold[(i - 1 + bins) % bins] + fold[i] + fold[(i + 1) % bins]) / 3);
  const sorted = [...smooth].sort((p, q) => p - q);
  return sorted[Math.floor(bins / 2)] - sorted[0];
}

export function mixDown(chs: Float32Array[]): Float32Array {
  if (chs.length === 1) return chs[0];
  const n = Math.min(...chs.map((c) => c.length));
  const out = new Float32Array(n);
  for (const c of chs) for (let i = 0; i < n; i++) out[i] += c[i] / chs.length;
  return out;
}

/** Measures a mix; long songs are measured on at most `maxSeconds` from `from`. */
export function analyzeMix(chs: Float32Array[], rate: number, opts: { bpm?: number; from?: number; maxSeconds?: number } = {}): MixProfile {
  const a = Math.round((opts.from ?? 0) * rate);
  const b = Math.min(chs[0].length, a + Math.round((opts.maxSeconds ?? 30) * rate));
  const part = chs.map((c) => c.subarray(a, b));
  const mono = mixDown(part);
  const bpm = opts.bpm ?? estimateTempo(mono, rate);
  return {
    lufs: loudness(part, rate),
    bands: bandBalance(mono, rate),
    bpm,
    pump: bpm ? pumpDepth(mono, rate, bpm) : 0,
  };
}

/** Start (seconds) of the loudest stretch of `seconds`, usually a drop. */
export function loudestStretch(x: Float32Array, rate: number, seconds: number): number {
  const env = envelope(x, rate, 0.5);
  const w = Math.max(1, Math.round(seconds / 0.5));
  let best = 0;
  let bestAt = 0;
  for (let i = 0; i + w <= env.length; i++) {
    let s = 0;
    for (let j = i; j < i + w; j++) s += 10 ** (env[j] / 10);
    if (s > best) {
      best = s;
      bestAt = i;
    }
  }
  return bestAt * 0.5;
}

/** Plain-language differences that are big enough to hear. */
export function compareMix(ref: MixProfile, idea: MixProfile): string[] {
  const out: string[] = [];
  BANDS.forEach((b, i) => {
    const d = idea.bands[i] - ref.bands[i];
    if (Math.abs(d) >= 3) out.push(`${b.name}: in der Idee ${Math.abs(d).toFixed(0)} dB ${d > 0 ? "mehr" : "weniger"} als im Vorbild.`);
  });
  const pump = idea.pump - ref.pump;
  if (Math.abs(pump) >= 2) out.push(`Pumpen: Die Idee pumpt ${pump > 0 ? "stärker" : "schwächer"} (${idea.pump.toFixed(0)} dB gegen ${ref.pump.toFixed(0)} dB).`);
  if (ref.bpm && idea.bpm && Math.abs(ref.bpm - idea.bpm) >= 3) {
    out.push(`Tempo: Vorbild etwa ${Math.round(ref.bpm)} BPM, Idee ${Math.round(idea.bpm)} BPM.`);
  }
  if (!out.length) out.push("Klangbalance, Pumpen und Tempo liegen nah am Vorbild.");
  return out;
}
