import { mapViernesRequestToActions } from "../src/viernesBridge/actionMapper.ts";
import { processViernesBridgeRequest } from "../src/viernesBridge/processor.ts";
import type { ViernesBridgeRequest } from "../src/viernesBridge/types.ts";

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
