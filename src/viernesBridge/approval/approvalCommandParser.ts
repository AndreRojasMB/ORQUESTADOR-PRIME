import type { ViernesApprovalCommand } from "./types.js";

const APPROVE_WORDS = new Set(["aprobar", "apruebo", "autorizar"]);
const REJECT_WORDS = new Set(["rechazar", "rechazo", "cancelar"]);

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function parseApprovalCommand(text: string): ViernesApprovalCommand {
  const rawText = text;
  const normalized = normalizeText(text);
  const match = normalized.match(
    /^(aprobar|apruebo|autorizar|rechazar|rechazo|cancelar)\s+([A-Za-z0-9][A-Za-z0-9_-]*)(?:\s+(.+))?$/i,
  );

  if (!match) {
    return { type: "unknown", rawText };
  }

  const verb = match[1]?.toLowerCase();
  const actCode = match[2];
  const reason = match[3]?.trim();

  if (!verb || !actCode) {
    return { type: "unknown", rawText };
  }

  if (APPROVE_WORDS.has(verb)) {
    return {
      type: "approve",
      actCode,
      rawText,
    };
  }

  if (REJECT_WORDS.has(verb)) {
    return {
      type: "reject",
      actCode,
      ...(reason ? { reason } : {}),
      rawText,
    };
  }

  return { type: "unknown", rawText };
}
