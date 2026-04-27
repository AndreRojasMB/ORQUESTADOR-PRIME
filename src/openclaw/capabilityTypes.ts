import type { ActionRiskLevel } from "../actions/types.js";
import type { ToolCapability } from "../tools/types.js";

export type OpenClawCapabilityRiskLevel =
  | ActionRiskLevel
  | "high-risk";

export type OpenClawCapabilityId =
  | "computer.inspect.plan"
  | "computer.screenshot.metadata"
  | "computer.click.plan"
  | "computer.type.plan"
  | "computer.navigate.plan"
  | "openclaw.tool_invoke.dry_run"
  | "computer.click.real"
  | "computer.type.real"
  | "computer.navigate.real"
  | "computer.screenshot.raw"
  | "openclaw.tool_invoke.real";

export type OpenClawCapabilityAction =
  | "inspect"
  | "screenshot-metadata"
  | "click"
  | "type"
  | "navigate"
  | "tool-invoke";

export type OpenClawAllowedTarget =
  | "metadata"
  | "browser"
  | "application"
  | "desktop"
  | "tool-gateway";

export interface OpenClawCapabilityEntry {
  capabilityId: OpenClawCapabilityId;
  openclawTool: string | null;
  action: OpenClawCapabilityAction;
  description: string;
  riskLevel: OpenClawCapabilityRiskLevel;
  dryRunSupported: boolean;
  realExecutionSupported: boolean;
  requiresScreenshot: boolean;
  requiresKeyboard: boolean;
  requiresMouse: boolean;
  requiresNetwork: boolean;
  mutatesExternalState: boolean;
  mutatesRepo: boolean;
  allowedTargets: OpenClawAllowedTarget[];
  requiredPermissions: ToolCapability[];
  requiredEnv: string[];
  forbiddenByDefault: boolean;
}
