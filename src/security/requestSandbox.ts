// src/security/requestSandbox.ts
// Wraps outbound HTTP calls through domain validation.
// Blocked requests return a synthetic 403 response — never throws.

import { isAllowedUrl, DEFAULT_ALLOWLIST } from "./domainValidator.js";
import { readUserConfig } from "../config/userConfigStore.js";
import { logger } from "../observability/logger.js";

let _cachedAllowlist: string[] | null = null;

async function getAllowlist(): Promise<string[]> {
  if (_cachedAllowlist) return _cachedAllowlist;
  const config = await readUserConfig();
  _cachedAllowlist = [
    ...DEFAULT_ALLOWLIST,
    ...config.allowedDomains,
  ];
  return _cachedAllowlist;
}

/** Reset the cached allowlist (useful if config changes mid-run). */
export function resetAllowlistCache(): void {
  _cachedAllowlist = null;
}

/**
 * Sandboxed fetch — validates the URL against the domain allowlist
 * before making the request. Returns a 403 Response if blocked.
 */
export async function sandboxedFetch(
  url: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const urlString = typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url;
  const allowlist = await getAllowlist();

  if (!isAllowedUrl(urlString, allowlist)) {
    logger.warn("Request blocked by sandbox", { url: urlString });
    return new Response(
      JSON.stringify({ error: "blocked_by_sandbox", url: urlString }),
      { status: 403, statusText: "Forbidden", headers: { "Content-Type": "application/json" } },
    );
  }

  return fetch(url, init);
}
