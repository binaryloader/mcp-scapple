import { XMLParser } from "fast-xml-parser";
import type {
  ScappleDocument,
  ScappleNote,
  NoteAppearance,
  RGBColor,
  BorderStyle,
  TextAlignment,
} from "../types.js";
import { ScappleParseError, ScappleValidationError } from "../errors.js";
import { parseIdRange } from "./id-range.js";
import { clampColor } from "./color.js";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  isArray: (tagName) => tagName === "Note",
  parseTagValue: false,
  trimValues: false,
});

function parseFloat0(value: unknown): number {
  const n = parseFloat(String(value));
  return isNaN(n) ? 0 : n;
}

function parseInt0(value: unknown): number {
  const n = parseInt(String(value), 10);
  return isNaN(n) ? 0 : n;
}

function parseColor(value: unknown): RGBColor | null {
  if (value === undefined || value === null) return null;
  const str = String(value);
  const parts = str.split(/\s+/).map(Number);
  if (parts.length < 3 || parts.some(isNaN)) return null;
  return clampColor({ r: parts[0], g: parts[1], b: parts[2] });
}

function parseBorderStyle(value: unknown): BorderStyle {
  const str = String(value ?? "");
  if (str === "Square" || str === "Rounded" || str === "Cloud") return str;
  return "None";
}

function parseAlignment(value: unknown): TextAlignment {
  const str = String(value ?? "Center");
  if (str === "Left" || str === "Right") return str;
  return "Center";
}

function extractAppearance(note: Record<string, unknown>): NoteAppearance {
  const appearance = note["Appearance"] as Record<string, unknown> | undefined;
  const ap = appearance ?? {};

  return {
    alignment: parseAlignment(ap["Alignment"]),
    border: parseBorderStyle(ap["Border"]),
    fill: parseColor(ap["Fill"]),
    textColor: parseColor(ap["TextColor"]) ?? { r: 0, g: 0, b: 0 },
    fontSize: parseFloat0(ap["FontSize"] ?? 12),
    fontName: String(ap["FontName"] ?? "Helvetica"),
  };
}

function extractString(note: Record<string, unknown>): string {
  const str = note["String"];
  if (str === undefined || str === null) return "";
  return String(str);
}

function parseNote(raw: Record<string, unknown>): ScappleNote {
  const id = parseInt0(raw["@_ID"]);
  const fontSizeStr = raw["@_FontSize"];
  const widthStr = raw["@_Width"];
  const heightStr = raw["@_Height"];
  const positionStr = String(raw["@_Position"] ?? "0,0");

  const posParts = positionStr.split(",").map((s) => parseFloat(s.trim()));
  if (posParts.length < 2 || posParts.some(isNaN)) {
    throw new ScappleParseError(
      `Invalid Position format: "${positionStr}"`,
      "PARSE_INVALID_FORMAT",
      { noteId: id, position: positionStr }
    );
  }

  const appearance = extractAppearance(raw);
  const fontSize = fontSizeStr !== undefined ? parseFloat0(fontSizeStr) : appearance.fontSize;
  const width = widthStr !== undefined ? parseFloat0(widthStr) : 140;
  const height = heightStr !== undefined ? parseFloat0(heightStr) : 30;

  const connectedStr = String(raw["ConnectedNoteIDs"] ?? "");
  const pointsToStr = String(raw["PointsToNoteIDs"] ?? "");

  return {
    id,
    x: posParts[0],
    y: posParts[1],
    width,
    height,
    text: extractString(raw),
    appearance: { ...appearance, fontSize },
    connectedNoteIDs: parseIdRange(connectedStr),
    pointsToNoteIDs: parseIdRange(pointsToStr),
  };
}

export function parse(xml: string): ScappleDocument {
  let parsed: Record<string, unknown>;
  try {
    parsed = xmlParser.parse(xml) as Record<string, unknown>;
  } catch (err) {
    throw new ScappleParseError(
      `Failed to parse XML: ${err instanceof Error ? err.message : String(err)}`,
      "PARSE_INVALID_XML"
    );
  }

  const scapple = parsed["ScappleDocument"] as Record<string, unknown> | undefined;
  if (!scapple) {
    throw new ScappleParseError(
      "Missing root <ScappleDocument> element",
      "PARSE_MISSING_ELEMENT"
    );
  }

  const notesWrapper = scapple["Notes"] as Record<string, unknown> | undefined;
  const rawNotes = (notesWrapper?.["Note"] ?? []) as Record<string, unknown>[];

  const notes = rawNotes.map(parseNote);

  const noteIds = new Set(notes.map((n) => n.id));
  const duplicates = notes.length - noteIds.size;
  if (duplicates > 0) {
    throw new ScappleValidationError(
      `Found ${duplicates} duplicate note ID(s)`,
      "VALIDATION_DUPLICATE_ID"
    );
  }

  for (const note of notes) {
    for (const connId of note.connectedNoteIDs) {
      if (!noteIds.has(connId)) {
        throw new ScappleValidationError(
          `Note ${note.id} references non-existent connected note ${connId}`,
          "VALIDATION_INVALID_ID",
          { noteId: note.id, referencedId: connId }
        );
      }
    }
    for (const ptsId of note.pointsToNoteIDs) {
      if (!noteIds.has(ptsId)) {
        throw new ScappleValidationError(
          `Note ${note.id} references non-existent pointed note ${ptsId}`,
          "VALIDATION_INVALID_ID",
          { noteId: note.id, referencedId: ptsId }
        );
      }
    }
  }

  const bgColor = parseColor(
    (scapple["BackgroundColor"] as string) ?? undefined
  ) ?? { r: 1, g: 1, b: 1 };

  const textColor = parseColor(
    (scapple["DefaultTextColor"] as string) ?? undefined
  ) ?? { r: 0, g: 0, b: 0 };

  return {
    notes,
    settings: {
      backgroundColor: bgColor,
      textColor,
    },
  };
}
