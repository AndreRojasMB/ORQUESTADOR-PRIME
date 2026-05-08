import { autopilotSourceOnlyBoundaries } from "./riskBoundaries.js";
import type { CodexHandoffContract } from "./codexHandoff.js";
import type { AutopilotBoundarySet } from "./types.js";

export type HandoffValidationChecklistStatus = "pending" | "pass" | "warn" | "fail";

export interface HandoffValidationChecklistItem {
  checklistItemId: string;
  label: string;
  safeSummary: string;
  required: boolean;
  status: HandoffValidationChecklistStatus;
  metadataOnly: true;
  noExecution: true;
}

export interface HandoffValidationChecklist {
  checklistId: string;
  phase: string;
  items: HandoffValidationChecklistItem[];
  advisoryOnly: true;
  sourceOnly: true;
  metadataOnly: true;
  noValidationExecution: true;
  boundaries: AutopilotBoundarySet;
}

const item = (
  checklistItemId: string,
  label: string,
  safeSummary: string,
): HandoffValidationChecklistItem => ({
  checklistItemId,
  label,
  safeSummary,
  required: true,
  status: "pending",
  metadataOnly: true,
  noExecution: true,
});

export function createHandoffValidationChecklist(
  handoff: CodexHandoffContract,
): HandoffValidationChecklist {
  return {
    checklistId: `${handoff.handoffId}:validation_checklist`,
    phase: handoff.phase,
    items: [
      item(
        "scope:no_forbidden_files",
        "No forbidden files touched",
        "Confirm modified files do not include forbidden paths.",
      ),
      item(
        "safety:no_provider_sends",
        "No provider sends",
        "Confirm the task did not introduce provider send behavior.",
      ),
      item(
        "safety:no_desktop_automation",
        "No desktop automation",
        "Confirm the task did not introduce desktop automation behavior.",
      ),
      item(
        "safety:no_dashboard_mutation",
        "No dashboard mutation",
        "Confirm the task did not mutate dashboard data or write paths.",
      ),
      item(
        "safety:no_secret_or_network_access",
        "No secrets, environment, or network access",
        "Confirm the task did not introduce secrets, environment reads, or network calls.",
      ),
      item(
        "safety:no_process_execution",
        "No process execution",
        "Confirm the task did not introduce process-launching behavior.",
      ),
      item(
        "scope:no_package_workflow_changes",
        "No package or workflow changes unless approved",
        "Confirm package and workflow files were untouched unless explicitly allowed.",
      ),
      item(
        "scope:dirty_files_unstaged",
        "Dirty files outside scope remain unstaged",
        "Confirm unrelated dirty files were not staged.",
      ),
    ],
    advisoryOnly: true,
    sourceOnly: true,
    metadataOnly: true,
    noValidationExecution: true,
    boundaries: autopilotSourceOnlyBoundaries,
  };
}
