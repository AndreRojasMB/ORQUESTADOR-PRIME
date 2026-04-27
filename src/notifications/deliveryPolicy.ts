import { createSafeError } from "../errors/errorTaxonomy.js";
import type { SafeError } from "../errors/errorTaxonomy.js";
import type { NotificationDeliveryPolicy } from "./types.js";

export type NotificationExternalTarget =
  | "whatsapp"
  | "omi"
  | "email"
  | "api"
  | "desktop";

const EXTERNAL_TARGETS: NotificationExternalTarget[] = [
  "whatsapp",
  "omi",
  "email",
  "api",
  "desktop",
];

export function createLocalInboxDeliveryPolicy(): NotificationDeliveryPolicy {
  return {
    localInbox: true,
    whatsapp: false,
    omi: false,
    email: false,
    api: false,
    desktop: false,
    blockedExternalTargets: EXTERNAL_TARGETS.slice(),
    reason: "Notifications are local inbox only in this phase.",
  };
}

export function isExternalNotificationTargetAllowed(
  target: NotificationExternalTarget,
): false {
  void target;
  return false;
}

export function blockedExternalDeliveryError(
  target: NotificationExternalTarget,
  correlationId?: string | null,
): SafeError {
  return createSafeError("notification.blocked", {
    correlationId: correlationId ?? null,
    safeMessage: `Notification delivery target ${target} is disabled in this phase.`,
    auditHint: "Use the local inbox. External notification delivery needs a later safety phase.",
  });
}
