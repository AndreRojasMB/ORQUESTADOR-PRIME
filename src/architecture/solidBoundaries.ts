export interface SolidArchitectureBoundarySet {
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noAutoRefactor: true;
  noScanners: true;
  noRuntimeExecution: true;
  noProviderCalls: true;
  noDashboardMutation: true;
  noOpenClaw: true;
  noWhatsAppOutbound: true;
  noN8n: true;
  noMemoryPersistence: true;
  noGitAutomation: true;
  noProcessLaunch: true;
  noEnvAccess: true;
  noNetwork: true;
  noDbSqlMutation: true;
  noDeploy: true;
  noRefactorExecution: true;
}

export const solidArchitectureBoundaries: SolidArchitectureBoundarySet = {
  reportOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
  noAutoRefactor: true,
  noScanners: true,
  noRuntimeExecution: true,
  noProviderCalls: true,
  noDashboardMutation: true,
  noOpenClaw: true,
  noWhatsAppOutbound: true,
  noN8n: true,
  noMemoryPersistence: true,
  noGitAutomation: true,
  noProcessLaunch: true,
  noEnvAccess: true,
  noNetwork: true,
  noDbSqlMutation: true,
  noDeploy: true,
  noRefactorExecution: true,
};

export const solidArchitectureBoundarySummary = {
  boundaryId: "solid_architecture_boundaries:111I",
  schemaVersion: "1.0",
  safeSummary:
    "SOLID architecture charter metadata is report-only, advisory-only, source-only, and cannot execute refactors.",
  boundaries: solidArchitectureBoundaries,
  metadataOnly: true,
  reportOnly: true,
  advisoryOnly: true,
  sourceOnly: true,
} as const;
