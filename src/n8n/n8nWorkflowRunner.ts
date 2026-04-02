// src/n8n/n8nWorkflowRunner.ts
// High-level abstraction for running n8n workflows from the orchestrator.
// Resolves whether to use webhook or API path, returns normalized result.

import { triggerWebhook, executeWorkflow } from "./n8nClient.js";
import { logger } from "../observability/logger.js";

// ─── Types ───────────────────────────────────────────────────────

export type N8nTriggerMode = "webhook" | "api";

export interface N8nRunRequest {
  /** "webhook" uses triggerWebhook(), "api" uses executeWorkflow() */
  trigger: N8nTriggerMode;
  /** For webhook: the path segment (e.g. "deploy"). For api: the workflow ID. */
  target: string;
  /** Payload sent to the workflow */
  payload: Record<string, unknown>;
}

export interface N8nRunResult {
  ok: boolean;
  trigger: N8nTriggerMode;
  target: string;
  content: string;
  executionId?: string | undefined;
  raw?: unknown;
}

// ─── Runner ──────────────────────────────────────────────────────

export async function runN8nWorkflow(
  request: N8nRunRequest
): Promise<N8nRunResult> {
  const { trigger, target, payload } = request;

  try {
    if (trigger === "webhook") {
      logger.debug(`n8n webhook → /webhook/${target}`);
      const res = await triggerWebhook(target, payload);

      const content =
        typeof res.data === "string"
          ? res.data
          : JSON.stringify(res.data, null, 2);

      if (!res.ok) {
        logger.warn(`n8n webhook failed (${res.statusCode})`, { data: content });
      }

      return {
        ok: res.ok,
        trigger: "webhook",
        target,
        content,
        raw: res.data,
      };
    }

    // trigger === "api"
    logger.debug(`n8n API → workflow ${target}`);
    const res = await executeWorkflow({ workflowId: target, payload });

    const content =
      typeof res.data === "string"
        ? res.data
        : JSON.stringify(res.data, null, 2);

    if (!res.ok) {
      logger.warn(`n8n API execute failed (${res.statusCode})`, { data: content });
    }

    return {
      ok: res.ok,
      trigger: "api",
      target,
      content,
      executionId: res.executionId,
      raw: res.data,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn("n8n workflow run error", { error: message });
    return {
      ok: false,
      trigger,
      target,
      content: message,
    };
  }
}
