import { getIntegrationStatuses } from "../src/integrations/status.ts";

async function main(): Promise<void> {
  try {
    const statuses = await getIntegrationStatuses();

    console.log("Integrations:");
    for (const integration of statuses) {
      console.log(
        `- ${integration.name}: ${integration.configured ? "configured" : "missing"}`,
      );
    }
  } catch {
    console.error("Integrations:");
    console.error("- status check failed: missing");
  }
}

await main();
process.exitCode = 0;
