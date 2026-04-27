import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { redactString, redactStructuredValue } from "../privacy/redactionEngine.js";
import type { RedactionMetadata } from "../privacy/redactionEngine.js";
import type {
  RiskAssessmentInput,
  RiskEvalReportMetadata,
  RiskSensitiveDataFlags,
} from "./types.js";

export interface ParsedRiskInput {
  input: RiskAssessmentInput;
  safePreview: string;
  inputHash: string;
  redaction: RedactionMetadata;
}

function hashText(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function redactionFlags(metadata: RedactionMetadata): RiskSensitiveDataFlags {
  return {
    removedKinds: metadata.removedKinds.slice().sort(),
    containsSecrets: metadata.containsSecrets,
    containsRawIdentity: metadata.containsRawIdentity,
    containsRawBody: metadata.containsRawBody,
    containsFileContent: metadata.containsFileContent,
    unsafe:
      metadata.containsSecrets ||
      metadata.containsRawBody ||
      metadata.containsFileContent,
  };
}

export async function readJsonFile(path: string): Promise<unknown> {
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw) as unknown;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Unable to read JSON file: ${message}`);
  }
}

export async function readStdinIfAvailable(): Promise<string | null> {
  if (process.stdin.isTTY) {
    return null;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }

  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  return raw.length > 0 ? raw : null;
}

export function parseRiskInput(raw: unknown): ParsedRiskInput {
  let parsed: unknown = raw;

  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      parsed = { task: raw };
    }
  }

  if (!isObject(parsed)) {
    throw new Error("Risk input must be a JSON object or task text.");
  }

  const redacted = redactStructuredValue(parsed, { maxLength: 1_000 });
  const taskValue = parsed.task;
  const task =
    typeof taskValue === "string"
      ? redactString(taskValue, { maxLength: 500 }).safePreview
      : undefined;
  const input = {
    ...(redacted.value as RiskAssessmentInput),
    ...(task ? { task } : {}),
  } satisfies RiskAssessmentInput;

  const flags = redactionFlags(redacted.metadata);
  input.sensitiveData = {
    ...(input.sensitiveData ?? {}),
    removedKinds: [
      ...new Set([
        ...(input.sensitiveData?.removedKinds ?? []).map(String),
        ...flags.removedKinds,
      ]),
    ].sort(),
    containsSecrets: input.sensitiveData?.containsSecrets === true || flags.containsSecrets,
    containsRawIdentity:
      input.sensitiveData?.containsRawIdentity === true || flags.containsRawIdentity,
    containsRawBody: input.sensitiveData?.containsRawBody === true || flags.containsRawBody,
    containsFileContent:
      input.sensitiveData?.containsFileContent === true || flags.containsFileContent,
    unsafe: input.sensitiveData?.unsafe === true || flags.unsafe,
  };

  return {
    input,
    safePreview: redacted.safePreview,
    inputHash: hashText(redacted.safePreview),
    redaction: redacted.metadata,
  };
}

export async function readEvalReport(path: string): Promise<RiskEvalReportMetadata> {
  const parsed = await readJsonFile(path);
  if (!isObject(parsed)) {
    throw new Error("Eval report must be a JSON object.");
  }
  return parsed as RiskEvalReportMetadata;
}

export function buildSyntheticRiskInput(): RiskAssessmentInput {
  return {
    task: "unspecified local assessment",
    taskMetadata: {
      source: "risk-assess-cli",
      warning: "No explicit input was supplied.",
    },
  };
}
