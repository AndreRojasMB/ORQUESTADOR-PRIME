import { createApprovalGate } from "../src/integrations/actions/approval/approvalGate.ts";
import { createActionAuditTrail } from "../src/integrations/actions/audit/auditTrail.ts";
import { createExecutionGate } from "../src/integrations/actions/executors/executionGate.ts";
import type { IntegrationActionExecutionResult } from "../src/integrations/actions/executors/types.ts";
import { validateIntegrationActionPolicy } from "../src/integrations/actions/policy/policyValidator.ts";
import { validateProposedIntegrationAction } from "../src/integrations/actions/validator.ts";
import { getIntegrationEnvSnapshot } from "../src/integrations/status.ts";
import type { ProposedIntegrationAction } from "../src/integrations/actions/types.ts";

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

function makeAction(
  id: string,
  owner: string | undefined,
  repo: string | undefined,
): ProposedIntegrationAction {
  return {
    id,
    integration: "github",
    action: "read_repo_status",
    title: "Read GitHub repository status",
    description: "Read minimal GitHub repository metadata through the safe execution gate.",
    riskLevel: "low",
    requiresApproval: true,
    dryRunOnly: true,
    input: {
      ...(owner ? { owner } : {}),
      ...(repo ? { repo } : {}),
    },
    expectedOutcome: "Safe read-only GitHub repository status evidence.",
    createdAt: new Date().toISOString(),
  };
}

function printResult(label: string, result: IntegrationActionExecutionResult): void {
  console.log(`- ${label}`);
  console.log(`  status: ${result.status}`);
  console.log(`  mode: ${result.mode}`);
  console.log(`  blockedReasons: ${result.blockedReasons?.join(", ") ?? "none"}`);
  console.log(`  evidence: ${JSON.stringify(result.evidenceRedacted ?? {})}`);
}

async function runAction(
  action: ProposedIntegrationAction,
): Promise<IntegrationActionExecutionResult> {
  const approvalGate = await createApprovalGate();
  const auditTrail = await createActionAuditTrail();
  const executionGate = createExecutionGate({ approvalGate, auditTrail });

  await auditTrail.createActionAudit(action);

  const validation = await validateProposedIntegrationAction(action);
  console.log(`  validator: ${validation.allowed ? "allowed" : "blocked"}`);
  if (validation.reasons.length > 0) {
    console.log(`  validatorReasons: ${validation.reasons.join(", ")}`);
  }

  const policy = await validateIntegrationActionPolicy(action);
  console.log(`  policy: ${policy.allowed ? "allowed" : "blocked"}`);
  if (policy.reasons.length > 0) {
    console.log(`  policyReasons: ${policy.reasons.join(", ")}`);
  }

  const approval = await approvalGate.createApprovalRequest(action);
  await auditTrail.recordApprovalRequested(action, approval);
  await approvalGate.approveAction(approval.id, approval.actCode);
  const approved = await approvalGate.getApprovalStatus(approval.id);
  if (approved) await auditTrail.recordApprovalApproved(action, approved);

  const result = await executionGate.execute(action);
  const audit = await auditTrail.getAuditRecord(action.id);
  console.log(
    `  auditEvents: ${audit?.events.map((event) => event.eventType).join(", ") ?? "none"}`,
  );
  return result;
}

async function main(): Promise<number> {
  const env = await getIntegrationEnvSnapshot();
  const configuredOwner = env.GITHUB_OWNER;
  const selectedRepo = firstAllowedRepo(env.GITHUB_ALLOWED_REPOS, configuredOwner);
  const owner = selectedRepo.owner ?? configuredOwner;
  const repo = selectedRepo.repo;

  console.log("GitHub read_repo_status demo:");
  if (!repo) {
    console.log("- repo selection: none; owner-level readiness will be simulated safely");
  }

  const allowedAction = makeAction("github-read-demo-allowed", owner, repo);
  const allowedResult = await runAction(allowedAction);
  printResult("allowed owner/repo", allowedResult);

  const blockedAction = makeAction(
    "github-read-demo-blocked-owner",
    "not-allowed-owner",
    repo,
  );
  const blockedResult = await runAction(blockedAction);
  printResult("blocked owner", blockedResult);

  console.log("- writes: none");
  return 0;
}

process.exitCode = await main();
