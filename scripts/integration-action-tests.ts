import { mkdtemp, readFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { createApprovalGate } from "../src/integrations/actions/approval/approvalGate.ts";
import { createActionAuditTrail } from "../src/integrations/actions/audit/auditTrail.ts";
import { redactSensitive } from "../src/integrations/actions/audit/redact.ts";
import { createExecutionGate } from "../src/integrations/actions/executors/executionGate.ts";
import { validateIntegrationActionPolicy } from "../src/integrations/actions/policy/policyValidator.ts";
import { getIntegrationTargetPolicies } from "../src/integrations/actions/policy/targetPolicy.ts";
import { validateProposedIntegrationAction } from "../src/integrations/actions/validator.ts";
import { createPersistentApprovalStore } from "../src/integrations/actions/storage/approvalPersistentStore.ts";
import { createPersistentAuditStore } from "../src/integrations/actions/storage/auditPersistentStore.ts";
import { createPolicySnapshotStore } from "../src/integrations/actions/storage/policySnapshotStore.ts";
import type { ProposedIntegrationAction } from "../src/integrations/actions/types.ts";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const SAFE_ENV: NodeJS.ProcessEnv = {
  GITHUB_TOKEN: "phase17-token-never-print",
  GITHUB_OWNER: "orquestador-demo-owner",
  GITHUB_ALLOWED_REPOS: "orquestador-prime",
  N8N_BASE_URL: "http://127.0.0.1:5678",
  N8N_WEBHOOK_URL: "http://127.0.0.1:5678/webhook/orquestador-trigger",
  WHATSAPP_PROVIDER: "twilio",
  WHATSAPP_HEALTH_URL: "http://127.0.0.1:8787/health",
  WHATSAPP_WEBHOOK_URL: "http://127.0.0.1:8787/whatsapp-orchestrator",
  WHATSAPP_HOOK_TOKEN: "phase18-hook-token-never-print",
  WHATSAPP_VERIFY_TOKEN: "phase18-verify-token-never-print",
  COOLIFY_BASE_URL: "https://coolify.example.invalid",
};

const EVIDENCE_PLAN = {
  summary: "Capture safe local test evidence only.",
  steps: ["Validate local rule.", "Assert safe result."],
} as const;

const ROLLBACK_PLAN = {
  summary: "No real execution occurs in integration action tests.",
  steps: ["Confirm no external action was invoked."],
} as const;

function makeAction(
  id: string,
  integration: ProposedIntegrationAction["integration"],
  actionName: ProposedIntegrationAction["action"],
  input: Record<string, unknown> = {},
  options: Partial<
    Pick<
      ProposedIntegrationAction,
      "riskLevel" | "requiresApproval" | "dryRunOnly" | "evidencePlan" | "rollbackPlan"
    >
  > = {},
): ProposedIntegrationAction {
  const riskLevel = options.riskLevel ?? "low";
  return {
    id,
    integration,
    action: actionName,
    title: `Test ${integration}.${actionName}`,
    description: "Local integration action test proposal.",
    riskLevel,
    requiresApproval: options.requiresApproval ?? false,
    dryRunOnly: options.dryRunOnly ?? true,
    input,
    expectedOutcome: "A local allow or block decision.",
    ...(options.evidencePlan ? { evidencePlan: options.evidencePlan } : {}),
    ...(options.rollbackPlan ? { rollbackPlan: options.rollbackPlan } : {}),
    createdAt: new Date().toISOString(),
  };
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertIncludes(values: readonly string[], expected: string): void {
  assert(
    values.includes(expected),
    `expected reason "${expected}", got "${values.join(", ") || "none"}"`,
  );
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

async function validatorTests(): Promise<TestResult[]> {
  return Promise.all([
    test("validator blocks dryRunOnly=false", async () => {
      const result = await validateProposedIntegrationAction(
        makeAction("test-validator-real", "github", "create_issue", {}, {
          riskLevel: "medium",
          requiresApproval: true,
          dryRunOnly: false,
        }),
      );
      assert(!result.allowed, "expected validator to block real execution");
      assertIncludes(result.reasons, "real_execution_disabled_in_phase_11");
    }),
    test("validator blocks high risk without evidencePlan", async () => {
      const result = await validateProposedIntegrationAction(
        makeAction("test-validator-high", "whatsapp", "send_message", {}, {
          riskLevel: "high",
          requiresApproval: true,
        }),
      );
      assert(!result.allowed, "expected high risk action to be blocked");
      assertIncludes(result.reasons, "high_risk_action_requires_evidence_plan");
    }),
    test("validator blocks critical without rollbackPlan", async () => {
      const result = await validateProposedIntegrationAction(
        makeAction("test-validator-critical", "coolify", "deploy_application", {}, {
          riskLevel: "critical",
          requiresApproval: true,
          evidencePlan: EVIDENCE_PLAN,
        }),
      );
      assert(!result.allowed, "expected critical action to be blocked");
      assertIncludes(result.reasons, "critical_risk_action_requires_rollback_plan");
    }),
  ]);
}

async function approvalTests(): Promise<TestResult[]> {
  return Promise.all([
    test("approval rejects incorrect ACT", async () => {
      const gate = await createApprovalGate();
      const action = makeAction("test-approval-wrong", "whatsapp", "send_message", {}, {
        riskLevel: "high",
        requiresApproval: true,
        evidencePlan: EVIDENCE_PLAN,
      });
      const approval = await gate.createApprovalRequest(action);
      const decision = await gate.approveAction(approval.id, "ACT-LOCAL-WRNG-CODE");
      assert(!decision.allowed, "expected wrong ACT to be denied");
      assertIncludes(decision.reasons, "invalid_act_code");
    }),
    test("approval accepts correct ACT", async () => {
      const gate = await createApprovalGate();
      const action = makeAction("test-approval-right", "whatsapp", "send_message", {}, {
        riskLevel: "high",
        requiresApproval: true,
        evidencePlan: EVIDENCE_PLAN,
      });
      const approval = await gate.createApprovalRequest(action);
      const decision = await gate.approveAction(approval.id, approval.actCode);
      assert(decision.allowed, "expected correct ACT to approve");
    }),
    test("approval expires pending request", async () => {
      const gate = await createApprovalGate({ ttlMs: -1 });
      const action = makeAction("test-approval-expired", "whatsapp", "send_message", {}, {
        riskLevel: "high",
        requiresApproval: true,
        evidencePlan: EVIDENCE_PLAN,
      });
      const approval = await gate.createApprovalRequest(action);
      const decision = await gate.approveAction(approval.id, approval.actCode);
      assert(!decision.allowed, "expected expired approval to block");
      assertIncludes(decision.reasons, "approval_expired");
    }),
  ]);
}

async function auditTests(): Promise<TestResult[]> {
  return Promise.all([
    test("audit redacts sensitive fields", async () => {
      const redacted = redactSensitive({
        token: "demo-token",
        apiKey: "demo-api-key",
        authorization: "demo-authorization",
        cookie: "demo-cookie",
        safe: "visible",
      }) as Record<string, unknown>;
      assert(redacted.token === "[REDACTED]", "token was not redacted");
      assert(redacted.apiKey === "[REDACTED]", "apiKey was not redacted");
      assert(redacted.authorization === "[REDACTED]", "authorization was not redacted");
      assert(redacted.cookie === "[REDACTED]", "cookie was not redacted");
      assert(redacted.safe === "visible", "safe value should remain visible");
    }),
    test("execution gate requires audit record", async () => {
      const approvalGate = await createApprovalGate();
      const auditTrail = await createActionAuditTrail();
      const executionGate = createExecutionGate({
        approvalGate,
        auditTrail,
        policyOptions: { env: SAFE_ENV, envFiles: [] },
      });
      const result = await executionGate.execute(
        makeAction("test-exec-no-audit", "whatsapp", "validate_bridge", {
          targetUrl: "http://127.0.0.1:8787/health",
        }),
      );
      assert(result.status === "blocked", "expected missing audit to block");
      assertIncludes(result.blockedReasons ?? [], "audit_record_required");
    }),
  ]);
}

async function policyTests(): Promise<TestResult[]> {
  return Promise.all([
    test("policy allows GitHub owner", async () => {
      const result = await validateIntegrationActionPolicy(
        makeAction("test-policy-github-allowed", "github", "read_repo_status", {
          owner: "orquestador-demo-owner",
          repo: "orquestador-prime",
        }),
        { env: SAFE_ENV, envFiles: [] },
      );
      assert(result.allowed, "expected GitHub owner to be allowed");
    }),
    test("policy blocks GitHub owner", async () => {
      const result = await validateIntegrationActionPolicy(
        makeAction("test-policy-github-blocked", "github", "read_repo_status", {
          owner: "blocked-owner",
          repo: "orquestador-prime",
        }),
        { env: SAFE_ENV, envFiles: [] },
      );
      assert(!result.allowed, "expected GitHub owner to be blocked");
      assertIncludes(result.reasons, "github_owner_not_allowed");
    }),
    test("policy allows WhatsApp health URL", async () => {
      const result = await validateIntegrationActionPolicy(
        makeAction("test-policy-whatsapp-allowed", "whatsapp", "validate_bridge", {
          targetUrl: "http://127.0.0.1:8787/health",
        }),
        { env: SAFE_ENV, envFiles: [] },
      );
      assert(result.allowed, "expected WhatsApp health URL to be allowed");
    }),
    test("policy blocks WhatsApp webhook", async () => {
      const result = await validateIntegrationActionPolicy(
        makeAction("test-policy-whatsapp-webhook", "whatsapp", "validate_bridge", {
          webhookUrl: "http://127.0.0.1:8787/whatsapp-orchestrator",
        }),
        { env: SAFE_ENV, envFiles: [] },
      );
      assert(!result.allowed, "expected WhatsApp webhook to be blocked");
      assertIncludes(result.reasons, "webhook_execution_blocked");
    }),
    test("policy blocks WhatsApp send_message", async () => {
      const result = await validateIntegrationActionPolicy(
        makeAction("test-policy-whatsapp-send", "whatsapp", "send_message", {}, {
          riskLevel: "high",
          requiresApproval: true,
          evidencePlan: EVIDENCE_PLAN,
        }),
        { env: SAFE_ENV, envFiles: [] },
      );
      assert(!result.allowed, "expected WhatsApp send_message to be blocked");
      assertIncludes(result.reasons, "whatsapp_send_message_blocked_phase_15");
    }),
    test("policy blocks n8n webhook", async () => {
      const result = await validateIntegrationActionPolicy(
        makeAction("test-policy-n8n-webhook", "n8n", "validate_webhook", {
          webhookUrl: "http://127.0.0.1:5678/webhook/orquestador-trigger",
        }),
        { env: SAFE_ENV, envFiles: [] },
      );
      assert(!result.allowed, "expected n8n webhook to be blocked");
      assertIncludes(result.reasons, "webhook_execution_blocked");
    }),
    test("policy blocks Coolify deploy", async () => {
      const result = await validateIntegrationActionPolicy(
        makeAction("test-policy-coolify", "coolify", "deploy_application", {}, {
          riskLevel: "critical",
          requiresApproval: true,
          evidencePlan: EVIDENCE_PLAN,
          rollbackPlan: ROLLBACK_PLAN,
        }),
        { env: SAFE_ENV, envFiles: [] },
      );
      assert(!result.allowed, "expected Coolify deploy to be blocked");
      assertIncludes(result.reasons, "coolify_write_actions_blocked_phase_15");
    }),
  ]);
}

async function executionGateTests(): Promise<TestResult[]> {
  return Promise.all([
    test("execution gate blocks non-allowlisted action", async () => {
      const approvalGate = await createApprovalGate();
      const auditTrail = await createActionAuditTrail();
      const executionGate = createExecutionGate({
        approvalGate,
        auditTrail,
        policyOptions: { env: SAFE_ENV, envFiles: [] },
      });
      const action = makeAction("test-exec-not-allowlisted", "whatsapp", "send_message", {}, {
        riskLevel: "high",
        requiresApproval: true,
        evidencePlan: EVIDENCE_PLAN,
      });
      await auditTrail.createActionAudit(action);
      const result = await executionGate.execute(action);
      assert(result.status === "blocked", "expected action to be blocked");
      assertIncludes(result.blockedReasons ?? [], "action_not_allowlisted_phase_14");
    }),
    test("execution gate blocks unapproved action", async () => {
      const approvalGate = await createApprovalGate();
      const auditTrail = await createActionAuditTrail();
      const executionGate = createExecutionGate({
        approvalGate,
        auditTrail,
        policyOptions: { env: SAFE_ENV, envFiles: [] },
      });
      const action = makeAction(
        "test-exec-unapproved",
        "github",
        "read_repo_status",
        { owner: "orquestador-demo-owner" },
        { requiresApproval: true },
      );
      await auditTrail.createActionAudit(action);
      const result = await executionGate.execute(action);
      assert(result.status === "blocked", "expected unapproved action to block");
      assertIncludes(result.blockedReasons ?? [], "approval_required");
    }),
    test("github read result omits token", async () => {
      const approvalGate = await createApprovalGate();
      const auditTrail = await createActionAuditTrail();
      const executionGate = createExecutionGate({
        approvalGate,
        auditTrail,
        policyOptions: { env: SAFE_ENV, envFiles: [] },
      });
      const action = makeAction(
        "test-exec-github-no-token-output",
        "github",
        "read_repo_status",
        { owner: "orquestador-demo-owner" },
        { requiresApproval: true },
      );
      await auditTrail.createActionAudit(action);
      const approval = await approvalGate.createApprovalRequest(action);
      await approvalGate.approveAction(approval.id, approval.actCode);
      const result = await executionGate.execute(action);
      const serialized = JSON.stringify(result);
      assert(!serialized.includes("phase17-token-never-print"), "token leaked in result");
      assert(!serialized.toLowerCase().includes("authorization"), "authorization leaked in result");
    }),
    test("github read owner-only avoids remote call", async () => {
      const approvalGate = await createApprovalGate();
      const auditTrail = await createActionAuditTrail();
      const executionGate = createExecutionGate({
        approvalGate,
        auditTrail,
        policyOptions: { env: SAFE_ENV, envFiles: [] },
      });
      const action = makeAction(
        "test-exec-github-owner-only",
        "github",
        "read_repo_status",
        { owner: "orquestador-demo-owner" },
        { requiresApproval: true },
      );
      await auditTrail.createActionAudit(action);
      const approval = await approvalGate.createApprovalRequest(action);
      await approvalGate.approveAction(approval.id, approval.actCode);
      const result = await executionGate.execute(action);
      assert(result.status === "simulated", "expected owner-only read to be simulated");
      assert(
        JSON.stringify(result.evidenceRedacted).includes("owner_ready"),
        "expected owner_ready summary",
      );
    }),
    test("whatsapp blocked result omits hook and verify tokens", async () => {
      const approvalGate = await createApprovalGate();
      const auditTrail = await createActionAuditTrail();
      const envWithoutHealth = {
        ...SAFE_ENV,
        WHATSAPP_HEALTH_URL: "",
      };
      const executionGate = createExecutionGate({
        approvalGate,
        auditTrail,
        policyOptions: { env: envWithoutHealth, envFiles: [] },
      });
      const action = makeAction(
        "test-exec-whatsapp-no-token-output",
        "whatsapp",
        "validate_bridge",
        {},
      );
      await auditTrail.createActionAudit(action);
      const result = await executionGate.execute(action);
      const serialized = JSON.stringify(result);
      assert(result.status === "blocked", "expected missing health URL to block");
      assertIncludes(result.blockedReasons ?? [], "missing_health_url");
      assert(!serialized.includes("phase18-hook-token-never-print"), "hook token leaked in result");
      assert(!serialized.includes("phase18-verify-token-never-print"), "verify token leaked in result");
      assert(!serialized.toLowerCase().includes("authorization"), "authorization leaked in result");
    }),
  ]);
}

async function storageTests(): Promise<TestResult[]> {
  return Promise.all([
    test("persistent approval store hashes ACT code", async () => {
      const dataDir = await mkdtemp(join(tmpdir(), "orquestador-action-test-"));
      const store = createPersistentApprovalStore({ dataDir });
      const gate = await createApprovalGate({ store });
      const action = makeAction("test-storage-approval", "whatsapp", "send_message", {}, {
        riskLevel: "high",
        requiresApproval: true,
        evidencePlan: EVIDENCE_PLAN,
      });
      const approval = await gate.createApprovalRequest(action);
      const raw = await readFile(
        join(dataDir, "integration-actions", "approvals.json"),
        "utf-8",
      );
      assert(!raw.includes(approval.actCode), "ACT code leaked to disk");
      const decision = await gate.approveAction(approval.id, approval.actCode);
      assert(decision.allowed, "persistent store should verify ACT hash");
    }),
    test("persistent audit store redacts before writing", async () => {
      const dataDir = await mkdtemp(join(tmpdir(), "orquestador-action-test-"));
      const auditTrail = await createActionAuditTrail({
        store: createPersistentAuditStore({ dataDir }),
      });
      const action = makeAction(
        "test-storage-audit",
        "whatsapp",
        "validate_bridge",
        { token: "demo-token", safe: "visible" },
      );
      await auditTrail.createActionAudit(action);
      const raw = await readFile(
        join(dataDir, "integration-actions", "audit-records.json"),
        "utf-8",
      );
      assert(!raw.includes("demo-token"), "audit token leaked to disk");
      assert(raw.includes("[REDACTED]"), "redaction marker missing");
    }),
    test("policy snapshot store writes safe snapshot", async () => {
      const dataDir = await mkdtemp(join(tmpdir(), "orquestador-action-test-"));
      const policies = await getIntegrationTargetPolicies({
        env: SAFE_ENV,
        envFiles: [],
      });
      const store = createPolicySnapshotStore({ dataDir });
      const snapshot = await store.saveSnapshot({ policies, source: "test" });
      const snapshots = await store.listSnapshots();
      assert(snapshot.policies.length > 0, "expected policies in snapshot");
      assert(snapshots.length === 1, "expected one stored snapshot");
    }),
  ]);
}

async function main(): Promise<number> {
  const groups = [
    ["validator", await validatorTests()],
    ["approval", await approvalTests()],
    ["audit", await auditTests()],
    ["policy", await policyTests()],
    ["execution gate", await executionGateTests()],
    ["storage", await storageTests()],
  ] as const;

  const results = groups.flatMap(([, items]) => items);
  const failed = results.filter((result) => !result.passed);

  console.log("Integration action tests:");
  for (const [group, items] of groups) {
    const passed = items.filter((item) => item.passed).length;
    console.log(`- ${group}: ${passed}/${items.length} passed`);
  }

  if (failed.length > 0) {
    console.log("- failures:");
    for (const result of failed) {
      console.log(`  ${result.name}: ${result.error ?? "unknown failure"}`);
    }
    return 1;
  }

  console.log(`- total: ${results.length}/${results.length} passed`);
  console.log("- external calls: none");
  return 0;
}

process.exitCode = await main();
