import { readFile } from "node:fs/promises";
import path from "node:path";
import type { RenderTheme } from "../types.js";
import { parse } from "../lib/parser.js";
import { renderToPng } from "../lib/renderer.js";
import { ScappleIOError } from "../errors.js";

export async function scappleToImage(
  filePath: string,
  outputPath?: string,
  scale?: number,
  padding?: number,
  theme?: RenderTheme
): Promise<string> {
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
  const outPath = outputPath ?? filePath.replace(/\.scap$/i, ".png");

  const result = await renderToPng(doc, outPath, { scale, padding, theme });

  return JSON.stringify({
    inputPath: filePath,
    outputPath: result.outputPath,
    width: result.width,
    height: result.height,
    noteCount: doc.notes.length,
    message: `Successfully rendered ${doc.notes.length} notes to ${result.outputPath} (${result.width}x${result.height})`,
  });
}
