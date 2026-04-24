// scripts/action-approve.ts
// Phase 32A — CLI for granting/revoking/listing second approvals.
//
// Usage:
//   npm run action:approve -- grant <proposalId> [--by=<actor>] [--ttl=<ms>]
//   npm run action:approve -- revoke <proposalId>
//   npm run action:approve -- list [--status=granted|consumed|expired|revoked]
//
// Second approval is single-use and short-lived. Granting it is a
// deliberate, human-only act. Phase 32A has no dispatch path that
// consumes these approvals; the infrastructure is ready for 32B.

import {
  grantSecondApproval,
  revokeSecondApproval,
  listSecondApprovals,
  expireStaleSecondApprovals,
} from "../src/actions/secondApprovalStore.js";
import type { SecondApprovalStatus } from "../src/actions/types.js";

type Sub = "grant" | "revoke" | "list";

function parseArgs(argv: string[]): {
  sub: Sub | null;
  positional: string[];
  flags: Record<string, string>;
} {
  const positional: string[] = [];
  const flags: Record<string, string> = {};

  for (const raw of argv) {
    if (raw.startsWith("--")) {
      const eq = raw.indexOf("=");
      if (eq > 0) flags[raw.slice(2, eq)] = raw.slice(eq + 1);
      else flags[raw.slice(2)] = "true";
    } else {
      positional.push(raw);
    }
  }

  const sub = (positional.shift() ?? null) as Sub | null;
  return { sub, positional, flags };
}

function printUsage(): void {
  console.error(
    [
      "Usage:",
      "  npm run action:approve -- grant <proposalId> [--by=<actor>] [--ttl=<ms>]",
      "  npm run action:approve -- revoke <proposalId>",
      "  npm run action:approve -- list [--status=granted|consumed|expired|revoked]",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const { sub, positional, flags } = parseArgs(process.argv.slice(2));

  if (!sub) {
    printUsage();
    process.exit(2);
  }

  // Opportunistic expiry sweep on any invocation.
  await expireStaleSecondApprovals();

  if (sub === "grant") {
    const proposalId = positional[0];
    if (!proposalId) {
      printUsage();
      process.exit(2);
    }
    const grantedBy = flags["by"] ?? "cli:local";
    const ttl = flags["ttl"] ? Number(flags["ttl"]) : undefined;
    const result = await grantSecondApproval({
      proposalId,
      grantedBy,
      ...(ttl && Number.isFinite(ttl) ? { ttlMs: ttl } : {}),
    });
    console.log(JSON.stringify(
      {
        action: "grant",
        ok: result.ok,
        reason: result.reason,
        approval: result.approval,
      },
      null,
      2,
    ));
    process.exit(result.ok ? 0 : 1);
  }

  if (sub === "revoke") {
    const proposalId = positional[0];
    if (!proposalId) {
      printUsage();
      process.exit(2);
    }
    const result = await revokeSecondApproval(proposalId);
    console.log(JSON.stringify(
      { action: "revoke", ok: result.ok, revokedCount: result.count },
      null,
      2,
    ));
    process.exit(result.ok ? 0 : 1);
  }

  if (sub === "list") {
    const status = (flags["status"] as SecondApprovalStatus | undefined) ?? undefined;
    const approvals = await listSecondApprovals(status);
    console.log(JSON.stringify(
      { action: "list", filter: status ?? "all", count: approvals.length, approvals },
      null,
      2,
    ));
    process.exit(0);
  }

  printUsage();
  process.exit(2);
}

main().catch((err) => {
  console.error("action:approve fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
