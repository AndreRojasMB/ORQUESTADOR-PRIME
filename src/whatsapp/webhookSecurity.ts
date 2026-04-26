// src/whatsapp/webhookSecurity.ts
// Pure inbound webhook security helpers for WhatsApp/n8n/Twilio transport.
// No logging here: callers must log only safe reason codes, never raw bodies,
// phone numbers, tokens, or provider secrets.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// ─── Decision types ─────────────────────────────────────────────

export type WhatsAppWebhookSecurityReasonCode =
  | "allowed"
  | "missing-hook-token"
  | "invalid-hook-token"
  | "missing-n8n-shared-secret"
  | "invalid-n8n-shared-secret"
  | "missing-stable-message-id"
  | "twilio-signature-context-missing"
  | "twilio-signature-invalid";

export interface WhatsAppWebhookSecurityDecision {
  ok: boolean;
  reasonCode: WhatsAppWebhookSecurityReasonCode;
  statusCode: number;
  safeMessage: string;
}

export interface HookTokenValidationInput {
  presentedToken?: string | null | undefined;
  expectedToken?: string | null | undefined;
}

export interface N8nSharedSecretValidationInput {
  presentedSecret?: string | null | undefined;
  expectedSecret?: string | null | undefined;
}

export interface StableMessageIdValidationInput {
  messageId?: string | null | undefined;
  requireStableMessageId: boolean;
}

export interface TwilioSignatureValidationInput {
  enabled: boolean;
  authToken?: string | null | undefined;
  publicUrl?: string | null | undefined;
  signature?: string | null | undefined;
  params?: Record<string, string> | null | undefined;
}

export interface InboundWhatsAppTransportValidationInput {
  hookToken?: string | null | undefined;
  expectedHookToken?: string | null | undefined;
  n8nSharedSecret?: string | null | undefined;
  expectedN8nSharedSecret?: string | null | undefined;
  messageId?: string | null | undefined;
  requireStableMessageId: boolean;
  validateTwilioSignature: boolean;
  twilioAuthToken?: string | null | undefined;
  twilioWebhookPublicUrl?: string | null | undefined;
  twilioSignature?: string | null | undefined;
  twilioParams?: Record<string, string> | null | undefined;
}

// ─── Shared helpers ─────────────────────────────────────────────

function allowed(): WhatsAppWebhookSecurityDecision {
  return {
    ok: true,
    reasonCode: "allowed",
    statusCode: 200,
    safeMessage: "Allowed",
  };
}

function blocked(
  reasonCode: Exclude<WhatsAppWebhookSecurityReasonCode, "allowed">,
  statusCode: number,
  safeMessage: string,
): WhatsAppWebhookSecurityDecision {
  return {
    ok: false,
    reasonCode,
    statusCode,
    safeMessage,
  };
}

function nonEmpty(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function timingSafeSecretEqual(
  presented: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (!nonEmpty(presented) || !nonEmpty(expected)) {
    return false;
  }

  // Hash first so timingSafeEqual always compares fixed-length buffers and
  // does not leak secret length differences.
  const presentedHash = createHash("sha256").update(presented).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(presentedHash, expectedHash);
}

// ─── Hook token / n8n shared secret ─────────────────────────────

export function validateHookToken(
  input: HookTokenValidationInput,
): WhatsAppWebhookSecurityDecision {
  if (!nonEmpty(input.expectedToken) || !nonEmpty(input.presentedToken)) {
    return blocked(
      "missing-hook-token",
      401,
      "Webhook authentication failed.",
    );
  }

  if (!timingSafeSecretEqual(input.presentedToken, input.expectedToken)) {
    return blocked(
      "invalid-hook-token",
      401,
      "Webhook authentication failed.",
    );
  }

  return allowed();
}

export function validateN8nSharedSecret(
  input: N8nSharedSecretValidationInput,
): WhatsAppWebhookSecurityDecision {
  // Optional hardening: if no expected secret is configured, this gate is off.
  if (!nonEmpty(input.expectedSecret)) {
    return allowed();
  }

  if (!nonEmpty(input.presentedSecret)) {
    return blocked(
      "missing-n8n-shared-secret",
      401,
      "Webhook authentication failed.",
    );
  }

  if (!timingSafeSecretEqual(input.presentedSecret, input.expectedSecret)) {
    return blocked(
      "invalid-n8n-shared-secret",
      401,
      "Webhook authentication failed.",
    );
  }

  return allowed();
}

// ─── Stable source event ids ────────────────────────────────────

export function validateStableMessageId(
  input: StableMessageIdValidationInput,
): WhatsAppWebhookSecurityDecision {
  if (!input.requireStableMessageId) {
    return allowed();
  }

  if (!nonEmpty(input.messageId)) {
    return blocked(
      "missing-stable-message-id",
      400,
      "Webhook payload must include a stable message id.",
    );
  }

  return allowed();
}

// ─── Twilio signature validation ────────────────────────────────

function buildTwilioSignatureBase(
  publicUrl: string,
  params: Record<string, string>,
): string {
  return Object.keys(params)
    .sort()
    .reduce((acc, key) => `${acc}${key}${params[key] ?? ""}`, publicUrl);
}

export function validateTwilioSignature(
  input: TwilioSignatureValidationInput,
): WhatsAppWebhookSecurityDecision {
  if (!input.enabled) {
    return allowed();
  }

  if (
    !nonEmpty(input.authToken) ||
    !nonEmpty(input.publicUrl) ||
    !nonEmpty(input.signature) ||
    !input.params ||
    Object.keys(input.params).length === 0
  ) {
    return blocked(
      "twilio-signature-context-missing",
      401,
      "Twilio signature validation is enabled but required context is missing.",
    );
  }

  const base = buildTwilioSignatureBase(input.publicUrl, input.params);
  const expected = createHmac("sha1", input.authToken)
    .update(base)
    .digest("base64");

  if (!timingSafeSecretEqual(input.signature, expected)) {
    return blocked(
      "twilio-signature-invalid",
      401,
      "Webhook signature validation failed.",
    );
  }

  return allowed();
}

// ─── Combined transport validation ──────────────────────────────

export function validateInboundWhatsAppTransport(
  input: InboundWhatsAppTransportValidationInput,
): WhatsAppWebhookSecurityDecision {
  const hook = validateHookToken({
    presentedToken: input.hookToken,
    expectedToken: input.expectedHookToken,
  });
  if (!hook.ok) return hook;

  const n8nSecret = validateN8nSharedSecret({
    presentedSecret: input.n8nSharedSecret,
    expectedSecret: input.expectedN8nSharedSecret,
  });
  if (!n8nSecret.ok) return n8nSecret;

  const stableId = validateStableMessageId({
    messageId: input.messageId,
    requireStableMessageId: input.requireStableMessageId,
  });
  if (!stableId.ok) return stableId;

  const twilio = validateTwilioSignature({
    enabled: input.validateTwilioSignature,
    authToken: input.twilioAuthToken,
    publicUrl: input.twilioWebhookPublicUrl,
    signature: input.twilioSignature,
    params: input.twilioParams,
  });
  if (!twilio.ok) return twilio;

  return allowed();
}
