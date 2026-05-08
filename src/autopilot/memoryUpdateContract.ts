import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type { AutopilotBoundarySet, AutopilotRiskLevel } from "./types.js";

export type AutopilotMemoryUpdateStatus =
  | "proposed"
  | "needs_review"
  | "approved_for_future_write"
  | "rejected"
  | "blocked";

export interface AutopilotMemoryUpdateProposal {
  memoryProposalId: string;
  proposedMemoryEntry: string;
  sourceReportRef: string;
  reason: string;
  risk: AutopilotRiskLevel;
  requiresHumanApproval: true;
  status: AutopilotMemoryUpdateStatus;
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noAutomaticMemoryWrite: true;
  noStoreMutation: true;
  boundaries: AutopilotBoundarySet;
}

export function createMemoryUpdateProposal(
  input: {
    memoryProposalId: string;
    proposedMemoryEntry: string;
    sourceReportRef: string;
    reason: string;
    risk: AutopilotRiskLevel;
  },
): AutopilotMemoryUpdateProposal {
  return {
    memoryProposalId: input.memoryProposalId,
    proposedMemoryEntry: input.proposedMemoryEntry,
    sourceReportRef: input.sourceReportRef,
    reason: input.reason,
    risk: input.risk,
    requiresHumanApproval: true,
    status: "proposed",
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noAutomaticMemoryWrite: true,
    noStoreMutation: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
