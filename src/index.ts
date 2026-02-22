#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readScapple } from "./tools/read-scapple.js";
import { writeScapple } from "./tools/write-scapple.js";
import { scappleToImage } from "./tools/scapple-to-image.js";
import { textToScapple } from "./tools/text-to-scapple.js";
import { ScappleError } from "./errors.js";

const server = new McpServer({
  name: "mcp-scapple",
  version: "1.0.0",
});

function errorResult(err: unknown): { content: { type: "text"; text: string }[] } {
  const message = err instanceof ScappleError
    ? `[${err.code}] ${err.message}`
    : err instanceof Error
      ? err.message
      : String(err);
  return { content: [{ type: "text" as const, text: `Error: ${message}` }] };
}

server.tool(
  "read-scapple",
  "Read and parse a Scapple (.scap) file into structured JSON. Returns all notes with their positions, text, appearance, and connections.",
  { filePath: z.string().describe("Absolute path to the .scap file") },
  async ({ filePath }) => {
    try {
      const result = await readScapple(filePath);
      return { content: [{ type: "text" as const, text: result }] };
    } catch (err) {
      return errorResult(err);
    }
  }
);

server.tool(
  "write-scapple",
  "Create a new Scapple (.scap) file from structured note data. Each note needs at minimum x, y coordinates and text. Connections and styling are optional.",
  {
    filePath: z.string().describe("Absolute path for the output .scap file"),
    document: z.object({
      notes: z.array(z.object({
        x: z.number().describe("X coordinate"),
        y: z.number().describe("Y coordinate"),
        text: z.string().describe("Note text content"),
        id: z.number().optional().describe("Note ID (auto-assigned if omitted)"),
        width: z.number().optional().describe("Note width (default: 140)"),
        height: z.number().optional().describe("Note height (default: 30)"),
        alignment: z.enum(["Left", "Center", "Right"]).optional(),
        border: z.enum(["Rounded", "Square", "Cloud", "None"]).optional(),
        fill: z.string().optional().describe("Fill color as hex (e.g. '#ffeb3b')"),
        textColor: z.string().optional().describe("Text color as hex"),
        fontSize: z.number().optional().describe("Font size (default: 12)"),
        connectedNoteIDs: z.array(z.number()).optional().describe("IDs of connected notes"),
        pointsToNoteIDs: z.array(z.number()).optional().describe("IDs of notes this note points to (arrow)"),
      })).describe("Array of notes to create"),
      backgroundColor: z.string().optional().describe("Background color as hex"),
    }).describe("Document structure with notes and optional settings"),
  },
  async ({ filePath, document }) => {
    try {
      const result = await writeScapple(filePath, document);
      return { content: [{ type: "text" as const, text: result }] };
    } catch (err) {
      return errorResult(err);
    }
  }
);

server.tool(
  "scapple-to-image",
  "Convert a Scapple (.scap) file to a PNG image. Renders all notes, connections, and arrows with proper styling.",
  {
    filePath: z.string().describe("Absolute path to the .scap file"),
    outputPath: z.string().optional().describe("Output PNG path (default: same name with .png extension)"),
    scale: z.number().optional().describe("Render scale factor (default: 2 for Retina)"),
    padding: z.number().optional().describe("Canvas padding in pixels (default: 40)"),
  },
  async ({ filePath, outputPath, scale, padding }) => {
    try {
      const result = await scappleToImage(filePath, outputPath, scale, padding);
      return { content: [{ type: "text" as const, text: result }] };
    } catch (err) {
      return errorResult(err);
    }
  }
);

server.tool(
  "text-to-scapple",
  "Convert structured text into a Scapple diagram. Accepts indented text, bullet lists, or numbered lists. Hierarchy is determined by indentation depth. Root items become cloud-shaped nodes, children become rounded nodes with arrows.",
  {
    text: z.string().describe("Structured text with indentation to define hierarchy. Supports bullet points (-, *, •) and numbered lists."),
    filePath: z.string().describe("Absolute path for the output .scap file"),
    renderImage: z.boolean().optional().describe("Also render a PNG image (default: false)"),
    scale: z.number().optional().describe("Image scale factor if rendering (default: 2)"),
  },
  async ({ text, filePath, renderImage, scale }) => {
    try {
      const result = await textToScapple(text, filePath, renderImage, scale);
      return { content: [{ type: "text" as const, text: result }] };
    } catch (err) {
      return errorResult(err);
    }
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});
