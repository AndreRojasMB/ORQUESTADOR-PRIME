import { mkdtemp, readFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { createApprovalGate } from "../src/integrations/actions/approval/approvalGate.ts";
import { createActionAuditTrail } from "../src/integrations/actions/audit/auditTrail.ts";
import { createPersistentApprovalStore } from "../src/integrations/actions/storage/approvalPersistentStore.ts";
import { createPersistentAuditStore } from "../src/integrations/actions/storage/auditPersistentStore.ts";
import type { IntegrationActionApprovalRequest } from "../src/integrations/actions/approval/types.ts";
import type { ProposedIntegrationAction } from "../src/integrations/actions/types.ts";
import { listenViernesBridgeHttpServer } from "../src/viernesBridge/server/httpServer.ts";
import { readViernesBridgeStatus } from "../src/viernesBridge/status/statusStore.ts";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const SECRET_VALUES = [
  "approval-resume-gh-token-never-print",
  "approval-resume-hook-token-never-print",
  "approval-resume-verify-token-never-print",
] as const;

const BASIC_EVIDENCE_PLAN = {
  summary: "Record safe approval resume block decision only.",
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

function safeEnv(dataDir: string): NodeJS.ProcessEnv {
  return {
    ORQUESTADOR_DATA_DIR: dataDir,
    GITHUB_TOKEN: SECRET_VALUES[0],
    GITHUB_OWNER: "orquestador-demo-owner",
    GITHUB_ALLOWED_REPOS: "orquestador-prime",
    WHATSAPP_PROVIDER: "twilio",
    WHATSAPP_HEALTH_URL: "http://127.0.0.1:8787/health",
    WHATSAPP_WEBHOOK_URL: "http://127.0.0.1:8787/whatsapp-orchestrator",
    WHATSAPP_HOOK_TOKEN: SECRET_VALUES[1],
    WHATSAPP_VERIFY_TOKEN: SECRET_VALUES[2],
  };
}

function githubReadAction(id: string): ProposedIntegrationAction {
  return {
    id,
    integration: "github",
    action: "read_repo_status",
    title: "Resume GitHub repo status",
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

function whatsappWriteAction(id: string): ProposedIntegrationAction {
  return {
    id,
    integration: "whatsapp",
    action: "send_message",
    title: "Blocked WhatsApp send",
    description: "Approved write action must still be blocked by execution policy.",
    riskLevel: "high",
    requiresApproval: true,
    dryRunOnly: true,
    input: {
      to: "redacted-local-recipient",
      message: "redacted-message",
      token: SECRET_VALUES[1],
    },
    expectedOutcome: "Execution gate blocks before any provider call.",
    evidencePlan: BASIC_EVIDENCE_PLAN,
    createdAt: new Date().toISOString(),
  };
}

async function createApprovalFixture(input: {
  env: NodeJS.ProcessEnv;
  action: ProposedIntegrationAction;
  ttlMs?: number;
  audit?: boolean;
}): Promise<IntegrationActionApprovalRequest> {
  const approvalGate = await createApprovalGate({
    store: createPersistentApprovalStore({ env: input.env }),
    ...(input.ttlMs !== undefined ? { ttlMs: input.ttlMs } : {}),
  });
  const auditTrail = await createActionAuditTrail({
    store: createPersistentAuditStore({ env: input.env }),
  });

  if (input.audit ?? true) {
    await auditTrail.createActionAudit(input.action);
  }
  const approval = await approvalGate.createApprovalRequest(input.action);
  if (input.audit ?? true) {
    await auditTrail.recordApprovalRequested(input.action, approval);
  }
  return approval;
}

async function approvalStatus(
  env: NodeJS.ProcessEnv,
  approvalId: string,
): Promise<IntegrationActionApprovalRequest | undefined> {
  const approvalGate = await createApprovalGate({
    store: createPersistentApprovalStore({ env }),
  });
  return approvalGate.getApprovalStatus(approvalId);
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
  assert(response.status === 200, `expected 200, got ${response.status}`);
  return (await response.json()) as Record<string, unknown>;
}

async function postViernesRequest(
  url: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await fetch(`${url}/viernes/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  assert(response.status === 200, `expected 200, got ${response.status}`);
  return (await response.json()) as Record<string, unknown>;
}

function reasons(body: Record<string, unknown>): string[] {
  return Array.isArray(body.blockedReasons)
    ? body.blockedReasons.filter((reason): reason is string => typeof reason === "string")
    : [];
}

function assertNoSecret(value: unknown): void {
  const serialized = JSON.stringify(value);
  for (const secret of SECRET_VALUES) {
    assert(!serialized.includes(secret), "provider secret leaked");
  }
  assert(!serialized.toLowerCase().includes("authorization"), "authorization leaked");
}

function firstApproval(body: Record<string, unknown>): Record<string, unknown> {
  const approvals = body.approvalRequests;
  assert(Array.isArray(approvals) && approvals.length > 0, "expected approval request");
  const approval = approvals[0];
  assert(approval && typeof approval === "object" && !Array.isArray(approval), "expected approval object");
  return approval as Record<string, unknown>;
}

async function main(): Promise<number> {
  const tests: TestResult[] = [];
  const dataDir = await mkdtemp(join(tmpdir(), "orquestador-approval-resume-"));
  const env = safeEnv(dataDir);
  const handle = await listenViernesBridgeHttpServer({
    host: "127.0.0.1",
    port: 0,
    env,
    executeReadOnly: false,
  });

  try {
    tests.push(
      await test("needs_approval response includes ACT but status and stores do not", async () => {
        const requestBody = await postViernesRequest(handle.url, {
          source: "local",
          messageText: "revisa estado github",
          intent: "check_github_repo_status",
          context: {
            owner: "orquestador-demo-owner",
          },
        });
        assert(requestBody.status === "needs_approval", `expected needs_approval, got ${requestBody.status}`);
        const act = typeof requestBody.approvalCode === "string" ? requestBody.approvalCode : undefined;
        assert(!!act && act.startsWith("ACT-LOCAL-"), "expected top-level approvalCode");
        assert(requestBody.approvalInstruction === `aprobar ${act}`, "expected top-level approvalInstruction");
        assert(requestBody.rejectInstruction === `rechazar ${act}`, "expected top-level rejectInstruction");
        assert(requestBody.localDevOnly === true, "expected localDevOnly marker");
        assert(typeof requestBody.riskLevel === "string", "expected top-level riskLevel");
        assert(typeof requestBody.expiresAt === "string", "expected top-level expiresAt");
        const approvalId = typeof requestBody.approvalId === "string" ? requestBody.approvalId : undefined;
        const actionId = typeof requestBody.actionId === "string" ? requestBody.actionId : undefined;
        assert(!!approvalId, "expected top-level approvalId");
        assert(!!actionId, "expected top-level actionId");
        const approval = firstApproval(requestBody);
        assert(approval.id === approvalId, "approval request id mismatch");
        assert(approval.actionId === actionId, "approval request actionId mismatch");
        const message = approval.message as Record<string, unknown> | undefined;
        assert(message?.channel === "local_dev", "expected local_dev message");
        assert(message?.containsLocalDevAct === true, "expected local/dev ACT marker");
        const text = typeof message?.text === "string" ? message.text : "";
        assert(text.includes(act), "expected matching ACT in immediate local/dev response");

        const statusRaw = await readFile(join(dataDir, "viernes-bridge-status.json"), "utf-8");
        assert(!statusRaw.includes(act), "ACT leaked to status store");
        const auditRaw = await readFile(join(dataDir, "integration-actions", "audit-records.json"), "utf-8");
        assert(!auditRaw.includes(act), "ACT leaked to audit store");
        const approvalRaw = await readFile(join(dataDir, "integration-actions", "approvals.json"), "utf-8");
        assert(!approvalRaw.includes(act), "ACT leaked to approval store");

        const approved = await postApprovalCommand(handle.url, {
          type: "approval_command",
          text: `aprobar ${act}`,
          approvalId,
          source: "local",
        });
        assert(approved.status === "read_only_executed", `expected read_only_executed, got ${approved.status}`);
        assertNoSecret(requestBody);
        assertNoSecret(approved);
      }),
    );

    tests.push(
      await test("correct ACT approves and resumes read-only action", async () => {
        const action = githubReadAction("approval-resume-readonly-ok");
        const approval = await createApprovalFixture({ env, action });
        const body = await postApprovalCommand(handle.url, {
          type: "approval_command",
          text: `aprobar ${approval.actCode}`,
          approvalId: approval.id,
          source: "local",
        });
        assert(body.status === "read_only_executed", `expected read_only_executed, got ${body.status}`);
        assert((body.executionResult as Record<string, unknown> | undefined)?.status === "simulated", "expected safe simulated execution");
        const stored = await approvalStatus(env, approval.id);
        assert(stored?.status === "approved", "approval should be approved");
        assertNoSecret(body);
      }),
    );

    tests.push(
      await test("wrong ACT blocks approval", async () => {
        const action = githubReadAction("approval-resume-wrong-act");
        const approval = await createApprovalFixture({ env, action });
        const body = await postApprovalCommand(handle.url, {
          type: "approval_command",
          text: "aprobar ACT-LOCAL-WRONG-CODE",
          approvalId: approval.id,
          source: "local",
        });
        assert(body.status === "blocked", "expected blocked");
        assert(reasons(body).includes("invalid_act_code"), "expected invalid_act_code");
        const stored = await approvalStatus(env, approval.id);
        assert(stored?.status === "pending", "approval should remain pending");
        assertNoSecret(body);
      }),
    );

    tests.push(
      await test("unknown approval id returns not_found", async () => {
        const body = await postApprovalCommand(handle.url, {
          type: "approval_command",
          text: "aprobar ACT-LOCAL-FAKE-CODE",
          approvalId: "approval-does-not-exist",
          source: "local",
        });
        assert(body.status === "not_found", `expected not_found, got ${body.status}`);
        assert(reasons(body).includes("approval_not_found"), "expected approval_not_found");
        assertNoSecret(body);
      }),
    );

    tests.push(
      await test("correct reject command rejects approval", async () => {
        const action = githubReadAction("approval-resume-reject-ok");
        const approval = await createApprovalFixture({ env, action });
        const body = await postApprovalCommand(handle.url, {
          type: "approval_command",
          text: `rechazar ${approval.actCode} no autorizado`,
          approvalId: approval.id,
          source: "local",
        });
        assert(body.status === "rejected", `expected rejected, got ${body.status}`);
        const stored = await approvalStatus(env, approval.id);
        assert(stored?.status === "rejected", "approval should be rejected");
        assertNoSecret(body);
      }),
    );

    tests.push(
      await test("expired approval blocks", async () => {
        const action = githubReadAction("approval-resume-expired");
        const approval = await createApprovalFixture({ env, action, ttlMs: -1000 });
        const body = await postApprovalCommand(handle.url, {
          type: "approval_command",
          text: `aprobar ${approval.actCode}`,
          approvalId: approval.id,
          source: "local",
        });
        assert(body.status === "blocked", "expected blocked");
        assert(reasons(body).includes("approval_expired"), "expected approval_expired");
        assertNoSecret(body);
      }),
    );

    tests.push(
      await test("approved write action still blocks", async () => {
        const action = whatsappWriteAction("approval-resume-write-blocked");
        const approval = await createApprovalFixture({ env, action });
        const body = await postApprovalCommand(handle.url, {
          type: "approval_command",
          text: `aprobar ${approval.actCode}`,
          approvalId: approval.id,
          source: "local",
        });
        assert(body.status === "blocked", "expected write action to stay blocked");
        assert(reasons(body).length > 0, "expected block reasons");
        const stored = await approvalStatus(env, approval.id);
        assert(stored?.status === "approved", "approval itself should be approved");
        assertNoSecret(body);
      }),
    );

    tests.push(
      await test("request without audit trail blocks before approval", async () => {
        const action = githubReadAction("approval-resume-no-audit");
        const approval = await createApprovalFixture({ env, action, audit: false });
        const body = await postApprovalCommand(handle.url, {
          type: "approval_command",
          text: `aprobar ${approval.actCode}`,
          approvalId: approval.id,
          source: "local",
        });
        assert(body.status === "blocked", "expected blocked");
        assert(reasons(body).includes("audit_record_required"), "expected audit_record_required");
        const stored = await approvalStatus(env, approval.id);
        assert(stored?.status === "pending", "approval should remain pending");
        assertNoSecret(body);
      }),
    );

    tests.push(
      await test("status store updates without ACT code", async () => {
        const action = githubReadAction("approval-resume-status-store");
        const approval = await createApprovalFixture({ env, action });
        await postApprovalCommand(handle.url, {
          type: "approval_command",
          text: `aprobar ${approval.actCode}`,
          approvalId: approval.id,
          source: "local",
        });
        const status = await readViernesBridgeStatus({ env });
        assert(status.connected === true, "expected connected status");
        assert(status.mode === "local_http", "expected local_http mode");
        assert(status.writesEnabled === false, "writes must remain disabled");
        assert(status.lastIntent === "approval_command", "expected approval_command intent");
        assert(status.lastStatus === "read_only_executed", "expected read_only_executed status");
        const raw = await readFile(join(dataDir, "viernes-bridge-status.json"), "utf-8");
        assert(!raw.includes(approval.actCode), "ACT code leaked to status store");
        assertNoSecret(raw);
      }),
    );
  } finally {
    await new Promise<void>((resolve) => {
      handle.server.close(() => resolve());
    });
    await rm(dataDir, { force: true, recursive: true });
  }

  const failed = tests.filter((result) => !result.passed);
  console.log("Viernes bridge approval resume tests:");
  console.log(`- total: ${tests.length - failed.length}/${tests.length} passed`);

  if (failed.length > 0) {
    console.log("- failures:");
    for (const result of failed) {
      console.log(`  ${result.name}: ${result.error ?? "unknown failure"}`);
    }
    return 1;
  }

  console.log("- messages sent: none");
  console.log("- provider writes: none");
  console.log("- secrets printed: none");
  return 0;
}

process.exitCode = await main();
