import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { createSafeError } from "../errors/errorTaxonomy.js";
import type { SafeError } from "../errors/errorTaxonomy.js";
import { logger } from "../observability/logger.js";
import {
  redactString,
  type RedactionMetadata,
} from "../privacy/redactionEngine.js";
import { deriveProjectIdentity } from "../supervisor/projectIdentity.js";
import {
  SCREENSHOT_TRACE_STORE_VERSION,
  type AppendScreenshotTraceMetadataInput,
  type ScreenshotTraceMetadata,
  type ScreenshotTraceStats,
  type ScreenshotTraceStoreData,
  type ScreenshotTraceViewport,
} from "./types.js";

const DATA_DIR = join(homedir(), ".orquestador-prime");
const SCREENSHOT_TRACE_FILE = join(DATA_DIR, "screenshot-traces.json");
const MAX_SCREENSHOT_TRACE_ENTRIES = 1000;

const EMPTY_VIEWPORT: ScreenshotTraceViewport = {
  width: null,
  height: null,
  deviceScaleFactor: null,
};

const EMPTY_STORE: ScreenshotTraceStoreData = {
  version: SCREENSHOT_TRACE_STORE_VERSION,
  traces: [],
  lastUpdatedAt: null,
};

function generateTraceId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `scr_${ts}_${rand}`;
}

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function cloneRedaction(metadata: RedactionMetadata): RedactionMetadata {
  return {
    removedKinds: metadata.removedKinds.slice(),
    containsSecrets: metadata.containsSecrets,
    containsRawIdentity: metadata.containsRawIdentity,
    containsRawBody: metadata.containsRawBody,
    containsFileContent: metadata.containsFileContent,
    truncated: metadata.truncated,
    redactionVersion: metadata.redactionVersion,
  };
}

function mergeRedaction(items: RedactionMetadata[]): RedactionMetadata {
  const first = items[0];
  return {
    removedKinds: [...new Set(items.flatMap((item) => item.removedKinds))].sort(),
    containsSecrets: items.some((item) => item.containsSecrets),
    containsRawIdentity: items.some((item) => item.containsRawIdentity),
    containsRawBody: items.some((item) => item.containsRawBody),
    containsFileContent: items.some((item) => item.containsFileContent),
    truncated: items.some((item) => item.truncated),
    redactionVersion: first?.redactionVersion ?? "1.0",
  };
}

function cloneViewport(viewport: ScreenshotTraceViewport): ScreenshotTraceViewport {
  return {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
  };
}

function cloneTrace(trace: ScreenshotTraceMetadata): ScreenshotTraceMetadata {
  return {
    traceId: trace.traceId,
    version: trace.version,
    projectId: trace.projectId,
    projectName: trace.projectName,
    projectRootHash: trace.projectRootHash,
    createdAt: trace.createdAt,
    source: trace.source,
    screenHash: trace.screenHash,
    screenshotRef: trace.screenshotRef,
    viewport: cloneViewport(trace.viewport),
    windowTitlePreview: trace.windowTitlePreview,
    urlHost: trace.urlHost,
    redaction: cloneRedaction(trace.redaction),
    linkedProposalId: trace.linkedProposalId,
    linkedJobId: trace.linkedJobId,
    storageMode: trace.storageMode,
    correlationId: trace.correlationId,
  };
}

function normalizeViewport(
  viewport: Partial<ScreenshotTraceViewport> | undefined,
): ScreenshotTraceViewport {
  return {
    width: Number.isFinite(viewport?.width ?? Number.NaN)
      ? Number(viewport?.width)
      : null,
    height: Number.isFinite(viewport?.height ?? Number.NaN)
      ? Number(viewport?.height)
      : null,
    deviceScaleFactor: Number.isFinite(viewport?.deviceScaleFactor ?? Number.NaN)
      ? Number(viewport?.deviceScaleFactor)
      : null,
  };
}

function hostFromUrl(value: string | null | undefined): {
  host: string | null;
  redaction: RedactionMetadata;
} {
  if (!value) {
    const empty = redactString("", { maxLength: 1 });
    return { host: null, redaction: empty.metadata };
  }

  const redacted = redactString(value, { maxLength: 300 });
  try {
    const parsed = new URL(redacted.value);
    return { host: parsed.host || null, redaction: redacted.metadata };
  } catch {
    return { host: null, redaction: redacted.metadata };
  }
}

function safeScreenshotRef(value: string | null | undefined): {
  ref: string | null;
  redaction: RedactionMetadata;
} {
  if (!value) {
    const empty = redactString("", { maxLength: 1 });
    return { ref: null, redaction: empty.metadata };
  }
  const redacted = redactString(value, { maxLength: 120 });
  return {
    ref: `ref:${hashValue(redacted.value).slice(0, 16)}:${redacted.safePreview}`,
    redaction: redacted.metadata,
  };
}

function looksLikeRawImage(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }
  const trimmed = value.trim();
  return (
    trimmed.startsWith("data:image/") ||
    trimmed.length > 4096 ||
    /^[A-Za-z0-9+/]{500,}={0,2}$/.test(trimmed)
  );
}

