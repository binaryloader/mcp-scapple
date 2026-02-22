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
  readonly alignment: TextAlignment | null;
  readonly border: BorderStyle | null;
  readonly borderColor: RGBColor | null;
  readonly borderWeight: number | null;
  readonly fill: RGBColor | null;
  readonly textColor: RGBColor | null;
  readonly fontSize: number | null;
  readonly fontName: string | null;
  readonly isBold: boolean;
  readonly isItalic: boolean;
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

export interface BackgroundShape {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly border: BorderStyle;
  readonly borderColor: RGBColor | null;
  readonly borderWeight: number;
  readonly fill: RGBColor | null;
}

export interface NoteStyle {
  readonly name: string;
  readonly id: string;
  readonly borderThickness?: number;
  readonly borderColor?: RGBColor;
  readonly fillColor?: RGBColor;
  readonly textColor?: RGBColor;
  readonly fontSize?: number;
  readonly isBold?: boolean;
  readonly isItalic?: boolean;
}

export interface ScappleSettings {
  readonly backgroundColor: RGBColor;
  readonly textColor: RGBColor;
  readonly defaultFont: string;
  readonly noteXPadding: number;
}

export interface ScappleDocument {
  readonly notes: readonly ScappleNote[];
  readonly backgroundShapes: readonly BackgroundShape[];
  readonly noteStyles: readonly NoteStyle[];
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

export interface RenderTheme {
  readonly backgroundColor?: string;
  readonly backgroundPattern?: "none" | "dots" | "grid" | "lines";
  readonly patternColor?: string;
  readonly strokeColor?: string;
  readonly strokeWidth?: number;
  readonly lineColor?: string;
  readonly lineWidth?: number;
  readonly arrowColor?: string;
  readonly shadowColor?: string;
  readonly shadowEnabled?: boolean;
  readonly borderRadius?: number;
  readonly defaultFont?: string;
  readonly defaultFontSize?: number;
  readonly defaultTextColor?: string;
  readonly defaultFill?: string;
  readonly defaultBorder?: BorderStyle;
  readonly defaultAlignment?: TextAlignment;
  readonly noteXPadding?: number;
}

export const DEFAULT_THEME: Required<RenderTheme> = {
  backgroundColor: "#ffffff",
  backgroundPattern: "none",
  patternColor: "#cccccc",
  strokeColor: "#cccccc",
  strokeWidth: 1,
  lineColor: "#666666",
  lineWidth: 1,
  arrowColor: "#666666",
  shadowColor: "#00000033",
  shadowEnabled: true,
  borderRadius: 8,
  defaultFont: "Helvetica",
  defaultFontSize: 12,
  defaultTextColor: "#000000",
  defaultFill: "none",
  defaultBorder: "None",
  defaultAlignment: "Center",
  noteXPadding: 8,
};
