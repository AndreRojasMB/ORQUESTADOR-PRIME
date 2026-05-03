import {
  checkIntegrationHealth,
  type IntegrationHealthTargetArg,
} from "../src/integrations/health.ts";

type HealthTargetArg = IntegrationHealthTargetArg | "all";

const VALID_TARGETS: readonly HealthTargetArg[] = [
  "openai",
  "anthropic",
  "claude",
  "lightrag",
  "coolify",
  "github",
  "openclaw",
  "n8n",
  "whatsapp",
  "all",
];

interface ParsedArgs {
  target: HealthTargetArg;
  help: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  let target: string | undefined;
  let help = false;

  for (let index = 0; index < argv.length; index += 1) {
    const raw = argv[index];
    if (raw === "--help" || raw === "-h") {
      help = true;
      continue;
    }

    if (raw === "--target") {
      target = argv[index + 1];
      index += 1;
      continue;
    }

    if (raw?.startsWith("--target=")) {
      target = raw.slice("--target=".length);
      continue;
    }

    throw new Error("invalid_usage");
  }

  if (!target) target = "all";
  if (!VALID_TARGETS.includes(target as HealthTargetArg)) {
    throw new Error("invalid_usage");
  }

  return { target: target as HealthTargetArg, help };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run integrations:health -- --target openai",
      "  npm run integrations:health -- --target anthropic",
      "  npm run integrations:health -- --target claude",
      "  npm run integrations:health -- --target lightrag",
      "  npm run integrations:health -- --target coolify",
      "  npm run integrations:health -- --target github",
      "  npm run integrations:health -- --target openclaw",
      "  npm run integrations:health -- --target n8n",
      "  npm run integrations:health -- --target whatsapp",
      "  npm run integrations:health -- --target all",
      "",
      "Safety:",
      "  Read-only diagnostics only. No secrets are printed.",
    ].join("\n"),
  );
}

async function main(): Promise<number> {
  let args: ParsedArgs;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch {
    printUsage();
    return 1;
  }

  if (args.help) {
    printUsage();
    return 0;
  }

  try {
    const results = await checkIntegrationHealth(args.target);

    console.log("Integration health:");
    for (const result of results) {
      console.log(`- ${result.name}: ${result.status}`);
    }

    return 0;
  } catch {
    console.error("Integration health:");
    console.error("- health check failed: error");
    return 1;
  }
}

process.exitCode = await main();
