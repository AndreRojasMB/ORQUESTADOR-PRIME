# Safe Scaffold Generator

Phase: 96I
Status: docs-only/spec-only

## A. Purpose

Phase 96I is docs-only/spec-only.

Phase 96I defines a future safe scaffold planning path for ORQUESTADOR-PRIME.
It is architecture and specification only.

Existing scaffold surfaces are write-adjacent and generation-adjacent. The
safe scaffold strategy exists so future work can separate reviewed planning
metadata from any later file creation, template use, package changes, runtime
behavior, or generated project output.

This phase does not implement scaffold generation. It does not modify
`src/scaffold/*`. It does not modify `src/prompts/scaffold.ts`. It does not
generate projects or files. It does not execute templates. It does not add
package scripts or CLI behavior. It does not make ORQUESTADOR-PRIME
production-ready.

## B. Current Scaffold Baseline

The current scaffold baseline is generation-capable when invoked through
existing surfaces:

- `package.json` exposes `npm run scaffold` through
  `tsx src/index.ts --mode=scaffold`.
- `src/scaffold/scaffoldWriter.ts` is write-capable and uses `mkdir` and
  `writeFile`.
- `src/scaffold/templates.ts` and `src/scaffold/templates/*` include project
  file contents.
- `src/prompts/scaffold.ts` asks for runnable scaffold JSON with
  `files[].content`.
- Existing factory metadata lanes are advisory planning inputs, not scaffold
  execution surfaces.

Phase 96I does not call, modify, wrap, or extend those scaffold surfaces.

## C. Scaffold Readiness Gaps

Before any future scaffold generator can be considered safe, ORQUESTADOR-PRIME
is missing:

- a safe scaffold planning contract,
- a generated-file manifest policy,
- an approval gate model for writes,
- a path, overwrite, and delete safety model,
- a scaffold risk taxonomy,
- a rollback and delete policy,
- clear separation between advisory factory metadata and write-capable scaffold
  surfaces.

## D. Safe Scaffold Planning Strategy

Future scaffold planning should produce proposals and metadata before files.
Scaffold plans should be reviewable, bounded, redacted, and explicit about
assumptions and exclusions.

No future file write should happen before human approval. No generated project
should be created until a separately approved gated phase exists. Factory
metadata may inform scaffold plans, but it must not execute generation by
itself.

## E. Scaffold Request Model

Future scaffold request metadata should include:

- intent,
- target domain,
- target module,
- stack,
- language and framework references,
- constraints,
- exclusions,
- operator notes,
- risk classification,
- approval requirement.

Request metadata should not include secrets, raw provider output, raw prompts,
private store data, credential values, or executable commands.

## F. Blueprint Reference Model

Future scaffold plans may reference reviewed module blueprint IDs.

Blueprint references are metadata only. They should not trigger file creation,
project generation, database schema generation, or package mutation. Phase 96I
does not implement blueprint-to-file generation.

## G. Language / Framework Relationship

Future scaffold plans may consume language and framework profile IDs as
metadata.

Those profile references must not:

- execute build or test commands,
- install dependencies,
- mutate package files,
- modify lockfiles,
- change workflows,
- create generated files.

Language and framework profiles remain advisory context until a separate
scaffold execution phase is approved.

## H. Process / Reporting / Transaction / UI Relationship

Future scaffold planning may use advisory context from:

- business process modeling,
- BI/reporting layer,
- transactional systems layer,
- enterprise UI patterns.

Those lanes may help describe process states, reporting surfaces, transaction
boundaries, and UI patterns, but they must not make scaffold output executable
or write files.

## I. Generated-File Manifest Model

A future generated-file manifest should be metadata only until a later approved
phase. Candidate fields include:

- relative path,
- file purpose,
- source metadata reference,
- risk tier,
- overwrite policy,
- approval status,
- verification expectation,
- rollback note,
- privacy/secret status.

The manifest must not be treated as permission to write files. It is a future
review contract, not generated output in Phase 96I.

## J. Approval Gate Model

Human approval is required before any future file write.

Higher-risk scaffold types require stronger approval. Any future scaffold plan
that proposes package changes, workflow changes, database schemas, connector
surfaces, automation, deployment files, runtime behavior, dashboard behavior, or
credential-adjacent behavior must be treated as high or critical risk.

Phase 96I does not execute approvals, create proposals, dispatch actions, or
write approval records.

## K. Risk Classification

Future scaffold risk tiers:

- low: docs-only scaffold plan,
- medium: test, docs, or module skeleton metadata,
- high: API, dashboard, or workflow scaffold,
- critical: DB/schema, connector, automation, deployment, or transactional
  scaffold.

Risk tiers are review metadata. They do not grant execution permission.

## L. Dry-Run / Proposal-Only Model

A future dry-run must preview a file plan only.

It must not:

- write files,
- change packages,
- install dependencies,
- execute commands,
- create artifacts,
- generate projects,
- mutate workflows,
- run templates.

Dry-run output should be bounded, redacted, and reviewable.

## M. Rollback / Delete Strategy

Rollback and delete planning is future-only.

Rollback plans should remain metadata until a later phase defines safe
implementation rules. Phase 96I adds no deletion behavior, no cleanup commands,
no generated output, and no file mutation.

