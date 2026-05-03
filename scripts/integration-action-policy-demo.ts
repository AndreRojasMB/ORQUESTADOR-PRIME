import { validateIntegrationActionPolicy } from "../src/integrations/actions/policy/policyValidator.ts";
import type { PolicyValidationResult } from "../src/integrations/actions/policy/types.ts";
import type { ProposedIntegrationAction } from "../src/integrations/actions/types.ts";

const SAFE_DEMO_ENV: NodeJS.ProcessEnv = {
  GITHUB_OWNER: "orquestador-demo-owner",
  GITHUB_ALLOWED_REPOS: "orquestador-prime",
  N8N_BASE_URL: "http://127.0.0.1:5678",
  N8N_WEBHOOK_URL: "http://127.0.0.1:5678/webhook/orquestador-trigger",
  WHATSAPP_HEALTH_URL: "http://127.0.0.1:8787/health",
  WHATSAPP_WEBHOOK_URL: "http://127.0.0.1:8787/whatsapp-orchestrator",
  COOLIFY_BASE_URL: "https://coolify.example.invalid",
  OPENCLAW_GATEWAY_URL: "http://127.0.0.1:18789",
  LIGHTRAG_BASE_URL: "http://127.0.0.1:9621",
};

const EVIDENCE_PLAN = {
  summary: "Record safe local policy decision only.",
  steps: ["Validate target policy.", "Print safe allow/block reasons."],
} as const;

const ROLLBACK_PLAN = {
  summary: "No remote mutation is performed by this demo.",
  steps: ["Confirm no executor was invoked."],
} as const;

function action(
  id: string,
  integration: ProposedIntegrationAction["integration"],
  actionName: ProposedIntegrationAction["action"],
  input: Record<string, unknown>,
  riskLevel: ProposedIntegrationAction["riskLevel"] = "low",
): ProposedIntegrationAction {
  return {
    id,
    integration,
    action: actionName,
    title: `Policy demo ${integration}.${actionName}`,
    description: "Local target policy validation demo action.",
    riskLevel,
    requiresApproval: riskLevel !== "low",
    dryRunOnly: true,
    input,
    expectedOutcome: "A safe policy allow/block decision.",
    ...(riskLevel === "high" || riskLevel === "critical"
      ? { evidencePlan: EVIDENCE_PLAN }
      : {}),
    ...(riskLevel === "critical" ? { rollbackPlan: ROLLBACK_PLAN } : {}),
    createdAt: new Date().toISOString(),
  };
}

async function runPolicy(
  label: string,
  proposedAction: ProposedIntegrationAction,
): Promise<void> {
  const result: PolicyValidationResult = await validateIntegrationActionPolicy(
    proposedAction,
    {
      env: SAFE_DEMO_ENV,
      envFiles: [],
    },
  );

  console.log(`- ${label}`);
  console.log(`  integration: ${proposedAction.integration}`);
  console.log(`  action: ${proposedAction.action}`);
  console.log(`  allowed: ${result.allowed}`);
  console.log(`  reasons: ${result.reasons.join(", ") || "none"}`);
  console.log(`  warnings: ${result.warnings?.join(", ") || "none"}`);
}

async function main(): Promise<number> {
  console.log("Integration action target policy demo:");

  await runPolicy(
    "github.read_repo_status with allowed owner",
    action("policy-demo-github-allowed", "github", "read_repo_status", {
      owner: "orquestador-demo-owner",
      repo: "orquestador-prime",
    }),
  );

  await runPolicy(
    "github.read_repo_status with blocked owner",
    action("policy-demo-github-blocked-owner", "github", "read_repo_status", {
      owner: "not-allowed-owner",
      repo: "orquestador-prime",
    }),
  );

  await runPolicy(
    "whatsapp.validate_bridge with allowed health URL",
    action("policy-demo-whatsapp-health", "whatsapp", "validate_bridge", {
      targetUrl: "http://127.0.0.1:8787/health",
    }),
  );

  await runPolicy(
    "whatsapp.validate_bridge attempting webhook URL",
    action("policy-demo-whatsapp-webhook", "whatsapp", "validate_bridge", {
      webhookUrl: "http://127.0.0.1:8787/whatsapp-orchestrator",
    }),
  );

  await runPolicy(
    "n8n.validate_webhook attempting webhook URL",
    action("policy-demo-n8n-webhook", "n8n", "validate_webhook", {
      webhookUrl: "http://127.0.0.1:5678/webhook/orquestador-trigger",
    }),
  );

  await runPolicy(
    "coolify.deploy_application blocked",
    action("policy-demo-coolify-deploy", "coolify", "deploy_application", {
      application: "demo-app",
    }, "critical"),
  );

  await runPolicy(
    "openclaw.invoke_tool blocked",
    action("policy-demo-openclaw-tool", "openclaw", "invoke_tool", {
      tool: "demo_tool",
    }, "critical"),
  );

  console.log("- external calls: none");
  return 0;
}

process.exitCode = await main();
