import { planComputerActionDryRun } from "../src/computerUse/dryRunPlanner.js";
import type { ChannelKind } from "../src/actions/types.js";
import type { PermissionSubjectKind } from "../src/permissions/types.js";

const SUBJECT_KINDS = new Set<PermissionSubjectKind>([
  "user",
  "channel",
  "agent",
  "job",
  "system",
  "api-client",
]);

const CHANNELS = new Set<ChannelKind>([
  "cli",
  "whatsapp",
  "omi",
  "dashboard",
  "openclaw",
  "system",
  "api",
]);

interface ParsedArgs {
  capabilityId: string | null;
  instruction: string | null;
  target: string | null;
  subjectKind: PermissionSubjectKind;
  subjectHash: string | null;
  channel: ChannelKind;
  screenshotTraceId: string | null;
  linkedJobId: string | null;
  linkedProposalId: string | null;
  correlationId: string | null;
  pretty: boolean;
  help: boolean;
}

function parseBoolean(value: string, flagName: string): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${flagName} must be true or false`);
}

function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string> = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${raw}`);
    }
    const eq = raw.indexOf("=");
    flags[eq > 0 ? raw.slice(2, eq) : raw.slice(2)] = eq > 0 ? raw.slice(eq + 1) : "true";
  }

  const subjectKind = (flags["subject-kind"] ?? "user") as PermissionSubjectKind;
  if (!SUBJECT_KINDS.has(subjectKind)) {
    throw new Error("--subject-kind is not known");
  }

  const channel = (flags["channel"] ?? "cli") as ChannelKind;
  if (!CHANNELS.has(channel)) {
    throw new Error("--channel is not known");
  }

  return {
    capabilityId: flags["capability"] ?? null,
    instruction: flags["instruction"] ?? null,
    target: flags["target"] ?? null,
    subjectKind,
    subjectHash: flags["subject-hash"] ?? null,
    channel,
    screenshotTraceId: flags["screenshot-trace-id"] ?? null,
    linkedJobId: flags["job-id"] ?? null,
    linkedProposalId: flags["proposal-id"] ?? null,
    correlationId: flags["correlation-id"] ?? null,
    pretty: flags["pretty"] ? parseBoolean(flags["pretty"], "--pretty") : false,
    help: flags["help"] === "true" || flags["h"] === "true",
  };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run computer:dry-run -- --capability=<id> --instruction=<text> --subject-hash=<hash>",
      "  npm run computer:dry-run -- --capability=computer.click.plan --target=browser --instruction=<text>",
      "",
      "Safety:",
      "  Dry-run planning only. Does not click, type, navigate, capture screenshots, or call OpenClaw.",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    process.exit(0);
  }
  if (!args.capabilityId) {
    throw new Error("--capability is required");
  }
  if (!args.instruction || args.instruction.trim().length === 0) {
    throw new Error("--instruction is required");
  }

  const result = await planComputerActionDryRun({
    capabilityId: args.capabilityId,
    instruction: args.instruction,
    target: args.target,
    subjectKind: args.subjectKind,
    subjectHash: args.subjectHash,
    channel: args.channel,
    screenshotTraceId: args.screenshotTraceId,
    linkedJobId: args.linkedJobId,
    linkedProposalId: args.linkedProposalId,
    correlationId: args.correlationId,
  });

  process.stdout.write(JSON.stringify(result, null, args.pretty ? 2 : 0));
  process.stdout.write("\n");
  process.exit(result.ok ? 0 : 1);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
