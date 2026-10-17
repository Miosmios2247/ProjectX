// Groove: swing and velocity feel, applied when notes are played or exported.

/**
 * Map a 16th-step position to beats (quarter notes) with swing.
 * swing 0.5 = straight; 0.6 = the second 16th of each 8th comes late.
 */
export function stepToBeat(step: number, swing: number): number {
  const pair = Math.floor(step / 2);
  const within = step - pair * 2; // 0..2
  const frac = within <= 1 ? within * swing : swing + (within - 1) * (1 - swing);
  return pair * 0.5 + frac * 0.5;
}

export function clampVel(v: number): number {
  return Math.max(1, Math.min(127, Math.round(v)));
}

/** Slight accent on beats and downbeats; random variation is added by the caller. */
export function accent(step: number): number {
  const s = ((step % 16) + 16) % 16;
  if (s === 0) return 6;
  if (s % 4 === 0) return 3;
  if (s % 2 === 0) return 0;
  return -4;
}
