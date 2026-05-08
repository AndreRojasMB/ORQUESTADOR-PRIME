// scripts/whatsapp-approval-bridge-tests.ts
// Focused smoke tests for the feature-flagged ORQUESTADOR WhatsApp approval bridge.

import { createHash } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { strict as assert } from "node:assert";
import { DEFAULT_USER_CONFIG, type UserConfig } from "../src/config/userConfig.js";
import { handleWhatsAppMessage } from "../src/whatsapp/handler.js";
import type { ChannelMessage } from "../src/whatsapp/types.js";

const PHONE = "+15550126000";
const PHONE_HASH = createHash("sha256").update(PHONE).digest("hex");

interface BridgeCapture {
  requests: unknown[];
  close: () => Promise<void>;
  url: string;
}

function makeConfig(
  bridgeUrl?: string,
  overrides: Record<string, unknown> = {},
): UserConfig {
  return {
    ...DEFAULT_USER_CONFIG,
    whatsapp: {
      ...DEFAULT_USER_CONFIG.whatsapp,
      enabled: true,
      allowedPhones: [PHONE],
      maxMessagesPerHour: 1_000,
      safeModes: ["plan", "audit"],
      ...overrides,
      ...(bridgeUrl
        ? {
            orquestadorApprovalBridgeEnabled: true,
            orquestadorApprovalBridgeUrl: bridgeUrl,
            orquestadorApprovalBridgeLatest: {
              approvalId: "approval-local-1",
              approvalCode: "ACT-LOCAL-1234",
              actionId: "action-local-1",
              status: "pending",
              summary: "Local approval pending.",
            },
          }
        : {}),
    } as UserConfig["whatsapp"] & Record<string, unknown>,
  };
}

function makeMessage(text: string, messageId: string): ChannelMessage {
  return {
    senderHash: PHONE_HASH,
    senderRaw: PHONE,
    messageId,
    text,
    timestamp: Date.now(),
    channel: "whatsapp",
  };
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function startBridge(status: "read_only_executed" | "rejected"): Promise<BridgeCapture> {
  const requests: unknown[] = [];
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== "POST" || req.url !== "/viernes/approval-command") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "not_found" }));
      return;
    }

    requests.push(await readJson(req));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status,
        summary: status === "read_only_executed" ? "approved locally" : "rejected locally",
        approvalId: "approval-local-1",
      }),
    );
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected local bridge TCP address.");
  }

  return {
    requests,
    url: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

async function testFlagOffKeepsNormalRouting(): Promise<void> {
  const reply = await handleWhatsAppMessage(
    makeMessage("actions help", "flag-off-actions-help"),
    makeConfig(undefined, { orquestadorApprovalBridgeEnabled: false }),
  );

  assert(reply);
  assert(reply.text.includes("[ACTIONS]"));
}

async function testFlagOnApprovesExactCommand(): Promise<void> {
  const bridge = await startBridge("read_only_executed");
  try {
    const reply = await handleWhatsAppMessage(
      makeMessage("APROBAR ORQUESTADOR", "flag-on-approve"),
      makeConfig(bridge.url),
    );

    assert(reply);
    assert(reply.text.includes("status=read_only_executed"));
    assert(reply.text.includes("outboundSent=false"));
    assert.equal(bridge.requests.length, 1);
    assert.deepEqual(bridge.requests[0], {
      type: "approval_command",
      text: "aprobar ACT-LOCAL-1234",
      approvalId: "approval-local-1",
      actionId: "action-local-1",
      source: "whatsapp",
    });
  } finally {
    await bridge.close();
  }
}

async function testFlagOnRejectsExactCommand(): Promise<void> {
  const bridge = await startBridge("rejected");
  try {
    const reply = await handleWhatsAppMessage(
      makeMessage("RECHAZAR ORQUESTADOR", "flag-on-reject"),
      makeConfig(bridge.url),
    );

    assert(reply);
    assert(reply.text.includes("status=rejected"));
    assert.equal(bridge.requests.length, 1);
  } finally {
    await bridge.close();
  }
}

async function testAmbiguousCommandIsBlocked(): Promise<void> {
  const bridge = await startBridge("read_only_executed");
  try {
    const reply = await handleWhatsAppMessage(
      makeMessage("ok", "flag-on-ambiguous"),
      makeConfig(bridge.url),
    );

    assert(reply);
    assert(reply.text.includes("status=blocked"));
    assert.equal(bridge.requests.length, 0);
  } finally {
    await bridge.close();
  }
}

async function testUnrelatedMessageContinuesNormalRouting(): Promise<void> {
  const bridge = await startBridge("read_only_executed");
  try {
    const reply = await handleWhatsAppMessage(
      makeMessage("actions help", "flag-on-actions-help"),
      makeConfig(bridge.url),
    );

    assert(reply);
    assert(reply.text.includes("[ACTIONS]"));
    assert.equal(bridge.requests.length, 0);
  } finally {
    await bridge.close();
  }
}

async function testOfflineBridgeIsSafe(): Promise<void> {
  const reply = await handleWhatsAppMessage(
    makeMessage("APROBAR ORQUESTADOR", "flag-on-offline"),
    makeConfig("http://127.0.0.1:9"),
  );

  assert(reply);
  assert(reply.text.includes("status=orquestador_unavailable"));
  assert(reply.text.includes("providerWrites=none"));
}

async function main(): Promise<void> {
  const tests: Array<[string, () => Promise<void>]> = [
    ["flag off keeps normal routing", testFlagOffKeepsNormalRouting],
    ["flag on approves exact command", testFlagOnApprovesExactCommand],
    ["flag on rejects exact command", testFlagOnRejectsExactCommand],
    ["ambiguous command is blocked", testAmbiguousCommandIsBlocked],
    ["unrelated message continues normal routing", testUnrelatedMessageContinuesNormalRouting],
    ["offline bridge is safe", testOfflineBridgeIsSafe],
  ];

  for (const [name, test] of tests) {
    await test();
    console.log(`ok - ${name}`);
  }

  console.log(`${tests.length}/${tests.length} whatsapp approval bridge tests passed`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
