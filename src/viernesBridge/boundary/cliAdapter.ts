import type {
  ViernesBridgeApprovalCommandBoundaryResult,
  ViernesBridgeApprovalCommandBoundaryResponse,
  ViernesBridgeApprovalCommandPayload,
  ViernesBridgeBoundaryPayload,
  ViernesBridgeBoundaryProcessorOptions,
  ViernesBridgeBoundaryResult,
  ViernesBridgeCliParseResult,
} from "./types.js";
import type { ViernesBridgeIntent, ViernesBridgeSource } from "../types.js";
import type { IntegrationActionAuditRecord } from "../../integrations/actions/audit/types.js";
import type { ProposedIntegrationAction } from "../../integrations/actions/types.js";

type LocalRequestAdapterModule = typeof import("../localAdapter/localRequestAdapter.js");
type ProcessorModule = typeof import("../processor.js");
type ApprovalGateModule = typeof import("../../integrations/actions/approval/approvalGate.js");
type ApprovalPersistentStoreModule = typeof import("../../integrations/actions/storage/approvalPersistentStore.js");
type AuditTrailModule = typeof import("../../integrations/actions/audit/auditTrail.js");
type AuditPersistentStoreModule = typeof import("../../integrations/actions/storage/auditPersistentStore.js");
type ApprovalCommandParserModule = typeof import("../approval/approvalCommandParser.js");
type ApprovalProcessorModule = typeof import("../approval/approvalProcessor.js");
type RedactModule = typeof import("../../integrations/actions/audit/redact.js");

const KNOWN_SOURCES = new Set(["local", "whatsapp", "api"]);
const APPROVAL_INTENTS = new Set(["check_github_repo_status", "prepare_whatsapp_reply"]);

const KNOWN_INTENTS = new Set([
  "check_github_repo_status",
  "validate_whatsapp_bridge",
  "prepare_whatsapp_reply",
  "send_whatsapp_message",
  "trigger_n8n_workflow",
  "create_github_issue",
  "create_github_repo",
  "deploy_coolify",
  "invoke_openclaw_tool",
  "run_browser_task",
  "index_lightrag_document",
  "run_model_prompt",
  "unknown",
]);

async function loadLocalRequestAdapterModule(): Promise<LocalRequestAdapterModule> {
  return (await import(new URL("../localAdapter/localRequestAdapter.ts", import.meta.url).href)) as LocalRequestAdapterModule;
}

async function loadProcessorModule(): Promise<ProcessorModule> {
  return (await import(new URL("../processor.ts", import.meta.url).href)) as ProcessorModule;
}

async function loadApprovalGateModule(): Promise<ApprovalGateModule> {
  return (await import(new URL("../../integrations/actions/approval/approvalGate.ts", import.meta.url).href)) as ApprovalGateModule;
}

async function loadApprovalPersistentStoreModule(): Promise<ApprovalPersistentStoreModule> {
  return (await import(new URL("../../integrations/actions/storage/approvalPersistentStore.ts", import.meta.url).href)) as ApprovalPersistentStoreModule;
}

async function loadAuditTrailModule(): Promise<AuditTrailModule> {
  return (await import(new URL("../../integrations/actions/audit/auditTrail.ts", import.meta.url).href)) as AuditTrailModule;
}

async function loadAuditPersistentStoreModule(): Promise<AuditPersistentStoreModule> {
  return (await import(new URL("../../integrations/actions/storage/auditPersistentStore.ts", import.meta.url).href)) as AuditPersistentStoreModule;
}

async function loadApprovalCommandParserModule(): Promise<ApprovalCommandParserModule> {
  return (await import(new URL("../approval/approvalCommandParser.ts", import.meta.url).href)) as ApprovalCommandParserModule;
}

async function loadApprovalProcessorModule(): Promise<ApprovalProcessorModule> {
  return (await import(new URL("../approval/approvalProcessor.ts", import.meta.url).href)) as ApprovalProcessorModule;
}

async function loadRedactModule(): Promise<RedactModule> {
  return (await import(new URL("../../integrations/actions/audit/redact.ts", import.meta.url).href)) as RedactModule;
}

function nowIso(): string {
  return new Date().toISOString();
}

function nextValue(
  argv: readonly string[],
  index: number,
  flag: string,
  errors: string[],
): string | undefined {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    errors.push(`${flag}_requires_value`);
    return undefined;
  }
  return value;
}

