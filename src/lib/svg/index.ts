import type { ScappleDocument, RenderTheme, Rect, BorderStyle, TextAlignment, RGBColor } from "../../types.js";
import { DEFAULT_THEME } from "../../types.js";
import type { ScappleSettings } from "../../types.js";
import { rgbToHex, hexToRgb } from "../color.js";
import { computeBoundingBox, noteToRect } from "../geometry.js";
import { buildDefs } from "./defs.js";
import { renderShape } from "./shapes.js";
import { computeConnections, renderConnections } from "./connections.js";
import { renderText } from "./text.js";

function buildBackgroundPattern(
  pattern: Required<RenderTheme>["backgroundPattern"],
  patternColor: string,
  bbox: Rect
): string {
  if (pattern === "none") return "";

  let patternContent: string;
  switch (pattern) {
    case "dots":
      patternContent = `<pattern id="bg-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="1" fill="${patternColor}"/>
    </pattern>`;
      break;
    case "grid":
      patternContent = `<pattern id="bg-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="20" stroke="${patternColor}" stroke-width="0.5"/>
      <line x1="0" y1="0" x2="20" y2="0" stroke="${patternColor}" stroke-width="0.5"/>
    </pattern>`;
      break;
    case "lines":
      patternContent = `<pattern id="bg-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="20" y2="0" stroke="${patternColor}" stroke-width="0.5"/>
    </pattern>`;
      break;
  }

  return `${patternContent}
  <rect x="${bbox.x}" y="${bbox.y}" width="${bbox.width}" height="${bbox.height}" fill="url(#bg-pattern)"/>`;
}

function resolveTheme(
  theme: RenderTheme | undefined,
  settings: ScappleSettings
): Required<RenderTheme> {
  const docBgHex = rgbToHex(settings.backgroundColor);
  const docTextHex = rgbToHex(settings.textColor);

  const base: Required<RenderTheme> = {
    ...DEFAULT_THEME,
    backgroundColor: docBgHex,
    defaultTextColor: docTextHex,
    defaultFont: settings.defaultFont,
    noteXPadding: settings.noteXPadding,
  };

  if (!theme) return base;

  return {
    backgroundColor: theme.backgroundColor ?? base.backgroundColor,
    backgroundPattern: theme.backgroundPattern ?? base.backgroundPattern,
    patternColor: theme.patternColor ?? base.patternColor,
    strokeColor: theme.strokeColor ?? base.strokeColor,
    strokeWidth: theme.strokeWidth ?? base.strokeWidth,
    lineColor: theme.lineColor ?? base.lineColor,
    lineWidth: theme.lineWidth ?? base.lineWidth,
    arrowColor: theme.arrowColor ?? base.arrowColor,
    shadowColor: theme.shadowColor ?? base.shadowColor,
    shadowEnabled: theme.shadowEnabled ?? base.shadowEnabled,
    borderRadius: theme.borderRadius ?? base.borderRadius,
    defaultFont: theme.defaultFont ?? base.defaultFont,
    defaultFontSize: theme.defaultFontSize ?? base.defaultFontSize,
    defaultTextColor: theme.defaultTextColor ?? base.defaultTextColor,
    defaultFill: theme.defaultFill ?? base.defaultFill,
    defaultBorder: theme.defaultBorder ?? base.defaultBorder,
    defaultAlignment: theme.defaultAlignment ?? base.defaultAlignment,
    noteXPadding: theme.noteXPadding ?? base.noteXPadding,
  };
}

function resolveNoteDefaults(
  appearance: {
    alignment: TextAlignment | null;
    border: BorderStyle | null;
    borderColor: RGBColor | null;
    borderWeight: number | null;
    fill: RGBColor | null;
    textColor: RGBColor | null;
    fontSize: number | null;
    fontName: string | null;
  },
  theme: Required<RenderTheme>
): {
  alignment: TextAlignment;
  border: BorderStyle;
  fill: RGBColor | null;
  textColor: RGBColor;
  fontSize: number;
  fontName: string;
  strokeColor: string;
  strokeWidth: number;
} {
  const defaultFill = theme.defaultFill !== "none" ? hexToRgb(theme.defaultFill) : null;

  return {
    alignment: appearance.alignment ?? theme.defaultAlignment,
    border: appearance.border ?? theme.defaultBorder,
    fill: appearance.fill ?? defaultFill,
    textColor: appearance.textColor ?? hexToRgb(theme.defaultTextColor),
    fontSize: appearance.fontSize ?? theme.defaultFontSize,
    fontName: appearance.fontName ?? theme.defaultFont,
    strokeColor: appearance.borderColor ? rgbToHex(appearance.borderColor) : theme.strokeColor,
    strokeWidth: appearance.borderWeight ?? theme.strokeWidth,
  };
}

export function buildSvg(
  doc: ScappleDocument,
  padding: number = 40,
  theme?: RenderTheme
): string {
  const noteRects = doc.notes.map(noteToRect);
  const shapeRects = doc.backgroundShapes.map(noteToRect);
  const allRects = [...shapeRects, ...noteRects];
  const bbox = computeBoundingBox(allRects, padding);

  const resolved = resolveTheme(theme, doc.settings);

  const connectionLines = computeConnections(doc.notes);
  const connectionsStr = renderConnections(connectionLines, resolved);

  const patternStr = buildBackgroundPattern(resolved.backgroundPattern, resolved.patternColor, bbox);

  const shapesStr = doc.backgroundShapes
    .map((shape) => {
      const shapeStrokeColor = shape.borderColor ? rgbToHex(shape.borderColor) : resolved.strokeColor;
      const shapeTheme = {
        ...resolved,
        strokeColor: shapeStrokeColor,
        strokeWidth: shape.borderWeight,
      };
      return `  ${renderShape(shape.x, shape.y, shape.width, shape.height, shape.border, shape.fill, shapeTheme)}`;
    })
    .join("\n");

  const notesStr = doc.notes
    .map((note) => {
      const r = resolveNoteDefaults(note.appearance, resolved);
      const noteTheme = {
        ...resolved,
        strokeColor: r.strokeColor,
        strokeWidth: r.strokeWidth,
      };

      const shape = renderShape(
        note.x,
        note.y,
        note.width,
        note.height,
        r.border,
        r.fill,
        noteTheme
      );
      const text = renderText(
        note.text,
        note.x,
        note.y,
        note.width,
        note.height,
        r.fontSize,
        r.fontName,
        r.alignment,
        r.textColor,
        resolved.noteXPadding,
        note.appearance.isBold,
        note.appearance.isItalic
      );
      return `  ${shape}\n  ${text}`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}" width="${bbox.width}" height="${bbox.height}">
  ${buildDefs(resolved)}
  <rect x="${bbox.x}" y="${bbox.y}" width="${bbox.width}" height="${bbox.height}" fill="${resolved.backgroundColor}"/>
  ${patternStr}
${shapesStr}
  ${connectionsStr}
${notesStr}
</svg>`;
}
