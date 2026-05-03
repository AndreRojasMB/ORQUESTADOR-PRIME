import type {
  IntegrationActionIntegration,
  IntegrationActionName,
} from "../types.js";
import type { IntegrationActionExecutor } from "./types.js";

type GitHubExecutorModule = typeof import("./githubExecutor.js");
type N8nExecutorModule = typeof import("./n8nExecutor.js");
type WhatsAppExecutorModule = typeof import("./whatsappExecutor.js");

export interface ExecutorAllowlistEntry {
  integration: IntegrationActionIntegration;
  action: IntegrationActionName;
  mode: "read_only" | "simulated";
}
export const PHASE_14_EXECUTOR_ALLOWLIST: readonly ExecutorAllowlistEntry[] = [
  { integration: "github", action: "read_repo_status", mode: "read_only" },
  { integration: "whatsapp", action: "validate_bridge", mode: "simulated" },
  { integration: "n8n", action: "validate_webhook", mode: "simulated" },
];

async function loadGitHubExecutor(): Promise<GitHubExecutorModule> {
  return (await import(new URL("./githubExecutor.ts", import.meta.url).href)) as GitHubExecutorModule;
}

async function loadN8nExecutor(): Promise<N8nExecutorModule> {
  return (await import(new URL("./n8nExecutor.ts", import.meta.url).href)) as N8nExecutorModule;
}

async function loadWhatsAppExecutor(): Promise<WhatsAppExecutorModule> {
  return (await import(new URL("./whatsappExecutor.ts", import.meta.url).href)) as WhatsAppExecutorModule;
}

export function isExecutorAllowlisted(
  integration: IntegrationActionIntegration,
  action: IntegrationActionName,
): boolean {
  return PHASE_14_EXECUTOR_ALLOWLIST.some(
    (entry) => entry.integration === integration && entry.action === action,
  );
}

export async function getIntegrationActionExecutor(
  integration: IntegrationActionIntegration,
  action: IntegrationActionName,
): Promise<IntegrationActionExecutor | undefined> {
  if (integration === "github" && action === "read_repo_status") {
    return (await loadGitHubExecutor()).executeGitHubReadRepoStatus;
  }

  if (integration === "whatsapp" && action === "validate_bridge") {
    return (await loadWhatsAppExecutor()).executeWhatsAppValidateBridge;
  }

  if (integration === "n8n" && action === "validate_webhook") {
    return (await loadN8nExecutor()).executeN8nValidateWebhook;
  }

  return undefined;
}
