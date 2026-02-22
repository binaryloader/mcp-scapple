import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { RenderTheme } from "../types.js";
import { textToNotes } from "../lib/layout.js";
import { buildDocument, build } from "../lib/builder.js";
import { renderToPng } from "../lib/renderer.js";
import { ScappleIOError } from "../errors.js";

export async function textToScapple(
  text: string,
  filePath: string,
  renderImage?: boolean,
  scale?: number,
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

  const notes = textToNotes(text);
  if (notes.length === 0) {
    return JSON.stringify({
      filePath,
      noteCount: 0,
      message: "No content found in the provided text.",
    });
  }

  const doc = buildDocument({ notes });
  const xml = build(doc);

  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });

  try {
    await writeFile(filePath, xml, "utf-8");
  } catch (err) {
    throw new ScappleIOError(
      `Failed to write file: ${filePath}`,
      "IO_WRITE_FAILED",
      { filePath, error: err instanceof Error ? err.message : String(err) }
    );
  }

  const result: Record<string, unknown> = {
    filePath,
    noteCount: notes.length,
    message: `Successfully created ${notes.length} notes from text in ${filePath}`,
  };

  if (renderImage) {
    const imagePath = filePath.replace(/\.scap$/i, ".png");
    const renderResult = await renderToPng(doc, imagePath, { scale, theme });
    result.imagePath = renderResult.outputPath;
    result.imageWidth = renderResult.width;
    result.imageHeight = renderResult.height;
  }

  return JSON.stringify(result);
}
