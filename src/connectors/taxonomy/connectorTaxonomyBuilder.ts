import {
  connectorTaxonomyBoundaries,
  listConnectorTaxonomyTemplates,
  supportedConnectorIds,
} from "./connectorTaxonomyTemplates.js";
import type {
  ConnectorId,
  ConnectorTaxonomy,
  ConnectorTaxonomyEntry,
  ConnectorTaxonomyInput,
  ConnectorTaxonomyResult,
  ConnectorTaxonomyValidationFinding,
} from "./types.js";

const normalizeId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const isSupportedConnectorId = (value: string): value is ConnectorId =>
  supportedConnectorIds.includes(value as ConnectorId);

const boundedUnique = (values: readonly string[] | undefined, limit: number): string[] =>
  Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean))).slice(0, limit);

const cloneEntry = (entry: ConnectorTaxonomyEntry): ConnectorTaxonomyEntry => ({
  ...entry,
  capabilities: entry.capabilities.map((item) => ({ ...item })),
  readOnlyCapabilities: entry.readOnlyCapabilities.map((item) => ({ ...item })),
  mutationCapabilities: entry.mutationCapabilities.map((item) => ({ ...item })),
  permissionScopes: entry.permissionScopes.map((item) => ({ ...item })),
  credentialRequirements: entry.credentialRequirements.map((item) => ({ ...item })),
  dataAccessScopes: entry.dataAccessScopes.map((item) => ({ ...item })),
  actionScopes: entry.actionScopes.map((item) => ({ ...item })),
  rateLimitPlan: { ...entry.rateLimitPlan },
  retryPlan: { ...entry.retryPlan },
  auditPlan: { ...entry.auditPlan },
  dryRunPlan: { ...entry.dryRunPlan },
  approvalGate: { ...entry.approvalGate },
  sandboxPlan: { ...entry.sandboxPlan },
  redactionRules: entry.redactionRules.map((item) => ({
    ...item,
    deniedRawData: item.deniedRawData.slice(),
  })),
  assumptions: entry.assumptions.slice(),
  exclusions: entry.exclusions.slice(),
  boundaries: { ...entry.boundaries },
});

const finding = (
  reasonCode: string,
  safeMessage: string,
  path?: string,
): ConnectorTaxonomyValidationFinding => ({
  id: "finding_1",
  severity: "fail",
  reasonCode,
  safeMessage,
  ...(path ? { path } : {}),
});

const result = (
  status: ConnectorTaxonomyResult["status"],
  errors: ConnectorTaxonomyValidationFinding[],
  warnings: ConnectorTaxonomyValidationFinding[] = [],
  entry?: ConnectorTaxonomyEntry,
  entries?: ConnectorTaxonomyEntry[],
  taxonomy?: ConnectorTaxonomy,
): ConnectorTaxonomyResult => ({
  ok: errors.length === 0 && (status === "entry_found" || status === "taxonomy_built"),
  status,
  ...(entry ? { entry } : {}),
  ...(entries ? { entries } : {}),
  ...(taxonomy ? { taxonomy } : {}),
  warnings,
  errors,
  advisoryOnly: true,
  sourceOnly: true,
  boundaries: connectorTaxonomyBoundaries,
});

export const listConnectorTaxonomyEntries = (): ConnectorTaxonomyEntry[] =>
  listConnectorTaxonomyTemplates();

export const getConnectorTaxonomyEntry = (
  connectorId: ConnectorId | string,
): ConnectorTaxonomyResult => {
  const normalized = normalizeId(connectorId);
  if (!isSupportedConnectorId(normalized)) {
    return result("entry_not_found", [
      finding(
        "CONNECTOR_ID_NOT_FOUND",
        "Requested connector id is not in the supported advisory taxonomy registry.",
        "connectorId",
      ),
    ]);
  }

  const template = listConnectorTaxonomyTemplates().find((item) => item.connectorId === normalized);
  return template
    ? result("entry_found", [], [], cloneEntry(template))
    : result("entry_not_found", [
        finding(
          "CONNECTOR_TEMPLATE_NOT_FOUND",
          "Requested connector taxonomy template is not available.",
          "connectorId",
        ),
      ]);
};

export const buildConnectorTaxonomy = (
  input: ConnectorTaxonomyInput = {},
): ConnectorTaxonomyResult => {
  const requestedConnectorIds = input.connectorIds?.length
    ? input.connectorIds.map((connectorId) => normalizeId(connectorId))
    : supportedConnectorIds.slice();

  const unsupportedConnectorIds = requestedConnectorIds.filter(
    (connectorId) => !isSupportedConnectorId(connectorId),
  );
  if (unsupportedConnectorIds.length > 0) {
    return result("input_invalid", [
      {
        ...finding(
          "CONNECTOR_ID_INVALID",
          "Connector taxonomy input includes unsupported connector ids.",
          "connectorIds",
        ),
        metadata: { invalidConnectorCount: unsupportedConnectorIds.length },
      },
    ]);
  }

  const templates = listConnectorTaxonomyTemplates();
  const entries = requestedConnectorIds
    .filter(isSupportedConnectorId)
    .map((connectorId) => templates.find((template) => template.connectorId === connectorId))
    .filter((entry): entry is ConnectorTaxonomyEntry => Boolean(entry))
    .map(cloneEntry);

  const includedConnectorIds = entries.map((entry) => entry.connectorId);
  const assumptions = [
    "Connector taxonomy is curated advisory metadata, not connector execution, network access, or repository scanning.",
    "Credential requirements are metadata only and never contain credential values.",
    ...boundedUnique(input.assumptions, 8),
  ];
  const exclusions = [
    "No provider, network, external service, filesystem, command, credential, webhook, browser, terminal, payment, billing, SSO, connector, action, automation, runtime, dashboard, package, workflow, database, or release behavior is performed.",
    ...boundedUnique(input.exclusions, 8),
  ];

  const taxonomy: ConnectorTaxonomy = {
    taxonomyId: input.taxonomyId?.trim() || "connector-taxonomy:current",
    schemaVersion: "1.0",
    name: input.name?.trim() || "ORQUESTADOR-PRIME connector metadata taxonomy",
    summary:
      input.summary?.trim() ||
      "Curated source-only connector taxonomy metadata for future governance and readiness review.",
    entries,
    includedConnectorIds,
    assumptions,
    exclusions,
    advisoryOnly: true,
    sourceOnly: true,
    boundaries: connectorTaxonomyBoundaries,
  };

  return result("taxonomy_built", [], [], undefined, entries, taxonomy);
};
