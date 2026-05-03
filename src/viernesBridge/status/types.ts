import type { ViernesBridgeIntent, ViernesBridgeStatus } from "../types.js";

export type ViernesBridgeOperationalMode = "local_http" | "cli" | "unknown";

export type ViernesBridgeStoredStatus =
  | ViernesBridgeStatus
  | "unauthorized"
  | "invalid_request"
  | "error";

export interface ViernesBridgeStatusRecord {
  connected: boolean;
  mode: ViernesBridgeOperationalMode;
  writesEnabled: false;
  lastHandshakeAt?: string;
  lastStatus?: ViernesBridgeStoredStatus;
  lastIntent?: ViernesBridgeIntent | string;
  lastErrorCode?: string;
  requestId?: string;
}

export const DEFAULT_VIERNES_BRIDGE_STATUS: ViernesBridgeStatusRecord = {
  connected: false,
  mode: "unknown",
  writesEnabled: false,
};
