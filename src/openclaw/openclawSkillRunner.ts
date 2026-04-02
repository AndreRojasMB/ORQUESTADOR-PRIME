// src/openclaw/openclawSkillRunner.ts
// Invokes OpenClaw skills by name via the Gateway /tools/invoke API.
// Maps results back into a shape the orchestrator can consume.

import { toolInvoke } from "./openclawClient.js";
import type { ProviderResponse } from "../providers/types.js";
import { logger } from "../observability/logger.js";

export interface SkillRunRequest {
  skill: string;
  action?: string;
  args?: Record<string, unknown>;
  sessionKey?: string;
}

export interface SkillRunResult {
  ok: boolean;
  content: string;
  raw?: unknown;
}

export async function runSkill(request: SkillRunRequest): Promise<SkillRunResult> {
  try {
    const response = await toolInvoke({
      tool:       request.skill,
      action:     request.action,
      args:       request.args,
      sessionKey: request.sessionKey ?? "main",
    });

    if (!response.ok) {
      logger.warn(`OpenClaw skill "${request.skill}" failed`, {
        error: response.error,
      });
      return {
        ok: false,
        content: response.error ?? "Unknown skill error",
      };
    }

    const content =
      typeof response.result === "string"
        ? response.result
        : JSON.stringify(response.result, null, 2);

    return { ok: true, content, raw: response.result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn(`OpenClaw skill invocation error`, { error: message });
    return { ok: false, content: message };
  }
}

export function skillResultToProviderResponse(
  result: SkillRunResult,
  model: string
): ProviderResponse {
  return {
    provider: "openclaw",
    model,
    content: result.content,
  };
}
