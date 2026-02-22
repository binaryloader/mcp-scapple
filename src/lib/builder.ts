import { XMLBuilder } from "fast-xml-parser";
import type {
  ScappleDocument,
  ScappleNote,
  NoteAppearance,
  RGBColor,
  DocumentInput,
  NoteInput,
} from "../types.js";
import { hexToRgb, rgbToString } from "./color.js";
import { serializeIdRange } from "./id-range.js";
import crypto from "node:crypto";

const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  format: true,
  indentBy: "    ",
  suppressEmptyNode: true,
});

function buildAppearanceXml(appearance: NoteAppearance): Record<string, string> {
  const ap: Record<string, string> = {};
  ap["Alignment"] = appearance.alignment;
  if (appearance.border !== "None") {
    ap["Border"] = appearance.border;
  }
  if (appearance.fill) {
    ap["Fill"] = rgbToString(appearance.fill);
  }
  ap["TextColor"] = rgbToString(appearance.textColor);
  if (appearance.fontName !== "Helvetica") {
    ap["FontName"] = appearance.fontName;
  }
  return ap;
}

function buildNoteXml(note: ScappleNote): Record<string, unknown> {
  const result: Record<string, unknown> = {
    "@_ID": String(note.id),
    "@_FontSize": String(note.appearance.fontSize),
    "@_Position": `${note.x},${note.y}`,
    "@_Width": String(note.width),
    "String": note.text,
    "Appearance": buildAppearanceXml(note.appearance),
  };

  if (note.connectedNoteIDs.length > 0) {
    result["ConnectedNoteIDs"] = serializeIdRange(note.connectedNoteIDs);
  }
  if (note.pointsToNoteIDs.length > 0) {
    result["PointsToNoteIDs"] = serializeIdRange(note.pointsToNoteIDs);
  }

  return result;
}

function resolveColor(
  hex: string | undefined,
  fallback: RGBColor
): RGBColor {
  if (!hex) return fallback;
  return hexToRgb(hex);
}

function buildNoteFromInput(
  input: NoteInput,
  id: number
): ScappleNote {
  const fill = input.fill ? hexToRgb(input.fill) : null;
  const textColor = input.textColor
    ? hexToRgb(input.textColor)
    : { r: 0, g: 0, b: 0 };

  return {
    id: input.id ?? id,
    x: input.x,
    y: input.y,
    width: input.width ?? 140,
    height: input.height ?? 30,
    text: input.text,
    appearance: {
      alignment: input.alignment ?? "Center",
      border: input.border ?? "Rounded",
      fill,
      textColor,
      fontSize: input.fontSize ?? 12,
      fontName: input.fontName ?? "Helvetica",
    },
    connectedNoteIDs: input.connectedNoteIDs ? [...input.connectedNoteIDs] : [],
    pointsToNoteIDs: input.pointsToNoteIDs ? [...input.pointsToNoteIDs] : [],
  };
}

function ensureBidirectionalConnections(notes: ScappleNote[]): ScappleNote[] {
  const connectionMap = new Map<number, Set<number>>();

  for (const note of notes) {
    if (!connectionMap.has(note.id)) {
      connectionMap.set(note.id, new Set());
    }
    const set = connectionMap.get(note.id)!;
    for (const connId of note.connectedNoteIDs) {
      set.add(connId);
    }
    for (const ptsId of note.pointsToNoteIDs) {
      set.add(ptsId);
    }
  }

  for (const [noteId, connections] of connectionMap) {
    for (const connId of connections) {
      if (!connectionMap.has(connId)) {
        connectionMap.set(connId, new Set());
      }
      connectionMap.get(connId)!.add(noteId);
    }
  }

  return notes.map((note) => {
    const allConnections = connectionMap.get(note.id) ?? new Set<number>();
    const pointsToSet = new Set(note.pointsToNoteIDs);
    const connectedIds = [...allConnections].sort((a, b) => a - b);

    return {
      ...note,
      connectedNoteIDs: connectedIds,
      pointsToNoteIDs: [...pointsToSet],
    };
  });
}

export function buildDocument(input: DocumentInput): ScappleDocument {
  const rawNotes = input.notes.map((n, i) => buildNoteFromInput(n, i));
  const notes = ensureBidirectionalConnections(rawNotes);

  const bgColor = input.backgroundColor
    ? hexToRgb(input.backgroundColor)
    : { r: 1, g: 1, b: 1 };

  return {
    notes,
    settings: {
      backgroundColor: bgColor,
      textColor: { r: 0, g: 0, b: 0 },
    },
  };
}

export function build(doc: ScappleDocument): string {
  const uuid = crypto.randomUUID().toUpperCase();

  const notesXml = doc.notes.map(buildNoteXml);

  const scapple: Record<string, unknown> = {
    "?xml": {
      "@_version": "1.0",
      "@_encoding": "UTF-8",
    },
    "ScappleDocument": {
      "@_Version": "1.2",
      "@_ID": uuid,
      "Notes": {
        "Note": notesXml,
      },
      "BackgroundColor": rgbToString(doc.settings.backgroundColor),
      "AutoFit": "0,1",
      "NotesTextEncoding": "94",
      "Printable": "YES",
    },
  };

  return xmlBuilder.build(scapple);
}