function parseSource(value: string | undefined, errors: string[]): ViernesBridgeSource | undefined {
  if (!value) return undefined;
  if (KNOWN_SOURCES.has(value)) return value as ViernesBridgeSource;
  errors.push("invalid_source");
  return undefined;
}

function parseIntent(value: string | undefined, errors: string[]): ViernesBridgeIntent | undefined {
  if (!value) return undefined;
  if (KNOWN_INTENTS.has(value)) return value as ViernesBridgeIntent;
  errors.push("invalid_intent");
  return undefined;
}

function safeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function isApprovalIntent(intent: string | undefined): boolean {
  return !!intent && APPROVAL_INTENTS.has(intent);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function auditCreatedInput(record: IntegrationActionAuditRecord): Record<string, unknown> {
  const created = record.events.find((event) => event.eventType === "action_created");
  const details = isRecord(created?.detailsRedacted)
    ? created.detailsRedacted
    : undefined;
  return isRecord(details?.input) ? details.input : {};
}

function auditExpectedOutcome(record: IntegrationActionAuditRecord): string {
  const created = record.events.find((event) => event.eventType === "action_created");
  const details = isRecord(created?.detailsRedacted)
    ? created.detailsRedacted
    : undefined;
  return (
    text(details?.expectedOutcome) ??
    "A safe approved action remains controlled by the execution gate."
  );
}

function reconstructActionFromAudit(
  record: IntegrationActionAuditRecord,
  approvalSummary: string | undefined,
): ProposedIntegrationAction {
  const created = record.events.find((event) => event.eventType === "action_created");
  return {
    id: record.actionId,
    integration: record.integration,
    action: record.action,
    title: text(created?.summary) ?? approvalSummary ?? "Viernes approved action",
    description:
      approvalSummary ??
      `Resume ${record.integration}.${record.action} through the safe execution gate.`,
    riskLevel: record.riskLevel,
    requiresApproval: true,
    dryRunOnly: true,
    input: auditCreatedInput(record),
    expectedOutcome: auditExpectedOutcome(record),
    createdAt: record.createdAt,
  };
}

async function createPersistentBoundaryContext(
  env: NodeJS.ProcessEnv | undefined,
): Promise<{
  approvalGate: Awaited<ReturnType<ApprovalGateModule["createApprovalGate"]>>;
  auditTrail: Awaited<ReturnType<AuditTrailModule["createActionAuditTrail"]>>;
}> {
  const [
    approvalGateModule,
    approvalStoreModule,
    auditTrailModule,
    auditStoreModule,
  ] = await Promise.all([
    loadApprovalGateModule(),
    loadApprovalPersistentStoreModule(),
    loadAuditTrailModule(),
    loadAuditPersistentStoreModule(),
  ]);
  const storageOptions = { env: env ?? process.env };
  return {
    approvalGate: await approvalGateModule.createApprovalGate({
      store: approvalStoreModule.createPersistentApprovalStore(storageOptions),
    }),
    auditTrail: await auditTrailModule.createActionAuditTrail({
      store: auditStoreModule.createPersistentAuditStore(storageOptions),
    }),
  };
}

function parseContextJson(value: string | undefined, errors: string[]): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    errors.push("context_must_be_json_object");
    return {};
  } catch {
    errors.push("context_json_invalid");
    return {};
  }
}

function setContextValue(
  context: Record<string, unknown>,
  value: string | undefined,
  errors: string[],
): void {
  if (!value) return;
  const separator = value.indexOf("=");
  if (separator <= 0) {
    errors.push("context_value_must_be_key_equals_value");
    return;
  }

  const key = value.slice(0, separator).trim();
  const entry = value.slice(separator + 1).trim();
  if (!key || !entry) {
    errors.push("context_value_must_be_key_equals_value");
    return;
  }

  context[key] = entry;
}

