# Phase 117B - UI Boundary Rule Model

## Purpose

The UI Boundary Rule Model defines metadata for future frontend responsibility rules. It converts generic UI concerns into source-only, report-only rule entries and findings that can be supplied to the SOLID Validator Core.

The model is declarative. It does not inspect UI files, evaluate real components, or change dashboard behavior.

## Responsibility Categories

Future frontend rules should support:

- `presentation_only`: rendering and composition only.
- `container_orchestration`: state and adapter orchestration.
- `state_management`: state ownership and update responsibility.
- `effect_boundary`: side-effect isolation and review posture.
- `routing_boundary`: route ownership and navigation responsibility.
- `data_adapter_boundary`: caller-supplied data adapter metadata.
- `form_validation_boundary`: validation and submission separation.
- `accessibility_boundary`: interactive UI accessibility responsibility.
- `design_system_boundary`: tokens, styling, and visual consistency.
- `dashboard_write_boundary`: future-gated dashboard write concern.
- `provider_boundary`: provider-adjacent UI concern.
- `runtime_future_boundary`: future runtime UI concern.

## UI Boundary Rule Metadata

Future `UiBoundaryRule` metadata should include:

- `ruleId`: stable rule id.
- `title`: concise title.
- `category`: frontend responsibility category.
- `allowedResponsibilities`: responsibilities allowed in the category.
- `forbiddenResponsibilities`: responsibilities that should not appear.
- `reviewRequiredResponsibilities`: responsibilities that need human review.
- `severityDefault`: default advisory severity.
- `requiredEvidence`: caller-supplied evidence required for confidence.
- `reportOnly`: true.
- `safetyBoundaries`: source-only and report-only safety metadata.

## Frontend Finding Metadata

Future `FrontendResponsibilityFinding` metadata should include:

- `findingId`
- `ruleId`
- `responsibilityCategory`
- `sourceModule`
- `affectedComponent`
- `affectedLayer`
- `severity`
- `description`
- `evidenceRefs`
- `relatedSolidPrinciples`
- `relatedSmellCategoryRefs`
- `suggestedAction`
- `riskLevel`
- `approvalRequired`
- `pmEscalation`
- `autopilotUse`

Findings should be accepted as caller-supplied metadata by later validator reports.

## Severity Guidance

Suggested severity defaults:

- `info`: purely descriptive responsibility notes.
- `low`: minor ambiguity with no write or runtime concern.
- `medium`: mixed responsibility requiring review.
- `high`: provider, dashboard write, runtime, or hidden effect pressure.
- `critical`: approval bypass, unapproved write path, or execution-capable UI concern.

Severity is advisory and must not fail builds or trigger runtime behavior.

## Relationship to Existing Architecture Layers

UI boundary rules should map to:

- SRP through responsibility separation.
- OCP through extension-friendly component boundaries.
- ISP through small component contracts and props.
- DIP through data adapter and provider separation.
- Module boundaries through dashboard, providers, runtime-future, and architecture layer metadata.
- Smell taxonomy through responsibility overload, hidden side effects, dashboard write leakage, provider leakage, and approval bypass risk.
- Review checklist through repeatable questions for UI responsibility evidence.
- Validator core through caller-supplied findings and evidence.

## Evidence Model

Future evidence should be caller supplied and may include:

- Component responsibility summary.
- State ownership summary.
- Effect boundary notes.
- Routing responsibility notes.
- Form validation responsibility notes.
- Accessibility notes.
- Design token or style boundary notes.
- Dashboard write-path warning notes.

Evidence references are labels, not file reads.

## Non-Goals

The UI boundary model must not define:

- Dashboard implementation changes.
- Dashboard write behavior.
- Real component scanning.
- Source-tree parsing.
- Repository reading.
- Automatic import detection.
- Runtime validators over real UI files.
- Refactor execution.
- Provider, OpenClaw, WhatsApp, n8n, DB, deploy, git, memory, env, network, or process behavior.

## Future 117I Test Expectations

The future smoke test should validate:

- Responsibility category metadata.
- UI boundary rule metadata.
- Frontend finding metadata.
- Severity defaults.
- SOLID, smell, checklist, and validator linkage.
- No dashboard, scanner, runtime, or repository-reading assumptions.