## N. Redaction / Privacy Strategy

Future scaffold plans must deny:

- secrets,
- tokens,
- config values,
- raw prompts,
- raw provider output,
- private store data,
- raw connector payloads,
- credentials,
- personal data unless explicitly reviewed.

Plans should summarize before detail and should not include raw local paths
unless a later approved phase defines a safe path policy.

## O. Scaffold Coverage Plan

| Scaffold area | Allowed metadata | Denied behavior | Risk tier | Approval requirement | Future-only status | Verification needs |
|---|---|---|---|---|---|---|
| CLI/module scaffold | module shape, command intent, file role summaries | package writes, executable CLI changes, generated files | medium | human approval before writes | future-only | path bounds, package diff review |
| API scaffold | route inventory, service boundaries, auth assumptions | server implementation, runtime execution, DB schemas | high | stronger approval | future-only | route review, runtime boundary review |
| dashboard/view scaffold | view names, data categories, read-only expectations | dashboard implementation, routes, server actions, config writes | high | stronger approval | future-only | read-only policy and redaction review |
| CRUD scaffold | entity names, field summaries, operation intent | DB schemas, SQL, migrations, store mutation | critical | explicit high-risk approval | future-only | schema and migration review |
| workflow/process scaffold | process states, transitions, handoffs | automation execution, scheduler behavior, webhook triggers | high | stronger approval | future-only | dry-run and approval review |
| reporting/dashboard scaffold | report names, metrics, visualization intent | BI execution, raw data access, generated dashboards | medium | human approval | future-only | redaction and data source review |
| transactional module scaffold | transaction boundaries, idempotency notes, audit needs | ledgers, queues, workers, payment behavior | critical | explicit high-risk approval | future-only | transaction and audit review |
| connector scaffold | connector taxonomy refs, capability summaries | network calls, credentials, connector writes | critical | explicit high-risk approval | future-only | credential, scope, and audit review |
| automation workflow scaffold | workflow outline, validation expectations | automation execution, action dispatch, job enqueue | high | stronger approval | future-only | trace and approval review |
| docs scaffold | outline, audience, topic map | file writes in 96I, generated docs | low | human approval before writes | future-only | doc scope review |
| test scaffold | test plan, coverage areas, risk notes | writing test files, running commands | medium | human approval before writes | future-only | command and fixture review |
| deployment scaffold | topology notes, environment assumptions | Docker, Coolify, workflow, deployment file generation | critical | explicit high-risk approval | future-only | release and rollback review |

## P. Future Validation Strategy

Future validation should require:

- scaffold plans are advisory only,
- `dryRunOnly` and `proposalOnly` are true if metadata is later added,
- generated file paths are future metadata only,
- no absolute dangerous paths,
- no overwrite or delete behavior,
- no executable code generation in 96I,
- no package, script, or workflow mutations,
- no DB schema or SQL generation,
- no secret, token, or config values,
- approval gates before any future write,
- rollback and delete plans as strategy only,
- no provider, network, filesystem write, action, store, runtime, or
  automation behavior,
- no production, security, or compliance guarantees.

## Q. Integration Plan

Safe scaffold planning may later support:

- module blueprint generator,
- language/framework profiles,
- enterprise UI patterns,
- business process modeling,
- BI/reporting layer,
- transactional systems layer,
- connector taxonomy,
- credential vault strategy,
- runtime readiness,
- dashboard/control center,
- action/proposal/approval safety,
- productization/release path.

Those integrations should remain metadata-only until a later phase explicitly
approves implementation behavior.

## R. Safety Boundaries / Non-Goals

Phase 96I explicitly preserves:

- no provider calls,
- no network,
- no filesystem mutation,
- no file writes,
- no scaffold generation,
- no generated projects,
- no template execution,
- no CLI/package/workflow changes,
- no runtime/dashboard/automation/connector execution,
- no credential/vault implementation,
- no action/proposal/approval execution,
- no jobs execution,
- no DB schemas/SQL,
- no production-ready claims,
- no security/compliance guarantees.

## S. Future Source Candidates

Future-only source candidates, not implemented in Phase 96I:

- `src/scaffold/planning/types.ts`,
- `src/scaffold/planning/scaffoldPlanTemplates.ts`,
- `src/scaffold/planning/scaffoldPlanValidator.ts`,
- `src/scaffold/planning/scaffoldPlanBuilder.ts`.

Future type candidates:

- `ScaffoldPlanSchemaVersion`,
- `ScaffoldPlanId`,
- `ScaffoldPlanCategory`,
- `ScaffoldRiskTier`,
- `ScaffoldBoundarySet`,
- `ScaffoldInputReference`,
- `ScaffoldBlueprintReference`,
- `ScaffoldLanguageFrameworkReference`,
- `ScaffoldGeneratedFilePlan`,
- `ScaffoldDryRunManifest`,
- `ScaffoldApprovalGate`,
- `ScaffoldRollbackPlan`,
- `ScaffoldValidationFinding`,
- `ScaffoldValidationResult`.

These candidates must remain source-only advisory metadata unless a later phase
explicitly approves any write-capable scaffold behavior.
