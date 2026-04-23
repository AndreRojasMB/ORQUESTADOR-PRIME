// src/openclaw/openclawClient.ts
// Low-level HTTP client for the OpenClaw Gateway.
// Supports chat completions (/v1/chat/completions) and tool invocation (/tools/invoke).

import { OPENCLAW_CONFIG } from "../config.js";
import { sandboxedFetch } from "../security/requestSandbox.js";

// ─── Types ───────────────────────────────────────────────────────

export interface OpenClawMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenClawChatRequest {
  model?: string;
  messages: OpenClawMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface OpenClawChatChoice {
  index: number;
  message: { role: string; content: string };
  finish_reason: string;
}

export interface OpenClawChatResponse {
  id: string;
  choices: OpenClawChatChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenClawToolInvokeRequest {
  tool: string;
  action?: string | undefined;
  args?: Record<string, unknown> | undefined;
  sessionKey?: string | undefined;
  dryRun?: boolean | undefined;
}

export interface OpenClawToolInvokeResponse {
  ok: boolean;
  result?: unknown;
  error?: string;
}

// ─── Client ──────────────────────────────────────────────────────

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (OPENCLAW_CONFIG.token) {
    h["Authorization"] = `Bearer ${OPENCLAW_CONFIG.token}`;
  }
  return h;
}

function baseUrl(): string {
  return OPENCLAW_CONFIG.gatewayUrl.replace(/\/+$/, "");
}

export async function chatCompletions(
  request: OpenClawChatRequest
): Promise<OpenClawChatResponse> {
  const url = `${baseUrl()}/v1/chat/completions`;

  const res = await sandboxedFetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: request.model ?? OPENCLAW_CONFIG.model,
      messages: request.messages,
      ...(request.max_tokens && { max_tokens: request.max_tokens }),
      ...(request.temperature != null && { temperature: request.temperature }),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenClaw chat failed (${res.status}): ${body}`);
  }

  return (await res.json()) as OpenClawChatResponse;
}

export async function toolInvoke(
  request: OpenClawToolInvokeRequest
): Promise<OpenClawToolInvokeResponse> {
  const url = `${baseUrl()}/tools/invoke`;

  const res = await sandboxedFetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenClaw tool invoke failed (${res.status}): ${body}`);
  }

  return (await res.json()) as OpenClawToolInvokeResponse;
}
