import type { NoteInput } from "../types.js";
import { measureTextWidth } from "./text-metrics.js";

interface TreeNode {
  readonly text: string;
  readonly children: TreeNode[];
  readonly depth: number;
}

const COLORS = [
  "#ffeb3b", // yellow
  "#4fc3f7", // light blue
  "#81c784", // green
  "#ff8a65", // orange
  "#ce93d8", // purple
  "#f48fb1", // pink
  "#80cbc4", // teal
  "#fff176", // light yellow
];

function parseIndentedText(text: string): TreeNode[] {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const roots: TreeNode[] = [];
  const stack: { node: TreeNode; indent: number }[] = [];

  for (const line of lines) {
    const trimmed = line.replace(/^[\s]*[-*•]\s*/, "").replace(/^[\s]*\d+\.\s*/, "");
    const rawIndent = line.search(/\S/);
    const indent = rawIndent >= 0 ? rawIndent : 0;
    const cleanText = trimmed.trim();
    if (!cleanText) continue;

    const node: TreeNode = { text: cleanText, children: [], depth: 0 };

    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(node);
    } else {
      const parent = stack[stack.length - 1].node;
      parent.children.push(node);
      (node as { depth: number }).depth = stack.length;
    }

    stack.push({ node, indent });
  }

  return roots;
}

interface PlacedNote {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly parentIndex: number | null;
}

function layoutTree(
  roots: TreeNode[],
  fontSize: number
): PlacedNote[] {
  const placed: PlacedNote[] = [];
  const hGap = 60;
  const vGap = 50;
  let globalY = 0;

  function placeNode(
    node: TreeNode,
    depth: number,
    parentIndex: number | null
  ): number {
    const textWidth = measureTextWidth(node.text, fontSize);
    const noteWidth = Math.max(80, textWidth + 24);
    const noteHeight = 30;
    const x = depth * (160 + hGap);

    if (node.children.length === 0) {
      const idx = placed.length;
      placed.push({
        text: node.text,
        x,
        y: globalY,
        width: noteWidth,
        height: noteHeight,
        depth,
        parentIndex,
      });
      globalY += noteHeight + vGap;
      return idx;
    }

    const firstChildY = globalY;
    const myIndex = placed.length;
    placed.push({
      text: node.text,
      x,
      y: 0,
      width: noteWidth,
      height: noteHeight,
      depth,
      parentIndex,
    });

    for (const child of node.children) {
      placeNode(child, depth + 1, myIndex);
    }

    const lastChildY = globalY - vGap - noteHeight;
    const centerY = (firstChildY + lastChildY) / 2;

    (placed[myIndex] as { y: number }).y = centerY;

    return myIndex;
  }

  for (const root of roots) {
    placeNode(root, 0, null);
    globalY += 20;
  }

  return placed;
}

export function textToNotes(text: string): NoteInput[] {
  const fontSize = 12;
  const roots = parseIndentedText(text);

  if (roots.length === 0) {
    return [];
  }

  const placedNotes = layoutTree(roots, fontSize);

  return placedNotes.map((note, idx) => {
    const colorIndex = note.depth % COLORS.length;
    const connections: number[] = [];

    if (note.parentIndex !== null) {
      connections.push(note.parentIndex);
    }

    const childIndices = placedNotes
      .map((n, i) => (n.parentIndex === idx ? i : -1))
      .filter((i) => i >= 0);
    connections.push(...childIndices);

    const pointsTo = childIndices;

    return {
      id: idx,
      x: note.x,
      y: note.y,
      width: note.width,
      height: note.height,
      text: note.text,
      border: note.depth === 0 ? "Cloud" as const : "Rounded" as const,
      fill: COLORS[colorIndex],
      fontSize,
      connectedNoteIDs: connections,
      pointsToNoteIDs: pointsTo,
    };
  });
}
