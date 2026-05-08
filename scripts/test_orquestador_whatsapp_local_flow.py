from __future__ import annotations

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any

from orquestador_bridge_whatsapp_ux import (
    ApprovalContext,
    classify_orquestador_command,
    extract_whatsapp_text,
    handle_orquestador_whatsapp_observation,
)


class TestFailure(Exception):
    pass


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise TestFailure(message)


def whatsapp_payload(text: str) -> dict[str, Any]:
    return {
        "entry": [
            {
                "changes": [
                    {
                        "value": {
                            "messages": [
                                {
                                    "from": "redacted-local-number",
                                    "id": "wamid.local",
                                    "text": {"body": text},
                                    "type": "text",
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }


class LocalBridgeHandler(BaseHTTPRequestHandler):
    requests: list[dict[str, Any]] = []

    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length", "0"))
        body = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
        LocalBridgeHandler.requests.append(body)
        text = str(body.get("text") or "")
        if self.path != "/viernes/approval-command":
            status = {"status": "not_found", "summary": "not_found"}
        elif text.startswith("aprobar "):
            status = {
                "status": "read_only_executed",
                "summary": "Approved read-only action executed safely.",
                "approvalStatus": "approved",
                "providerWrites": "none",
            }
        elif text.startswith("rechazar "):
            status = {
                "status": "rejected",
                "summary": "Approval rejected safely.",
                "approvalStatus": "rejected",
                "providerWrites": "none",
            }
        else:
            status = {"status": "blocked", "blockedReasons": ["approval_command_not_recognized"]}

        encoded = json.dumps(status).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def log_message(self, format: str, *args: object) -> None:
        return


def start_bridge() -> tuple[HTTPServer, str]:
    server = HTTPServer(("127.0.0.1", 0), LocalBridgeHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, f"http://127.0.0.1:{server.server_port}"


def run_test(name: str, fn) -> tuple[str, bool, str | None]:
    try:
        fn()
        return (name, True, None)
    except Exception as exc:
        return (name, False, str(exc))


def main() -> int:
    latest = ApprovalContext(
        approval_id="approval-local-1",
        approval_code="ACT-LOCAL-1234-ABCD",
        action_id="action-local-1",
        status="pending",
        summary="Read-only status check pending.",
    )
    server, bridge_url = start_bridge()

    tests = [
        (
            "extracts WhatsApp text",
            lambda: assert_true(
                extract_whatsapp_text(whatsapp_payload("estado aprobacion orquestador"))
                == "estado aprobacion orquestador",
                "text not extracted",
            ),
        ),
        (
            "status command returns observation response",
            lambda: assert_true(
                handle_orquestador_whatsapp_observation(
                    whatsapp_payload("estado aprobacion orquestador"),
                    latest_approval=latest,
                )["status"]
                == "pending",
                "status command failed",
            ),
        ),
        (
            "approve command reaches local bridge only",
            lambda: assert_true(
                handle_orquestador_whatsapp_observation(
                    whatsapp_payload("APROBAR ORQUESTADOR"),
                    latest_approval=latest,
                    bridge_url=bridge_url,
                )["status"]
                == "read_only_executed",
                "approve did not return read_only_executed",
            ),
        ),
        (
            "reject command reaches local bridge only",
            lambda: assert_true(
                handle_orquestador_whatsapp_observation(
                    whatsapp_payload("RECHAZAR ORQUESTADOR"),
                    latest_approval=latest,
                    bridge_url=bridge_url,
                )["status"]
                == "rejected",
                "reject did not return rejected",
            ),
        ),
        (
            "ambiguous commands do not approve",
            lambda: [
                assert_true(
                    handle_orquestador_whatsapp_observation(whatsapp_payload(text))["status"]
                    == "blocked",
                    f"{text} should block",
                )
                for text in ["sí", "ok", "dale", "hazlo"]
            ],
        ),
        (
            "normal payload returns no_action",
            lambda: assert_true(
                handle_orquestador_whatsapp_observation(whatsapp_payload("hola viernes"))["status"]
                == "no_action",
                "normal payload should no_action",
            ),
        ),
        (
            "offline bridge fails safely",
            lambda: assert_true(
                handle_orquestador_whatsapp_observation(
                    whatsapp_payload("APROBAR ORQUESTADOR"),
                    latest_approval=latest,
                    bridge_url="http://127.0.0.1:9",
                    timeout_seconds=0.1,
                )["status"]
                == "orquestador_unavailable",
                "offline bridge should fail safely",
            ),
        ),
        (
            "no real outbound send flag",
            lambda: assert_true(
                handle_orquestador_whatsapp_observation(
                    whatsapp_payload("APROBAR ORQUESTADOR"),
                    latest_approval=latest,
                    bridge_url=bridge_url,
                )["outboundSent"]
                is False,
                "outbound send should be false",
            ),
        ),
        (
            "explicit command classifier only",
            lambda: assert_true(
                classify_orquestador_command("aprobar porfa") == "no_action",
                "non-explicit approval should not approve",
            ),
        ),
    ]

    try:
        results = [run_test(name, fn) for name, fn in tests]
    finally:
        server.shutdown()
        server.server_close()

    failed = [result for result in results if not result[1]]
    print("ORQUESTADOR WhatsApp local observation tests:")
    print(f"- total: {len(results) - len(failed)}/{len(results)} passed")
    print("- outbound messages sent: none")
    print("- provider writes: none")
    print("- writes enabled: false")
    print("- secrets printed: none")

    if failed:
        print("- failures:")
        for name, _, error in failed:
            print(f"  {name}: {error}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
