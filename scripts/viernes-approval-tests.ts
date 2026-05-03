import { createApprovalGate } from "../src/integrations/actions/approval/approvalGate.ts";
import { createActionAuditTrail } from "../src/integrations/actions/audit/auditTrail.ts";
import type { ProposedIntegrationAction } from "../src/integrations/actions/types.ts";
import { parseApprovalCommand } from "../src/viernesBridge/approval/approvalCommandParser.ts";
import { formatApprovalRequestForWhatsApp } from "../src/viernesBridge/approval/approvalMessageFormatter.ts";
import {
  processViernesApprovalCommand,
  resumeApprovedViernesAction,
} from "../src/viernesBridge/approval/approvalProcessor.ts";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const SAFE_ENV: NodeJS.ProcessEnv = {
  GITHUB_TOKEN: "viernes-approval-test-token-never-print",
  GITHUB_OWNER: "orquestador-demo-owner",
  GITHUB_ALLOWED_REPOS: "orquestador-prime",
  WHATSAPP_PROVIDER: "twilio",
  WHATSAPP_HEALTH_URL: "http://127.0.0.1:8787/health",
  WHATSAPP_WEBHOOK_URL: "http://127.0.0.1:8787/whatsapp-orchestrator",
  WHATSAPP_HOOK_TOKEN: "viernes-approval-hook-token-never-print",
  WHATSAPP_VERIFY_TOKEN: "viernes-approval-verify-token-never-print",
};