export function parseViernesBridgeCliArgs(
  argv: readonly string[],
): ViernesBridgeCliParseResult {
  const errors: string[] = [];
  let help = false;
  let id: string | undefined;
  let source: ViernesBridgeSource | undefined;
  let messageText = "";
  let intent: ViernesBridgeIntent | undefined;
  let context: Record<string, unknown> = {};
  let executeReadOnly = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }

    if (arg === "--id") {
      id = nextValue(argv, index, "id", errors);
      index += 1;
      continue;
    }

    if (arg === "--source") {
      source = parseSource(nextValue(argv, index, "source", errors), errors);
      index += 1;
      continue;
    }

    if (arg === "--message" || arg === "-m") {
      messageText = nextValue(argv, index, "message", errors) ?? messageText;
      index += 1;
      continue;
    }

    if (arg === "--intent") {
      intent = parseIntent(nextValue(argv, index, "intent", errors), errors);
      index += 1;
      continue;
    }

    if (arg === "--context-json") {
      context = {
        ...context,
        ...parseContextJson(nextValue(argv, index, "context-json", errors), errors),
      };
      index += 1;
      continue;
    }

    if (arg === "--context") {
      setContextValue(context, nextValue(argv, index, "context", errors), errors);
      index += 1;
      continue;
    }

    if (arg === "--execute-read-only") {
      executeReadOnly = true;
      continue;
    }

    errors.push(`unknown_arg:${arg ?? ""}`);
  }

  if (!help && !messageText && !intent) {
    errors.push("message_or_intent_required");
  }

  const payload: ViernesBridgeBoundaryPayload | undefined =
    errors.length === 0
      ? {
          ...(id ? { id } : {}),
          source: source ?? "local",
          messageText,
          ...(intent ? { intent } : {}),
          context,
        }
      : undefined;

  return {
    ...(payload ? { payload } : {}),
    errors,
    help,
    executeReadOnly,
  };
}

export function viernesBridgeCliHelpText(): string {
  return [
    "Usage:",
    "  npm run viernes:bridge:cli -- --intent validate_whatsapp_bridge --message \"valida el bridge\"",
    "",
    "Options:",
    "  --intent <intent>            Supported Viernes bridge intent.",
    "  --message, -m <text>         Message text to normalize.",
    "  --source <local|whatsapp|api>",
    "  --context key=value          Safe context entry; repeatable.",
    "  --context-json <json>        Safe context JSON object.",
    "  --execute-read-only          Let existing read-only allowlisted actions execute.",
    "  --help",
  ].join("\n");
}

export async function processViernesBridgeBoundaryPayload(
  payload: ViernesBridgeBoundaryPayload,
  options: ViernesBridgeBoundaryProcessorOptions = {},
): Promise<ViernesBridgeBoundaryResult> {
  const [{ adaptLocalViernesPayloadToBridgeRequest }, { processViernesBridgeRequest }] =
    await Promise.all([loadLocalRequestAdapterModule(), loadProcessorModule()]);
  const request = await adaptLocalViernesPayloadToBridgeRequest(payload);
  const policyOptions = options.policyOptions ?? {
    ...(options.env ? { env: options.env } : {}),
    ...(options.envFiles ? { envFiles: options.envFiles } : {}),
  };
  const persistentContext = isApprovalIntent(request.intent)
    ? await createPersistentBoundaryContext(policyOptions.env)
    : undefined;
  const response = await processViernesBridgeRequest({ ...request }, {
    executeReadOnly: options.executeReadOnly ?? false,
    policyOptions,
    ...(persistentContext
      ? {
          approvalGate: persistentContext.approvalGate,
          auditTrail: persistentContext.auditTrail,
        }
      : {}),
  });

  return {
    response,
    createdAt: nowIso(),
  };
}

function approvalSummary(
  status: ViernesBridgeApprovalCommandBoundaryResponse["status"],
): string {
  if (status === "approved") return "Approval command approved the action.";
  if (status === "rejected") return "Approval command rejected the action.";
  if (status === "resumed_read_only") return "Approved read-only action resumed safely.";
  if (status === "not_found") return "Approval command could not be correlated safely.";
  if (status === "blocked") return "Approval command was blocked by local safety policy.";
  return "Approval command failed safely.";
}

async function finalizeApprovalResponse(
  response: ViernesBridgeApprovalCommandBoundaryResponse,
): Promise<ViernesBridgeApprovalCommandBoundaryResponse> {
  const { redactSensitive } = await loadRedactModule();
  return redactSensitive(response) as ViernesBridgeApprovalCommandBoundaryResponse;
}

