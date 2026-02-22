# mcp-scapple

An MCP (Model Context Protocol) server for reading, writing, and rendering [Scapple](https://www.literatureandlatte.com/scapple/overview) (.scap) files. Scapple is a brainstorming tool by Literature & Latte that stores diagrams as XML. This server enables AI assistants to work with Scapple files directly.

## Features

- **read-scapple**: Parse a .scap file into structured JSON with notes, positions, connections, and styling
- **write-scapple**: Create a .scap file from structured note data with automatic bidirectional connection management
- **scapple-to-image**: Render a .scap file to PNG with configurable scale and padding
- **text-to-scapple**: Convert indented text, bullet lists, or numbered lists into Scapple diagrams with automatic layout

## Components

| Path | Description |
|---|---|
| `src/index.ts` | MCP server entrypoint |
| `src/types.ts` | TypeScript type definitions |
| `src/errors.ts` | Custom error class hierarchy |
| `src/lib/parser.ts` | .scap XML to ScappleDocument parser |
| `src/lib/builder.ts` | ScappleDocument to .scap XML builder |
| `src/lib/renderer.ts` | SVG/PNG rendering pipeline |
| `src/lib/layout.ts` | Text-to-diagram automatic layout |
| `src/lib/svg/` | SVG generation modules (shapes, connections, text) |
| `src/tools/` | MCP tool handlers |
| `examples/` | Example .scap files |

## Requirements

- Node.js 18+
- npm

## Usage

### 1. Install Dependencies

```bash
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Configure in Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "scapple": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-scapple/dist/index.js"]
    }
  }
}
```

### 4. Tool Usage

**read-scapple** — Read a Scapple file:
```
filePath: "/path/to/diagram.scap"
```

**write-scapple** — Create a Scapple file:
```
filePath: "/path/to/output.scap"
document: { notes: [{ x: 100, y: 100, text: "Hello" }] }
```

**scapple-to-image** — Render to PNG:
```
filePath: "/path/to/diagram.scap"
scale: 2
```

**text-to-scapple** — Convert text to diagram:
```
text: "Root Topic\n  Branch A\n    Leaf 1\n  Branch B"
filePath: "/path/to/output.scap"
renderImage: true
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
