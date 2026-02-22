import type { ScappleNote, Point } from "../../types.js";
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
      const to = hasArrow
        ? lineRectIntersection(fromCenter, toCenter, noteToRect(target))
        : toCenter;

      lines.push({
        from,
        to: hasArrow
          ? lineRectIntersection(fromCenter, toCenter, noteToRect(target))
          : lineRectIntersection(fromCenter, toCenter, noteToRect(target)),
        hasArrow,
      });
    }
  }

  return lines;
}

export function renderConnections(lines: readonly ConnectionLine[]): string {
  return lines
    .map((line) => {
      const marker = line.hasArrow ? ` marker-end="url(#arrowhead)"` : "";
      return `<line x1="${line.from.x}" y1="${line.from.y}" x2="${line.to.x}" y2="${line.to.y}" stroke="#666666" stroke-width="1"${marker}/>`;
    })
    .join("\n  ");
}
