import { processViernesBridgeRequest } from "../src/viernesBridge/processor.ts";
import type { ViernesBridgeResponse } from "../src/viernesBridge/types.ts";
import { getIntegrationEnvSnapshot } from "../src/integrations/status.ts";

function splitAllowedRepos(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function firstAllowedRepo(value: string | undefined, owner: string | undefined): {
  owner?: string;
  repo?: string;
} {
  const first = splitAllowedRepos(value)[0];
  if (!first) return {};

  if (first.includes("/")) {
    const [repoOwner, repo] = first.split("/", 2);
    return {
      owner: owner ?? repoOwner,
      ...(repo ? { repo } : {}),
    };
  }

  return { ...(owner ? { owner } : {}), repo: first };
}

function safeResponse(response: ViernesBridgeResponse): string {
  return JSON.stringify(
    {
      requestId: response.requestId,
      status: response.status,
      summary: response.summary,
      proposedActions: response.proposedActions,
      blockedReasons: response.blockedReasons ?? [],
      approvalRequests: response.approvalRequests?.map((approval) => ({
        id: approval.id,
        actionId: approval.actionId,
        status: approval.status,
        expiresAt: approval.expiresAt,
      })) ?? [],
      executionResults: response.executionResults?.map((result) => ({
        integration: result.integration,
        action: result.action,
        status: result.status,
        mode: result.mode,
        blockedReasons: result.blockedReasons ?? [],
        evidenceRedacted: result.evidenceRedacted,
      })) ?? [],
      auditEventCount: response.auditIds?.length ?? 0,
    },
    null,
    2,
  );
}

async function main(): Promise<number> {
  const env = await getIntegrationEnvSnapshot();
  const githubTarget = firstAllowedRepo(env.GITHUB_ALLOWED_REPOS, env.GITHUB_OWNER);

  const requests = [
    {
      id: "viernes-demo-github-status",
      source: "local",
      messageText: "Check GitHub repo status",
      intent: "check_github_repo_status",
      context: {
        owner: githubTarget.owner ?? env.GITHUB_OWNER,
        ...(githubTarget.repo ? { repo: githubTarget.repo } : {}),
      },
    },
    {
      id: "viernes-demo-whatsapp-bridge",
      source: "local",
      messageText: "Validate WhatsApp bridge",
      intent: "validate_whatsapp_bridge",
      context: {
        ...(env.WHATSAPP_HEALTH_URL
          ? { targetUrl: env.WHATSAPP_HEALTH_URL }
          : {}),
      },
    },
    {
      id: "viernes-demo-send-blocked",
      source: "whatsapp",
      messageText: "Send WhatsApp message",
      intent: "send_whatsapp_message",
      context: {
        note: "message body intentionally omitted",
      },
    },
    {
      id: "viernes-demo-unknown",
      source: "local",
      messageText: "Do something unsupported",
      intent: "unknown",
    },
  ] as const;

  console.log("Viernes bridge demo:");
  for (const request of requests) {
    const response = await processViernesBridgeRequest(request);
    console.log(`- ${request.id}`);
    console.log(safeResponse(response));
  }
  console.log("- writes: none");
  return 0;
}

process.exitCode = await main();
