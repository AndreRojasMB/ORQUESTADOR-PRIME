import { runIntegrationActionDryRun } from "../src/integrations/actions/dryRun.ts";

function formatReasons(reasons: readonly string[]): string {
  return reasons.length > 0 ? reasons.join(", ") : "none";
}

async function main(): Promise<number> {
  const results = await runIntegrationActionDryRun();

  console.log("Integration action dry-run:");
  for (const result of results) {
    console.log(`- ${result.actionId}`);
    console.log(`  integration: ${result.integration}`);
    console.log(`  action: ${result.action}`);
    console.log(`  riskLevel: ${result.riskLevel}`);
    console.log(`  allowed: ${result.allowed ? "true" : "false"}`);
    console.log(`  reasons: ${formatReasons(result.reasons)}`);
  }

  return 0;
}

process.exitCode = await main();
