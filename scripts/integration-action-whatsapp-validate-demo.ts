import { createApprovalGate } from "../src/integrations/actions/approval/approvalGate.ts";
import { createActionAuditTrail } from "../src/integrations/actions/audit/auditTrail.ts";
import { createExecutionGate } from "../src/integrations/actions/executors/executionGate.ts";
import type { IntegrationActionExecutionResult } from "../src/integrations/actions/executors/types.ts";
import { validateIntegrationActionPolicy } from "../src/integrations/actions/policy/policyValidator.ts";
import type { ProposedIntegrationAction } from "../src/integrations/actions/types.ts";
import { validateProposedIntegrationAction } from "../src/integrations/actions/validator.ts";
import { getIntegrationEnvSnapshot } from "../src/integrations/status.ts";

const EVIDENCE_PLAN = {
  summary: "Confirm blocked WhatsApp send action without sending messages.",
  steps: ["Run local validation.", "Confirm execution gate blocks the action."],
} as const;

function makeValidateAction(
  id: string,
  input: Record<string, unknown>,
): ProposedIntegrationAction {
  return {
    id,
    integration: "whatsapp",
    action: "validate_bridge",
    title: "Validate WhatsApp bridge health",
    description: "Read the local WhatsApp bridge health URL through the safe execution gate.",
    riskLevel: "low",
    requiresApproval: false,
    dryRunOnly: true,
    input,
    expectedOutcome: "Safe read-only WhatsApp bridge health evidence.",
    createdAt: new Date().toISOString(),
  };
}

function makeSendAction(id: string): ProposedIntegrationAction {
  return {
    id,
    integration: "whatsapp",
    action: "send_message",
    title: "Blocked WhatsApp send demo",
    description: "Demonstrate that WhatsApp message sending remains blocked.",
    riskLevel: "high",
    requiresApproval: true,
    dryRunOnly: true,
    input: {
      recipient: "demo-recipient",
      message: "demo message not sent",
    },
    expectedOutcome: "Execution gate blocks the send action.",
    evidencePlan: EVIDENCE_PLAN,
    createdAt: new Date().toISOString(),
  };
}

function printResult(label: string, result: IntegrationActionExecutionResult): void {
  console.log(`- ${label}`);
  console.log(`  status: ${result.status}`);
  console.log(`  mode: ${result.mode}`);
  console.log(`  blockedReasons: ${result.blockedReasons?.join(", ") ?? "none"}`);
  console.log(`  evidence: ${JSON.stringify(result.evidenceRedacted ?? {})}`);
}

async function runAction(
  action: ProposedIntegrationAction,
): Promise<IntegrationActionExecutionResult> {
  const approvalGate = await createApprovalGate();
  const auditTrail = await createActionAuditTrail();
  const executionGate = createExecutionGate({ approvalGate, auditTrail });

  await auditTrail.createActionAudit(action);

  const validation = await validateProposedIntegrationAction(action);
  console.log(`  validator: ${validation.allowed ? "allowed" : "blocked"}`);
  if (validation.reasons.length > 0) {
    console.log(`  validatorReasons: ${validation.reasons.join(", ")}`);
  }

  const policy = await validateIntegrationActionPolicy(action);
  console.log(`  policy: ${policy.allowed ? "allowed" : "blocked"}`);
  if (policy.reasons.length > 0) {
    console.log(`  policyReasons: ${policy.reasons.join(", ")}`);
  }

  const result = await executionGate.execute(action);
  const audit = await auditTrail.getAuditRecord(action.id);
  console.log(
    `  auditEvents: ${audit?.events.map((event) => event.eventType).join(", ") ?? "none"}`,
  );
  return result;
}

async function main(): Promise<number> {
  const env = await getIntegrationEnvSnapshot();
  const healthUrl = env.WHATSAPP_HEALTH_URL;
  const webhookUrl = env.WHATSAPP_WEBHOOK_URL ?? env.TWILIO_WEBHOOK_PUBLIC_URL;

  console.log("WhatsApp validate_bridge demo:");
  if (!healthUrl) {
    console.log("- health URL: missing; safe block expected");
  }

  const allowedAction = makeValidateAction(
    "whatsapp-validate-demo-health",
    healthUrl ? { targetUrl: healthUrl } : {},
  );
  const allowedResult = await runAction(allowedAction);
  printResult("health URL validation", allowedResult);

  const webhookAction = makeValidateAction("whatsapp-validate-demo-webhook", {
    webhookUrl: webhookUrl ?? "https://example.invalid/blocked-webhook",
  });
  const webhookResult = await runAction(webhookAction);
  printResult("webhook attempt blocked", webhookResult);

  const sendAction = makeSendAction("whatsapp-validate-demo-send-blocked");
  const sendResult = await runAction(sendAction);
  printResult("send_message remains blocked", sendResult);

  console.log("- messages sent: none");
  return 0;
}

process.exitCode = await main();
