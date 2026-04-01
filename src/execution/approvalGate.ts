// src/execution/approvalGate.ts
// Human-in-the-loop antes de cualquier acción destructiva.
// El sistema NUNCA mergeea sin aprobación explícita.

import { confirm, select } from "@inquirer/prompts";
import { logger }          from "../observability/logger.js";
import type { ExecutionProposal } from "../types.js";

export type ApprovalDecision = "approve" | "reject" | "review";

export async function requestApproval(
  proposal: ExecutionProposal
): Promise<ApprovalDecision> {

  console.log(`
╔══════════════════════════════════════════════════════╗
║  ⚠️   HUMAN APPROVAL REQUIRED                        ║
╠══════════════════════════════════════════════════════╣
║  The AI agent proposes the following changes:        ║
╚══════════════════════════════════════════════════════╝

📋 Title    : ${proposal.title}
🌿 Branch   : ${proposal.branchName}

📁 Files to change:
${proposal.files.map((f) => `  ${f.operation.toUpperCase().padEnd(8)} ${f.path}`).join("\n")}

⚠️  Risks:
${proposal.risks.map((r) => `  • ${r}`).join("\n")}

🔄 Rollback: ${proposal.rollbackPlan}
  `);

  const decision = await select<ApprovalDecision>({
    message: "What would you like to do?",
    choices: [
      {
        name:  "✅ Approve — push branch and open draft PR",
        value: "approve",
      },
      {
        name:  "👁  Review — open files first, decide later",
        value: "review",
      },
      {
        name:  "❌ Reject — discard all changes",
        value: "reject",
      },
    ],
  });

  return decision;
}

export async function confirmReject(): Promise<boolean> {
  return confirm({
    message: "Are you sure you want to discard all proposed changes?",
    default: false,
  });
}