const BASIC_EVIDENCE_PLAN = {
  summary: "Record safe test block decision only.",
  steps: ["Validate action.", "Confirm execution gate blocks writes."],
} as const;

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function test(name: string, fn: () => Promise<void>): Promise<TestResult> {
  try {
    await fn();
    return { name, passed: true };
  } catch (err) {
    return {
      name,
      passed: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function githubReadAction(id = "viernes-approval-test-github-read"): ProposedIntegrationAction {
  return {
    id,
    integration: "github",
    action: "read_repo_status",
    title: "Test GitHub repo status",
    description: "Read owner-level GitHub status through the safe executor gate.",
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

function whatsappWriteAction(id = "viernes-approval-test-whatsapp-send"): ProposedIntegrationAction {
  return {
    id,
    integration: "whatsapp",
    action: "send_message",
    title: "Test WhatsApp send remains blocked",
    description: "Approved write action must still be blocked by execution policy.",
    riskLevel: "high",
    requiresApproval: true,
    dryRunOnly: true,
    input: {
      to: "redacted-local-recipient",
      message: "redacted-message",
      token: "viernes-approval-hook-token-never-print",
    },
    expectedOutcome: "Execution gate blocks before any provider call.",
    evidencePlan: BASIC_EVIDENCE_PLAN,
    createdAt: new Date().toISOString(),
  };
}

async function createApprovedContext(action: ProposedIntegrationAction): Promise<{
  approvalGate: Awaited<ReturnType<typeof createApprovalGate>>;
  auditTrail: Awaited<ReturnType<typeof createActionAuditTrail>>;
  approvalId: string;
  actCode: string;
}> {
  const approvalGate = await createApprovalGate();
  const auditTrail = await createActionAuditTrail();
  await auditTrail.createActionAudit(action);
  const approval = await approvalGate.createApprovalRequest(action);
  await auditTrail.recordApprovalRequested(action, approval);
  return {
    approvalGate,
    auditTrail,
    approvalId: approval.id,
    actCode: approval.actCode,
  };
}

async function main(): Promise<number> {
  const tests: TestResult[] = [];

  tests.push(
    await test("parser recognizes approve commands", async () => {
      assert(parseApprovalCommand("aprobar 123456").type === "approve", "aprobar failed");
      assert(parseApprovalCommand("apruebo ACT-LOCAL-ABCD-1234").type === "approve", "apruebo failed");
      assert(parseApprovalCommand("autorizar ACT-LOCAL-ABCD-1234").type === "approve", "autorizar failed");
    }),
  );

  tests.push(
    await test("parser recognizes reject commands", async () => {
      assert(parseApprovalCommand("rechazar 123456").type === "reject", "rechazar failed");
      assert(parseApprovalCommand("rechazo ACT-LOCAL-ABCD-1234").type === "reject", "rechazo failed");
      assert(parseApprovalCommand("cancelar ACT-LOCAL-ABCD-1234").type === "reject", "cancelar failed");
    }),
  );

  tests.push(
    await test("parser returns unknown for unrelated text", async () => {
      assert(parseApprovalCommand("hola viernes").type === "unknown", "expected unknown");
    }),
  );

  tests.push(
    await test("formatter does not include provider secrets", async () => {
      const action = githubReadAction("viernes-approval-format-redaction");
      action.input = {
        owner: "orquestador-demo-owner",
        token: "viernes-approval-test-token-never-print",
        authorization: "demo_authorization_value_never_print",
      };
      const { approvalGate } = await createApprovedContext(action);
      const approval = await approvalGate.getApprovalStatus(action.id);
      assert(!approval, "approval lookup by action id should not expose request");

      const directApproval = {
        id: "approval-format-demo",
        actionId: action.id,
        actionSummary: "github:read_repo_status - Test",
        integration: action.integration,
        action: action.action,
        riskLevel: action.riskLevel,
        requiredBecause: ["action_requires_approval"],
        actCode: "ACT-LOCAL-FORM-1234",
        status: "pending" as const,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      };
      const formatted = formatApprovalRequestForWhatsApp(directApproval, action);
      const serialized = JSON.stringify(formatted);
      assert(!serialized.includes("viernes-approval-test-token-never-print"), "token leaked");
      assert(!serialized.includes("demo_authorization_value_never_print"), "authorization leaked");
      assert(serialized.includes("ACT-LOCAL-FORM-1234"), "expected local/dev ACT in message");
    }),
  );

  tests.push(
    await test("wrong ACT does not approve", async () => {
      const action = githubReadAction("viernes-approval-wrong-act");
      const { approvalGate, auditTrail, approvalId } = await createApprovedContext(action);
      const result = await processViernesApprovalCommand(
        parseApprovalCommand("aprobar ACT-LOCAL-WRONG-CODE"),
        {
          approvalGate,
          auditTrail,
          approvalId,
          action,
          policyOptions: { env: SAFE_ENV, envFiles: [] },
        },
      );
      assert(!result.allowed, "wrong ACT should not approve");
      assert(result.reasons.includes("invalid_act_code"), "expected invalid_act_code");
    }),
  );

  tests.push(
    await test("correct ACT approves", async () => {
      const action = githubReadAction("viernes-approval-correct-act");
      const { approvalGate, auditTrail, approvalId, actCode } =
        await createApprovedContext(action);
      const result = await processViernesApprovalCommand(
        parseApprovalCommand(`aprobar ${actCode}`),
        {
          approvalGate,
          auditTrail,
          approvalId,
          action,
          policyOptions: { env: SAFE_ENV, envFiles: [] },
        },
      );
      assert(result.allowed, "correct ACT should approve");
      assert(result.status === "approved", "expected approved status");
    }),
  );

  tests.push(
    await test("reject command marks approval rejected", async () => {
      const action = githubReadAction("viernes-approval-reject-command");
      const { approvalGate, auditTrail, approvalId, actCode } =
        await createApprovedContext(action);
      const result = await processViernesApprovalCommand(
        parseApprovalCommand(`rechazar ${actCode} no autorizado`),
        {
          approvalGate,
          auditTrail,
          approvalId,
          action,
          policyOptions: { env: SAFE_ENV, envFiles: [] },
        },
      );
      assert(!result.allowed, "reject should not allow action");
      assert(result.status === "rejected", "expected rejected status");
      const status = await approvalGate.getApprovalStatus(approvalId);
      assert(status?.status === "rejected", "approval should be rejected");
    }),
  );

  tests.push(
    await test("wrong ACT does not reject", async () => {
      const action = githubReadAction("viernes-approval-wrong-reject");
      const { approvalGate, auditTrail, approvalId } =
        await createApprovedContext(action);
      const result = await processViernesApprovalCommand(
        parseApprovalCommand("rechazar ACT-LOCAL-WRONG-CODE"),
        {
          approvalGate,
          auditTrail,
          approvalId,
          action,
          policyOptions: { env: SAFE_ENV, envFiles: [] },
        },
      );
      assert(!result.allowed, "wrong ACT should not reject");
      assert(result.status === "blocked", "expected blocked status");
      assert(result.reasons.includes("invalid_act_code"), "expected invalid_act_code");
      const status = await approvalGate.getApprovalStatus(approvalId);
      assert(status?.status === "pending", "approval should remain pending");
    }),
  );

  tests.push(
    await test("write action remains blocked after approval", async () => {
      const action = whatsappWriteAction();
      const { approvalGate, auditTrail, approvalId, actCode } =
        await createApprovedContext(action);
      const approvalResult = await processViernesApprovalCommand(
        parseApprovalCommand(`aprobar ${actCode}`),
        {
          approvalGate,
          auditTrail,
          approvalId,
          action,
          policyOptions: { env: SAFE_ENV, envFiles: [] },
        },
      );
      assert(approvalResult.allowed, "approval should be accepted");

      const resumeResult = await resumeApprovedViernesAction(approvalId, {
        approvalGate,
        auditTrail,
        approvalId,
        action,
        policyOptions: { env: SAFE_ENV, envFiles: [] },
      });
      assert(!resumeResult.allowed, "write action should remain blocked");
      assert(
        resumeResult.reasons.includes("action_not_allowlisted_phase_14"),
        `expected allowlist block, got ${resumeResult.reasons.join(", ")}`,
      );
    }),
  );

  tests.push(
    await test("approved read-only action can resume", async () => {
      const action = githubReadAction("viernes-approval-readonly-resume");
      const { approvalGate, auditTrail, approvalId, actCode } =
        await createApprovedContext(action);
      const result = await processViernesApprovalCommand(
        parseApprovalCommand(`aprobar ${actCode}`),
        {
          approvalGate,
          auditTrail,
          approvalId,
          action,
          policyOptions: { env: SAFE_ENV, envFiles: [] },
          resumeApprovedReadOnly: true,
        },
      );
      assert(result.allowed, "read-only resume should be allowed");
      assert(result.status === "resumed_read_only", "expected resumed_read_only");
      assert(result.executionResult?.status === "simulated", "expected safe simulated owner readiness");
      const serialized = JSON.stringify(result);
      assert(!serialized.includes("viernes-approval-test-token-never-print"), "token leaked");
      assert(!serialized.toLowerCase().includes("authorization"), "authorization leaked");
    }),
  );

  const failed = tests.filter((result) => !result.passed);
  console.log("Viernes approval tests:");
  console.log(`- total: ${tests.length - failed.length}/${tests.length} passed`);

  if (failed.length > 0) {
    console.log("- failures:");
    for (const result of failed) {
      console.log(`  ${result.name}: ${result.error ?? "unknown failure"}`);
    }
    return 1;
  }

  console.log("- messages sent: none");
  console.log("- external writes: none");
  return 0;
}

process.exitCode = await main();
