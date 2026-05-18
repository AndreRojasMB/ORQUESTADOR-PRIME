# Mobile API Contract Boundaries

Phase: 135B - MOBILE API CONTRACT PLANNER

Status: planning / safety boundaries

## Boundary Summary

Mobile API Contract Planner is a planning layer. It should convert mobile
feature, screen, state, offline, security, testing, and release metadata into
future API contract metadata.

It must not become a backend scaffold, server route writer, database migration
author, network client, provider connector, auth runtime, dashboard writer, CI
gate, memory writer, or source-control actor.

## Allowed In Phase 135B

Allowed work:

- create docs that describe future API contract metadata
- define endpoint candidate metadata
- define request and response metadata
- define auth, role, and permission metadata
- define error contract metadata
- define pagination, filter, and sort posture
- define offline/cache/sync implications
- define security, performance, testing, and release references
- define safety boundaries and stop conditions
- run read-only verification commands
- run typecheck as a repository safety check

## Not Allowed In Phase 135B

Not allowed:

- source implementation
- endpoint file creation
- backend implementation
- database or schema mutation
- network requests
- provider execution
- auth runtime implementation
- credentials or signing material
- app creation
- Expo/EAS execution
- native project creation
- package changes
- workflow or CI changes
- dashboard mutation
- secrets or environment reads
- memory persistence
- git automation from source
- commit
- push

## Future 135I Allowed Scope

The next implementation phase may create source-only metadata helpers:

- `src/pm/mobileApiContractPlanner.ts`
- `src/pm/index.ts` export
- `docs/mobile-api-contract-planner.md`
- optional `scripts/mobile-api-contract-planner-tests.ts`

The implementation must remain pure:

- no filesystem reads or writes from source
- no environment reads
- no network calls
- no provider calls
- no backend files
- no endpoint files
- no schema changes
- no runtime effects
- no dashboard mutation
- no memory writes
- no source-control operations from source

## Future 135I Disallowed Scope

The next implementation phase must not:

- add real API route files
- implement backend behavior
- add migrations or schema assets
- call external services
- connect to providers
- configure auth runtime
- add dependencies or package scripts
- modify workflows or CI
- mutate dashboards
- persist memory
- perform source-control behavior from source

## Safety Flags To Preserve

Future metadata should include explicit booleans such as:

- `sourceOnly`
- `advisoryOnly`
- `metadataOnly`
- `noEndpointCreation`
- `noBackendImplementation`
- `noDatabaseMutation`
- `noNetworkCalls`
- `noProviderCalls`
- `noAuthRuntime`
- `noCredentialUse`
- `noAppCreation`
- `noExpoEasExecution`
- `noPackageChanges`
- `noCiActivation`
- `noMemoryPersistence`
- `noGitAutomationFromSource`

## Human Review Boundaries

Future output should require human review before implementation when:

- data sensitivity is personal, financial, health, child/minor, or unknown
- auth, role, or permission posture is unclear
- offline write or conflict behavior is involved
- monetization, marketplace, messaging, or safety flows are involved
- delete/archive behavior is involved
- rate limits or abuse risks are unclear
- performance or release readiness evidence is missing
- required approvals are not present

## Scope Safety Gates

Future implementation should include gates for:

- source feature references present
- source screen references present
- operation type assigned
- target entity assigned
- request model metadata present
- response model metadata present
- auth and permission posture mapped
- validation needs mapped
- error model refs present
- offline/cache/sync posture mapped
- security and privacy refs mapped
- testing and release refs mapped
- risk and approval posture mapped
- unresolved questions documented
- safety boundaries preserved

## Forbidden Action Gate

If future metadata input asks for real action, the planner should return a
blocked or human-review recommendation. Examples include:

- add endpoint files
- implement backend behavior
- add schema changes
- run network requests
- call providers
- configure auth runtime
- set up credentials
- mutate dashboards
- activate CI
- persist memory
- perform source-control behavior from source modules

## Verification Expectations

For Phase 135B:

- only docs should change
- no source files should change
- no package or workflow files should change
- no backend folders or route files should appear
- no files outside the allowed docs should be staged
- no commit or push should be made

For Phase 135I:

- typecheck should pass
- optional smoke should prove helper purity and mapping behavior
- forbidden grep should be clean or document preexisting false positives only
- staged files should stay inside the future 135I scope
