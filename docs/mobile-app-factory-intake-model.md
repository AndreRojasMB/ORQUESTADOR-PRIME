# Mobile App Factory Intake Model

Phase: 121B - MOBILE APP FACTORY STRATEGY PLAN

Status: planning / intake model / docs-only

## Purpose

The intake model defines how a future Mobile App Factory can convert a raw app
idea into safe planning metadata for PM Core, SOLID Core, and later mobile
architecture phases.

The intake model does not generate apps, create projects, call services, create
accounts, or run mobile tooling.

## Intake Inputs

Recommended future metadata:

- `intakeId`
- `appIdea`
- `originalUserGoal`
- `safeSummary`
- `targetUsers`
- `businessGoal`
- `platformPriority`
- `supportedAppType`
- `coreFlows`
- `screenMap`
- `navigationModel`
- `dataModelSummary`
- `offlineNeeds`
- `authNeeds`
- `monetizationNeeds`
- `safetyNeeds`
- `releaseTarget`
- `riskLevel`
- `requiredApprovals`
- `evidenceRefs`
- `assumptions`
- `exclusions`

All intake fields should be caller-supplied metadata.

## Supported App Type Classification

The classifier should support:

- `habit_gamified_app`
- `social_freemium_app`
- `marketplace_app`
- `erp_mobile_field_ops_app`
- `education_app`
- `service_booking_app`
- `dashboard_companion_app`
- `ai_assistant_mobile_app`
- `unknown_mobile_app`

Classification should be advisory. It should not create templates or choose
dependencies by itself.

## Clarification Checklist

Future intake should ask for:

- primary users,
- user pain point,
- success metric,
- must-have flows,
- launch platform priority,
- auth and account needs,
- offline expectations,
- sensitive data concerns,
- monetization target,
- accessibility needs,
- release target,
- approval requirements.

If answers are incomplete, the strategy should produce an uncertainty list
rather than generating an implementation plan.

## Screen Map Planning

Screen map metadata should include:

- screen id,
- title,
- app flow,
- user goal,
- primary actions,
- required data,
- empty state needs,
- loading state needs,
- error state needs,
- accessibility notes,
- security notes,
- analytics notes,
- DoD notes.

Screen map output remains a plan. It does not create UI files.

## Navigation Planning

Navigation metadata should include:

- root navigation model,
- auth gate posture,
- tab or drawer needs,
- modal needs,
- deep link needs,
- onboarding path,
- account recovery path,
- settings path,
- support path,
- offline recovery path.

Navigation output remains advisory. It does not configure routes.

## Risk And Approval Metadata

Risk metadata should cover:

- app type complexity,
- auth and privacy needs,
- offline complexity,
- payment or monetization complexity,
- provider dependency pressure,
- release readiness risk,
- accessibility risk,
- platform policy risk,
- content safety risk,
- operational support risk.

Approval metadata should identify which future steps require human review
before implementation, especially payments, external services, push
notifications, store submission, production backend, or sensitive data.

## Output Contract

Future intake should produce:

- app type classification,
- mobile strategy summary,
- requirement gaps,
- screen map seed,
- navigation model seed,
- architecture recommendation seed,
- security baseline seed,
- testing strategy seed,
- release readiness seed,
- PM task graph seed,
- DoD seed,
- risk and blocker candidates,
- next phase recommendation.

All outputs remain source-only advisory metadata.
