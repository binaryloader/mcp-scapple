import type { ScappleNote, Point, RenderTheme } from "../../types.js";
import { DEFAULT_THEME } from "../../types.js";
import { centerOf, lineRectIntersection, noteToRect } from "../geometry.js";

interface ConnectionLine {
  readonly from: Point;
  readonly to: Point;
  readonly hasArrow: boolean;
}

export function computeConnections(notes: readonly ScappleNote[]): ConnectionLine[] {
  const noteMap = new Map<number, ScappleNote>();
  for (const note of notes) {
    noteMap.set(note.id, note);
  }

  const lines: ConnectionLine[] = [];
  const drawnPairs = new Set<string>();

  for (const note of notes) {
    const pointsToSet = new Set(note.pointsToNoteIDs);

    for (const connId of note.connectedNoteIDs) {
      const pairKey =
        note.id < connId ? `${note.id}-${connId}` : `${connId}-${note.id}`;

      if (drawnPairs.has(pairKey)) continue;
      drawnPairs.add(pairKey);

      const target = noteMap.get(connId);
      if (!target) continue;

      const fromCenter = centerOf(noteToRect(note));
      const toCenter = centerOf(noteToRect(target));
      const hasArrow = pointsToSet.has(connId);

      const from = lineRectIntersection(toCenter, fromCenter, noteToRect(note));
      const to = lineRectIntersection(fromCenter, toCenter, noteToRect(target));

      lines.push({ from, to, hasArrow });
    }
  }

  return lines;
}

export function renderConnections(
  lines: readonly ConnectionLine[],
  theme: Required<RenderTheme> = DEFAULT_THEME
): string {
  const { lineColor, lineWidth } = theme;
  return lines
    .map((line) => {
      const marker = line.hasArrow ? ` marker-end="url(#arrowhead)"` : "";
      return `<line x1="${line.from.x}" y1="${line.from.y}" x2="${line.to.x}" y2="${line.to.y}" stroke="${lineColor}" stroke-width="${lineWidth}"${marker}/>`;
    })
    .join("\n  ");
}
