// LOCAL TESTING ONLY — not for production use.
// CLI script that calls processInboundWebhook() with a JSON payload from stdin.
//
// Usage:
//   echo '{"sender":"+51912996652","messageId":"test-1","text":"plan a SaaS CRM"}' \
//     | npm run whatsapp:test -- myHookToken
//
//   echo '{"sender":"+51912996652","messageId":"test-2","text":"audit my repo"}' \
//     | tsx scripts/whatsapp-test.ts myHookToken

import { processInboundWebhook } from "../src/whatsapp/bridge.js";

async function main(): Promise<void> {
  const hookToken = process.argv[2];

  if (!hookToken) {
    console.error("Usage: tsx scripts/whatsapp-test.ts <hookToken>");
    console.error('  Pipe JSON payload via stdin, e.g.:');
    console.error(
      '  echo \'{"sender":"+51912996652","messageId":"test-1","text":"plan a SaaS CRM"}\' | tsx scripts/whatsapp-test.ts mytoken',
    );
    process.exit(1);
  }

  // Read JSON payload from stdin
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf-8").trim();

  if (!raw) {
    console.error("Error: no payload received on stdin");
    process.exit(1);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    console.error("Error: invalid JSON on stdin");
    process.exit(1);
  }

  const reply = await processInboundWebhook(payload, hookToken);

  if (reply) {
    console.log(JSON.stringify(reply, null, 2));
  } else {
    console.log(JSON.stringify({ result: null }, null, 2));
  }
}

main().catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
