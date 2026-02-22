export function parseIdRange(value: string): number[] {
  if (!value.trim()) return [];
  const ids: number[] = [];
  const parts = value.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          ids.push(i);
        }
      }
    } else {
      const id = parseInt(trimmed, 10);
      if (!isNaN(id)) {
        ids.push(id);
      }
    }
  }
  return ids;
}

export function serializeIdRange(ids: readonly number[]): string {
  if (ids.length === 0) return "";
  const sorted = [...ids].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(", ");
}
