// Piano-roll drawing for one lane (canvas, theme colors from CSS tokens).

import type { DrumHit, DrumInst, Note } from "../../engine/src/index";

export interface RollColors {
  note: string;
  grid: string;
  bar: string;
}

function setup(canvas: HTMLCanvasElement): { ctx: CanvasRenderingContext2D; w: number; h: number } | null {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return null;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return { ctx, w, h };
}

function grid(ctx: CanvasRenderingContext2D, w: number, h: number, totalSteps: number, c: RollColors): void {
  for (let s = 4; s < totalSteps; s += 4) {
    const x = Math.round((s / totalSteps) * w) + 0.5;
    ctx.strokeStyle = s % 16 === 0 ? c.bar : c.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function drawNotes(canvas: HTMLCanvasElement, notes: readonly Note[], totalSteps: number, colors: RollColors): void {
  const s = setup(canvas);
  if (!s) return;
  const { ctx, w, h } = s;
  grid(ctx, w, h, totalSteps, colors);
  if (!notes.length) return;
  let lo = Math.min(...notes.map((n) => n.pitch));
  let hi = Math.max(...notes.map((n) => n.pitch));
  const span = Math.max(hi - lo, 11);
  const mid = (lo + hi) / 2;
  lo = Math.floor(mid - span / 2) - 1;
  hi = Math.ceil(mid + span / 2) + 1;
  const rows = hi - lo + 1;
  const rowH = h / rows;
  ctx.fillStyle = colors.note;
  for (const n of notes) {
    const x = (n.start / totalSteps) * w;
    const nw = Math.max(2, (n.len / totalSteps) * w - 1.5);
    const y = h - (n.pitch - lo + 1) * rowH;
    ctx.globalAlpha = 0.55 + 0.45 * (n.vel / 127);
    roundRect(ctx, x, y, nw, Math.max(2, rowH - 1), 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

const DRUM_ROWS: DrumInst[][] = [
  ["hatC", "hatO", "shaker", "tamb"],
  ["percHi", "percLo", "rim"],
  ["snare", "clap"],
  ["kick"],
];

export function drawDrums(canvas: HTMLCanvasElement, hits: readonly DrumHit[], totalSteps: number, colors: RollColors): void {
  const s = setup(canvas);
  if (!s) return;
  const { ctx, w, h } = s;
  grid(ctx, w, h, totalSteps, colors);
  const rowH = h / DRUM_ROWS.length;
  ctx.fillStyle = colors.note;
  for (const hit of hits) {
    const row = DRUM_ROWS.findIndex((r) => r.includes(hit.inst));
    const x = (hit.step / totalSteps) * w;
    const size = Math.max(3, Math.min(rowH - 3, (w / totalSteps) * 0.8));
    ctx.globalAlpha = 0.35 + 0.65 * (hit.vel / 127);
    roundRect(ctx, x, row * rowH + (rowH - size) / 2, size, size, 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