function unsafeTraceError(input: {
  correlationId?: string | null | undefined;
  reason: string;
}): SafeError {
  return createSafeError("redaction.unsafe", {
    correlationId: input.correlationId ?? null,
    safeMessage: input.reason,
    auditHint: "Screenshot trace metadata must not include raw screenshot or base64 image content.",
  });
}

export async function readScreenshotTraceStore(): Promise<ScreenshotTraceStoreData> {
  try {
    const raw = await readFile(SCREENSHOT_TRACE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ScreenshotTraceStoreData;
    if (
      parsed.version !== SCREENSHOT_TRACE_STORE_VERSION ||
      !Array.isArray(parsed.traces)
    ) {
      return { ...EMPTY_STORE, traces: [] };
    }
    return {
      version: SCREENSHOT_TRACE_STORE_VERSION,
      traces: parsed.traces.map(cloneTrace),
      lastUpdatedAt: parsed.lastUpdatedAt ?? null,
    };
  } catch {
    return { ...EMPTY_STORE, traces: [] };
  }
}

async function writeScreenshotTraceStore(
  store: ScreenshotTraceStoreData,
): Promise<boolean> {
  try {
    const normalized: ScreenshotTraceStoreData = {
      version: SCREENSHOT_TRACE_STORE_VERSION,
      traces: store.traces.slice(-MAX_SCREENSHOT_TRACE_ENTRIES).map(cloneTrace),
      lastUpdatedAt: new Date().toISOString(),
    };
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(
      SCREENSHOT_TRACE_FILE,
      JSON.stringify(normalized, null, 2),
      "utf-8",
    );
    return true;
  } catch (err) {
    logger.warn("screenshot trace store write failed - continuing without persistence", {
      error: String(err),
    });
    return false;
  }
}

export async function appendScreenshotTraceMetadata(
  input: AppendScreenshotTraceMetadataInput,
): Promise<{
  trace: ScreenshotTraceMetadata | null;
  persisted: boolean;
  error: SafeError | null;
}> {
  if (
    looksLikeRawImage(input.screenshotRef) ||
    looksLikeRawImage(input.screenHash) ||
    looksLikeRawImage(input.windowTitle) ||
    looksLikeRawImage(input.url)
  ) {
    return {
      trace: null,
      persisted: false,
      error: unsafeTraceError({
        correlationId: input.correlationId,
        reason: "Screenshot trace metadata rejected raw image-like content.",
      }),
    };
  }

  const identity = deriveProjectIdentity(input.projectRoot);
  const createdAt = input.createdAt ?? new Date().toISOString();
  const title = input.windowTitle
    ? redactString(input.windowTitle, { maxLength: 140 })
    : null;
  const url = hostFromUrl(input.url);
  const screenshotRef = safeScreenshotRef(input.screenshotRef);
  const redaction = mergeRedaction([
    ...(title ? [title.metadata] : []),
    url.redaction,
    screenshotRef.redaction,
  ]);

  if (
    redaction.containsSecrets ||
    redaction.containsRawBody ||
    redaction.containsFileContent
  ) {
    return {
      trace: null,
      persisted: false,
      error: unsafeTraceError({
        correlationId: input.correlationId,
        reason: "Screenshot trace metadata contains unsafe redacted content.",
      }),
    };
  }

  const trace: ScreenshotTraceMetadata = {
    traceId: generateTraceId(),
    version: SCREENSHOT_TRACE_STORE_VERSION,
    projectId: identity.projectId,
    projectName: identity.projectName,
    projectRootHash: identity.projectRootHash,
    createdAt,
    source: input.source ?? "cli",
    screenHash: input.screenHash ? hashValue(input.screenHash) : null,
    screenshotRef: screenshotRef.ref,
    viewport: normalizeViewport(input.viewport ?? EMPTY_VIEWPORT),
    windowTitlePreview: title?.safePreview ?? null,
    urlHost: url.host,
    redaction,
    linkedProposalId: input.linkedProposalId ?? null,
    linkedJobId: input.linkedJobId ?? null,
    storageMode: "metadata-only",
    correlationId: input.correlationId ?? null,
  };

  const store = await readScreenshotTraceStore();
  store.traces.push(trace);
  const persisted = await writeScreenshotTraceStore(store);

  return {
    trace: cloneTrace(trace),
    persisted,
    error: persisted
      ? null
      : createSafeError("store.write_failed", {
          correlationId: input.correlationId ?? null,
          source: "screenshotTraceStore",
        }),
  };
}

export async function getRecentScreenshotTraces(
  n = 50,
): Promise<ScreenshotTraceMetadata[]> {
  const store = await readScreenshotTraceStore();
  return store.traces.slice(-n).map(cloneTrace);
}

export async function getScreenshotTraceStats(): Promise<ScreenshotTraceStats> {
  const store = await readScreenshotTraceStore();
  const stats: ScreenshotTraceStats = {
    total: store.traces.length,
    bySource: {},
    byStorageMode: { "metadata-only": 0 },
  };

  for (const trace of store.traces) {
    stats.bySource[trace.source] = (stats.bySource[trace.source] ?? 0) + 1;
    stats.byStorageMode[trace.storageMode] =
      (stats.byStorageMode[trace.storageMode] ?? 0) + 1;
  }

  return stats;
}

export function getScreenshotTracePath(): string {
  return SCREENSHOT_TRACE_FILE;
}
