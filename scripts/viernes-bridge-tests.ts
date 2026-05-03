import { createApprovalGate } from "../src/integrations/actions/approval/approvalGate.ts";
import { createActionAuditTrail } from "../src/integrations/actions/audit/auditTrail.ts";
import { mapViernesRequestToActions } from "../src/viernesBridge/actionMapper.ts";
import { processViernesBridgeRequest } from "../src/viernesBridge/processor.ts";
import type {
  ViernesBridgeRequest,
  ViernesBridgeResponse,
} from "../src/viernesBridge/types.ts";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const SAFE_ENV: NodeJS.ProcessEnv = {
  GITHUB_TOKEN: "viernes-test-token-never-print",
  GITHUB_OWNER: "orquestador-demo-owner",
  GITHUB_ALLOWED_REPOS: "orquestador-prime",
  WHATSAPP_PROVIDER: "twilio",
  WHATSAPP_HEALTH_URL: "http://127.0.0.1:8787/health",
  WHATSAPP_WEBHOOK_URL: "http://127.0.0.1:8787/whatsapp-orchestrator",
  WHATSAPP_HOOK_TOKEN: "viernes-hook-token-never-print",
  WHATSAPP_VERIFY_TOKEN: "viernes-verify-token-never-print",
};

function request(
  id: string,
  intent: ViernesBridgeRequest["intent"],
  context: Record<string, unknown> = {},
): ViernesBridgeRequest {
  return {
    id,
    source: "local",
    messageText: intent ?? "unknown",
    ...(intent ? { intent } : {}),
    context,
    requestedAt: new Date().toISOString(),
  };
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertIncludes(values: readonly string[] | undefined, expected: string): void {
  assert(
    (values ?? []).includes(expected),
    `expected "${expected}", got "${(values ?? []).join(", ") || "none"}`,
  );
}

function extractLocalDevAct(value: string): string | undefined {
  return value.match(/ACT:\s+(ACT-LOCAL-[A-Z0-9-]+)/)?.[1];
}

function assertCompleteNeedsApprovalContract(
  response: ViernesBridgeResponse,
): string {
  assert(response.status === "needs_approval", "expected needs_approval");
  assert(typeof response.approvalId === "string" && response.approvalId.length > 0, "expected approvalId");
  assert(typeof response.actionId === "string" && response.actionId.length > 0, "expected actionId");
  assert(typeof response.approvalCode === "string" && response.approvalCode.startsWith("ACT-LOCAL-"), "expected approvalCode");
  assert(response.approvalInstruction === `aprobar ${response.approvalCode}`, "expected approvalInstruction");
  assert(response.rejectInstruction === `rechazar ${response.approvalCode}`, "expected rejectInstruction");
  assert(typeof response.riskLevel === "string" && response.riskLevel.length > 0, "expected riskLevel");
  assert(typeof response.expiresAt === "string" && response.expiresAt.length > 0, "expected expiresAt");
  assert(response.localDevOnly === true, "expected localDevOnly");
  return response.approvalCode;
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

async function main(): Promise<number> {
  const tests: TestResult[] = [];

  tests.push(
    await test("allowed GitHub intent maps correct action", async () => {
      const mapped = mapViernesRequestToActions(
        request("test-map-github", "check_github_repo_status", {
          owner: "orquestador-demo-owner",
          repo: "orquestador-prime",
        }),
      );
      assert(mapped.actions.length === 1, "expected one action");
      assert(mapped.actions[0]?.integration === "github", "expected github");
      assert(mapped.actions[0]?.action === "read_repo_status", "expected read_repo_status");
    }),
  );

  tests.push(
    await test("dangerous intent is blocked", async () => {
      const response = await processViernesBridgeRequest(
        request("test-danger-send", "send_whatsapp_message", {
          token: "viernes-hook-token-never-print",
        }),
        {
          executeReadOnly: false,
          policyOptions: { env: SAFE_ENV, envFiles: [] },
        },
      );
      assert(response.status === "blocked", "expected blocked response");
      assertIncludes(response.blockedReasons, "whatsapp_send_message_blocked");
    }),
  );

  tests.push(
    await test("unknown intent returns no_action", async () => {
      const response = await processViernesBridgeRequest(
        request("test-unknown", "unknown"),
        {
          executeReadOnly: false,
          policyOptions: { env: SAFE_ENV, envFiles: [] },
        },
      );
      assert(response.status === "no_action", "expected no_action");
      assert(response.proposedActions.length === 0, "expected no proposed actions");
    }),
  );

  tests.push(
    await test("bridge validates, dry-runs, policies, and audits", async () => {
      const response = await processViernesBridgeRequest(
        request("test-policy-audit", "validate_whatsapp_bridge", {}),
        {
          executeReadOnly: false,
          policyOptions: {
            env: { ...SAFE_ENV, WHATSAPP_HEALTH_URL: "" },
            envFiles: [],
          },
        },
      );
      assert(response.status === "blocked", "expected policy block");
      assertIncludes(response.blockedReasons, "missing_health_url");
      assert((response.auditIds?.length ?? 0) >= 3, "expected audit events");
    }),
  );

  tests.push(
    await test("evidence and response are redacted", async () => {
      const response = await processViernesBridgeRequest(
        request("test-redaction", "send_whatsapp_message", {
          token: "viernes-hook-token-never-print",
          authorization: "demo authorization value",
        }),
        {
          executeReadOnly: false,
          policyOptions: { env: SAFE_ENV, envFiles: [] },
        },
      );
      const serialized = JSON.stringify(response);
      assert(!serialized.includes("viernes-hook-token-never-print"), "token leaked");
      assert(!serialized.includes("viernes-verify-token-never-print"), "verify token leaked");
      assert(!serialized.toLowerCase().includes("authorization"), "authorization leaked");
    }),
  );

  tests.push(
    await test("allowed WhatsApp bridge can stop at dry-run", async () => {
      const response = await processViernesBridgeRequest(
        request("test-dry-run-whatsapp", "validate_whatsapp_bridge", {
          targetUrl: "http://127.0.0.1:8787/health",
        }),
        {
          executeReadOnly: false,
          policyOptions: { env: SAFE_ENV, envFiles: [] },
        },
      );
      assert(response.status === "dry_run_ready", "expected dry_run_ready");
      assert(response.executionResults === undefined, "expected no execution results");
    }),
  );

  tests.push(
    await test("needs_approval includes immediate local/dev ACT message only", async () => {
      const approvalGate = await createApprovalGate();
      const auditTrail = await createActionAuditTrail();
      const response = await processViernesBridgeRequest(
        request("test-needs-approval-message", "check_github_repo_status", {
          owner: "orquestador-demo-owner",
        }),
        {
          approvalGate,
          auditTrail,
          executeReadOnly: false,
          policyOptions: { env: SAFE_ENV, envFiles: [] },
        },
      );
      const act = assertCompleteNeedsApprovalContract(response);
      const approval = response.approvalRequests?.[0];
      assert(response.approvalId === approval?.id, "top-level approvalId must match approval request");
      assert(response.actionId === approval?.actionId, "top-level actionId must match approval request");
      const message = response.approvalRequests?.[0]?.message;
      assert(message?.channel === "local_dev", "expected local_dev approval message");
      assert(message.containsLocalDevAct === true, "expected local/dev ACT marker");
      assert(extractLocalDevAct(message.text) === act, "expected matching ACT in immediate response message");
      const serializedResponse = JSON.stringify(response);
      assert(!serializedResponse.includes("viernes-test-token-never-print"), "github token leaked");
      assert(!serializedResponse.includes("viernes-hook-token-never-print"), "hook token leaked");
      assert(!serializedResponse.toLowerCase().includes("authorization"), "authorization leaked");

      const auditSerialized = JSON.stringify(await auditTrail.listAuditRecords());
      assert(!auditSerialized.includes(act), "ACT leaked to audit records");
    }),
  );

  tests.push(
    await test("all needs_approval responses include complete local/dev contract", async () => {
      const cases: readonly {
        id: string;
        intent: ViernesBridgeRequest["intent"];
        context?: Record<string, unknown>;
      }[] = [
        {
          id: "test-e2e-approval-contract",
          intent: "e2e_readonly_status_demo",
        },
        {
          id: "test-github-approval-contract",
          intent: "check_github_repo_status",
          context: { owner: "orquestador-demo-owner" },
        },
        {
          id: "test-prepare-reply-approval-contract",
          intent: "prepare_whatsapp_reply",
        },
      ];

      for (const entry of cases) {
        const response = await processViernesBridgeRequest(
          request(entry.id, entry.intent, entry.context ?? {}),
          {
            executeReadOnly: false,
            policyOptions: { env: SAFE_ENV, envFiles: [] },
          },
        );
        const act = assertCompleteNeedsApprovalContract(response);
        const serialized = JSON.stringify(response);
        assert(!serialized.includes("viernes-test-token-never-print"), "github token leaked");
        assert(!serialized.includes("viernes-hook-token-never-print"), "hook token leaked");
        assert(!serialized.toLowerCase().includes("authorization"), "authorization leaked");
        assert(response.approvalInstruction === `aprobar ${act}`, "approval instruction mismatch");
      }
    }),
  );

  const failed = tests.filter((result) => !result.passed);
  console.log("Viernes bridge tests:");
  console.log(`- total: ${tests.length - failed.length}/${tests.length} passed`);

  if (failed.length > 0) {
    console.log("- failures:");
    for (const result of failed) {
      console.log(`  ${result.name}: ${result.error ?? "unknown failure"}`);
    }
    return 1;
  }

  console.log("- external calls: none");
  return 0;
}

process.exitCode = await main();
