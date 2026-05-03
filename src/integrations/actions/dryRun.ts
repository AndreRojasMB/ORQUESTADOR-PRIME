import type {
  IntegrationActionValidationResult,
  ProposedIntegrationAction,
} from "./types.js";

function nowIso(): string {
  return new Date().toISOString();
}

const BASIC_EVIDENCE_PLAN = {
  summary: "Capture validation result and dry-run proposal metadata only.",
  steps: [
    "Record action id, integration, action, and risk level.",
    "Record validator reasons without secrets or provider responses.",
  ],
} as const;

const BASIC_ROLLBACK_PLAN = {
  summary: "No remote change occurs in dry-run; rollback is not required.",
  steps: [
    "Confirm no executor was called.",
    "Discard the proposal or revise it before any future approval flow.",
  ],
} as const;

export function buildExampleIntegrationActions(): ProposedIntegrationAction[] {
  return [
    {
      id: "act-example-github-read-status",
      integration: "github",
      action: "read_repo_status",
      title: "Dry-run GitHub repo status read",
      description: "Validate a low-risk read-only GitHub action proposal.",
      riskLevel: "low",
      requiresApproval: true,
      dryRunOnly: true,
      input: {
        owner: "example-owner",
        repo: "example-repo",
      },
      expectedOutcome: "A future executor would read repository metadata only.",
      createdAt: nowIso(),
    },
    {
      id: "act-example-whatsapp-send-blocked",
      integration: "whatsapp",
      action: "send_message",
      title: "Blocked WhatsApp message send",
      description: "Demonstrate that sending messages requires approval.",
      riskLevel: "high",
      requiresApproval: false,
      dryRunOnly: true,
      input: {
        to: "redacted-local-recipient",
        messageTemplate: "example-template-name",
      },
      expectedOutcome: "The validator blocks the proposal before any provider call.",
      evidencePlan: BASIC_EVIDENCE_PLAN,
      createdAt: nowIso(),
    },
    {
      id: "act-example-github-real-execution-blocked",
      integration: "github",
      action: "create_issue",
      title: "Blocked GitHub issue creation",
      description: "Demonstrate that real execution is disabled in this phase.",
      riskLevel: "medium",
      requiresApproval: true,
      dryRunOnly: false,
      input: {
        owner: "example-owner",
        repo: "example-repo",
        title: "Example issue title",
      },
      expectedOutcome: "The validator blocks the proposal because dryRunOnly is false.",
      createdAt: nowIso(),
    },
    {
      id: "act-example-coolify-deploy-dry-run",
      integration: "coolify",
      action: "deploy_application",
      title: "Documented Coolify deployment dry-run",
      description: "Demonstrate critical action rollback and dry-run requirements.",
      riskLevel: "critical",
      requiresApproval: true,
      dryRunOnly: true,
      input: {
        applicationId: "example-application-id",
      },
      expectedOutcome: "The validator allows only a fully documented dry-run proposal.",
      evidencePlan: BASIC_EVIDENCE_PLAN,
      rollbackPlan: BASIC_ROLLBACK_PLAN,
      createdAt: nowIso(),
    },
  ];
}

type ValidatorModule = typeof import("./validator.js");

async function loadValidatorModule(): Promise<ValidatorModule> {
  return (await import(new URL("./validator.ts", import.meta.url).href)) as ValidatorModule;
}

export async function runIntegrationActionDryRun(
  actions: readonly ProposedIntegrationAction[] = buildExampleIntegrationActions(),
): Promise<IntegrationActionValidationResult[]> {
  const { validateProposedIntegrationAction } = await loadValidatorModule();
  return Promise.all(
    actions.map((action) => validateProposedIntegrationAction(action)),
  );
}
