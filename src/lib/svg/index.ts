import type { ScappleDocument } from "../../types.js";
import { rgbToHex } from "../color.js";
import { computeBoundingBox, noteToRect } from "../geometry.js";
import { buildDefs } from "./defs.js";
import { renderShape } from "./shapes.js";
import { computeConnections, renderConnections } from "./connections.js";
import { renderText } from "./text.js";

export function buildSvg(
  doc: ScappleDocument,
  padding: number = 40
): string {
  const rects = doc.notes.map(noteToRect);
  const bbox = computeBoundingBox(rects, padding);

  const bgColor = rgbToHex(doc.settings.backgroundColor);

  const connectionLines = computeConnections(doc.notes);
  const connectionsStr = renderConnections(connectionLines);

  const notesStr = doc.notes
    .map((note) => {
      const shape = renderShape(
        note.x,
        note.y,
        note.width,
        note.height,
        note.appearance.border,
        note.appearance.fill
      );
      const text = renderText(
        note.text,
        note.x,
        note.y,
        note.width,
        note.height,
        note.appearance.fontSize,
        note.appearance.fontName,
        note.appearance.alignment,
        note.appearance.textColor
      );
      return `  ${shape}\n  ${text}`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}" width="${bbox.width}" height="${bbox.height}">
  ${buildDefs()}
  <rect x="${bbox.x}" y="${bbox.y}" width="${bbox.width}" height="${bbox.height}" fill="${bgColor}"/>
  ${connectionsStr}
${notesStr}
</svg>`;
}
