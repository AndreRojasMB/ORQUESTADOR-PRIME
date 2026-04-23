// src/n8n/n8nClient.ts
// Low-level HTTP client for n8n.
// Supports two trigger paths:
//   1. Webhook triggers — POST to a webhook URL
//   2. REST API — POST /api/v1/workflows/:id/execute

import { N8N_CONFIG } from "../config.js";
import { sandboxedFetch } from "../security/requestSandbox.js";

// ─── Types ───────────────────────────────────────────────────────

export interface N8nWebhookPayload {
  [key: string]: unknown;
}

export interface N8nWebhookResponse {
  ok: boolean;
  data: unknown;
  statusCode: number;
}

export interface N8nExecuteRequest {
  workflowId: string;
  payload?: Record<string, unknown>;
}

export interface N8nExecuteResponse {
  ok: boolean;
  data: unknown;
  executionId?: string;
  statusCode: number;
}

// ─── Helpers ─────────────────────────────────────────────────────

function apiHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (N8N_CONFIG.apiKey) {
    h["X-N8N-API-KEY"] = N8N_CONFIG.apiKey;
  }
  return h;
}

function baseUrl(): string {
  return N8N_CONFIG.baseUrl.replace(/\/+$/, "");
}

function webhookBaseUrl(): string {
  return N8N_CONFIG.webhookBaseUrl.replace(/\/+$/, "");
}

// ─── Client ──────────────────────────────────────────────────────

/**
 * Trigger an n8n workflow via its webhook URL.
 * The `webhookPath` is appended to the webhook base URL.
 * Example: triggerWebhook("orquestador", { mode: "plan", task: "..." })
 *   → POST http://localhost:5678/webhook/orquestador
 */
export async function triggerWebhook(
  webhookPath: string,
  payload: N8nWebhookPayload
): Promise<N8nWebhookResponse> {
  const url = `${webhookBaseUrl()}/webhook/${webhookPath}`;

  const res = await sandboxedFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  return {
    ok: res.ok,
    data,
    statusCode: res.status,
  };
}

/**
 * Execute an n8n workflow via the REST API.
 * Requires N8N_API_KEY to be set.
 * POST /api/v1/workflows/:id/execute
 */
export async function executeWorkflow(
  request: N8nExecuteRequest
): Promise<N8nExecuteResponse> {
  const url = `${baseUrl()}/api/v1/workflows/${request.workflowId}/execute`;

  const res = await sandboxedFetch(url, {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify(request.payload ?? {}),
  });

  const data = await res.json().catch(() => null) as Record<string, unknown> | null;

  return {
    ok: res.ok,
    data,
    statusCode: res.status,
    ...(data && typeof data.executionId === "string" && {
      executionId: data.executionId,
    }),
  };
}