function commandResponse(input: {
  status: ViernesBridgeApprovalCommandBoundaryResponse["status"];
  approvalId?: string;
  actionId?: string;
  reasons?: readonly string[];
  executionResult?: ViernesBridgeApprovalCommandBoundaryResponse["executionResult"];
}): ViernesBridgeApprovalCommandBoundaryResponse {
  return {
    requestId: safeId("viernes-approval"),
    status: input.status,
    summary: approvalSummary(input.status),
    ...(input.approvalId ? { approvalId: input.approvalId } : {}),
    ...(input.actionId ? { actionId: input.actionId } : {}),
    blockedReasons: input.reasons ?? [],
    ...(input.executionResult ? { executionResult: input.executionResult } : {}),
    createdAt: nowIso(),
  };
}

export async function processViernesBridgeApprovalCommandPayload(
  payload: ViernesBridgeApprovalCommandPayload,
  options: ViernesBridgeBoundaryProcessorOptions = {},
): Promise<ViernesBridgeApprovalCommandBoundaryResult> {
  const textValue = text(payload.text);
  if (payload.type !== "approval_command" || !textValue) {
    return {
      response: await finalizeApprovalResponse(
        commandResponse({
          status: "blocked",
          reasons: ["approval_command_payload_invalid"],
        }),
      ),
      createdAt: nowIso(),
    };
  }

  const context = await createPersistentBoundaryContext(options.env);
  const { parseApprovalCommand } = await loadApprovalCommandParserModule();
  const command = parseApprovalCommand(textValue);
  const approvalId = text(payload.approvalId);
  const explicitActionId = text(payload.actionId);

  if (command.type === "unknown") {
    return {
      response: await finalizeApprovalResponse(
        commandResponse({
          status: "blocked",
          reasons: ["approval_command_not_recognized"],
        }),
      ),
      createdAt: nowIso(),
    };
  }

  if (!approvalId && !explicitActionId) {
    return {
      response: await finalizeApprovalResponse(
        commandResponse({
          status: "not_found",
          reasons: ["approval_or_action_id_required"],
        }),
      ),
      createdAt: nowIso(),
    };
  }

  if (command.type === "reject" && !approvalId) {
    return {
      response: await finalizeApprovalResponse(
        commandResponse({
          status: "blocked",
          ...(explicitActionId ? { actionId: explicitActionId } : {}),
          reasons: ["approval_id_required_for_reject"],
        }),
      ),
      createdAt: nowIso(),
    };
  }

  const approval = approvalId
    ? await context.approvalGate.getApprovalStatus(approvalId)
    : undefined;
  const actionId = explicitActionId ?? approval?.actionId;
  if (!actionId) {
    return {
      response: await finalizeApprovalResponse(
        commandResponse({
          status: "not_found",
          ...(approvalId ? { approvalId } : {}),
          reasons: ["approval_not_found"],
        }),
      ),
      createdAt: nowIso(),
    };
  }

  const auditRecord = await context.auditTrail.getAuditRecord(actionId);
  if (!auditRecord) {
    return {
      response: await finalizeApprovalResponse(
        commandResponse({
          status: "blocked",
          ...(approvalId ? { approvalId } : {}),
          actionId,
          reasons: ["audit_record_required"],
        }),
      ),
      createdAt: nowIso(),
    };
  }

  const action = reconstructActionFromAudit(auditRecord, approval?.actionSummary);
  const { processViernesApprovalCommand } = await loadApprovalProcessorModule();
  const result = await processViernesApprovalCommand(command, {
    approvalGate: context.approvalGate,
    auditTrail: context.auditTrail,
    ...(approvalId ? { approvalId } : {}),
    actionId,
    action,
    policyOptions: options.policyOptions ?? {
      ...(options.env ? { env: options.env } : {}),
      ...(options.envFiles ? { envFiles: options.envFiles } : {}),
    },
    resumeApprovedReadOnly: true,
  });
  const status =
    result.status === "approved" ||
    result.status === "rejected" ||
    result.status === "resumed_read_only"
      ? result.status
      : "blocked";

  return {
    response: await finalizeApprovalResponse(
      commandResponse({
        status,
        ...(result.approvalId ? { approvalId: result.approvalId } : {}),
        ...(result.actionId ? { actionId: result.actionId } : {}),
        reasons: result.allowed ? [] : result.reasons,
        ...(result.executionResult ? { executionResult: result.executionResult } : {}),
      }),
    ),
    createdAt: nowIso(),
  };
}
