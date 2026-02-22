const AVG_CHAR_WIDTH_RATIO = 0.6;
const CJK_CHAR_WIDTH_RATIO = 1.0;

function isCJK(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3040 && code <= 0x309f) ||
    (code >= 0x30a0 && code <= 0x30ff) ||
    (code >= 0xac00 && code <= 0xd7af)
  );
}

export function measureTextWidth(
  text: string,
  fontSize: number
): number {
  let width = 0;
  for (const char of text) {
    if (isCJK(char)) {
      width += fontSize * CJK_CHAR_WIDTH_RATIO;
    } else {
      width += fontSize * AVG_CHAR_WIDTH_RATIO;
    }
  }
  return width;
}

export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      if (!currentLine) {
        currentLine = word;
        continue;
      }
      const testLine = `${currentLine} ${word}`;
      if (measureTextWidth(testLine, fontSize) <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines.length > 0 ? lines : [""];
}

export function getLineHeight(fontSize: number): number {
  return fontSize * 1.3;
}
