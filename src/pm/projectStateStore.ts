import type {
  ProjectId,
  ProjectSnapshot,
  ProjectState,
  ProjectStateValidationResult,
} from "./types.js";
import { pmFoundationBoundaries } from "./boundaries.js";

export type ProjectStateStoreOperation =
  | "describe_contract"
  | "accept_candidate"
  | "return_candidate"
  | "validate_candidate"
  | "summarize_candidate";

export interface ProjectStateStoreResult {
  ok: boolean;
  operation: ProjectStateStoreOperation;
  projectId?: ProjectId;
  state?: ProjectState;
  snapshot?: ProjectSnapshot;
  validation?: ProjectStateValidationResult;
  advisoryOnly: true;
  sourceOnly: true;
  noPersistence: true;
  boundaries: typeof pmFoundationBoundaries;
}

export interface ProjectStateStore {
  readonly advisoryOnly: true;
  readonly sourceOnly: true;
  readonly noPersistence: true;
  readonly boundaries: typeof pmFoundationBoundaries;
  describeContract(): ProjectStateStoreResult;
  acceptCandidate(state: ProjectState): ProjectStateStoreResult;
  returnCandidate(projectId: ProjectId, state: ProjectState): ProjectStateStoreResult;
  validateCandidate(state: ProjectState): ProjectStateValidationResult;
  summarizeCandidate(state: ProjectState): ProjectStateStoreResult;
}

export const projectStateStoreContractBoundaries = {
  ...pmFoundationBoundaries,
  noPersistence: true,
  noFilesystemReads: true,
  noFilesystemWrites: true,
} as const;

export const projectStateStoreContractSummary = {
  contractId: "project_state_store:contract:102I",
  schemaVersion: "1.0",
  summary:
    "ProjectStateStore is a future adapter contract only; Phase 102I provides no implementation or persistence.",
  advisoryOnly: true,
  sourceOnly: true,
  noPersistence: true,
  boundaries: projectStateStoreContractBoundaries,
} as const;
