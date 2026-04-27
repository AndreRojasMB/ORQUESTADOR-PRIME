import { appendJob } from "../src/jobs/jobStore.js";
import {
  DANGEROUS_JOB_KINDS,
  SAFE_JOB_KINDS,
  type JobKind,
  type JobSource,
} from "../src/jobs/types.js";
import type { PermissionSubjectKind } from "../src/permissions/types.js";

const SUBJECT_KINDS = new Set<PermissionSubjectKind>([
  "user",
  "channel",
  "agent",
  "job",
  "system",
  "api-client",
]);

const SOURCES = new Set<JobSource>([
  "cli",
  "dashboard",
  "system",
  "scheduler",
  "whatsapp",
  "omi",
  "openclaw",
  "api",
]);

const JOB_KINDS = new Set<JobKind>([
  ...SAFE_JOB_KINDS,
  ...DANGEROUS_JOB_KINDS,
]);

interface ParsedArgs {
  kind: JobKind | null;
  input: Record<string, unknown>;
  subjectKind: PermissionSubjectKind;
  subjectHash: string | null;
  source: JobSource;
  requestedBy: string | null;
  runAt?: string;
  expiresAt?: string | null;
  maxAttempts?: number;
  correlationId?: string | null;
  pretty: boolean;
  help: boolean;
}

function parseBoolean(value: string, flagName: string): boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${flagName} must be true or false`);
}

function parseJsonObject(value: string): Record<string, unknown> {
  const parsed = JSON.parse(value) as unknown;
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("--input-json must be a JSON object");
  }
  return parsed as Record<string, unknown>;
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

  const kind = flags["kind"] ?? null;
  if (kind && !JOB_KINDS.has(kind as JobKind)) {
    throw new Error("--kind is not a known job kind");
  }

  const subjectKind = (flags["subject-kind"] ?? "user") as PermissionSubjectKind;
  if (!SUBJECT_KINDS.has(subjectKind)) {
    throw new Error("--subject-kind is not known");
  }

  const source = (flags["source"] ?? "cli") as JobSource;
  if (!SOURCES.has(source)) {
    throw new Error("--source is not known");
  }

  const maxAttempts = flags["max-attempts"] ? Number(flags["max-attempts"]) : undefined;
  if (maxAttempts !== undefined && (!Number.isInteger(maxAttempts) || maxAttempts <= 0)) {
    throw new Error("--max-attempts must be a positive integer");
  }

  return {
    kind: kind as JobKind | null,
    input: flags["input-json"] ? parseJsonObject(flags["input-json"]) : {},
    subjectKind,
    subjectHash: flags["subject-hash"] ?? null,
    source,
    requestedBy: flags["requested-by"] ?? null,
    ...(flags["run-at"] ? { runAt: flags["run-at"] } : {}),
    ...(flags["expires-at"] ? { expiresAt: flags["expires-at"] } : {}),
    ...(maxAttempts !== undefined ? { maxAttempts } : {}),
    ...(flags["correlation-id"] ? { correlationId: flags["correlation-id"] } : {}),
    pretty: flags["pretty"] ? parseBoolean(flags["pretty"], "--pretty") : false,
    help: flags["help"] === "true" || flags["h"] === "true",
  };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run jobs:enqueue -- --kind=<kind> --subject-hash=<hash> [--input-json='{}']",
      "  npm run jobs:enqueue -- --kind=<kind> --subject-hash=<hash> [--run-at=<iso>]",
      "",
      "Safety:",
      "  Enqueue is permission checked and stores redacted job input only.",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    process.exit(0);
  }
  if (!args.kind) {
    throw new Error("--kind is required");
  }
  if (!args.subjectHash || args.subjectHash.trim().length === 0) {
    throw new Error("--subject-hash is required");
  }

  const result = await appendJob({
    kind: args.kind,
    input: args.input,
    subjectKind: args.subjectKind,
    subjectHash: args.subjectHash,
    source: args.source,
    ...(args.requestedBy ? { requestedBy: args.requestedBy } : {}),
    ...(args.runAt ? { runAt: args.runAt } : {}),
    ...(args.expiresAt !== undefined ? { expiresAt: args.expiresAt } : {}),
    ...(args.maxAttempts !== undefined ? { maxAttempts: args.maxAttempts } : {}),
    ...(args.correlationId ? { correlationId: args.correlationId } : {}),
  });

  process.stdout.write(JSON.stringify(result, null, args.pretty ? 2 : 0));
  process.stdout.write("\n");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
