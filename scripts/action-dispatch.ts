// scripts/action-dispatch.ts
// Human-triggered one-shot CLI for dispatching an approved ActionProposal.
// Phase 30A — explicit, manual invocation only; no scheduler, no retries.
//
// Usage:
//   npm run action:dispatch -- <proposalId>
//   npm run action:dispatch -- <proposalId> --actor=<actor>

import { dispatchAction } from "../src/actions/executionBridge.js";

function parseArgs(argv: string[]): { proposalId: string | null; actor: string } {
  const positional: string[] = [];
  let actor = "cli:local";

  for (const raw of argv) {
    if (raw.startsWith("--actor=")) {
      const v = raw.slice("--actor=".length);
      if (v) actor = v;
    } else if (!raw.startsWith("--")) {
      positional.push(raw);
    }
  }

  return { proposalId: positional[0] ?? null, actor };
}

async function main(): Promise<void> {
  const { proposalId, actor } = parseArgs(process.argv.slice(2));

  if (!proposalId) {
    console.error("Usage: npm run action:dispatch -- <proposalId> [--actor=<actor>]");
    process.exit(2);
  }

  const result = await dispatchAction(proposalId, actor);

  console.log(JSON.stringify({
    proposalId,
    actor,
    ok: result.ok,
    category: result.category,
    message: result.message,
    output: result.output,
  }, null, 2));

  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error("action:dispatch fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
