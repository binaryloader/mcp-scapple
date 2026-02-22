import { XMLParser } from "fast-xml-parser";
import type {
  ScappleDocument,
  ScappleNote,
  NoteAppearance,
  RGBColor,
  BorderStyle,
  TextAlignment,
  BackgroundShape,
  NoteStyle,
} from "../types.js";
import { ScappleParseError, ScappleValidationError } from "../errors.js";
import { parseIdRange } from "./id-range.js";
import { clampColor } from "./color.js";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  isArray: (tagName) => tagName === "Note" || tagName === "Shape" || tagName === "Style",
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

function parseBorderStyle(value: unknown): BorderStyle | null {
  const str = String(value ?? "");
  if (str === "Square" || str === "Rounded" || str === "Cloud") return str;
  if (str === "None") return "None";
  return null;
}

function parseAlignment(value: unknown): TextAlignment | null {
  const str = String(value ?? "");
  if (str === "Left" || str === "Right" || str === "Center") return str;
  return null;
}

function extractAppearance(note: Record<string, unknown>): NoteAppearance {
  const appearance = note["Appearance"] as Record<string, unknown> | undefined;
  const ap = appearance ?? {};

  let border: BorderStyle | null = null;
  let borderColor: RGBColor | null = null;
  let borderWeight: number | null = null;

  const borderRaw = ap["Border"];
  if (typeof borderRaw === "object" && borderRaw !== null) {
    const obj = borderRaw as Record<string, unknown>;
    border = parseBorderStyle(obj["@_Style"]) ?? "Rounded";
    borderWeight = obj["@_Weight"] !== undefined ? parseFloat0(obj["@_Weight"]) : null;
    borderColor = parseColor(obj["#text"]);
  } else if (typeof borderRaw === "string") {
    border = parseBorderStyle(borderRaw);
  }

  return {
    alignment: parseAlignment(ap["Alignment"]),
    border,
    borderColor,
    borderWeight,
    fill: parseColor(ap["Fill"]),
    textColor: parseColor(ap["TextColor"]),
    fontSize: ap["FontSize"] !== undefined ? parseFloat0(ap["FontSize"]) : null,
    fontName: ap["FontName"] !== undefined ? String(ap["FontName"]) : null,
    isBold: String(ap["IsBold"] ?? "No") === "Yes",
    isItalic: String(ap["IsItalic"] ?? "No") === "Yes",
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

function parseBackgroundShape(raw: Record<string, unknown>): BackgroundShape {
  const id = parseInt0(raw["@_ID"]);
  const positionStr = String(raw["@_Position"] ?? "0,0");
  const width = parseFloat0(raw["@_Width"] ?? 100);
  const height = parseFloat0(raw["@_Height"] ?? 100);

  const posParts = positionStr.split(",").map((s) => parseFloat(s.trim()));
  if (posParts.length < 2 || posParts.some(isNaN)) {
    throw new ScappleParseError(
      `Invalid BackgroundShape Position: "${positionStr}"`,
      "PARSE_INVALID_FORMAT",
      { shapeId: id, position: positionStr }
    );
  }

  const appearance = raw["Appearance"] as Record<string, unknown> | undefined;
  const ap = appearance ?? {};
  const borderRaw = ap["Border"];

  let border: BorderStyle = "Rounded";
  let borderColor: RGBColor | null = null;
  let borderWeight = 1;
  let fill: RGBColor | null = null;

  if (typeof borderRaw === "object" && borderRaw !== null) {
    const obj = borderRaw as Record<string, unknown>;
    border = parseBorderStyle(obj["@_Style"]) ?? "Rounded";
    borderWeight = obj["@_Weight"] !== undefined ? parseFloat0(obj["@_Weight"]) : 1;
    borderColor = parseColor(obj["#text"]);
  } else if (typeof borderRaw === "string") {
    borderColor = parseColor(borderRaw);
  }

  fill = parseColor(ap["Fill"]);

  return {
    id,
    x: posParts[0],
    y: posParts[1],
    width,
    height,
    border,
    borderColor,
    borderWeight,
    fill,
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

  const stylesWrapper = scapple["NoteStyles"] as Record<string, unknown> | undefined;
  const rawStyles = (stylesWrapper?.["Style"] ?? []) as Record<string, unknown>[];
  const noteStyles: NoteStyle[] = rawStyles.map((raw) => ({
    name: String(raw["@_Name"] ?? ""),
    id: String(raw["@_ID"] ?? ""),
    borderThickness: raw["BorderThickness"] !== undefined ? parseFloat0(raw["BorderThickness"]) : undefined,
    borderColor: raw["BorderColor"] !== undefined ? parseColor(raw["BorderColor"]) ?? undefined : undefined,
    fillColor: raw["FillColor"] !== undefined ? parseColor(raw["FillColor"]) ?? undefined : undefined,
    textColor: raw["TextColor"] !== undefined ? parseColor(raw["TextColor"]) ?? undefined : undefined,
    fontSize: raw["FontSize"] !== undefined ? parseFloat0(raw["FontSize"]) : undefined,
    isBold: String(raw["IsBold"] ?? "") === "Yes" ? true : undefined,
    isItalic: String(raw["IsItalic"] ?? "") === "Yes" ? true : undefined,
  }));

  const bgShapesWrapper = scapple["BackgroundShapes"] as Record<string, unknown> | undefined;
  const rawShapes = (bgShapesWrapper?.["Shape"] ?? []) as Record<string, unknown>[];
  const backgroundShapes = rawShapes.map(parseBackgroundShape);

  const uiSettings = scapple["UISettings"] as Record<string, unknown> | undefined;
  const ui = uiSettings ?? {};

  const bgColor = parseColor(
    (scapple["BackgroundColor"] as string) ??
    (ui["BackgroundColor"] as string) ?? undefined
  ) ?? { r: 1, g: 1, b: 1 };

  const textColor = parseColor(
    (scapple["DefaultTextColor"] as string) ?? undefined
  ) ?? { r: 0, g: 0, b: 0 };

  const defaultFont = ui["DefaultFont"] !== undefined
    ? String(ui["DefaultFont"])
    : "Helvetica";

  const noteXPadding = ui["NoteXPadding"] !== undefined
    ? parseFloat0(ui["NoteXPadding"])
    : 8;

  return {
    notes,
    backgroundShapes,
    noteStyles,
    settings: {
      backgroundColor: bgColor,
      textColor,
      defaultFont,
      noteXPadding,
    },
  };
}
