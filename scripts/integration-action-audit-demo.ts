import { createApprovalGate } from "../src/integrations/actions/approval/approvalGate.ts";
import { createActionAuditTrail } from "../src/integrations/actions/audit/auditTrail.ts";
import { redactSensitive } from "../src/integrations/actions/audit/redact.ts";
import { runIntegrationActionDryRun } from "../src/integrations/actions/dryRun.ts";
import type { ProposedIntegrationAction } from "../src/integrations/actions/types.ts";
import { validateProposedIntegrationAction } from "../src/integrations/actions/validator.ts";

function buildAuditDemoAction(): ProposedIntegrationAction {
  return {
    id: "act-demo-audit-whatsapp-send-message",
    integration: "whatsapp",
    action: "send_message",
    title: "Audit demo WhatsApp send-message approval",
    description:
      "Create an audit trail for a WhatsApp send_message proposal without sending anything.",
    riskLevel: "high",
    requiresApproval: true,
    dryRunOnly: true,
    input: {
      to: "redacted-local-recipient",
      messageTemplate: "audit-demo-template",
      token: "fake-token-never-use",
      apiKey: "fake-api-key-never-use",
      nested: {
        authorization: "demo_authorization_value_redacted",
        cookie: "fake-cookie",
        safeNote: "this field should remain visible",
      },
    },
    expectedOutcome:
      "A future executor would send a WhatsApp message only after approval.",
    evidencePlan: {
      summary: "Record local audit metadata and future provider result evidence.",
      steps: [
        "Record validation outcome.",
        "Record ACT approval state.",
        "Record executor result in a later phase without secrets.",
      ],
    },
    createdAt: new Date().toISOString(),
  };
}

function eventTypes(record: { events: readonly { eventType: string }[] }): string {
  return record.events.map((event) => event.eventType).join(", ");
}

async function main(): Promise<number> {
  const action = buildAuditDemoAction();
  const audit = await createActionAuditTrail();
  const gate = await createApprovalGate();

  await audit.createActionAudit(action);

  const validation = await validateProposedIntegrationAction(action);
  await audit.recordValidationResult(action, validation);
  if (!validation.allowed) {
    await audit.recordActionBlocked(action, validation.reasons);
  }

  const [dryRunResult] = await runIntegrationActionDryRun([action]);
  if (dryRunResult) {
    await audit.recordDryRunResult(action, dryRunResult);
  }

  const approval = await gate.createApprovalRequest(action);
  await audit.recordApprovalRequested(action, approval);

  const approvalDecision = await gate.approveAction(approval.id, approval.actCode);
  const approvalStatus = await gate.getApprovalStatus(approval.id);
  if (approvalDecision.allowed && approvalStatus) {
    await audit.recordApprovalApproved(action, approvalStatus);
  }

  const approved = await gate.assertActionApproved(action);
  if (approved.allowed) {
    await audit.recordReadyForExecution(action);
  }

  await audit.recordExecutionSkippedPhase13(action);

  const record = await audit.getAuditRecord(action.id);
  const redactionSample = redactSensitive(action.input) as Record<string, unknown>;

  console.log("Integration action audit demo:");
  console.log(`- action id: ${action.id}`);
  console.log(`  integration: ${action.integration}`);
  console.log(`  action: ${action.action}`);
  console.log(`  event count: ${record?.events.length ?? 0}`);
  console.log(`  event types: ${record ? eventTypes(record) : "none"}`);
  console.log("  redaction sample:");
  console.log(`    token: ${String(redactionSample["token"])}`);
  console.log(`    apiKey: ${String(redactionSample["apiKey"])}`);
  const nested = redactionSample["nested"] as Record<string, unknown> | undefined;
  console.log(`    authorization: ${String(nested?.["authorization"])}`);
  console.log(`    cookie: ${String(nested?.["cookie"])}`);
  console.log(`    safeNote: ${String(nested?.["safeNote"])}`);

  return 0;
}

process.exitCode = await main();
