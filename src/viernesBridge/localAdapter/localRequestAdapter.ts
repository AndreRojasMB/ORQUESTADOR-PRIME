import type {
  ViernesBridgeIntent,
  ViernesBridgeRequest,
  ViernesBridgeSource,
} from "../types.js";

type NormalizerModule = typeof import("../normalizer.js");
type WorkspaceDiscoveryModule = typeof import("./workspaceDiscovery.js");

async function loadNormalizerModule(): Promise<NormalizerModule> {
  return (await import(new URL("../normalizer.ts", import.meta.url).href)) as NormalizerModule;
}

async function loadWorkspaceDiscoveryModule(): Promise<WorkspaceDiscoveryModule> {
  return (await import(new URL("./workspaceDiscovery.ts", import.meta.url).href)) as WorkspaceDiscoveryModule;
}

export interface ViernesLocalAdapterPayload {
  id?: string;
  source?: ViernesBridgeSource;
  userId?: string;
  clientId?: string;
  messageText?: string;
  intent?: ViernesBridgeIntent;
  context?: Record<string, unknown>;
  requestedAt?: string;
}

const SAFE_CONTEXT_KEYS = new Set([
  "workspacePath",
  "owner",
  "repo",
  "githubOwner",
  "githubRepo",
  "targetOwner",
  "targetRepo",
  "targetUrl",
  "healthUrl",
  "url",
]);

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

async function normalizeWorkspacePath(value: unknown): Promise<string> {
  const { DEFAULT_VIERNES_WSL_PATH, windowsPathToWslPath } =
    await loadWorkspaceDiscoveryModule();
  const pathValue = text(value);
  return pathValue ? windowsPathToWslPath(pathValue) : DEFAULT_VIERNES_WSL_PATH;
}

async function sanitizedContext(
  payload: ViernesLocalAdapterPayload,
): Promise<Record<string, unknown>> {
  const sourceContext =
    payload.context && typeof payload.context === "object" && !Array.isArray(payload.context)
      ? payload.context
      : {};
  const context: Record<string, unknown> = {
    workspacePath: await normalizeWorkspacePath(sourceContext["workspacePath"]),
  };

  for (const [key, value] of Object.entries(sourceContext)) {
    if (!SAFE_CONTEXT_KEYS.has(key)) continue;
    if (key === "workspacePath") continue;
    const safeText = text(value);
    if (safeText) context[key] = safeText;
  }

  return context;
}

export async function adaptLocalViernesPayloadToBridgeRequest(
  payload: ViernesLocalAdapterPayload,
): Promise<ViernesBridgeRequest> {
  const { normalizeViernesBridgeRequest } = await loadNormalizerModule();
  const adapted: Partial<ViernesBridgeRequest> & Record<string, unknown> = {
    ...(payload.id ? { id: payload.id } : {}),
    source: payload.source ?? "local",
    ...(payload.userId ? { userId: payload.userId } : {}),
    ...(payload.clientId ? { clientId: payload.clientId } : {}),
    messageText: payload.messageText ?? "",
    ...(payload.intent ? { intent: payload.intent } : {}),
    context: await sanitizedContext(payload),
    ...(payload.requestedAt ? { requestedAt: payload.requestedAt } : {}),
  };

  return normalizeViernesBridgeRequest(adapted);
}
