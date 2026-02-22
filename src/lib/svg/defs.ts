import type { RenderTheme } from "../../types.js";
import { DEFAULT_THEME } from "../../types.js";

export function buildDefs(theme: Required<RenderTheme> = DEFAULT_THEME): string {
  const shadowFilter = theme.shadowEnabled
    ? `<filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="${theme.shadowColor}"/>
    </filter>`
    : "";

  return `<defs>
    ${shadowFilter}
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="${theme.arrowColor}"/>
    </marker>
  </defs>`;
}
