# Mobile API Contract Planner

Phase: 135I - MOBILE API CONTRACT PLANNER IMPLEMENTATION

Status: source-only / advisory / metadata-only

## Purpose

Mobile API Contract Planner converts mobile feature and screen blueprint
metadata into future API contract metadata. It describes endpoint candidates,
request models, response models, error models, auth posture, role/permission
posture, pagination/filter/sort posture, offline/cache implications, security
refs, performance refs, testing refs, release refs, risks, approvals, and
limitations.

The layer does not add live API routes, implement backend behavior, alter
database schemas, perform network requests, call providers, configure auth
runtime, create apps, run Expo/EAS, change packages, activate CI, persist
memory, or perform source-control actions from source.

## Implemented Source File

- `src/pm/mobileApiContractPlanner.ts`

The file belongs in PM Core because it consumes feature, screen, state,
offline, security, performance, testing, and release metadata. It returns
planning, DoD, risk, approval, task graph, SOLID review, and Autopilot dry-run
handoff context.

## API Contract Model

`MobileApiContract` records:

- `apiContractId`
- `featureRef`
- `screenRefs`
- `endpointName`
- `method`
- `pathTemplate`
- `purpose`
- `requestModel`
- `responseModel`
- `authRequired`
- `allowedRoles`
- `requiredPermissions`
- `errorModelRefs`
- `paginationModel`
- `filterSortModel`
- `offlineCachePolicy`
- `securityRefs`
- `performanceRefs`
- `testingRefs`
- `releaseRefs`
- `riskLevel`
- `requiredApprovals`
- `limitations`

Contract values are planning labels only. `pathTemplate` is not a framework
route, server handler, network client, or provider binding.

## Endpoint Candidate Model

`MobileEndpointCandidate` records:

- `endpointCandidateId`
- `sourceFeatureRef`
- `sourceScreenRef`
- `operationType`
- `targetEntity`
- `userGoal`
- `dataNeeds`
- `authNeeds`
- `offlineNeeds`
- `validationNeeds`
- `suggestedContractRef`
- `confidence`
- `riskLevel`

Candidates help PM and architecture review decide whether a future contract is
needed. They do not add endpoint files or runtime behavior.

## Request And Response Model

`MobileApiRequestResponseModel` records:

- `modelId`
- `modelName`
- `fields`
- `requiredFields`
- `optionalFields`
- `sensitiveFields`
- `validationRules`
- `exampleShapeLabel`
- `limitations`

Fields and validation rules are descriptive labels. They are not runtime
validators and do not include live payloads, credentials, logs, or production
examples.

## Error Model

`MobileApiErrorModel` records:

- `errorModelId`
- `errorCode`
- `userMessage`
- `developerMessage`
- `recoverable`
- `retryAllowed`
- `fallbackAction`
- `relatedScreenStateRef`
- `riskLevel`

Error metadata maps future API failure posture to mobile screen states such as
validation, auth-required, offline, permission, conflict, blocked, and retry
flows.

## API Categories

Implemented categories:

- `auth`
- `user_profile`
- `content_list`
- `content_detail`
- `create_update`
- `delete_archive`
- `search_filter`
- `messaging`
- `marketplace`
- `gamification_progress`
- `offline_sync`
- `monetization`
- `safety_report`
- `notifications`
- `analytics_reporting`
- `admin_management`
- `ai_assistant`
- `unknown`

## Helpers

Implemented pure helpers:

- `createMobileApiContract`
- `createMobileEndpointCandidate`
- `createMobileApiRequestResponseModel`
- `createMobileApiErrorModel`
- `createMobileApiContractPlannerInput`
- `createMobileApiContractPlannerOutput`
- `planMobileApiContracts`
- `mapScreenBlueprintsToApiContracts`
- `summarizeMobileApiContractOutput`
- `selectApiContractsByCategory`
- `selectEndpointCandidatesByOperationType`

All helpers return metadata only.

## Safety Boundaries

The implementation preserves:

- source-only
- advisory-only
- metadata-only
- no endpoint creation
- no backend implementation
- no database or schema mutation
- no network calls
- no provider calls
- no auth runtime
- no credential use
- no app creation
- no Codex invocation
- no Expo/EAS execution
- no package changes
- no CI activation
- no memory persistence
- no git automation from source

## Feature And Screen Blueprint Integration

The planner consumes:

- source feature refs
- source screen refs
- route refs
- state refs
- data refs
- screen state refs
- security refs
- performance refs
- testing refs
- release refs
- risk and approval posture

It maps screen and feature metadata into contract candidates without adding any
server, provider, schema, or runtime artifact.

## State, Offline, Security, And Testing Integration

The metadata can support:

- state ownership review
- cache and sync review
- offline fallback review
- data sensitivity review
- auth and permission review
- payload and latency risk review
- contract QA planning
- release readiness gates

These are future review inputs only.

## PM / SOLID / Autopilot Integration

The metadata can support:

- PM reports
- task graph seeds
- DoD criteria
- risk and blocker metadata
- approval readiness
- SOLID/frontend/backend review context
- Autopilot handoff context
- dry-run scenarios
- phase closeout

It does not trigger Autopilot execution, memory writes, provider behavior,
dashboard mutation, backend behavior, or source-control behavior from source.

## Conversational Build Loop Readiness

This phase prepares:

idea intake -> requirements interview -> feature blueprints -> screen
blueprints -> API contract candidates -> future design-system planning ->
future handoff prompt context.

It does not automate conversation, run agents, dispatch prompts, invoke Codex,
implement backend behavior, add endpoint files, or create an app.

## Limitations

- No backend behavior is implemented.
- No endpoint files are added.
- No database or schema assets are changed.
- No network requests are made.
- No providers are called.
- No auth runtime is configured.
- No app project is created.
- No Expo, EAS, native, package, workflow, dashboard, runtime, or memory
  behavior is added.
- API contract labels are not production contracts.
- Security, privacy, auth, offline, performance, testing, and release posture
  still require human review before implementation.

## Next Phase

Recommended next phase:

**Phase 136B - Mobile Design System Blueprint Plan**

That phase should plan source-only design-system metadata that consumes feature,
screen, and API contract metadata without creating UI components, apps, native
files, packages, providers, backend behavior, or runtime wiring.
