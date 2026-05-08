import {
  solidArchitectureBoundaries,
  type SolidArchitectureBoundarySet,
} from "./solidBoundaries.js";
import {
  describeBackendLayerCategory,
  type BackendLayerCategory,
  type BackendLayeringSeverity,
} from "./backendRules.js";
import type {
  PMSchemaVersion,
} from "../pm/types.js";

export type IoBoundaryResponsibility =
  | "accept_request_metadata"
  | "validate_request_metadata"
  | "orchestrate_use_case"
  | "apply_domain_rule"
  | "describe_repository_contract"
  | "describe_adapter_contract"
  | "reference_provider_boundary"
  | "reference_config_boundary"
  | "reference_io_boundary"
  | "reference_runtime_future"
  | "reference_database_sql_boundary"
  | "reference_auth_security_boundary";

export interface IoBoundaryRule {
  ruleId: string;
  title: string;
  category: BackendLayerCategory;
  allowedResponsibilities: IoBoundaryResponsibility[];
  forbiddenResponsibilities: IoBoundaryResponsibility[];
  reviewRequiredResponsibilities: IoBoundaryResponsibility[];
  severityDefault: BackendLayeringSeverity;
  requiredEvidence: string[];
  reportOnly: true;
  safetyBoundaries: SolidArchitectureBoundarySet;
  metadataOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noBackendRuntimeMutation: true;
  noProviderExecution: true;
  noDbSqlAccess: true;
  noDashboardMutation: true;
  noRuntimeExecution: true;
  noScannerExecution: true;
  noRefactorExecution: true;
}

export interface IoBoundaryRuleInput {
  ruleId: string;
  title: string;
  category: BackendLayerCategory;
  allowedResponsibilities: IoBoundaryResponsibility[];
  forbiddenResponsibilities: IoBoundaryResponsibility[];
  reviewRequiredResponsibilities: IoBoundaryResponsibility[];
  requiredEvidence: string[];
  severityDefault?: BackendLayeringSeverity;
}

export interface IoBoundaryRuleSummary {
  summaryId: string;
  schemaVersion: PMSchemaVersion;
  ruleCount: number;
  byCategory: Record<BackendLayerCategory, number>;
  safeSummary: string;
  metadataOnly: true;
  reportOnly: true;
  advisoryOnly: true;
  sourceOnly: true;
  noBackendRuntimeMutation: true;
  noProviderExecution: true;
  noDbSqlAccess: true;
  noDashboardMutation: true;
  noRuntimeExecution: true;
  noScannerExecution: true;
  noRefactorExecution: true;
  safetyBoundaries: SolidArchitectureBoundarySet;
}

export const ioBoundaryResponsibilities = [
  "accept_request_metadata",
  "validate_request_metadata",
  "orchestrate_use_case",
  "apply_domain_rule",
  "describe_repository_contract",
  "describe_adapter_contract",
  "reference_provider_boundary",
  "reference_config_boundary",
  "reference_io_boundary",
  "reference_runtime_future",
  "reference_database_sql_boundary",
  "reference_auth_security_boundary",
] as const satisfies readonly IoBoundaryResponsibility[];

const emptyCategoryCounts = (): Record<BackendLayerCategory, number> => ({
  controller_boundary: 0,
  service_orchestration: 0,
  domain_core: 0,
  repository_boundary: 0,
  adapter_boundary: 0,
  provider_boundary: 0,
  io_boundary: 0,
  config_boundary: 0,
  integration_boundary: 0,
  runtime_future_boundary: 0,
  db_sql_boundary: 0,
  auth_security_boundary: 0,
});

export const createIoBoundaryRule = (
  input: IoBoundaryRuleInput,
): IoBoundaryRule => {
  const category = describeBackendLayerCategory(input.category);

  return {
    ruleId: input.ruleId,
    title: input.title,
    category: input.category,
    allowedResponsibilities: [...input.allowedResponsibilities],
    forbiddenResponsibilities: [...input.forbiddenResponsibilities],
    reviewRequiredResponsibilities: [...input.reviewRequiredResponsibilities],
    severityDefault: input.severityDefault ?? category.defaultSeverity,
    requiredEvidence: [...input.requiredEvidence],
    reportOnly: true,
    safetyBoundaries: solidArchitectureBoundaries,
    metadataOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noBackendRuntimeMutation: true,
    noProviderExecution: true,
    noDbSqlAccess: true,
    noDashboardMutation: true,
    noRuntimeExecution: true,
    noScannerExecution: true,
    noRefactorExecution: true,
  };
};

