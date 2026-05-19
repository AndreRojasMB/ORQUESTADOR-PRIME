# Conversational Build Loop Stage Model

Status: source-only / advisory / metadata-only

## Purpose

The stage model defines how a future Conversational Build Loop dry-run should
move from user idea metadata to review-ready artifact metadata. Each stage is
passive, deterministic, and approval-aware.

## Stage Metadata

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

## Required Stages

### idea_intake

Transforms a simple user idea into intake metadata. It should preserve the raw
idea, intent, assumptions, unknowns, target users, app type hypothesis, and
safety notes.

### requirements_interview

Turns intake metadata into functional and non-functional requirements,
MVP/Beta/Release scope, constraints, user roles, data needs, and unresolved
questions.

### feature_blueprints

Maps requirements into feature blueprint metadata with priority, dependencies,
acceptance criteria, DoD, risk, and approval posture.

### screen_blueprints

Maps feature blueprints into screen blueprint metadata with screen states,
component slot posture, navigation refs, accessibility notes, and safety notes.

### api_contracts

Maps feature and screen needs into API contract candidate metadata. It should
describe future operation posture, request/response labels, error posture, and
offline/security/testing links without creating backend behavior.

### design_system

Maps screen and UX needs into design token, component blueprint, layout,
theme, motion, and accessibility posture.

### quality_security_release

Aggregates state, offline, security, performance, testing, analytics, push,
and release readiness metadata. It should expose risks and required evidence.

### store_readiness

Aggregates release/store metadata, privacy/rating posture, listing readiness,
support/contact posture, and compliance review notes.

### prompt_draft

Builds a passive prompt draft metadata object. The draft must not be usable
without human approval.

### human_review

Checks whether the chain is complete enough for a future handoff plan. It
should preserve blockers, unresolved questions, risk, approvals, and next
recommended phase.

## Stage Flow

```text
idea_intake
-> requirements_interview
-> feature_blueprints
-> screen_blueprints
-> api_contracts
-> design_system
-> quality_security_release
-> store_readiness
-> prompt_draft
-> human_review
```

## Artifact Chain Metadata

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

## Prompt Draft Metadata

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

## Evidence Expectations

Each stage should reference evidence from:

- Autopilot dry-run hardening scenario/gate metadata
- Mobile Factory first dry-run summary
- PM module summaries from phases 121-140
- validation report metadata
- memory proposal metadata
- next-action recommendation metadata
- phase closeout metadata

Evidence is advisory metadata only.

## Stage Safety Notes

- stages cannot start external tools
- stages cannot call providers
- stages cannot create implementation artifacts
- stages cannot persist memory
- stages cannot mutate dashboards
- stages cannot modify source-control state
- prompt drafts remain review-only
