import type { TargetPolicyOptions } from "../../integrations/actions/policy/types.js";
import type { ViernesLocalAdapterPayload } from "../localAdapter/localRequestAdapter.js";
import type { ViernesBridgeResponse } from "../types.js";

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
