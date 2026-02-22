import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "../lib/parser.js";
import { rgbToHex } from "../lib/color.js";
import { ScappleIOError } from "../errors.js";
import type { ScappleDocument, ScappleNote } from "../types.js";

function noteToJson(note: ScappleNote): Record<string, unknown> {
  const result: Record<string, unknown> = {
    id: note.id,
    x: note.x,
    y: note.y,
    width: note.width,
    height: note.height,
    text: note.text,
    appearance: {
      alignment: note.appearance.alignment,
      border: note.appearance.border,
      fill: note.appearance.fill ? rgbToHex(note.appearance.fill) : null,
      textColor: rgbToHex(note.appearance.textColor),
      fontSize: note.appearance.fontSize,
      fontName: note.appearance.fontName,
    },
  };

  if (note.connectedNoteIDs.length > 0) {
    result.connectedNoteIDs = note.connectedNoteIDs;
  }
  if (note.pointsToNoteIDs.length > 0) {
    result.pointsToNoteIDs = note.pointsToNoteIDs;
  }

  return result;
}

export async function readScapple(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".scap") {
    throw new ScappleIOError(
      `File must have .scap extension: ${filePath}`,
      "IO_INVALID_PATH",
      { filePath }
    );
  }

  let xml: string;
  try {
    xml = await readFile(filePath, "utf-8");
  } catch (err) {
    throw new ScappleIOError(
      `Failed to read file: ${filePath}`,
      "IO_READ_FAILED",
      { filePath, error: err instanceof Error ? err.message : String(err) }
    );
  }

  const doc = parse(xml);

  const output = {
    filePath,
    noteCount: doc.notes.length,
    backgroundColor: rgbToHex(doc.settings.backgroundColor),
    notes: doc.notes.map(noteToJson),
  };

  return JSON.stringify(output, null, 2);
}
