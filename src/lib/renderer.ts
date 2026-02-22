import sharp from "sharp";
import type { ScappleDocument } from "../types.js";
import { ScappleRenderError } from "../errors.js";
import { buildSvg } from "./svg/index.js";

export interface RenderOptions {
  readonly scale?: number;
  readonly padding?: number;
}

export interface RenderResult {
  readonly width: number;
  readonly height: number;
  readonly outputPath: string;
}

export async function renderToSvg(
  doc: ScappleDocument,
  padding?: number
): Promise<string> {
  try {
    return buildSvg(doc, padding);
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

  const svg = await renderToSvg(doc, padding);
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