export const buildDefaultIoBoundaryRules = (): IoBoundaryRule[] => [
  createIoBoundaryRule({
    ruleId: "io_boundary_rule:controller_boundary",
    title: "Controller and API boundary",
    category: "controller_boundary",
    allowedResponsibilities: ["accept_request_metadata", "validate_request_metadata"],
    forbiddenResponsibilities: [
      "apply_domain_rule",
      "describe_repository_contract",
      "describe_adapter_contract",
      "reference_provider_boundary",
      "reference_runtime_future",
      "reference_database_sql_boundary",
    ],
    reviewRequiredResponsibilities: ["orchestrate_use_case", "reference_auth_security_boundary"],
    requiredEvidence: ["request metadata summary", "response boundary notes"],
  }),
  createIoBoundaryRule({
    ruleId: "io_boundary_rule:service_orchestration",
    title: "Service orchestration boundary",
    category: "service_orchestration",
    allowedResponsibilities: ["orchestrate_use_case", "validate_request_metadata"],
    forbiddenResponsibilities: ["reference_provider_boundary", "reference_runtime_future", "reference_database_sql_boundary"],
    reviewRequiredResponsibilities: ["describe_repository_contract", "describe_adapter_contract", "reference_io_boundary"],
    requiredEvidence: ["use-case orchestration summary", "dependency boundary notes"],
  }),
  createIoBoundaryRule({
    ruleId: "io_boundary_rule:domain_core",
    title: "Domain core boundary",
    category: "domain_core",
    allowedResponsibilities: ["apply_domain_rule"],
    forbiddenResponsibilities: [
      "accept_request_metadata",
      "orchestrate_use_case",
      "describe_adapter_contract",
      "reference_provider_boundary",
      "reference_config_boundary",
      "reference_io_boundary",
      "reference_runtime_future",
      "reference_database_sql_boundary",
    ],
    reviewRequiredResponsibilities: ["describe_repository_contract"],
    requiredEvidence: ["domain responsibility summary", "core dependency notes"],
  }),
  createIoBoundaryRule({
    ruleId: "io_boundary_rule:repository_boundary",
    title: "Repository contract boundary",
    category: "repository_boundary",
    allowedResponsibilities: ["describe_repository_contract"],
    forbiddenResponsibilities: ["accept_request_metadata", "reference_provider_boundary", "reference_runtime_future"],
    reviewRequiredResponsibilities: ["reference_database_sql_boundary", "reference_io_boundary"],
    requiredEvidence: ["persistence contract summary", "port metadata summary"],
  }),
  createIoBoundaryRule({
    ruleId: "io_boundary_rule:adapter_boundary",
    title: "Adapter boundary",
    category: "adapter_boundary",
    allowedResponsibilities: ["describe_adapter_contract", "reference_io_boundary"],
    forbiddenResponsibilities: ["apply_domain_rule", "accept_request_metadata", "reference_runtime_future"],
    reviewRequiredResponsibilities: ["reference_provider_boundary", "reference_config_boundary", "reference_database_sql_boundary"],
    requiredEvidence: ["adapter contract summary", "port relationship notes"],
  }),
  createIoBoundaryRule({
    ruleId: "io_boundary_rule:provider_boundary",
    title: "Provider boundary",
    category: "provider_boundary",
    allowedResponsibilities: [],
    forbiddenResponsibilities: ["reference_provider_boundary"],
    reviewRequiredResponsibilities: ["describe_adapter_contract", "reference_io_boundary"],
    requiredEvidence: ["future gate reference", "provider abstraction notes"],
    severityDefault: "critical",
  }),
  createIoBoundaryRule({
    ruleId: "io_boundary_rule:io_boundary",
    title: "IO boundary",
    category: "io_boundary",
    allowedResponsibilities: ["reference_io_boundary"],
    forbiddenResponsibilities: ["apply_domain_rule"],
    reviewRequiredResponsibilities: [
      "describe_adapter_contract",
      "reference_provider_boundary",
      "reference_config_boundary",
      "reference_runtime_future",
      "reference_database_sql_boundary",
    ],
    requiredEvidence: ["IO responsibility summary", "side-effect boundary notes"],
  }),
  createIoBoundaryRule({
    ruleId: "io_boundary_rule:config_boundary",
    title: "Config boundary",
    category: "config_boundary",
    allowedResponsibilities: ["reference_config_boundary"],
    forbiddenResponsibilities: ["accept_request_metadata", "apply_domain_rule", "reference_provider_boundary"],
    reviewRequiredResponsibilities: ["reference_io_boundary", "reference_runtime_future"],
    requiredEvidence: ["configuration ownership notes", "secret-free metadata summary"],
  }),
  createIoBoundaryRule({
    ruleId: "io_boundary_rule:integration_boundary",
    title: "Integration boundary",
    category: "integration_boundary",
    allowedResponsibilities: ["describe_adapter_contract", "reference_io_boundary"],
    forbiddenResponsibilities: ["apply_domain_rule", "reference_runtime_future"],
    reviewRequiredResponsibilities: ["reference_provider_boundary", "reference_config_boundary"],
    requiredEvidence: ["integration contract summary", "external-system boundary notes"],
  }),
  createIoBoundaryRule({
    ruleId: "io_boundary_rule:runtime_future_boundary",
    title: "Future runtime boundary",
    category: "runtime_future_boundary",
    allowedResponsibilities: [],
    forbiddenResponsibilities: ["reference_runtime_future"],
    reviewRequiredResponsibilities: ["reference_io_boundary", "reference_provider_boundary", "reference_config_boundary"],
    requiredEvidence: ["future runtime gate reference"],
    severityDefault: "high",
  }),
  createIoBoundaryRule({
    ruleId: "io_boundary_rule:db_sql_boundary",
    title: "Database and SQL boundary",
    category: "db_sql_boundary",
    allowedResponsibilities: [],
    forbiddenResponsibilities: ["reference_database_sql_boundary"],
    reviewRequiredResponsibilities: ["describe_repository_contract", "reference_io_boundary"],
    requiredEvidence: ["persistence safety notes", "schema-change exclusion"],
    severityDefault: "critical",
  }),
  createIoBoundaryRule({
    ruleId: "io_boundary_rule:auth_security_boundary",
    title: "Auth and security boundary",
    category: "auth_security_boundary",
    allowedResponsibilities: ["reference_auth_security_boundary", "validate_request_metadata"],
    forbiddenResponsibilities: ["reference_provider_boundary", "reference_runtime_future"],
    reviewRequiredResponsibilities: ["accept_request_metadata", "orchestrate_use_case", "reference_io_boundary"],
    requiredEvidence: ["approval posture", "auth responsibility notes"],
    severityDefault: "critical",
  }),
];

export const selectIoBoundaryRulesByCategory = (
  rules: readonly IoBoundaryRule[],
  category: BackendLayerCategory,
): IoBoundaryRule[] => rules.filter((rule) => rule.category === category);

export const summarizeIoBoundaryRules = (
  rules: readonly IoBoundaryRule[],
): IoBoundaryRuleSummary => {
  const byCategory = emptyCategoryCounts();

  rules.forEach((rule) => {
    byCategory[rule.category] += 1;
  });

  return {
    summaryId: "io_boundary_rule_summary:118I",
    schemaVersion: "1.0",
    ruleCount: rules.length,
    byCategory,
    safeSummary: `IO boundary rule summary contains ${rules.length} rule(s).`,
    metadataOnly: true,
    reportOnly: true,
    advisoryOnly: true,
    sourceOnly: true,
    noBackendRuntimeMutation: true,
    noProviderExecution: true,
    noDbSqlAccess: true,
    noDashboardMutation: true,
    noRuntimeExecution: true,
    noScannerExecution: true,
    noRefactorExecution: true,
    safetyBoundaries: solidArchitectureBoundaries,
  };
};

export const defaultIoBoundaryRules = buildDefaultIoBoundaryRules();
