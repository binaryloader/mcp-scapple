import type { Point, Rect } from "../types.js";

export function computeBoundingBox(
  rects: readonly Rect[],
  padding: number
): Rect {
  if (rects.length === 0) {
    return { x: 0, y: 0, width: padding * 2, height: padding * 2 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}

export function centerOf(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

export function lineRectIntersection(
  from: Point,
  to: Point,
  rect: Rect
): Point {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const hw = rect.width / 2;
  const hh = rect.height / 2;

  const dx = from.x - cx;
  const dy = from.y - cy;

  if (dx === 0 && dy === 0) {
    return { x: cx, y: cy };
  }

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  let scale: number;
  if (absDx * hh > absDy * hw) {
    scale = hw / absDx;
  } else {
    scale = hh / absDy;
  }

  return {
    x: cx + dx * scale,
    y: cy + dy * scale,
  };
}

export function noteToRect(note: { x: number; y: number; width: number; height: number }): Rect {
  return {
    x: note.x,
    y: note.y,
    width: note.width,
    height: note.height,
  };
}
