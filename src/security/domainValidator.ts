// src/security/domainValidator.ts
// Validates URLs against a configurable domain allowlist.

const LOCALHOST_ALIASES = new Set(["localhost", "127.0.0.1", "::1"]);

/**
 * Returns true if the given URL's host matches an entry in the allowlist.
 *
 * Allowlist entry formats:
 *   - "api.openai.com"    → exact hostname match (any port)
 *   - "localhost:5678"    → exact hostname + port
 *   - "localhost:*"       → any port on localhost (and aliases 127.0.0.1, ::1)
 */
export function isAllowedUrl(url: string, allowlist: string[]): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false; // malformed URL → block
  }

  const hostname = parsed.hostname;
  const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");

  for (const entry of allowlist) {
    const colonIdx = entry.indexOf(":");
    if (colonIdx === -1) {
      // Exact hostname, any port
      if (hostname === entry) return true;
      continue;
    }

    const entryHost = entry.slice(0, colonIdx);
    const entryPort = entry.slice(colonIdx + 1);

    if (entryPort === "*") {
      // Wildcard port — match hostname or localhost aliases
      if (hostname === entryHost) return true;
      if (LOCALHOST_ALIASES.has(entryHost) && LOCALHOST_ALIASES.has(hostname)) {
        return true;
      }
      continue;
    }

    // Exact hostname + port
    if (hostname === entryHost && port === entryPort) return true;
    if (
      LOCALHOST_ALIASES.has(entryHost) &&
      LOCALHOST_ALIASES.has(hostname) &&
      port === entryPort
    ) {
      return true;
    }
  }

  return false;
}

/** Default domains always allowed. */
export const DEFAULT_ALLOWLIST = [
  "api.openai.com",
  "api.anthropic.com",
  "localhost:*",
];
