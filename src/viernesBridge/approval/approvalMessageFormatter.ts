import type { IntegrationActionApprovalRequest } from "../../integrations/actions/approval/types.js";
import type { ProposedIntegrationAction } from "../../integrations/actions/types.js";
import type { ViernesApprovalMessage } from "./types.js";

function actionLabel(action: ProposedIntegrationAction): string {
  return `${action.integration}.${action.action}`;
}

export function formatApprovalRequestForWhatsApp(
  approvalRequest: IntegrationActionApprovalRequest,
  action: ProposedIntegrationAction,
  requestId?: string,
): ViernesApprovalMessage {
  const instructions = [
    `Para aprobar: aprobar ${approvalRequest.actCode}`,
    `Para rechazar: rechazar ${approvalRequest.actCode}`,
    "Local/dev only: este ACT no es un secreto de proveedor.",
    "No se envia ningun mensaje ni se ejecutan escrituras desde esta respuesta.",
  ] as const;

  const lines = [
    "ORQUESTADOR-PRIME solicita aprobacion ACT local/dev.",
    `Accion: ${action.title}`,
    `Contrato: ${actionLabel(action)}`,
    `Riesgo: ${action.riskLevel}`,
    `Approval: ${approvalRequest.id}`,
    `Expira: ${approvalRequest.expiresAt}`,
    `ACT: ${approvalRequest.actCode}`,
    "",
    ...instructions,
  ];

  return {
    ...(requestId ? { requestId } : {}),
    approvalId: approvalRequest.id,
    actionId: action.id,
    text: lines.join("\n"),
    riskLevel: action.riskLevel,
    expiresAt: approvalRequest.expiresAt,
    instructions,
  };
}
