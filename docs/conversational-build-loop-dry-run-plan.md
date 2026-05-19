# Conversational Build Loop Dry-Run Plan

Status: source-only / advisory / metadata-only

## Purpose

Phase PILOT-3B plans a controlled Conversational Build Loop dry-run. The goal
is to simulate how a simple user idea can become structured mobile planning
artifacts and a passive Codex handoff prompt draft.

This phase creates planning documentation only. It does not implement source
modules, run the loop, invoke Codex, create app artifacts, or perform external
actions.

## Strategic Context

The current system already has:

- Autopilot real dry-run metadata from PILOT-1I
- Autopilot dry-run hardening and quality gates from PILOT-2I
- Mobile Factory metadata pipeline from phases 121-139
- Mobile Factory review and first dry-run metadata from 140I

PILOT-3B plans the next connective layer:

simple conversational idea -> intake metadata -> requirements metadata ->
feature metadata -> screen metadata -> API/design/quality/release/store
metadata -> prompt draft metadata -> human review.

## Conversational Loop Scope

The future dry-run should simulate:

- user simple idea
- app idea intake metadata
- requirements interview metadata
- feature blueprint metadata
- screen blueprint metadata
- API contract candidate metadata
- design system metadata
- quality, security, testing, release, and store metadata
- next artifact recommendation
- Codex prompt draft as metadata only
- human approval checkpoints

The dry-run must remain passive and source-only. Every stage should return
metadata and never trigger runtime behavior.

## Conversational Input Model

Future metadata:

```ts
interface ConversationalBuildLoopInput {
  conversationDryRunId: string;
  userIdeaText: string;
  userIntent: string;
  targetProjectType: string;
  clarificationDepth: "none" | "light" | "standard" | "deep";
  assumedAnswers: readonly string[];
  unresolvedQuestions: readonly string[];
  safetyBoundaries: readonly string[];
  expectedArtifactChain: readonly string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  requiredApprovals: readonly string[];
}
```

Planned default idea:

> Quiero una app movil de habitos gamificada con mundo vivo, progreso,
> recordatorios y premium futuro.

## Loop Stage Model

Future metadata:

```ts
interface ConversationalBuildLoopStage {
  stageId: string;
  stageName: string;
  inputRefs: readonly string[];
  outputRefs: readonly string[];
  requiredEvidence: readonly string[];
  humanApprovalRequired: boolean;
  canProceed: boolean;
  blockers: readonly string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  limitations: readonly string[];
}
```

Required stages:

- `idea_intake`
- `requirements_interview`
- `feature_blueprints`
- `screen_blueprints`
- `api_contracts`
- `design_system`
- `quality_security_release`
- `store_readiness`
- `prompt_draft`
- `human_review`

## Artifact Chain Model

Future metadata:

```ts
interface ConversationalBuildLoopArtifactChain {
  chainId: string;
  artifacts: readonly string[];
  completedStages: readonly string[];
  blockedStages: readonly string[];
  unresolvedQuestions: readonly string[];
  nextRecommendedArtifact: string;
  safeToDraftPrompt: boolean;
  safeToUsePrompt: boolean;
  limitations: readonly string[];
}
```

The artifact chain is successful only when unresolved questions remain visible
and the prompt draft remains review-gated.

## Prompt Draft Model

Future metadata:

```ts
interface ConversationalBuildLoopPromptDraft {
  promptDraftId: string;
  targetPhase: string;
  targetMode: "B" | "I";
  projectPath: string;
  branch: string;
  contextSummary: string;
  allowedFiles: readonly string[];
  forbiddenFiles: readonly string[];
  task: string;
  boundaries: readonly string[];
  verificationPlan: readonly string[];
  smokePlan: readonly string[];
  finalReportFormat: readonly string[];
  safeToUseForExecution: false;
  requiresHumanApproval: true;
}
```

The prompt draft is a string-only metadata object. It must not launch Codex or
start implementation work.

## Human Approval Checkpoints

The future dry-run should require human approval before:

- moving from requirements metadata to feature/screen planning when risks are high
- accepting privacy, safety, monetization, or store assumptions
- accepting a prompt draft for later handoff
- transitioning from dry-run evidence to an implementation phase
- storing any durable memory proposal

## Success Criteria

The dry-run is successful if:

- artifact chain is complete enough for review
- unresolved questions are explicit
- prompt draft exists but is not usable without approval
- safety boundaries are preserved in every stage
- no source-stage file writes happen
- no runtime behavior happens
- no external providers or actions happen

## Blocked Criteria

The dry-run should be marked blocked if:

- intake metadata is missing
- requirements metadata is missing
- no feature blueprints exist
- no screen blueprints exist
- prompt draft lacks safety boundaries
- prompt draft is marked usable without approval
- artifact chain hides unresolved questions
- approval is missing for high-risk action

## Integration Plan

PILOT-3I should consume:

- Autopilot dry-run hardening as scenario/gate discipline
- Mobile Factory first dry-run as the mobile artifact fixture
- PM metadata modules 121-140 as the planning substrate
- Codex handoff runner as a passive prompt-package shape
- validation and memory proposal modules as review-only checks
- next-action coordinator as recommendation metadata
- phase closeout coordinator as completion metadata

No future integration in PILOT-3I should call providers, mutate dashboards,
persist memory, or start implementation work.

## Future PILOT-3I Scope

Safe implementation scope:

- create `src/autopilot/conversationalBuildLoopDryRun.ts`
- create `src/autopilot/conversationalBuildLoopFixtures.ts`
- update `src/autopilot/index.ts`
- create `docs/conversational-build-loop-dry-run.md`
- optionally create `scripts/conversational-build-loop-dry-run-tests.ts`

Out of scope:

- runtime loop execution
- external actions
- file-writing runner
- Codex invocation
- provider calls
- mobile tooling
- dashboard mutation
- durable memory persistence

## Future After PILOT-3I

If PILOT-3I passes:

- PILOT-4B - Human-Approved Codex Prompt Handoff Plan

If PILOT-3I exposes major gaps:

- Phase 141B - Roadmap Continuation Plan
