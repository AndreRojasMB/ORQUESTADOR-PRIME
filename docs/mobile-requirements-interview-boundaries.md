# Mobile Requirements Interview Boundaries

Phase: 132B - MOBILE REQUIREMENTS INTERVIEW PLAN

Status: planning / safety boundaries

## Boundary Summary

Mobile Requirements Interview is a planning and metadata layer. It should refine
an idea intake into requirements for later mobile architecture, UX, navigation,
state, offline, security, performance, testing, and release planning.

It must not become a live interview system, a chat agent, a prompt dispatcher,
an app generator, a mobile tooling wrapper, a provider integration, a dashboard
writer, a database writer, or a release workflow.

## Allowed In Phase 132B

Allowed work:

- create docs that describe future metadata models
- define requirement categories and question categories
- define requirement answer normalization rules
- plan MVP, beta, and release scope metadata
- plan mapping to existing mobile PM artifacts
- plan safety boundaries and stop conditions
- run read-only verification commands
- run typecheck because this is a repository-wide safety check

## Not Allowed In Phase 132B

Not allowed:

- source implementation
- conversational automation
- agent execution
- prompt generation or dispatch
- outbound messaging
- WhatsApp execution
- OpenClaw use
- Codex invocation
- mobile app generation
- route, screen, component, or project generation
- Expo or EAS execution
- native project creation
- package changes
- workflow or CI changes
- credentials or signing material
- provider calls
- runtime execution
- dashboard mutation
- DB/SQL mutation
- secrets or environment reads
- memory persistence
- git automation from source
- commit
- push

## Future 132I Allowed Scope

The next implementation phase may create source-only metadata helpers:

- `src/pm/mobileRequirementsInterview.ts`
- `src/pm/index.ts` export
- `docs/mobile-requirements-interview.md`
- optional `scripts/mobile-requirements-interview-tests.ts`

The implementation must remain pure:

- no filesystem reads or writes from source
- no environment reads
- no network calls
- no provider calls
- no mobile commands
- no app generation
- no runtime effects
- no memory writes
- no source-control operations from source

## Future 132I Disallowed Scope

The next implementation phase must not:

- implement a chat loop
- connect to WhatsApp or any messaging channel
- call external providers
- generate routes, screens, components, apps, or native folders
- configure Expo, EAS, app store metadata, credentials, or signing
- add dependencies or package scripts
- modify workflows or CI
- mutate dashboards
- mutate DB/SQL
- persist memory
- perform source-control automation from source

## Safety Flags To Preserve

Future metadata should include explicit booleans such as:

- `sourceOnly`
- `advisoryOnly`
- `metadataOnly`
- `noChatAutomation`
- `noMessageSending`
- `noWhatsAppExecution`
- `noOpenClaw`
- `noCodexExecution`
- `noAppGeneration`
- `noExpoEasExecution`
- `noNativeProjectCreation`
- `noPackageChanges`
- `noCredentialUse`
- `noProviderCalls`
- `noRuntimeExecution`
- `noDashboardMutation`
- `noDbSqlMutation`
- `noCiActivation`
- `noMemoryPersistence`
- `noGitAutomationFromSource`

## Human Review Boundaries

Future output should require human review before implementation when:

- health, children, finance, identity, location, payments, or other sensitive
  data appears in requirements
- auth, roles, or permissions are unresolved
- offline writes or conflict handling are requested
- monetization or marketplace behavior appears
- public release is requested
- safety, reporting, blocking, moderation, or abuse flows are in scope
- legal, compliance, platform policy, or store review concerns appear
- the requirement set is low confidence or has unresolved required questions

## Scope Safety Gates

Future implementation should include gates for:

- required question completion
- unresolved high-risk requirement detection
- MVP scope sanity
- sensitive data classification
- approval requirement detection
- downstream artifact mapping completeness
- safety boundary preservation
- no-execution guarantee

## Forbidden Action Gate

If future metadata input requests real action, the model should return a blocked
or human-review recommendation. Examples include:

- create a mobile app
- generate screens or route files
- run mobile tooling
- set up credentials
- configure providers
- mutate dashboards
- create DB/SQL assets
- activate CI
- persist memory
- perform source-control behavior from source modules

## Verification Expectations

For Phase 132B:

- only docs should change
- no source files should change
- no package or workflow files should change
- no generated mobile folders should appear
- no files outside the allowed docs should be staged
- no commit or push should be made

For Phase 132I:

- typecheck should pass
- optional smoke should prove helper purity and mapping behavior
- forbidden grep should be clean or document preexisting false positives only
- staged files should stay inside the future 132I scope
