import { createApprovalGate } from "../src/integrations/actions/approval/approvalGate.ts";
import { createActionAuditTrail } from "../src/integrations/actions/audit/auditTrail.ts";
import { createExecutionGate } from "../src/integrations/actions/executors/executionGate.ts";
import type { IntegrationActionExecutionResult } from "../src/integrations/actions/executors/types.ts";
import type { ProposedIntegrationAction } from "../src/integrations/actions/types.ts";

const EVIDENCE_PLAN = {
  summary: "Capture safe local executor result and redacted evidence.",
  steps: [
    "Record gate decision.",
    "Record read-only or simulated result without secrets.",
  ],
} as const;

function baseAction(
  id: string,
  integration: ProposedIntegrationAction["integration"],
  action: ProposedIntegrationAction["action"],
  riskLevel: ProposedIntegrationAction["riskLevel"],
  requiresApproval: boolean,
): ProposedIntegrationAction {
  return {
    id,
    integration,
    action,
    title: `Executor demo ${integration}.${action}`,
    description: "Local Phase 14 executor framework demo action.",
    riskLevel,
    requiresApproval,
    dryRunOnly: true,
    input: {
      target: "example-target",
      token: "fake-token-should-not-leak",
    },
    expectedOutcome: "A safe Phase 14 executor result or block decision.",
    ...(riskLevel === "high" || riskLevel === "critical"
      ? { evidencePlan: EVIDENCE_PLAN }
      : {}),
    ...(riskLevel === "critical"
      ? {
          rollbackPlan: {
            summary: "No real execution occurs in Phase 14.",
            steps: ["Confirm no external mutation happened."],
          },
        }
      : {}),
    createdAt: new Date().toISOString(),
  };
}

function printResult(label: string, result: IntegrationActionExecutionResult): void {
  console.log(`- ${label}`);
  console.log(`  action id: ${result.actionId}`);
  console.log(`  integration: ${result.integration}`);
  console.log(`  action: ${result.action}`);
  console.log(`  status: ${result.status}`);
  console.log(`  mode: ${result.mode}`);
  console.log(`  blockedReasons: ${result.blockedReasons?.join(", ") ?? "none"}`);
}

async function auditAction(
  auditTrail: Awaited<ReturnType<typeof createActionAuditTrail>>,
  action: ProposedIntegrationAction,
): Promise<void> {
  await auditTrail.createActionAudit(action);
}

async function approveAction(
  approvalGate: Awaited<ReturnType<typeof createApprovalGate>>,
  auditTrail: Awaited<ReturnType<typeof createActionAuditTrail>>,
  action: ProposedIntegrationAction,
): Promise<void> {
  const approval = await approvalGate.createApprovalRequest(action);
  await auditTrail.recordApprovalRequested(action, approval);
  await approvalGate.approveAction(approval.id, approval.actCode);
  const approved = await approvalGate.getApprovalStatus(approval.id);
  if (approved) await auditTrail.recordApprovalApproved(action, approved);
}

async function main(): Promise<number> {
  const approvalGate = await createApprovalGate();
  const auditTrail = await createActionAuditTrail();
  const executionGate = createExecutionGate({ approvalGate, auditTrail });

  const githubRead = baseAction(
    "exec-demo-github-read-status",
    "github",
    "read_repo_status",
    "low",
    true,
  );
  await auditAction(auditTrail, githubRead);
  await approveAction(approvalGate, auditTrail, githubRead);
  const githubResult = await executionGate.execute(githubRead);

  const whatsappSend = baseAction(
    "exec-demo-whatsapp-send-blocked",
    "whatsapp",
    "send_message",
    "high",
    true,
  );
  await auditAction(auditTrail, whatsappSend);
  const whatsappResult = await executionGate.execute(whatsappSend);

  const n8nTrigger = baseAction(
    "exec-demo-n8n-trigger-blocked",
    "n8n",
    "trigger_workflow",
    "high",
    true,
  );
  await auditAction(auditTrail, n8nTrigger);
  const n8nTriggerResult = await executionGate.execute(n8nTrigger);

  const noAudit = baseAction(
    "exec-demo-no-audit-blocked",
    "whatsapp",
    "validate_bridge",
    "low",
    false,
  );
  const noAuditResult = await executionGate.execute(noAudit);

  const unapproved = baseAction(
    "exec-demo-n8n-unapproved",
    "n8n",
    "validate_webhook",
    "low",
    true,
  );
  await auditAction(auditTrail, unapproved);
  const unapprovedResult = await executionGate.execute(unapproved);

  const githubAudit = await auditTrail.getAuditRecord(githubRead.id);
  const whatsappAudit = await auditTrail.getAuditRecord(whatsappSend.id);
  const actionCreated = whatsappAudit?.events.find(
    (event) => event.eventType === "action_created",
  );

  console.log("Integration action executor demo:");
  printResult("github.read_repo_status", githubResult);
  printResult("whatsapp.send_message blocked", whatsappResult);
  printResult("n8n.trigger_workflow blocked", n8nTriggerResult);
  printResult("missing audit trail blocked", noAuditResult);
  printResult("unapproved action blocked", unapprovedResult);
  console.log("- audit events:");
  console.log(
    `  github.read_repo_status: ${githubAudit?.events.map((event) => event.eventType).join(", ") ?? "none"}`,
  );
  console.log("- redacted evidence sample:");
  console.log(
    `  whatsapp action_created details: ${JSON.stringify(actionCreated?.detailsRedacted)}`,
  );

  return 0;
}

process.exitCode = await main();
