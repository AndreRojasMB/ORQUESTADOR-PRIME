import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { dirname, join } from "path";
import type {
  ViernesBridgeOperationalMode,
  ViernesBridgeStatusRecord,
  ViernesBridgeStoredStatus,
} from "./types.js";

export interface ViernesBridgeStatusStoreOptions {
  dataDir?: string;
  env?: NodeJS.ProcessEnv;
  path?: string;
}

export interface RecordViernesBridgeHandshakeInput {
  mode: ViernesBridgeOperationalMode;
  status: ViernesBridgeStoredStatus;
  connected?: boolean;
  intent?: string;
  errorCode?: string;
  requestId?: string;
  at?: string;
}

const MODES = new Set(["local_http", "cli", "unknown"]);
const SENSITIVE_FIELD_PATTERN =
  /(token|secret|authorization|cookie|password|api[_-]?key|bearer|act)/i;
const SAFE_TEXT_PATTERN = /^[a-zA-Z0-9_.:/-]+$/;
const DEFAULT_STATUS: ViernesBridgeStatusRecord = {
  connected: false,
  mode: "unknown",
  writesEnabled: false,
};

export function getViernesBridgeStatusPath(
  options: ViernesBridgeStatusStoreOptions = {},
): string {
  const env = options.env ?? process.env;
  const dataDir =
    options.dataDir ?? env.ORQUESTADOR_DATA_DIR?.trim() ?? join(homedir(), ".orquestador-prime");
  return (
    options.path ??
    join(dataDir, "viernes-bridge-status.json")
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function safeText(value: unknown, maxLength = 160): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > maxLength) return trimmed.slice(0, maxLength);
  return trimmed;
}

function safeCode(value: unknown): string | undefined {
  const text = safeText(value, 120);
  if (!text) return undefined;
  if (SENSITIVE_FIELD_PATTERN.test(text)) return undefined;
  if (!SAFE_TEXT_PATTERN.test(text)) return undefined;
  return text;
}

function sanitizeRecord(record: ViernesBridgeStatusRecord): ViernesBridgeStatusRecord {
  const sanitized: ViernesBridgeStatusRecord = {
    connected: record.connected,
    mode: MODES.has(record.mode) ? record.mode : "unknown",
    writesEnabled: false,
  };

  const lastHandshakeAt = safeText(record.lastHandshakeAt);
  if (lastHandshakeAt) sanitized.lastHandshakeAt = lastHandshakeAt;

  const lastStatus = safeCode(record.lastStatus);
  if (lastStatus) sanitized.lastStatus = lastStatus as ViernesBridgeStoredStatus;

  const lastIntent = safeCode(record.lastIntent);
  if (lastIntent) sanitized.lastIntent = lastIntent;

  const lastErrorCode = safeCode(record.lastErrorCode);
  if (lastErrorCode) sanitized.lastErrorCode = lastErrorCode;

  const requestId = safeCode(record.requestId);
  if (requestId) sanitized.requestId = requestId;

  return sanitized;
}

function isViernesBridgeStatusRecord(
  value: unknown,
): value is ViernesBridgeStatusRecord {
  if (!isObject(value)) return false;
  return (
    typeof value.connected === "boolean" &&
    typeof value.mode === "string" &&
    MODES.has(value.mode) &&
    value.writesEnabled === false
  );
}

export async function readViernesBridgeStatus(
  options: ViernesBridgeStatusStoreOptions = {},
): Promise<ViernesBridgeStatusRecord> {
  try {
    const raw = (await readFile(getViernesBridgeStatusPath(options), "utf-8")).replace(
      /^\uFEFF/,
      "",
    );
    const parsed = JSON.parse(raw) as unknown;
    if (!isViernesBridgeStatusRecord(parsed)) {
      return DEFAULT_STATUS;
    }
    return sanitizeRecord(parsed);
  } catch {
    return DEFAULT_STATUS;
  }
}

export async function writeViernesBridgeStatus(
  record: ViernesBridgeStatusRecord,
  options: ViernesBridgeStatusStoreOptions = {},
): Promise<boolean> {
  try {
    const path = getViernesBridgeStatusPath(options);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(sanitizeRecord(record), null, 2)}\n`, "utf-8");
    return true;
  } catch {
    return false;
  }
}

export async function recordViernesBridgeHandshake(
  input: RecordViernesBridgeHandshakeInput,
  options: ViernesBridgeStatusStoreOptions = {},
): Promise<ViernesBridgeStatusRecord> {
  const connected =
    input.connected ??
    !["unauthorized", "invalid_request", "error"].includes(input.status);
  const record: ViernesBridgeStatusRecord = {
    connected,
    mode: input.mode,
    writesEnabled: false,
    lastHandshakeAt: input.at ?? new Date().toISOString(),
    lastStatus: input.status,
  };

  const intent = safeCode(input.intent);
  if (intent) record.lastIntent = intent;

  const errorCode = safeCode(input.errorCode);
  if (errorCode) record.lastErrorCode = errorCode;

  const requestId = safeCode(input.requestId);
  if (requestId) record.requestId = requestId;

  const sanitized = sanitizeRecord(record);
  await writeViernesBridgeStatus(sanitized, options);
  return sanitized;
}
