import { homedir } from "os";
import { join } from "path";

export interface IntegrationActionStoragePathOptions {
  dataDir?: string;
  env?: NodeJS.ProcessEnv;
}

export const INTEGRATION_ACTION_STORAGE_DIRNAME = "integration-actions";

export function getOrquestadorDataDir(
  options: IntegrationActionStoragePathOptions = {},
): string {
  const env = options.env ?? process.env;
  return (
    options.dataDir ??
    env.ORQUESTADOR_DATA_DIR?.trim() ??
    join(homedir(), ".orquestador-prime")
  );
}

export function getIntegrationActionStorageDir(
  options: IntegrationActionStoragePathOptions = {},
): string {
  return join(getOrquestadorDataDir(options), INTEGRATION_ACTION_STORAGE_DIRNAME);
}

export function getApprovalStorePath(
  options: IntegrationActionStoragePathOptions = {},
): string {
  return join(getIntegrationActionStorageDir(options), "approvals.json");
}

export function getAuditStorePath(
  options: IntegrationActionStoragePathOptions = {},
): string {
  return join(getIntegrationActionStorageDir(options), "audit-records.json");
}

export function getPolicySnapshotStorePath(
  options: IntegrationActionStoragePathOptions = {},
): string {
  return join(getIntegrationActionStorageDir(options), "policy-snapshots.json");
}
