// src/lightrag/lightragClient.ts
// HTTP client for the LightRAG server.
// Supports document insertion (text/file) and query with mode selection.

import { readFile } from "fs/promises";
import { basename } from "path";
import { LIGHTRAG_CONFIG } from "../config.js";

// ─── Types ───────────────────────────────────────────────────────

export type LightRAGQueryMode = "naive" | "local" | "global" | "hybrid";

export interface LightRAGInsertTextRequest {
  text: string;
  description?: string | undefined;
}

export interface LightRAGInsertResponse {
  ok: boolean;
  trackId?: string | undefined;
  error?: string | undefined;
}

export interface LightRAGQueryRequest {
  query: string;
  mode: LightRAGQueryMode;
  onlyNeedContext?: boolean | undefined;
}

export interface LightRAGQueryResponse {
  ok: boolean;
  response?: string | undefined;
  error?: string | undefined;
}

// ─── Helpers ─────────────────────────────────────────────────────

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (LIGHTRAG_CONFIG.apiKey) {
    h["X-API-Key"] = LIGHTRAG_CONFIG.apiKey;
  }
  return h;
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  if (LIGHTRAG_CONFIG.apiKey) {
    h["X-API-Key"] = LIGHTRAG_CONFIG.apiKey;
  }
  return h;
}

function baseUrl(): string {
  return LIGHTRAG_CONFIG.baseUrl.replace(/\/+$/, "");
}

// ─── Client ──────────────────────────────────────────────────────

export async function insertText(
  request: LightRAGInsertTextRequest
): Promise<LightRAGInsertResponse> {
  const url = `${baseUrl()}/documents/text`;

  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      text: request.text,
      ...(request.description && { description: request.description }),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: `LightRAG insert failed (${res.status}): ${body}` };
  }

  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  return {
    ok: true,
    ...(data && typeof data.track_id === "string" && { trackId: data.track_id }),
  };
}

export async function insertFile(
  filePath: string
): Promise<LightRAGInsertResponse> {
  const url = `${baseUrl()}/documents/file`;

  const fileContent = await readFile(filePath);
  const fileName = basename(filePath);

  const formData = new FormData();
  formData.append("file", new Blob([fileContent]), fileName);

  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: `LightRAG file insert failed (${res.status}): ${body}` };
  }

  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  return {
    ok: true,
    ...(data && typeof data.track_id === "string" && { trackId: data.track_id }),
  };
}

export async function query(
  request: LightRAGQueryRequest
): Promise<LightRAGQueryResponse> {
  const url = `${baseUrl()}/query`;

  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      query: request.query,
      mode: request.mode,
      ...(request.onlyNeedContext != null && {
        only_need_context: request.onlyNeedContext,
      }),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: `LightRAG query failed (${res.status}): ${body}` };
  }

  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  const response =
    typeof data?.response === "string"
      ? data.response
      : data
        ? JSON.stringify(data)
        : "";

  return { ok: true, response };
}
