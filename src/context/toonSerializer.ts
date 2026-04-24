// src/context/toonSerializer.ts
// Tabular TOON (Token-Oriented Object Notation) serializer for prompt context.
// Prompt-only utility — does NOT touch any JSON store on disk.
//
// Emits:
//   <name>(<field_count>,<row_count>):
//     col1 | col2 | col3
//     v1a | v1b | v1c
//     v2a | v2b | v2c
//
// Quoting rules:
//   - scalar cells (string | number | boolean | null | undefined) only
//   - null/undefined → "-"
//   - strings containing "|", "\n", or leading/trailing whitespace are quoted
//   - internal quotes are doubled ("" — CSV-style)
//
// Pure function; no external deps.

export type ToonCell = string | number | boolean | null | undefined;

export interface ToonTableInput {
  name: string;
  headers: string[];
  rows: ToonCell[][];
}

const SEP = " | ";
const EMPTY = "-";

function needsQuote(s: string): boolean {
  return (
    s.includes("|") ||
    s.includes("\n") ||
    s.includes('"') ||
    s !== s.trim()
  );
}

function renderCell(cell: ToonCell): string {
  if (cell === null || cell === undefined) return EMPTY;
  if (typeof cell === "number") return Number.isFinite(cell) ? String(cell) : EMPTY;
  if (typeof cell === "boolean") return cell ? "true" : "false";
  const s = String(cell);
  if (s.length === 0) return EMPTY;
  if (needsQuote(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toonSerializeTable(input: ToonTableInput): string {
  const { name, headers, rows } = input;

  if (headers.length === 0) return "";

  const headerLine = headers.join(SEP);
  const dataLines = rows.map((row) => {
    // Defensive: pad or truncate to the header width so columns stay aligned.
    const cells: string[] = [];
    for (let i = 0; i < headers.length; i++) {
      cells.push(renderCell(row[i]));
    }
    return cells.join(SEP);
  });

  const lines = [`${name}(${headers.length},${rows.length}):`, `  ${headerLine}`];
  for (const d of dataLines) {
    lines.push(`  ${d}`);
  }
  return lines.join("\n");
}
