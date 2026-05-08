"""Local WhatsApp observation adapter for ORQUESTADOR approval UX.

This module is intentionally side-effect-light:
- it does not send WhatsApp messages;
- it does not read env files, vaults, or tokens;
- it does not create approvals or proposals;
- it only calls a caller-provided local ORQUESTADOR bridge URL when asked.
"""

from __future__ import annotations

import json
import re
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any, Callable


APPROVE_COMMANDS = {
    "aprobar orquestador",
    "aprobar ultima de orquestador",
}
REJECT_COMMANDS = {
    "rechazar orquestador",
    "rechazar ultima de orquestador",
}
STATUS_COMMANDS = {
    "estado aprobacion orquestador",
}
LATEST_COMMANDS = {
    "ultima aprobacion orquestador",
}
CANCEL_COMMANDS = {
    "cancelar aprobacion orquestador",
}
AMBIGUOUS_COMMANDS = {"si", "sí", "ok", "dale", "hazlo"}


@dataclass(frozen=True)
class ApprovalContext:
    approval_id: str
    approval_code: str
    action_id: str | None = None
    status: str = "pending"
    summary: str = "ORQUESTADOR approval pending."


def normalize_inbound_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def extract_whatsapp_text(payload: dict[str, Any]) -> str | None:
    for key in ("text", "body", "Body", "message", "Message"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()

    try:
        messages = payload["entry"][0]["changes"][0]["value"]["messages"]
        if isinstance(messages, list) and messages:
            message = messages[0]
            if isinstance(message, dict):
                text = message.get("text")
                if isinstance(text, dict) and isinstance(text.get("body"), str):
                    return text["body"].strip()
                button = message.get("button")
                if isinstance(button, dict) and isinstance(button.get("text"), str):
                    return button["text"].strip()
                interactive = message.get("interactive")
                if isinstance(interactive, dict):
                    reply = interactive.get("button_reply") or interactive.get("list_reply")
                    if isinstance(reply, dict) and isinstance(reply.get("title"), str):
                        return reply["title"].strip()
    except (KeyError, IndexError, TypeError):
        return None

    return None


def classify_orquestador_command(text: str) -> str:
    normalized = normalize_inbound_text(text)
    if normalized in APPROVE_COMMANDS:
        return "approve_latest"
    if normalized in REJECT_COMMANDS:
        return "reject_latest"
    if normalized in STATUS_COMMANDS:
        return "status"
    if normalized in LATEST_COMMANDS:
        return "latest"
    if normalized in CANCEL_COMMANDS:
        return "cancel"
    if normalized in AMBIGUOUS_COMMANDS:
        return "ambiguous"
    return "no_action"


def _safe_response(
    *,
    command: str,
    status: str,
    text_to_send: str,
    bridge_response: dict[str, Any] | None = None,
) -> dict[str, Any]:
    response: dict[str, Any] = {
        "mode": "observation_only",
        "command": command,
        "status": status,
        "textToSend": text_to_send,
        "outboundSent": False,
        "providerWrites": "none",
        "writesEnabled": False,
    }
    if bridge_response is not None:
        response["bridgeResponse"] = {
            key: value
            for key, value in bridge_response.items()
            if key
            in {
                "status",
                "summary",
                "approvalId",
                "actionId",
                "approvalStatus",
                "blockedReasons",
                "createdAt",
            }
        }
    return response


def _approval_command_text(command: str, context: ApprovalContext) -> str:
    if command == "approve_latest":
        return f"aprobar {context.approval_code}"
    if command == "reject_latest":
        return f"rechazar {context.approval_code}"
    raise ValueError("unsupported approval command")


def _post_bridge_approval_command(
    *,
    bridge_url: str,
    command: str,
    context: ApprovalContext,
    timeout_seconds: float,
    opener: Callable[..., Any] | None,
) -> dict[str, Any]:
    body: dict[str, Any] = {
        "type": "approval_command",
        "text": _approval_command_text(command, context),
        "approvalId": context.approval_id,
        "source": "whatsapp",
    }
    if context.action_id:
        body["actionId"] = context.action_id

    encoded = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(
        f"{bridge_url.rstrip('/')}/viernes/approval-command",
        data=encoded,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    open_fn = opener or urllib.request.urlopen
    with open_fn(request, timeout=timeout_seconds) as response:
        raw = response.read().decode("utf-8")
    parsed = json.loads(raw or "{}")
    return parsed if isinstance(parsed, dict) else {"status": "error"}


def handle_orquestador_whatsapp_observation(
    payload: dict[str, Any],
    *,
    latest_approval: ApprovalContext | dict[str, Any] | None = None,
    bridge_url: str | None = None,
    timeout_seconds: float = 2.0,
    opener: Callable[..., Any] | None = None,
) -> dict[str, Any]:
    text = extract_whatsapp_text(payload)
    if not text:
        return _safe_response(
            command="invalid_payload",
            status="no_action",
            text_to_send="No se detecto texto WhatsApp utilizable.",
        )

    command = classify_orquestador_command(text)
    if command == "ambiguous":
        return _safe_response(
            command=command,
            status="blocked",
            text_to_send=(
                "Comando ambiguo: no se aprobo ni rechazo ORQUESTADOR. "
                "Usa APROBAR ORQUESTADOR o RECHAZAR ORQUESTADOR."
            ),
        )
    if command == "no_action":
        return _safe_response(
            command=command,
            status="no_action",
            text_to_send="Mensaje no relacionado con aprobacion ORQUESTADOR.",
        )

    context = _coerce_context(latest_approval)
    if command in {"status", "latest"}:
        if not context:
            return _safe_response(
                command=command,
                status="not_found",
                text_to_send="No hay aprobacion ORQUESTADOR pendiente en contexto local.",
            )
        return _safe_response(
            command=command,
            status=context.status,
            text_to_send=f"Ultima aprobacion ORQUESTADOR: {context.status}. {context.summary}",
        )

    if command == "cancel":
        return _safe_response(
            command=command,
            status="cancelled_metadata_only",
            text_to_send="Solicitud de cancelacion registrada solo como observacion local.",
        )

    if command in {"approve_latest", "reject_latest"}:
        if not context:
            return _safe_response(
                command=command,
                status="not_found",
                text_to_send="No hay aprobacion ORQUESTADOR pendiente para correlacionar.",
            )
        if not bridge_url:
            return _safe_response(
                command=command,
                status="bridge_not_configured",
                text_to_send=(
                    "ORQUESTADOR no esta conectado en este adaptador de observacion; "
                    "no se envio ningun mensaje real."
                ),
            )
        try:
            bridge_response = _post_bridge_approval_command(
                bridge_url=bridge_url,
                command=command,
                context=context,
                timeout_seconds=timeout_seconds,
                opener=opener,
            )
        except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError):
            return _safe_response(
                command=command,
                status="orquestador_unavailable",
                text_to_send="ORQUESTADOR no disponible; no se ejecuto ninguna accion.",
            )

        status = str(bridge_response.get("status") or "unknown")
        if status in {"read_only_executed", "rejected", "approved", "blocked", "not_found"}:
            text_to_send = f"ORQUESTADOR respondio: {status}."
        else:
            text_to_send = "ORQUESTADOR respondio de forma no reconocida; revisar manualmente."
        return _safe_response(
            command=command,
            status=status,
            text_to_send=text_to_send,
            bridge_response=bridge_response,
        )

    return _safe_response(
        command=command,
        status="no_action",
        text_to_send="Sin accion para el comando recibido.",
    )


def _coerce_context(value: ApprovalContext | dict[str, Any] | None) -> ApprovalContext | None:
    if isinstance(value, ApprovalContext):
        return value
    if not isinstance(value, dict):
        return None

    approval_id = value.get("approvalId") or value.get("approval_id")
    approval_code = value.get("approvalCode") or value.get("approval_code")
    if not isinstance(approval_id, str) or not approval_id.strip():
        return None
    if not isinstance(approval_code, str) or not approval_code.strip():
        return None

    action_id = value.get("actionId") or value.get("action_id")
    status = value.get("status")
    summary = value.get("summary")
    return ApprovalContext(
        approval_id=approval_id.strip(),
        approval_code=approval_code.strip(),
        action_id=action_id.strip() if isinstance(action_id, str) and action_id.strip() else None,
        status=status.strip() if isinstance(status, str) and status.strip() else "pending",
        summary=summary.strip()
        if isinstance(summary, str) and summary.strip()
        else "ORQUESTADOR approval pending.",
    )
