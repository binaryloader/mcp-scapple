export interface RGBColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type BorderStyle = "Rounded" | "Square" | "Cloud" | "None";

export type TextAlignment = "Left" | "Center" | "Right";

export interface NoteAppearance {
  readonly alignment: TextAlignment;
  readonly border: BorderStyle;
  readonly fill: RGBColor | null;
  readonly textColor: RGBColor;
  readonly fontSize: number;
  readonly fontName: string;
}

export interface ScappleNote {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly text: string;
  readonly appearance: NoteAppearance;
  readonly connectedNoteIDs: readonly number[];
  readonly pointsToNoteIDs: readonly number[];
}

export interface ScappleSettings {
  readonly backgroundColor: RGBColor;
  readonly textColor: RGBColor;
}

export interface ScappleDocument {
  readonly notes: readonly ScappleNote[];
  readonly settings: ScappleSettings;
}

export interface NoteInput {
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly id?: number;
  readonly width?: number;
  readonly height?: number;
  readonly alignment?: TextAlignment;
  readonly border?: BorderStyle;
  readonly fill?: string;
  readonly textColor?: string;
  readonly fontSize?: number;
  readonly fontName?: string;
  readonly connectedNoteIDs?: readonly number[];
  readonly pointsToNoteIDs?: readonly number[];
}

export interface DocumentInput {
  readonly notes: readonly NoteInput[];
  readonly backgroundColor?: string;
}
