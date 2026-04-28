import { z } from "zod";

import type {
  AutomationNodeCategory,
  AutomationRiskLevel,
  AutomationTriggerType,
  AutomationWorkflow,
} from "./types.js";

export const AUTOMATION_WORKFLOW_SCHEMA_VERSION = "1.0";

export const AUTOMATION_TRIGGER_TYPES = [
  "manual",
  "schedule",
  "webhook",
  "event",
  "inbox_notification",
  "channel_message",
  "file_store_change_future",
  "external_connector_event_future",
] as const satisfies readonly AutomationTriggerType[];

export const AUTOMATION_NODE_CATEGORIES = [
  "transform",
  "condition",
  "approval_request",
  "notification",
  "action_proposal",
  "human_input",
  "data_read",
  "connector_call_future",
  "data_write_future_gated",
  "wait_timer",
  "branch_merge",
  "loop",
  "error_handler",
] as const satisfies readonly AutomationNodeCategory[];

export const AUTOMATION_RISK_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly AutomationRiskLevel[];

export const FORBIDDEN_AUTOMATION_KEYS = [
  "credential",
  "credentials",
  "credentialId",
  "apiKey",
  "api_key",
  "token",
  "bearer",
  "secret",
  "password",
  "requestBody",
  "rawBody",
] as const;

const boundedRecordSchema = z.record(z.string(), z.unknown());

export const automationPermissionRequirementSchema = z
  .object({
    permissionId: z.string().trim().min(1),
    scope: z.string().trim().min(1).optional(),
    reason: z.string().trim().min(1),
  })
  .strict();

export const automationTriggerSchema = z
  .object({
    triggerId: z.string().trim().min(1),
    type: z.enum(AUTOMATION_TRIGGER_TYPES),
    enabled: z.boolean(),
    futureOnly: z.boolean().optional(),
    metadata: boundedRecordSchema.optional(),
  })
  .strict();

export const automationNodeSchema = z
  .object({
    nodeId: z.string().trim().min(1),
    type: z.string().trim().min(1),
    category: z.enum(AUTOMATION_NODE_CATEGORIES),
    label: z.string().trim().min(1).optional(),
    inputSchema: boundedRecordSchema.optional(),
    outputSchema: boundedRecordSchema.optional(),
    riskLevel: z.enum(AUTOMATION_RISK_LEVELS),
    requiredPermissions: z.array(automationPermissionRequirementSchema),
    dryRunBehavior: boundedRecordSchema,
    executionBehavior: z.null().optional(),
    redactionRules: boundedRecordSchema.optional(),
    disabled: z.boolean().optional(),
    futureOnly: z.boolean().optional(),
    metadata: boundedRecordSchema.optional(),
  })
  .strict();

export const automationEdgeSchema = z
  .object({
    edgeId: z.string().trim().min(1),
    fromNodeId: z.string().trim().min(1),
    toNodeId: z.string().trim().min(1),
    condition: boundedRecordSchema.optional(),
    metadata: boundedRecordSchema.optional(),
  })
  .strict();

export const automationWorkflowSchema: z.ZodType<AutomationWorkflow> = z
  .object({
    workflowId: z.string().trim().min(1),
    schemaVersion: z.literal(AUTOMATION_WORKFLOW_SCHEMA_VERSION),
    version: z.string().trim().min(1),
    name: z.string().trim().min(1),
    description: z.string().trim().min(1).optional(),
    dryRunOnly: z.literal(true),
    triggers: z.array(automationTriggerSchema).min(1),
    nodes: z.array(automationNodeSchema).min(1),
    edges: z.array(automationEdgeSchema).default([]),
    variables: boundedRecordSchema.optional(),
    permissions: z.array(automationPermissionRequirementSchema),
    approvalPolicy: boundedRecordSchema.optional(),
    retryPolicy: boundedRecordSchema.optional(),
    timeoutPolicy: boundedRecordSchema.optional(),
    redactionPolicy: boundedRecordSchema.optional(),
    auditPolicy: boundedRecordSchema.optional(),
    metadata: boundedRecordSchema.optional(),
  })
  .strict();

