import {
  getNotificationStats,
  readNotificationStore,
} from "../src/notifications/notificationStore.js";
import type {
  NotificationKind,
  NotificationSeverity,
} from "../src/notifications/types.js";

const SEVERITIES = new Set<NotificationSeverity>([
  "info",
  "warning",
  "error",
  "critical",
]);

interface ParsedArgs {
  unread: boolean | null;
  kind: NotificationKind | null;
  severity: NotificationSeverity | null;
  limit: number;
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

  const severity = flags["severity"] ?? null;
  if (severity && !SEVERITIES.has(severity as NotificationSeverity)) {
    throw new Error("--severity is not known");
  }

  const limit = flags["limit"] ? Number(flags["limit"]) : 50;
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("--limit must be a positive integer");
  }

  return {
    unread: flags["unread"] ? parseBoolean(flags["unread"], "--unread") : null,
    kind: (flags["kind"] ?? null) as NotificationKind | null,
    severity: severity as NotificationSeverity | null,
    limit,
    pretty: flags["pretty"] ? parseBoolean(flags["pretty"], "--pretty") : false,
    help: flags["help"] === "true" || flags["h"] === "true",
  };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run notifications:list -- [--unread=true|false] [--kind=<kind>]",
      "  npm run notifications:list -- [--severity=info|warning|error|critical] [--limit=<n>]",
      "",
      "Safety:",
      "  Read-only local inbox listing. No external delivery.",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const [store, stats] = await Promise.all([
    readNotificationStore(),
    getNotificationStats(),
  ]);
  const notifications = store.notifications
    .filter((notification) => {
      if (args.unread === null) return true;
      const isUnread = !notification.readAt && !notification.dismissedAt;
      return args.unread ? isUnread : !isUnread;
    })
    .filter((notification) => (args.kind ? notification.kind === args.kind : true))
    .filter((notification) =>
      args.severity ? notification.severity === args.severity : true,
    )
    .slice(-args.limit);

  process.stdout.write(
    JSON.stringify({ stats, notifications }, null, args.pretty ? 2 : 0),
  );
  process.stdout.write("\n");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
