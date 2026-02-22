import sharp from "sharp";
import type { ScappleDocument, RenderTheme } from "../types.js";
import { ScappleRenderError } from "../errors.js";
import { buildSvg } from "./svg/index.js";

export interface RenderOptions {
  readonly scale?: number;
  readonly padding?: number;
  readonly theme?: RenderTheme;
}

export interface RenderResult {
  readonly width: number;
  readonly height: number;
  readonly outputPath: string;
}

export async function renderToSvg(
  doc: ScappleDocument,
  padding?: number,
  theme?: RenderTheme
): Promise<string> {
  try {
    return buildSvg(doc, padding, theme);
  } catch (err) {
    throw new ScappleRenderError(
      `Failed to generate SVG: ${err instanceof Error ? err.message : String(err)}`,
      "RENDER_SVG_FAILED"
    );
  }
}

export async function renderToPng(
  doc: ScappleDocument,
  outputPath: string,
  options: RenderOptions = {}
): Promise<RenderResult> {
  const scale = options.scale ?? 2;
  const padding = options.padding ?? 40;

  const svg = await renderToSvg(doc, padding, options.theme);
  const svgBuffer = Buffer.from(svg, "utf-8");

  try {
    const density = 72 * scale;
    const result = await sharp(svgBuffer, { density })
      .png()
      .toFile(outputPath);

    return {
      width: result.width,
      height: result.height,
      outputPath,
    };
  } catch (err) {
    throw new ScappleRenderError(
      `Failed to convert SVG to PNG: ${err instanceof Error ? err.message : String(err)}`,
      "RENDER_PNG_FAILED",
      { outputPath }
    );
  }
}
