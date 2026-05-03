import type {
  IntegrationActionIntegration,
  IntegrationActionName,
} from "../types.js";

export interface IntegrationTargetPolicy {
  integration: IntegrationActionIntegration;
  allowedActions: readonly IntegrationActionName[];
  allowedOwners?: readonly string[];
  allowedRepos?: readonly string[];
  allowedBaseUrls?: readonly string[];
  allowedHealthUrls?: readonly string[];
  blockedActions?: readonly IntegrationActionName[];
  notes?: readonly string[];
}

export interface PolicyValidationResult {
  allowed: boolean;
  reasons: readonly string[];
  warnings?: readonly string[];
}

export interface TargetPolicyOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  envFiles?: readonly string[];
  configPath?: string;
}
