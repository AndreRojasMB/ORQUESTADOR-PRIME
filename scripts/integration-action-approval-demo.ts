import { createApprovalGate } from "../src/integrations/actions/approval/approvalGate.ts";
import type { ProposedIntegrationAction } from "../src/integrations/actions/types.ts";

function demoWhatsAppAction(): ProposedIntegrationAction {
  return {
    id: "act-demo-whatsapp-send-message",
    integration: "whatsapp",
    action: "send_message",
    title: "Demo WhatsApp send-message approval",
    description:
      "Demonstrate ACT approval for a WhatsApp send_message proposal without sending anything.",
    riskLevel: "high",
    requiresApproval: true,
    dryRunOnly: true,
    input: {
      to: "redacted-local-recipient",
      messageTemplate: "demo-template",
    },
    expectedOutcome:
      "A future executor would send a message only after ACT approval.",
    evidencePlan: {
      summary: "Record approval metadata and future provider result evidence.",
      steps: [
        "Record action id, approval id, integration, and risk level.",
        "Record future executor result without message secrets or provider tokens.",
      ],
    },
    createdAt: new Date().toISOString(),
  };
}

function notApprovedGitHubAction(): ProposedIntegrationAction {
  return {
    id: "act-demo-github-unapproved-read",
    integration: "github",
    action: "read_repo_status",
    title: "Demo unapproved GitHub read",
    description: "Demonstrate that assertActionApproved blocks missing approvals.",
    riskLevel: "low",
    requiresApproval: true,
    dryRunOnly: true,
    input: {
      owner: "example-owner",
      repo: "example-repo",
    },
    expectedOutcome: "A future executor would read repository status only.",
    createdAt: new Date().toISOString(),
  };
}

async function main(): Promise<number> {
  const gate = await createApprovalGate();
  const action = demoWhatsAppAction();
  const approval = await gate.createApprovalRequest(action);

  console.log("Integration action approval demo:");
  console.log(`- approval id: ${approval.id}`);
  console.log(`  action id: ${approval.actionId}`);
  console.log(`  riskLevel: ${approval.riskLevel}`);
  console.log(`  status: ${approval.status}`);
  console.log(`  requiredBecause: ${approval.requiredBecause.join(", ")}`);
  console.log(`  localDevActCode: ${approval.actCode}`);

  const wrong = await gate.approveAction(approval.id, "ACT-LOCAL-WRONG-CODE");
  console.log("- wrong ACT attempt:");
  console.log(`  status: ${wrong.status}`);
  console.log(`  allowed: ${wrong.allowed ? "true" : "false"}`);
  console.log(`  reasons: ${wrong.reasons.join(", ") || "none"}`);

  const correct = await gate.approveAction(approval.id, approval.actCode);
  console.log("- correct ACT attempt:");
  console.log(`  status: ${correct.status}`);
  console.log(`  allowed: ${correct.allowed ? "true" : "false"}`);
  console.log(`  reasons: ${correct.reasons.join(", ") || "none"}`);

  const approvedAssert = await gate.assertActionApproved(action);
  console.log("- assert approved action:");
  console.log(`  status: ${approvedAssert.status}`);
  console.log(`  allowed: ${approvedAssert.allowed ? "true" : "false"}`);
  console.log(`  reasons: ${approvedAssert.reasons.join(", ") || "none"}`);

  const unapprovedAssert = await gate.assertActionApproved(notApprovedGitHubAction());
  console.log("- assert unapproved action:");
  console.log(`  status: ${unapprovedAssert.status}`);
  console.log(`  allowed: ${unapprovedAssert.allowed ? "true" : "false"}`);
  console.log(`  reasons: ${unapprovedAssert.reasons.join(", ") || "none"}`);

  const rejectAction = {
    ...demoWhatsAppAction(),
    id: "act-demo-whatsapp-reject-message",
    title: "Demo WhatsApp rejection",
    createdAt: new Date().toISOString(),
  };
  const rejectionRequest = await gate.createApprovalRequest(rejectAction);
  const rejected = await gate.rejectApproval(
    rejectionRequest.id,
    "user_rejected_demo",
  );
  console.log("- rejection demo:");
  console.log(`  approval id: ${rejected.approvalId}`);
  console.log(`  status: ${rejected.status}`);
  console.log(`  allowed: ${rejected.allowed ? "true" : "false"}`);
  console.log(`  reasons: ${rejected.reasons.join(", ") || "none"}`);

  return 0;
}

process.exitCode = await main();
