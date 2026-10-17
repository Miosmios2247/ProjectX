// Seeded random numbers. Every idea is reproducible from its seeds,
// so the same seed always gives the same notes (history, ratings, plugin).

export interface Rng {
  readonly seed: number;
  /** Uniform float in [0, 1). */
  next(): number;
  /** Integer in [min, max], both inclusive. */
  int(min: number, max: number): number;
  chance(p: number): boolean;
  pick<T>(items: readonly T[]): T;
  /** Pick by weight; items with weight <= 0 are never chosen. */
  weighted<T>(items: readonly T[], weight: (item: T) => number): T;
  /** Independent stream derived from this seed and a salt. */
  fork(salt: string | number): Rng;
}

/** FNV-1a 32-bit hash. */
export function hashString(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function deriveSeed(seed: number, salt: string | number): number {
  return hashString(`${seed >>> 0}:${salt}`);
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  // mulberry32
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng: Rng = {
    seed: seed >>> 0,
    next,
    int(min, max) {
      return min + Math.floor(next() * (max - min + 1));
    },
    chance(p) {
      return next() < p;
    },
    pick(items) {
      if (items.length === 0) throw new Error("pick() on empty list");
      return items[Math.floor(next() * items.length)];
    },
    weighted(items, weight) {
      let total = 0;
      for (const item of items) total += Math.max(0, weight(item));
      if (total <= 0) return rng.pick(items);
      let r = next() * total;
      for (const item of items) {
        r -= Math.max(0, weight(item));
        if (r < 0) return item;
      }
      return items[items.length - 1];
    },
    fork(salt) {
      return createRng(deriveSeed(seed, salt));
    },
  };
  return rng;
}

/** A fresh random seed (not reproducible; only for "Neue Idee"). */
export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
