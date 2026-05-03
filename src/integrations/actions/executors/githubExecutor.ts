import type { ProposedIntegrationAction } from "../types.js";
import type {
  IntegrationActionExecutionResult,
  IntegrationActionExecutorContext,
} from "./types.js";

type StatusModule = typeof import("../../status.js");

async function loadStatusModule(): Promise<StatusModule> {
  return (await import(new URL("../../status.ts", import.meta.url).href)) as StatusModule;
}

function nowIso(): string {
  return new Date().toISOString();
}

const DEFAULT_TIMEOUT_MS = 5_000;
const MAX_TIMEOUT_MS = 5_000;

function timeoutSignal(timeoutMs = DEFAULT_TIMEOUT_MS): {
  signal: AbortSignal;
  cancel: () => void;
} {
  const controller = new AbortController();
  const clamped = Math.min(Math.max(1, timeoutMs), MAX_TIMEOUT_MS);
  const timer = setTimeout(() => controller.abort(), clamped);
  timer.unref();
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
  };
}

function textInput(
  action: ProposedIntegrationAction,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const value = action.input[key];
    if (typeof value !== "string") continue;
    const normalized = value.trim().replace(/^['"]|['"]$/g, "");
    if (normalized) return normalized;
  }

  return undefined;
}

function repoInput(action: ProposedIntegrationAction): {
  owner?: string;
  repo?: string;
} {
  const owner = textInput(action, ["owner", "targetOwner", "githubOwner"]);
  const repo = textInput(action, ["repo", "targetRepo", "githubRepo"]);

  if (!repo?.includes("/")) {
    return {
      ...(owner ? { owner } : {}),
      ...(repo ? { repo } : {}),
    };
  }

  const [repoOwner, repoName] = repo.split("/", 2);
  return {
    ...(owner ?? repoOwner ? { owner: owner ?? repoOwner } : {}),
    ...(repoName ? { repo: repoName } : {}),
  };
}

function blockedResult(
  action: ProposedIntegrationAction,
  reason: string,
  evidence: Record<string, unknown> = {},
): IntegrationActionExecutionResult {
  return {
    actionId: action.id,
    integration: action.integration,
    action: action.action,
    status: "blocked",
    mode: "blocked",
    summary: "GitHub read_repo_status was blocked safely.",
    blockedReasons: [reason],
    evidenceRedacted: {
      ...evidence,
      statusSummary: reason,
    },
    createdAt: nowIso(),
  };
}

function failedResult(
  action: ProposedIntegrationAction,
  reason: string,
  evidence: Record<string, unknown> = {},
): IntegrationActionExecutionResult {
  return {
    actionId: action.id,
    integration: action.integration,
    action: action.action,
    status: "failed",
    mode: "blocked",
    summary: "GitHub read_repo_status read-only request failed safely.",
    blockedReasons: [reason],
    evidenceRedacted: {
      ...evidence,
      statusSummary: reason,
    },
    createdAt: nowIso(),
  };
}

function isUnavailableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  return (
    err.name === "AbortError" ||
    message.includes("aborted") ||
    message.includes("fetch failed") ||
    message.includes("econnrefused") ||
    message.includes("econnreset") ||
    message.includes("enotfound") ||
    message.includes("etimedout")
  );
}

function stringField(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function booleanField(
  record: Record<string, unknown>,
  key: string,
): boolean | undefined {
  return typeof record[key] === "boolean" ? record[key] : undefined;
}

function repoEvidence(payload: unknown, owner: string, repo: string): Record<string, unknown> {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const visibility =
    stringField(record, "visibility") ??
    (booleanField(record, "private") === true ? "private" : "public");

  return {
    owner,
    repo,
    visibility,
    ...(stringField(record, "default_branch")
      ? { defaultBranch: stringField(record, "default_branch") }
      : {}),
    ...(booleanField(record, "archived") !== undefined
      ? { archived: booleanField(record, "archived") }
      : {}),
    ...(stringField(record, "pushed_at")
      ? { pushedAt: stringField(record, "pushed_at") }
      : {}),
    ...(stringField(record, "updated_at")
      ? { updatedAt: stringField(record, "updated_at") }
      : {}),
    statusSummary: "repo_metadata_read",
  };
}

export async function executeGitHubReadRepoStatus(
  action: ProposedIntegrationAction,
  context: IntegrationActionExecutorContext,
): Promise<IntegrationActionExecutionResult> {
  const {
    getIntegrationEnvSnapshot,
    getIntegrationStatuses,
    hasUsableIntegrationValue,
  } = await loadStatusModule();
  const options = context.statusOptions ?? {};
  const [statuses, env] = await Promise.all([
    getIntegrationStatuses(options),
    getIntegrationEnvSnapshot(options),
  ]);
  const configured =
    statuses.find((status) => status.id === "github")?.configured ?? false;
  const token = env["GITHUB_TOKEN"];
  const configuredOwner = env["GITHUB_OWNER"];
  const input = repoInput(action);
  const owner = input.owner ?? configuredOwner;
  const repo = input.repo;

  if (
    !configured ||
    !hasUsableIntegrationValue(token) ||
    !hasUsableIntegrationValue(owner)
  ) {
    return blockedResult(action, "github_config_missing", {
      ...(owner ? { owner } : {}),
      ...(repo ? { repo } : {}),
    });
  }

  if (!repo) {
    return {
      actionId: action.id,
      integration: action.integration,
      action: action.action,
      status: "simulated",
      mode: "dry_run",
      summary: "GitHub owner configuration is ready; no repository was provided for a remote read.",
      evidenceRedacted: {
        owner,
        statusSummary: "owner_ready",
      },
      createdAt: nowIso(),
    };
  }

  const { signal, cancel } = timeoutSignal();

  try {
    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "ORQUESTADOR-PRIME-integration-action-executor",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        redirect: "manual",
        signal,
      },
    );

    if (response.status === 401 || response.status === 403) {
      return blockedResult(action, "unauthorized_or_forbidden", {
        owner,
        repo,
      });
    }

    if (response.status === 404) {
      return blockedResult(action, "repository_not_found_or_not_accessible", {
        owner,
        repo,
      });
    }

    if (response.status >= 500) {
      return failedResult(action, "github_unavailable", {
        owner,
        repo,
      });
    }

    if (response.status < 200 || response.status >= 300) {
      return failedResult(action, "github_read_error", {
        owner,
        repo,
      });
    }

    const payload = (await response.json()) as unknown;

    return {
      actionId: action.id,
      integration: action.integration,
      action: action.action,
      status: "executed_read_only",
      mode: "read_only",
      summary: "GitHub repository metadata read completed safely.",
      evidenceRedacted: {
        ...repoEvidence(payload, owner, repo),
      },
      createdAt: nowIso(),
    };
  } catch (err) {
    return failedResult(
      action,
      isUnavailableError(err) ? "github_unavailable" : "github_read_error",
      {
        owner,
        repo,
      },
    );
  } finally {
    cancel();
  }
}
