// src/output/parser.ts
// Parsea y valida el string de output del LLM contra el schema correcto.
// Si el LLM no devuelve JSON válido, retorna un ParseFailure con el
// texto original preservado — nunca crashea el sistema.
// V2 extension: agregar reintentos con prompt de corrección cuando falle.

import type { OrchestratorMode } from "../types.js";
import {
  PlanOutputSchema,
  RouteOutputSchema,
  BlueprintOutputSchema,
  AuditOutputSchema,
  ScaffoldOutputSchema,
  MemoryOutputSchema,
} from "./schemas.js";
import type { StructuredOutput } from "./schemas.js";

export interface ParseSuccess {
  success: true;
  data: StructuredOutput;
}

export interface ParseFailure {
  success: false;
  error: string;
  raw: string;
}

export type ParseResult = ParseSuccess | ParseFailure;

// Extrae JSON de un string que puede tener texto libre alrededor.
// El LLM a veces envuelve JSON en ```json ... ``` o agrega texto antes.
function extractJson(raw: string): string {
  // Intentar extraer bloque ```json ... ```
  const fenced = raw.match(/```json\s*([\s\S]*?)```/);
  if (fenced?.[1]) return fenced[1].trim();

  // Intentar extraer bloque ``` ... ```
  const plain = raw.match(/```\s*([\s\S]*?)```/);
  if (plain?.[1]) return plain[1].trim();

  // Intentar encontrar el primer { ... } balanceado
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return raw.slice(start, end + 1).trim();
  }

  return raw.trim();
}

function selectSchema(mode: OrchestratorMode):
  | typeof PlanOutputSchema
  | typeof RouteOutputSchema
  | typeof BlueprintOutputSchema
  | typeof AuditOutputSchema
  | typeof ScaffoldOutputSchema
  | typeof MemoryOutputSchema {
  switch (mode) {
    case "plan":
      return PlanOutputSchema;
    case "route":
      return RouteOutputSchema;
    case "blueprint":
      return BlueprintOutputSchema;
    case "audit":
      return AuditOutputSchema;
    case "scaffold":
      return ScaffoldOutputSchema;
    case "memory":
      return MemoryOutputSchema;
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

export function parseOutput(
  raw: string,
  mode: OrchestratorMode
): ParseResult {
  const schema = selectSchema(mode);
  const extracted = extractJson(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(extracted);
  } catch {
    return {
      success: false,
      error: "Output is not valid JSON",
      raw,
    };
  }

  // Inyectar mode si el LLM lo omitió
  if (typeof parsed === "object" && parsed !== null && !("mode" in parsed)) {
    (parsed as Record<string, unknown>)["mode"] = mode;
  }

  const result = schema.safeParse(parsed);

  if (!result.success) {
    return {
      success: false,
      error: JSON.stringify(result.error.flatten().fieldErrors, null, 2),
      raw,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}