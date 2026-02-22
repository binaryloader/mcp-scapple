import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { buildDocument, build } from "../lib/builder.js";
import { ScappleIOError } from "../errors.js";
import type { DocumentInput } from "../types.js";

export async function writeScapple(
  filePath: string,
  document: DocumentInput
): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".scap") {
    throw new ScappleIOError(
      `File must have .scap extension: ${filePath}`,
      "IO_INVALID_PATH",
      { filePath }
    );
  }

  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });

  const doc = buildDocument(document);
  const xml = build(doc);

  try {
    await writeFile(filePath, xml, "utf-8");
  } catch (err) {
    throw new ScappleIOError(
      `Failed to write file: ${filePath}`,
      "IO_WRITE_FAILED",
      { filePath, error: err instanceof Error ? err.message : String(err) }
    );
  }

  return JSON.stringify({
    filePath,
    noteCount: doc.notes.length,
    message: `Successfully wrote ${doc.notes.length} notes to ${filePath}`,
  });
}
