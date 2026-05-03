import { mkdtemp, mkdir, readdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import {
  discoverViernesWorkspace,
  windowsPathToWslPath,
} from "../src/viernesBridge/localAdapter/workspaceDiscovery.ts";
import { adaptLocalViernesPayloadToBridgeRequest } from "../src/viernesBridge/localAdapter/localRequestAdapter.ts";
import { processViernesBridgeRequest } from "../src/viernesBridge/processor.ts";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const SAFE_ENV: NodeJS.ProcessEnv = {
  WHATSAPP_PROVIDER: "twilio",
  WHATSAPP_HEALTH_URL: "http://127.0.0.1:8787/health",
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

async function createTempWorkspace(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "viernes-local-adapter-"));
  await mkdir(join(root, "src"));
  await mkdir(join(root, "scripts"));
  await writeFile(
    join(root, "package.json"),
    JSON.stringify(
      {
        name: "viernes-local-adapter-test",
        scripts: {
          dev: "node index.js",
          test: "node test.js",
        },
        dependencies: {
          typescript: "0.0.0-test",
          zod: "0.0.0-test",
        },
      },
      null,
      2,
    ),
  );
  await writeFile(join(root, "README.md"), "# Viernes test workspace\n");
  await writeFile(join(root, ".env"), "TOKEN=secret-never-print\n");
  return root;
}

async function topLevelSnapshot(root: string): Promise<string> {
  return JSON.stringify((await readdir(root)).sort());
}

async function main(): Promise<number> {
  const tests: TestResult[] = [];

  tests.push(
    await test("converts Windows path to WSL path", async () => {
      const converted = windowsPathToWslPath(
        "C:\\Users\\Franco Andre\\OneDrive - Universidad Privada del Valle\\Documents\\CodexAutomatizaciones",
      );
      assert(
        converted ===
          "/mnt/c/Users/Franco Andre/OneDrive - Universidad Privada del Valle/Documents/CodexAutomatizaciones",
        `unexpected path: ${converted}`,
      );
    }),
  );

  tests.push(
    await test("missing workspace reports safely", async () => {
      const root = join(tmpdir(), "viernes-local-adapter-missing-workspace");
      const result = await discoverViernesWorkspace({ rootPath: root });
      assert(!result.exists, "expected missing workspace");
      assert(!result.packageJsonExists, "expected no package.json");
      assert(result.scripts.length === 0, "expected no scripts");
    }),
  );

  tests.push(
    await test(".env presence is reported without values", async () => {
      const root = await createTempWorkspace();
      try {
        const before = await topLevelSnapshot(root);
        const result = await discoverViernesWorkspace({ rootPath: root });
        const after = await topLevelSnapshot(root);
        assert(before === after, "workspace changed during discovery");
        assert(result.exists, "expected workspace");
        assert(result.packageJsonExists, "expected package.json");
        assert(result.keyFiles.env, "expected .env presence");
        assert(result.scripts.includes("dev"), "expected script name");
        assert(result.scripts.includes("test"), "expected test script name");
        const serialized = JSON.stringify(result);
        assert(!serialized.includes("secret-never-print"), "env value leaked");
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    }),
  );

  tests.push(
    await test("local payload converts to ViernesBridgeRequest", async () => {
      const request = await adaptLocalViernesPayloadToBridgeRequest({
        source: "local",
        messageText: "validate whatsapp bridge",
        intent: "validate_whatsapp_bridge",
        context: {
          workspacePath:
            "C:\\Users\\Franco Andre\\OneDrive - Universidad Privada del Valle\\Documents\\CodexAutomatizaciones",
          healthUrl: "http://127.0.0.1:8787/health",
          token: "secret-never-print",
        },
      });
      assert(request.source === "local", "expected local source");
      assert(request.intent === "validate_whatsapp_bridge", "expected intent");
      assert(
        request.context?.workspacePath ===
          "/mnt/c/Users/Franco Andre/OneDrive - Universidad Privada del Valle/Documents/CodexAutomatizaciones",
        "expected WSL workspace path",
      );
      const serialized = JSON.stringify(request);
      assert(!serialized.includes("secret-never-print"), "context secret leaked");
    }),
  );

  tests.push(
    await test("dangerous intent remains blocked", async () => {
      const request = await adaptLocalViernesPayloadToBridgeRequest({
        source: "local",
        messageText: "send whatsapp message",
        intent: "send_whatsapp_message",
        context: {
          workspacePath: "/tmp/non-sensitive",
          token: "secret-never-print",
        },
      });
      const response = await processViernesBridgeRequest(request, {
        executeReadOnly: false,
        policyOptions: { env: SAFE_ENV, envFiles: [] },
      });
      assert(response.status === "blocked", "expected blocked response");
      assert(
        (response.blockedReasons ?? []).includes("whatsapp_send_message_blocked"),
        "expected whatsapp block reason",
      );
      const serialized = JSON.stringify(response);
      assert(!serialized.includes("secret-never-print"), "secret leaked");
    }),
  );

  const failed = tests.filter((result) => !result.passed);
  console.log("Viernes local adapter tests:");
  console.log(`- total: ${tests.length - failed.length}/${tests.length} passed`);

  if (failed.length > 0) {
    console.log("- failures:");
    for (const result of failed) {
      console.log(`  ${result.name}: ${result.error ?? "unknown failure"}`);
    }
    return 1;
  }

  console.log("- Viernes workspace modified: no");
  console.log("- Viernes scripts executed: none");
  console.log("- secrets printed: none");
  return 0;
}

process.exitCode = await main();
