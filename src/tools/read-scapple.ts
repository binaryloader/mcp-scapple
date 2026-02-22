import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "../lib/parser.js";
import { rgbToHex } from "../lib/color.js";
import { ScappleIOError } from "../errors.js";
import type { ScappleNote, BackgroundShape, NoteStyle } from "../types.js";

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
      borderColor: note.appearance.borderColor ? rgbToHex(note.appearance.borderColor) : null,
      borderWeight: note.appearance.borderWeight,
      fill: note.appearance.fill ? rgbToHex(note.appearance.fill) : null,
      textColor: note.appearance.textColor ? rgbToHex(note.appearance.textColor) : null,
      fontSize: note.appearance.fontSize,
      fontName: note.appearance.fontName,
      isBold: note.appearance.isBold,
      isItalic: note.appearance.isItalic,
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

function shapeToJson(shape: BackgroundShape): Record<string, unknown> {
  return {
    id: shape.id,
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
    border: shape.border,
    borderColor: shape.borderColor ? rgbToHex(shape.borderColor) : null,
    borderWeight: shape.borderWeight,
    fill: shape.fill ? rgbToHex(shape.fill) : null,
  };
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

  const output: Record<string, unknown> = {
    filePath,
    noteCount: doc.notes.length,
    backgroundColor: rgbToHex(doc.settings.backgroundColor),
    defaultFont: doc.settings.defaultFont,
    noteXPadding: doc.settings.noteXPadding,
    notes: doc.notes.map(noteToJson),
  };

  if (doc.backgroundShapes.length > 0) {
    output.backgroundShapes = doc.backgroundShapes.map(shapeToJson);
  }

  if (doc.noteStyles.length > 0) {
    output.noteStyles = doc.noteStyles.map((style) => {
      const result: Record<string, unknown> = {
        name: style.name,
        id: style.id,
      };
      if (style.borderThickness !== undefined) result.borderThickness = style.borderThickness;
      if (style.borderColor) result.borderColor = rgbToHex(style.borderColor);
      if (style.fillColor) result.fillColor = rgbToHex(style.fillColor);
      if (style.textColor) result.textColor = rgbToHex(style.textColor);
      if (style.fontSize !== undefined) result.fontSize = style.fontSize;
      if (style.isBold) result.isBold = true;
      if (style.isItalic) result.isItalic = true;
      return result;
    });
  }

  return JSON.stringify(output, null, 2);
}
