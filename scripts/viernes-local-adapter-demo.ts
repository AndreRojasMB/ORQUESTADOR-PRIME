import {
  DEFAULT_VIERNES_WINDOWS_PATH,
  DEFAULT_VIERNES_WSL_PATH,
  discoverViernesWorkspace,
} from "../src/viernesBridge/localAdapter/workspaceDiscovery.ts";
import { adaptLocalViernesPayloadToBridgeRequest } from "../src/viernesBridge/localAdapter/localRequestAdapter.ts";
import { processViernesBridgeRequest } from "../src/viernesBridge/processor.ts";

const SAFE_DEMO_ENV: NodeJS.ProcessEnv = {
  WHATSAPP_PROVIDER: "twilio",
  WHATSAPP_HEALTH_URL: "http://127.0.0.1:8787/health",
};

function printJson(label: string, value: unknown): void {
  console.log(`- ${label}`);
  console.log(JSON.stringify(value, null, 2));
}

async function main(): Promise<number> {
  const workspace = await discoverViernesWorkspace({
    rootPath: DEFAULT_VIERNES_WSL_PATH,
  });
  const request = await adaptLocalViernesPayloadToBridgeRequest({
    id: "viernes-local-adapter-demo",
    source: "local",
    messageText: "validate whatsapp bridge",
    intent: "validate_whatsapp_bridge",
    context: {
      workspacePath: DEFAULT_VIERNES_WINDOWS_PATH,
      healthUrl: "http://127.0.0.1:8787/health",
    },
  });
  const response = await processViernesBridgeRequest(request, {
    executeReadOnly: false,
    policyOptions: {
      env: SAFE_DEMO_ENV,
      envFiles: [],
    },
  });

  console.log("Viernes local adapter demo:");
  printJson("workspace discovery", {
    exists: workspace.exists,
    rootPath: workspace.rootPath,
    packageJsonExists: workspace.packageJsonExists,
    detectedStack: workspace.detectedStack ?? [],
    scripts: workspace.scripts,
    keyFilesPresent: workspace.keyFilesPresent,
    envPresent: workspace.keyFiles.env,
    envLocalPresent: workspace.keyFiles.envLocal,
  });
  printJson("adapted request", {
    id: request.id,
    source: request.source,
    intent: request.intent,
    messageText: request.messageText,
    context: request.context,
  });
  printJson("bridge response", {
    requestId: response.requestId,
    status: response.status,
    summary: response.summary,
    proposedActions: response.proposedActions,
    blockedReasons: response.blockedReasons ?? [],
    executionResultCount: response.executionResults?.length ?? 0,
  });
  console.log("- Viernes workspace modified: no");
  console.log("- Viernes scripts executed: no");
  console.log("- provider writes: none");
  return 0;
}

process.exitCode = await main();
