import {
  parseViernesBridgeCliArgs,
  processViernesBridgeBoundaryPayload,
  viernesBridgeCliHelpText,
} from "../src/viernesBridge/boundary/cliAdapter.ts";

function publicResponse(result: Awaited<ReturnType<typeof processViernesBridgeBoundaryPayload>>) {
  const response = result.response;
  return {
    requestId: response.requestId,
    status: response.status,
    summary: response.summary,
    proposedActions: response.proposedActions ?? [],
    approvalRequests: response.approvalRequests ?? [],
    executionResults: response.executionResults ?? [],
    blockedReasons: response.blockedReasons ?? [],
    createdAt: response.createdAt,
  };
}

async function main(): Promise<number> {
  const parsed = parseViernesBridgeCliArgs(process.argv.slice(2));

  if (parsed.help) {
    console.log(viernesBridgeCliHelpText());
    return 0;
  }

  if (parsed.errors.length > 0 || !parsed.payload) {
    console.log("Viernes bridge CLI error:");
    console.log(JSON.stringify({ errors: parsed.errors }, null, 2));
    console.log(viernesBridgeCliHelpText());
    return 1;
  }

  const result = await processViernesBridgeBoundaryPayload(parsed.payload, {
    env: process.env,
    executeReadOnly: parsed.executeReadOnly,
  });

  console.log("Viernes bridge CLI response:");
  console.log(JSON.stringify(publicResponse(result), null, 2));
  console.log("- provider writes: none");
  return 0;
}

process.exitCode = await main();
