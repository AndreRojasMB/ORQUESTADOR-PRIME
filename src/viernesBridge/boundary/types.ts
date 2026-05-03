import type { TargetPolicyOptions } from "../../integrations/actions/policy/types.js";
import type { ViernesLocalAdapterPayload } from "../localAdapter/localRequestAdapter.js";
import type { ViernesBridgeResponse } from "../types.js";
import type { IntegrationActionExecutionResult } from "../../integrations/actions/executors/types.js";
import type { ViernesBridgeSource } from "../types.js";

export interface ViernesBridgeBoundaryPayload extends ViernesLocalAdapterPayload {}

export interface ViernesBridgeBoundaryOptions {
  env?: NodeJS.ProcessEnv;
  envFiles?: readonly string[];
  executeReadOnly?: boolean;
}

export interface ViernesBridgeBoundaryResult {
  response: ViernesBridgeResponse;
  createdAt: string;
}

export interface ViernesBridgeCliParseResult {
  payload?: ViernesBridgeBoundaryPayload;
  errors: readonly string[];
  help: boolean;
  executeReadOnly: boolean;
}

export interface ViernesBridgeBoundaryProcessorOptions
  extends ViernesBridgeBoundaryOptions {
  policyOptions?: TargetPolicyOptions;
}

export interface ViernesBridgeApprovalCommandPayload {
  type: "approval_command";
  text: string;
  approvalId?: string;
  actionId?: string;
  source?: ViernesBridgeSource;
}

export type ViernesBridgeApprovalCommandBoundaryStatus =
  | "approved"
  | "rejected"
  | "blocked"
  | "resumed_read_only"
  | "not_found"
  | "error";

export interface ViernesBridgeApprovalCommandBoundaryResponse {
  requestId: string;
  status: ViernesBridgeApprovalCommandBoundaryStatus;
  summary: string;
  approvalId?: string;
  actionId?: string;
  blockedReasons: readonly string[];
  executionResult?: IntegrationActionExecutionResult;
  createdAt: string;
}

export interface ViernesBridgeApprovalCommandBoundaryResult {
  response: ViernesBridgeApprovalCommandBoundaryResponse;
  createdAt: string;
}
