import { createApprovalGate } from "../src/integrations/actions/approval/approvalGate.ts";
import { createActionAuditTrail } from "../src/integrations/actions/audit/auditTrail.ts";
import type { ProposedIntegrationAction } from "../src/integrations/actions/types.ts";
import { mapViernesRequestToActions } from "../src/viernesBridge/actionMapper.ts";
import { parseApprovalCommand } from "../src/viernesBridge/approval/approvalCommandParser.ts";
import { formatApprovalRequestForWhatsApp } from "../src/viernesBridge/approval/approvalMessageFormatter.ts";
import {
  processViernesApprovalCommand,
  resumeApprovedViernesAction,
} from "../src/viernesBridge/approval/approvalProcessor.ts";
import { processViernesBridgeRequest } from "../src/viernesBridge/processor.ts";
import type { ViernesBridgeRequest } from "../src/viernesBridge/types.ts";

const owner = process.env["GITHUB_OWNER"] ?? "orquestador-demo-owner";
const SAFE_DEMO_ENV: NodeJS.ProcessEnv = {
  ...process.env,
  GITHUB_TOKEN: process.env["GITHUB_TOKEN"] ?? "local-demo-token-never-print",
  GITHUB_OWNER: owner,
  WHATSAPP_PROVIDER: process.env["WHATSAPP_PROVIDER"] ?? "twilio",
  WHATSAPP_HEALTH_URL:
    process.env["WHATSAPP_HEALTH_URL"] ?? "http://127.0.0.1:8787/health",
};

const BASIC_EVIDENCE_PLAN = {
  summary: "Record safe approval UX block decision only.",
  steps: ["Validate action.", "Confirm execution gate blocks writes."],
} as const;

function request(): ViernesBridgeRequest {
  return {
    id: "viernes-approval-demo-github",
    source: "whatsapp",
    userId: "local-demo-user",
    messageText: "revisa estado del repo",
    intent: "check_github_repo_status",
    context: {
      owner,
    },
    requestedAt: new Date().toISOString(),
  };
}

function dangerousWriteAction(): ProposedIntegrationAction {
  return {
    id: "viernes-approval-demo-whatsapp-send-message",
    integration: "whatsapp",
    action: "send_message",
    title: "Attempt WhatsApp send message",
    description: "Approval UX demo for a write action that must remain blocked.",
    riskLevel: "high",
    requiresApproval: true,
    dryRunOnly: true,
    input: {
      to: "redacted-local-recipient",
      messageTemplate: "demo-template",
      token: "fake-token-never-print",
    },
    expectedOutcome: "The execution gate blocks this action before any provider call.",
    evidencePlan: BASIC_EVIDENCE_PLAN,
    createdAt: new Date().toISOString(),
  };
}

function printResult(label: string, value: unknown): void {
  console.log(`- ${label}`);
  console.log(JSON.stringify(value, null, 2));
}

async function main(): Promise<number> {
  const approvalGate = await createApprovalGate();
  const auditTrail = await createActionAuditTrail();
  const bridgeRequest = request();
  const mapped = mapViernesRequestToActions(bridgeRequest);
  const action = mapped.actions[0];

  if (!action) {
    console.log("Viernes approval demo:");
    console.log("- unable to build demo action");
    return 1;
  }

  const bridgeResponse = await processViernesBridgeRequest(bridgeRequest, {
    approvalGate,
    auditTrail,
    policyOptions: { env: SAFE_DEMO_ENV, envFiles: [] },
  });
  const approvalId = bridgeResponse.approvalRequests?.[0]?.id;
  const approval = approvalId
    ? await approvalGate.getApprovalStatus(approvalId)
    : undefined;

  if (!approval) {
    console.log("Viernes approval demo:");
    console.log("- expected approval request was not created");
    return 1;
  }

  const approvalMessage = formatApprovalRequestForWhatsApp(
    approval,
    action,
    bridgeRequest.id,
  );
  const wrongCommand = parseApprovalCommand("aprobar ACT-LOCAL-WRONG-CODE");
  const wrongDecision = await processViernesApprovalCommand(wrongCommand, {
    approvalGate,
    auditTrail,
    approvalId: approval.id,
    action,
    policyOptions: { env: SAFE_DEMO_ENV, envFiles: [] },
  });
  const correctCommand = parseApprovalCommand(`aprobar ${approval.actCode}`);
  const correctDecision = await processViernesApprovalCommand(correctCommand, {
    approvalGate,
    auditTrail,
    approvalId: approval.id,
    action,
    policyOptions: { env: SAFE_DEMO_ENV, envFiles: [] },
  });
  const resumed = await resumeApprovedViernesAction(approval.id, {
    approvalGate,
    auditTrail,
    approvalId: approval.id,
    action,
    policyOptions: { env: SAFE_DEMO_ENV, envFiles: [] },
  });

  const writeAction = dangerousWriteAction();
  await auditTrail.createActionAudit(writeAction);
  const writeApproval = await approvalGate.createApprovalRequest(writeAction);
  await auditTrail.recordApprovalRequested(writeAction, writeApproval);
  const writeCommand = parseApprovalCommand(`aprobar ${writeApproval.actCode}`);
  const writeDecision = await processViernesApprovalCommand(writeCommand, {
    approvalGate,
    auditTrail,
    approvalId: writeApproval.id,
    action: writeAction,
    policyOptions: { env: SAFE_DEMO_ENV, envFiles: [] },
  });
  const writeResume = await resumeApprovedViernesAction(writeApproval.id, {
    approvalGate,
    auditTrail,
    approvalId: writeApproval.id,
    action: writeAction,
    policyOptions: { env: SAFE_DEMO_ENV, envFiles: [] },
  });

  console.log("Viernes approval demo:");
  printResult("bridge response", {
    status: bridgeResponse.status,
    proposedActions: bridgeResponse.proposedActions,
    approvalRequestCount: bridgeResponse.approvalRequests?.length ?? 0,
  });
  printResult("formatted WhatsApp approval message", approvalMessage);
  printResult("wrong ACT decision", {
    status: wrongDecision.status,
    allowed: wrongDecision.allowed,
    reasons: wrongDecision.reasons,
  });
  printResult("correct ACT decision", {
    status: correctDecision.status,
    allowed: correctDecision.allowed,
    reasons: correctDecision.reasons,
  });
  printResult("resumed read-only action", {
    status: resumed.status,
    allowed: resumed.allowed,
    executionStatus: resumed.executionResult?.status,
    mode: resumed.executionResult?.mode,
    blockedReasons: resumed.reasons,
  });
  printResult("approved write remains blocked", {
    approvalStatus: writeDecision.status,
    approvalAllowed: writeDecision.allowed,
    resumeStatus: writeResume.status,
    executionStatus: writeResume.executionResult?.status,
    blockedReasons: writeResume.reasons,
  });
  console.log("- messages sent: none");
  console.log("- provider writes: none");
  return 0;
}

process.exitCode = await main();
