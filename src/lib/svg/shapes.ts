import type { RGBColor, BorderStyle, RenderTheme } from "../../types.js";
import { DEFAULT_THEME } from "../../types.js";
import { rgbToHex } from "../color.js";

function buildCloudPath(
  x: number,
  y: number,
  w: number,
  h: number
): string {
  const bumpRadius = 12;
  const parts: string[] = [];

  const hBumps = Math.max(2, Math.round(w / (bumpRadius * 2)));
  const vBumps = Math.max(2, Math.round(h / (bumpRadius * 2)));
  const hStep = w / hBumps;
  const vStep = h / vBumps;

  parts.push(`M ${x} ${y}`);

  for (let i = 0; i < hBumps; i++) {
    const sx = x + i * hStep;
    const ex = x + (i + 1) * hStep;
    const mx = (sx + ex) / 2;
    parts.push(`Q ${mx} ${y - bumpRadius} ${ex} ${y}`);
  }

  for (let i = 0; i < vBumps; i++) {
    const sy = y + i * vStep;
    const ey = y + (i + 1) * vStep;
    const my = (sy + ey) / 2;
    parts.push(`Q ${x + w + bumpRadius} ${my} ${x + w} ${ey}`);
  }

  for (let i = hBumps - 1; i >= 0; i--) {
    const sx = x + (i + 1) * hStep;
    const ex = x + i * hStep;
    const mx = (sx + ex) / 2;
    parts.push(`Q ${mx} ${y + h + bumpRadius} ${ex} ${y + h}`);
  }

  for (let i = vBumps - 1; i >= 0; i--) {
    const sy = y + (i + 1) * vStep;
    const ey = y + i * vStep;
    const my = (sy + ey) / 2;
    parts.push(`Q ${x - bumpRadius} ${my} ${x} ${ey}`);
  }

  parts.push("Z");
  return parts.join(" ");
}

export function renderShape(
  x: number,
  y: number,
  width: number,
  height: number,
  border: BorderStyle,
  fill: RGBColor | null,
  theme: Required<RenderTheme> = DEFAULT_THEME
): string {
  const fillStr = fill ? rgbToHex(fill) : "none";
  const { strokeColor, strokeWidth, borderRadius, shadowEnabled } = theme;
  const filterAttr = shadowEnabled ? ` filter="url(#shadow)"` : "";

  switch (border) {
    case "Rounded":
      return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${borderRadius}" ry="${borderRadius}" fill="${fillStr}" stroke="${strokeColor}" stroke-width="${strokeWidth}"${filterAttr}/>`;

    case "Square":
      return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="0" ry="0" fill="${fillStr}" stroke="${strokeColor}" stroke-width="${strokeWidth}"${filterAttr}/>`;

    case "Cloud": {
      const path = buildCloudPath(x, y, width, height);
      return `<path d="${path}" fill="${fillStr}" stroke="${strokeColor}" stroke-width="${strokeWidth}"${filterAttr}/>`;
    }

    case "None":
      if (fill) {
        return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="0" ry="0" fill="${fillStr}" stroke="none"/>`;
      }
      return "";
  }
}
