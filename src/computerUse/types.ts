import type { ChannelKind } from "../actions/types.js";
import type { SafeError } from "../errors/errorTaxonomy.js";
import type {
  PermissionCheckResult,
  PermissionSubjectKind,
} from "../permissions/types.js";
import type { RedactionMetadata } from "../privacy/redactionEngine.js";
import type {
  OpenClawAllowedTarget,
  OpenClawCapabilityId,
  OpenClawCapabilityRiskLevel,
} from "../openclaw/capabilityTypes.js";

export const SCREENSHOT_TRACE_STORE_VERSION = "1.0";

export type ScreenshotTraceStorageMode = "metadata-only";

export type ScreenshotTraceSource =
  | "cli"
  | "dashboard"
  | "job"
  | "system"
  | "openclaw";

export interface ScreenshotTraceViewport {
  width: number | null;
  height: number | null;
  deviceScaleFactor: number | null;
}

export interface ScreenshotTraceMetadata {
  traceId: string;
  version: typeof SCREENSHOT_TRACE_STORE_VERSION;
  projectId: string;
  projectName: string;
  projectRootHash: string;
  createdAt: string;
  source: ScreenshotTraceSource;
  screenHash: string | null;
  screenshotRef: string | null;
  viewport: ScreenshotTraceViewport;
  windowTitlePreview: string | null;
  urlHost: string | null;
  redaction: RedactionMetadata;
  linkedProposalId: string | null;
  linkedJobId: string | null;
  storageMode: ScreenshotTraceStorageMode;
  correlationId: string | null;
}

export interface ScreenshotTraceStoreData {
  version: typeof SCREENSHOT_TRACE_STORE_VERSION;
  traces: ScreenshotTraceMetadata[];
  lastUpdatedAt: string | null;
}

export interface AppendScreenshotTraceMetadataInput {
  source?: ScreenshotTraceSource;
  projectRoot?: string;
  screenHash?: string | null;
  screenshotRef?: string | null;
  viewport?: Partial<ScreenshotTraceViewport>;
  windowTitle?: string | null;
  url?: string | null;
  linkedProposalId?: string | null;
  linkedJobId?: string | null;
  correlationId?: string | null;
  createdAt?: string;
}

export interface ScreenshotTraceStats {
  total: number;
  bySource: Partial<Record<ScreenshotTraceSource, number>>;
  byStorageMode: Record<ScreenshotTraceStorageMode, number>;
}

export interface ComputerDryRunInput {
  capabilityId: OpenClawCapabilityId | string;
  instruction: string;
  target?: OpenClawAllowedTarget | string | null;
  subjectKind: PermissionSubjectKind;
  subjectHash: string | null;
  channel?: ChannelKind;
  projectRoot?: string;
  screenshotTraceId?: string | null;
  linkedJobId?: string | null;
  linkedProposalId?: string | null;
  correlationId?: string | null;
}

export interface ComputerDryRunResult {
  ok: boolean;
  dryRun: true;
  capabilityId: string;
  plannedSteps: string[];
  riskLevel: OpenClawCapabilityRiskLevel | "unknown";
  requiredApprovals: string[];
  blockedReasons: string[];
  safeSummary: string;
  permission: PermissionCheckResult | null;
  redaction: RedactionMetadata;
  screenshotTraceId: string | null;
  error: SafeError | null;
}
