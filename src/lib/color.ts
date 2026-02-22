import type { RGBColor } from "../types.js";

export function rgbToHex(color: RGBColor): string {
  const r = Math.round(Math.min(1, Math.max(0, color.r)) * 255);
  const g = Math.round(Math.min(1, Math.max(0, color.g)) * 255);
  const b = Math.round(Math.min(1, Math.max(0, color.b)) * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function hexToRgb(hex: string): RGBColor {
  const cleaned = hex.replace(/^#/, "");
  const num = parseInt(cleaned, 16);
  return {
    r: ((num >> 16) & 0xff) / 255,
    g: ((num >> 8) & 0xff) / 255,
    b: (num & 0xff) / 255,
  };
}

export function clampColor(color: RGBColor): RGBColor {
  return {
    r: Math.min(1, Math.max(0, color.r)),
    g: Math.min(1, Math.max(0, color.g)),
    b: Math.min(1, Math.max(0, color.b)),
  };
}

export function parseRGBString(value: string): RGBColor {
  const parts = value.split(/\s+/).map(Number);
  if (parts.length >= 3) {
    return clampColor({ r: parts[0], g: parts[1], b: parts[2] });
  }
  return { r: 0, g: 0, b: 0 };
}

export function rgbToString(color: RGBColor): string {
  return `${color.r} ${color.g} ${color.b}`;
}
