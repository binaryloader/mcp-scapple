import type { TextAlignment } from "../../types.js";
import { rgbToHex } from "../color.js";
import { wrapText, getLineHeight } from "../text-metrics.js";
import type { RGBColor } from "../../types.js";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function alignmentToAnchor(alignment: TextAlignment): string {
  switch (alignment) {
    case "Left":
      return "start";
    case "Right":
      return "end";
    case "Center":
      return "middle";
  }
}

function alignmentToX(
  alignment: TextAlignment,
  x: number,
  width: number,
  xPadding: number
): number {
  switch (alignment) {
    case "Left":
      return x + xPadding;
    case "Right":
      return x + width - xPadding;
    case "Center":
      return x + width / 2;
  }
}

export function renderText(
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  fontName: string,
  alignment: TextAlignment,
  textColor: RGBColor,
  noteXPadding: number = 8,
  isBold: boolean = false,
  isItalic: boolean = false
): string {
  const padding = noteXPadding * 2;
  const maxTextWidth = width - padding;
  const lines = wrapText(text, maxTextWidth, fontSize);
  const lineHeight = getLineHeight(fontSize);
  const totalTextHeight = lines.length * lineHeight;
  const textX = alignmentToX(alignment, x, width, noteXPadding);
  const textY = y + (height - totalTextHeight) / 2 + fontSize;

  const anchor = alignmentToAnchor(alignment);
  const color = rgbToHex(textColor);

  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${textX}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const weightAttr = isBold ? ` font-weight="bold"` : "";
  const styleAttr = isItalic ? ` font-style="italic"` : "";

  return `<text x="${textX}" y="${textY}" font-family="${escapeXml(fontName)}" font-size="${fontSize}" fill="${color}" text-anchor="${anchor}"${weightAttr}${styleAttr}>${tspans}</text>`;
}
