// src/whatsapp/bridge.ts
// Transport boundary — single entry point for external callers.
// Verifies hook token, normalizes payload, delegates to handler.
// Future channels (Telegram, Slack, dashboard) follow this same pattern.

import { timingSafeEqual } from "node:crypto";
import { readUserConfig } from "../config/userConfigStore.js";
import { logger } from "../observability/logger.js";
import { parseWhatsAppPayload } from "./messageParser.js";
import { handleWhatsAppMessage } from "./handler.js";
import type { ChannelReply } from "./types.js";

/**
 * Processes an inbound WhatsApp webhook payload.
 * This is the ONLY function external callers (n8n adapter, test harness) invoke.
 *
 * @param rawPayload — the raw JSON body from the webhook
 * @param hookToken  — the token sent by the caller for verification
 * @returns a ChannelReply to send back, or null if processing was skipped
 */
export async function processInboundWebhook(
  rawPayload: unknown,
  hookToken: string,
): Promise<ChannelReply | null> {
  // 1. Read config
  const config = await readUserConfig();

  // 2. Verify hook token at the transport boundary (timing-safe)
  const expected = config.whatsapp.hookToken;
  if (
    !expected ||
    expected.length !== hookToken.length ||
    !timingSafeEqual(Buffer.from(hookToken), Buffer.from(expected))
  ) {
    logger.warn("whatsapp:bridge — invalid hook token");
    return null;
  }

  // 3. Parse and normalize payload
  const message = parseWhatsAppPayload(rawPayload);
  if (!message) {
    logger.warn("whatsapp:bridge — malformed payload");
    return null;
  }

  // 4. Delegate to handler (auth already verified)
  return handleWhatsAppMessage(message, config);
}
