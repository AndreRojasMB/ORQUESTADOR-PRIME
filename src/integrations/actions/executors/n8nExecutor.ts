import type { ProposedIntegrationAction } from "../types.js";
import type {
  IntegrationActionExecutionResult,
  IntegrationActionExecutorContext,
} from "./types.js";

type StatusModule = typeof import("../../status.js");

async function loadStatusModule(): Promise<StatusModule> {
  return (await import(new URL("../../status.ts", import.meta.url).href)) as StatusModule;
}
function nowIso(): string {
  return new Date().toISOString();
}

export async function executeN8nValidateWebhook(
  action: ProposedIntegrationAction,
  _context: IntegrationActionExecutorContext,
): Promise<IntegrationActionExecutionResult> {
  const { getIntegrationStatuses } = await loadStatusModule();
  const statuses = await getIntegrationStatuses();
  const configured =
    statuses.find((status) => status.id === "n8n")?.configured ?? false;

  return {
    actionId: action.id,
    integration: action.integration,
    action: action.action,
    status: configured ? "simulated" : "blocked",
    mode: configured ? "dry_run" : "blocked",
    summary: configured
      ? "n8n webhook configuration is present; no webhook or workflow was executed."
      : "n8n webhook configuration is missing.",
    evidenceRedacted: {
      configPresent: configured,
      webhookCalled: false,
      workflowExecuted: false,
    },
    ...(configured ? {} : { blockedReasons: ["n8n_config_missing"] }),
    createdAt: nowIso(),
  };
}
