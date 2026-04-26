import type {
  ActionCategory,
  ActionRiskLevel,
  ChannelKind,
} from "../actions/types.js";

export type ToolRiskLevel = ActionRiskLevel;

export type ToolCategory =
  | ActionCategory
  | "computer-use"
  | "memory"
  | "learning"
  | "supervisor"
  | "permission"
  | "tool-registry"
  | "job"
  | "notification";

export type ToolCapability =
  | "tool.registry.inspect"
  | "permission.check"
  | "permission.audit.inspect"
  | "action.proposal.create"
  | "action.review.request"
  | "action.dispatch.approved"
  | "memory.v2.retrieve"
  | "learning.export"
  | "supervisor.status"
  | "notification.inbox.create"
  | "job.queue.enqueue"
  | "openclaw.tool_invoke.dry_run"
  | "computer.action.dry_run"
  | "repo.file_write.preview"
  | "repo.file_write.real"
  | "repo.git_branch.preview"
  | "repo.git_branch.real"
  | "repo.pr_create.preview";

export interface ToolRegistryEntry {
  toolId: string;
  capability: ToolCapability;
  category: ToolCategory;
  riskLevel: ToolRiskLevel;
  mutatesRepo: boolean;
  networkAccess: boolean;
  externalService: string | null;
  requiresApproval: boolean;
  allowedChannels: ChannelKind[];
  requiredPermissions: ToolCapability[];
  requiredEnv: string[];
  dryRunSupported: boolean;
  realExecutionSupported: boolean;
  forbiddenByDefault: boolean;
  description: string;
}
