import { mkdtemp, readFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { listenViernesBridgeHttpServer } from "../src/viernesBridge/server/httpServer.ts";
import { readViernesBridgeStatus } from "../src/viernesBridge/status/statusStore.ts";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

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

async function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(`${url}/viernes/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function assertNoSecretOrPayload(value: unknown): void {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("local_dev_token_no_compartir"), "local token leaked");
  assert(!serialized.includes("valida el bridge"), "messageText leaked");
  assert(!serialized.includes("envia whatsapp"), "dangerous messageText leaked");
  assert(!serialized.toLowerCase().includes("authorization"), "authorization leaked");
}

async function main(): Promise<number> {
  const tests: TestResult[] = [];
  const dataDir = await mkdtemp(join(tmpdir(), "orquestador-viernes-handshake-"));
  const env: NodeJS.ProcessEnv = {
    ORQUESTADOR_DATA_DIR: dataDir,
    WHATSAPP_PROVIDER: "twilio",
    WHATSAPP_HEALTH_URL: "http://127.0.0.1:8787/health",
    WHATSAPP_WEBHOOK_URL: "http://127.0.0.1:8787/whatsapp-orchestrator",
    WHATSAPP_HOOK_TOKEN: "local_dev_token_no_compartir",
  };

  const handle = await listenViernesBridgeHttpServer({
    host: "127.0.0.1",
    port: 0,
    env,
    executeReadOnly: false,
  });

  try {
    tests.push(
      await test("allowed request updates safe handshake status", async () => {
        const response = await postJson(handle.url, {
          source: "local",
          messageText: "valida el bridge",
          intent: "validate_whatsapp_bridge",
          context: {
            healthUrl: "http://127.0.0.1:8787/health",
          },
        });
        assert(response.status === 200, `expected 200, got ${response.status}`);
        const body = await response.json();
        assert(body.status === "dry_run_ready", `expected dry_run_ready, got ${body.status}`);

        const status = await readViernesBridgeStatus({ env });
        assert(status.connected === true, "expected connected status");
        assert(status.mode === "local_http", "expected local_http mode");
        assert(status.writesEnabled === false, "writes must remain disabled");
        assert(status.lastIntent === "validate_whatsapp_bridge", "expected last intent");
        assert(status.lastStatus === "dry_run_ready", "expected dry_run_ready store status");
        assert(typeof status.lastHandshakeAt === "string", "expected lastHandshakeAt");
        assertNoSecretOrPayload(status);
      }),
    );

    tests.push(
      await test("dangerous request is blocked and recorded safely", async () => {
        const response = await postJson(handle.url, {
          source: "local",
          messageText: "envia whatsapp",
          intent: "send_whatsapp_message",
          context: {
            token: "local_dev_token_no_compartir",
          },
        });
        assert(response.status === 200, `expected 200, got ${response.status}`);
        const body = await response.json();
        assert(body.status === "blocked", `expected blocked, got ${body.status}`);
        assert(
          (body.blockedReasons ?? []).includes("whatsapp_send_message_blocked"),
          "expected whatsapp_send_message_blocked",
        );

        const status = await readViernesBridgeStatus({ env });
        assert(status.connected === true, "blocked request still reached local boundary");
        assert(status.lastStatus === "blocked", "expected blocked store status");
        assert(status.lastIntent === "send_whatsapp_message", "expected dangerous last intent");
        assert(status.lastErrorCode === "whatsapp_send_message_blocked", "expected safe error code");
        assert(status.writesEnabled === false, "writes must remain disabled");
        assertNoSecretOrPayload(status);
      }),
    );

    tests.push(
      await test("status file does not store message text or secrets", async () => {
        const raw = await readFile(join(dataDir, "viernes-bridge-status.json"), "utf-8");
        assertNoSecretOrPayload(raw);
      }),
    );
  } finally {
    await new Promise<void>((resolve) => {
      handle.server.close(() => resolve());
    });
    await rm(dataDir, { force: true, recursive: true });
  }

  const failed = tests.filter((result) => !result.passed);
  console.log("Viernes bridge handshake tests:");
  console.log(`- total: ${tests.length - failed.length}/${tests.length} passed`);

  if (failed.length > 0) {
    console.log("- failures:");
    for (const result of failed) {
      console.log(`  ${result.name}: ${result.error ?? "unknown failure"}`);
    }
    return 1;
  }

  console.log("- status store: updated with safe metadata");
  console.log("- provider writes: none");
  console.log("- secrets printed: none");
  return 0;
}

process.exitCode = await main();
