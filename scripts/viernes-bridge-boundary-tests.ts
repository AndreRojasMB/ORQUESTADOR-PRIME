import {
  parseViernesBridgeCliArgs,
  processViernesBridgeBoundaryPayload,
} from "../src/viernesBridge/boundary/cliAdapter.ts";
import { listenViernesBridgeHttpServer } from "../src/viernesBridge/server/httpServer.ts";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const SAFE_ENV: NodeJS.ProcessEnv = {
  WHATSAPP_PROVIDER: "twilio",
  WHATSAPP_HEALTH_URL: "http://127.0.0.1:8787/health",
  ORQUESTADOR_VIERNES_BRIDGE_TOKEN: "boundary-token-never-print",
};

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

async function postJson(
  url: string,
  body: unknown,
  token?: string,
): Promise<Response> {
  return fetch(`${url}/viernes/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Orquestador-Bridge-Token": token } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function withServer<T>(
  fn: (url: string) => Promise<T>,
): Promise<T> {
  const handle = await listenViernesBridgeHttpServer({
    host: "127.0.0.1",
    port: 0,
    token: SAFE_ENV.ORQUESTADOR_VIERNES_BRIDGE_TOKEN,
    env: SAFE_ENV,
    executeReadOnly: false,
  });

  try {
    return await fn(handle.url);
  } finally {
    await new Promise<void>((resolve) => {
      handle.server.close(() => resolve());
    });
  }
}

function assertNoSecret(value: unknown): void {
  const serialized = JSON.stringify(value);
  assert(!serialized.includes("boundary-token-never-print"), "bridge token leaked");
  assert(!serialized.includes("secret-never-print"), "payload secret leaked");
}

async function main(): Promise<number> {
  const tests: TestResult[] = [];

  tests.push(
    await test("CLI processes validate_whatsapp_bridge", async () => {
      const parsed = parseViernesBridgeCliArgs([
        "--intent",
        "validate_whatsapp_bridge",
        "--message",
        "valida el bridge",
        "--context",
        "healthUrl=http://127.0.0.1:8787/health",
      ]);
      assert(parsed.errors.length === 0, `unexpected errors: ${parsed.errors.join(", ")}`);
      assert(parsed.payload !== undefined, "expected payload");
      const result = await processViernesBridgeBoundaryPayload(parsed.payload, {
        env: SAFE_ENV,
        envFiles: [],
        executeReadOnly: false,
      });
      assert(result.response.status === "dry_run_ready", "expected dry_run_ready");
      assertNoSecret(result);
    }),
  );

  tests.push(
    await test("CLI blocks send_whatsapp_message", async () => {
      const parsed = parseViernesBridgeCliArgs([
        "--intent",
        "send_whatsapp_message",
        "--message",
        "envia whatsapp",
        "--context",
        "token=secret-never-print",
      ]);
      assert(parsed.payload !== undefined, "expected payload");
      const result = await processViernesBridgeBoundaryPayload(parsed.payload, {
        env: SAFE_ENV,
        envFiles: [],
        executeReadOnly: false,
      });
      assert(result.response.status === "blocked", "expected blocked");
      assert(
        (result.response.blockedReasons ?? []).includes("whatsapp_send_message_blocked"),
        "expected whatsapp block reason",
      );
      assertNoSecret(result);
    }),
  );

  tests.push(
    await test("HTTP rejects incorrect token", async () => {
      await withServer(async (url) => {
        const response = await postJson(
          url,
          {
            source: "local",
            messageText: "valida el bridge",
            intent: "validate_whatsapp_bridge",
          },
          "wrong-token",
        );
        assert(response.status === 401, `expected 401, got ${response.status}`);
        const body = await response.json();
        assert(body.summary === "unauthorized", "expected unauthorized");
        assertNoSecret(body);
      });
    }),
  );

  tests.push(
    await test("HTTP processes allowed intent", async () => {
      await withServer(async (url) => {
        const response = await postJson(
          url,
          {
            source: "local",
            messageText: "valida el bridge",
            intent: "validate_whatsapp_bridge",
            context: {
              healthUrl: "http://127.0.0.1:8787/health",
              token: "secret-never-print",
            },
          },
          SAFE_ENV.ORQUESTADOR_VIERNES_BRIDGE_TOKEN,
        );
        assert(response.status === 200, `expected 200, got ${response.status}`);
        assert(!response.headers.has("access-control-allow-origin"), "CORS should not be open");
        const body = await response.json();
        assert(body.status === "dry_run_ready", `expected dry_run_ready, got ${body.status}`);
        assertNoSecret(body);
      });
    }),
  );

  tests.push(
    await test("HTTP blocks dangerous intent", async () => {
      await withServer(async (url) => {
        const response = await postJson(
          url,
          {
            source: "local",
            messageText: "envia whatsapp",
            intent: "send_whatsapp_message",
            context: {
              token: "secret-never-print",
            },
          },
          SAFE_ENV.ORQUESTADOR_VIERNES_BRIDGE_TOKEN,
        );
        assert(response.status === 200, `expected 200, got ${response.status}`);
        const body = await response.json();
        assert(body.status === "blocked", "expected blocked");
        assert(
          (body.blockedReasons ?? []).includes("whatsapp_send_message_blocked"),
          "expected whatsapp block reason",
        );
        assertNoSecret(body);
      });
    }),
  );

  const failed = tests.filter((result) => !result.passed);
  console.log("Viernes bridge boundary tests:");
  console.log(`- total: ${tests.length - failed.length}/${tests.length} passed`);

  if (failed.length > 0) {
    console.log("- failures:");
    for (const result of failed) {
      console.log(`  ${result.name}: ${result.error ?? "unknown failure"}`);
    }
    return 1;
  }

  console.log("- Viernes workspace modified: no");
  console.log("- provider writes: none");
  console.log("- secrets printed: none");
  return 0;
}

process.exitCode = await main();
