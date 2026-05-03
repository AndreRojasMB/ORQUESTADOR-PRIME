import { mkdtemp, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { createApprovalGate } from "../src/integrations/actions/approval/approvalGate.ts";
import { createActionAuditTrail } from "../src/integrations/actions/audit/auditTrail.ts";
import { createPersistentApprovalStore } from "../src/integrations/actions/storage/approvalPersistentStore.ts";
import { createPersistentAuditStore } from "../src/integrations/actions/storage/auditPersistentStore.ts";
import type { ProposedIntegrationAction } from "../src/integrations/actions/types.ts";
import { listenViernesBridgeHttpServer } from "../src/viernesBridge/server/httpServer.ts";

function githubReadAction(): ProposedIntegrationAction {
  return {
    id: "approval-resume-demo-github-read",
    integration: "github",
    action: "read_repo_status",
    title: "Demo GitHub repo status resume",
    description: "Resume a low-risk GitHub read action through the approval boundary.",
    riskLevel: "low",
    requiresApproval: true,
    dryRunOnly: true,
    input: {
      owner: "orquestador-demo-owner",
    },
    expectedOutcome: "Owner-level readiness is simulated without a remote write.",
    createdAt: new Date().toISOString(),
  };
}

async function postApprovalCommand(
  url: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await fetch(`${url}/viernes/approval-command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return (await response.json()) as Record<string, unknown>;
}

function publicResult(value: Record<string, unknown>): Record<string, unknown> {
  return {
    requestId: value.requestId,
    status: value.status,
    summary: value.summary,
    approvalId: value.approvalId,
    actionId: value.actionId,
    blockedReasons: value.blockedReasons,
    executionStatus: (value.executionResult as Record<string, unknown> | undefined)?.status,
    executionMode: (value.executionResult as Record<string, unknown> | undefined)?.mode,
  };
}

async function main(): Promise<number> {
  const dataDir = await mkdtemp(join(tmpdir(), "orquestador-approval-resume-demo-"));
  const env: NodeJS.ProcessEnv = {
    ORQUESTADOR_DATA_DIR: dataDir,
    GITHUB_TOKEN: process.env["GITHUB_TOKEN"] ?? "local-demo-token-never-print",
    GITHUB_OWNER: process.env["GITHUB_OWNER"] ?? "orquestador-demo-owner",
    WHATSAPP_PROVIDER: process.env["WHATSAPP_PROVIDER"] ?? "twilio",
    WHATSAPP_HEALTH_URL:
      process.env["WHATSAPP_HEALTH_URL"] ?? "http://127.0.0.1:8787/health",
  };
  const approvalGate = await createApprovalGate({
    store: createPersistentApprovalStore({ env }),
  });
  const auditTrail = await createActionAuditTrail({
    store: createPersistentAuditStore({ env }),
  });
  const action = githubReadAction();
  await auditTrail.createActionAudit(action);
  const approval = await approvalGate.createApprovalRequest(action);
  await auditTrail.recordApprovalRequested(action, approval);

  const handle = await listenViernesBridgeHttpServer({
    host: "127.0.0.1",
    port: 0,
    env,
    executeReadOnly: false,
  });

  try {
    const wrong = await postApprovalCommand(handle.url, {
      type: "approval_command",
      text: "aprobar ACT-LOCAL-WRONG-CODE",
      approvalId: approval.id,
      source: "local",
    });
    const correct = await postApprovalCommand(handle.url, {
      type: "approval_command",
      text: `aprobar ${approval.actCode}`,
      approvalId: approval.id,
      source: "local",
    });

    console.log("Viernes bridge approval resume demo:");
    console.log("- wrong ACT:");
    console.log(JSON.stringify(publicResult(wrong), null, 2));
    console.log("- correct ACT:");
    console.log(JSON.stringify(publicResult(correct), null, 2));
    console.log("- ACT displayed: no");
    console.log("- messages sent: none");
    console.log("- provider writes: none");
    return 0;
  } finally {
    await new Promise<void>((resolve) => {
      handle.server.close(() => resolve());
    });
    await rm(dataDir, { force: true, recursive: true });
  }
}

process.exitCode = await main();
