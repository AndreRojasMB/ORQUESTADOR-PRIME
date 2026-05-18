# Mobile Feature Blueprint Boundaries

Phase: 133B - MOBILE FEATURE BLUEPRINT GENERATOR PLAN

Status: planning / safety boundaries

## Boundary Summary

Mobile Feature Blueprint Generator is a planning layer. It should convert
Mobile Requirements Interview metadata into feature blueprint metadata that can
later guide implementation planning.

It must not become a feature scaffold, screen builder, route writer, app
factory, Codex runner, mobile command wrapper, provider connector, dashboard
writer, database writer, CI gate, memory writer, or source-control actor.

## Allowed In Phase 133B

Allowed work:

- create docs that describe future feature blueprint metadata
- define feature categories
- define blueprint input and output models
- define acceptance criteria and Definition of Done mapping
- define dependency, risk, approval, and scope mapping
- define safety boundaries and stop conditions
- run read-only verification commands
- run typecheck as a repository safety check

## Not Allowed In Phase 133B

Not allowed:

- source implementation
- feature source creation
- screen creation
- route file creation
- app creation
- Codex invocation
- conversational automation
- agent execution
- prompt dispatch
- outbound messaging
- WhatsApp execution
- OpenClaw use
- Expo/EAS execution
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

## Future 133I Allowed Scope

The next implementation phase may create source-only metadata helpers:

- `src/pm/mobileFeatureBlueprintGenerator.ts`
- `src/pm/index.ts` export
- `docs/mobile-feature-blueprint-generator.md`
- optional `scripts/mobile-feature-blueprint-generator-tests.ts`

The implementation must remain pure:

- no filesystem reads or writes from source
- no environment reads
- no network calls
- no provider calls
- no mobile commands
- no app creation
- no runtime effects
- no dashboard mutation
- no DB/SQL mutation
- no memory writes
- no source-control operations from source

## Future 133I Disallowed Scope

The next implementation phase must not:

- create feature source files
- create UI screens or route files
- create a mobile app project
- connect to WhatsApp or any messaging channel
- invoke Codex or OpenClaw
- call external providers
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
- `noFeatureSourceCreation`
- `noScreenCreation`
- `noRouteFileCreation`
- `noAppCreation`
- `noCodexExecution`
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

- feature risk is high or critical
- approvals are missing
- feature scope is unresolved
- sensitive data is involved
- monetization or public release is involved
- safety, reporting, blocking, moderation, or abuse flows are involved
- offline writes or conflict handling are involved
- performance, accessibility, or testing evidence is missing for release scope

## Scope Safety Gates

Future implementation should include gates for:

- source requirement refs present
- feature category assigned
- phase scope assigned
- target users and roles mapped
- acceptance criteria present
- Definition of Done present
- dependency list present
- risks and approvals mapped
- downstream artifacts mapped
- unresolved questions documented
- safety boundaries preserved

## Forbidden Action Gate

If future metadata input asks for real action, the generator should return a
blocked or human-review recommendation. Examples include:

- create feature files
- create UI screens
- write route files
- create a mobile app
- run mobile tooling
- invoke Codex or OpenClaw
- set up credentials
- configure providers
- mutate dashboards
- create DB/SQL assets
- activate CI
- persist memory
- perform source-control behavior from source modules

## Verification Expectations

For Phase 133B:

- only docs should change
- no source files should change
- no package or workflow files should change
- no generated mobile folders should appear
- no files outside the allowed docs should be staged
- no commit or push should be made

For Phase 133I:

- typecheck should pass
- optional smoke should prove helper purity and mapping behavior
- forbidden grep should be clean or document preexisting false positives only
- staged files should stay inside the future 133I scope
