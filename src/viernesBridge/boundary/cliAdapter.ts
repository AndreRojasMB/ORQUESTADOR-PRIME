import type {
  ViernesBridgeBoundaryPayload,
  ViernesBridgeBoundaryProcessorOptions,
  ViernesBridgeBoundaryResult,
  ViernesBridgeCliParseResult,
} from "./types.js";
import type { ViernesBridgeIntent, ViernesBridgeSource } from "../types.js";

type LocalRequestAdapterModule = typeof import("../localAdapter/localRequestAdapter.js");
type ProcessorModule = typeof import("../processor.js");

const KNOWN_SOURCES = new Set(["local", "whatsapp", "api"]);

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
  const response = await processViernesBridgeRequest({ ...request }, {
    executeReadOnly: options.executeReadOnly ?? false,
    policyOptions,
  });

  return {
    response,
    createdAt: nowIso(),
  };
}
