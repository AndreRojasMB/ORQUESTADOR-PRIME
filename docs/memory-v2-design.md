# Long-Term Memory V2 Design

Phase: 35D
Status: specification only

Memory V2 is a privacy-aware, project-scoped memory layer. It should preserve
compatibility with the existing V1 memory store while adding typed entries,
privacy labels, redaction metadata, retrieval scoring, and explicit project
isolation.

## Current Memory V1

V1 stores recent orchestration summaries in:

- `~/.orquestador-prime/memory.json`

Current entries include:

- id
- type
- task
- timestamp
- projectType
- agents
- keywords
- summary
- outputDir
- traceId
- trace
- source

V1 is useful but limited:

- no explicit project scope,
- no privacy label,
- no redaction metadata,
- no stable retrieval score model,
- no cross-store links beyond trace id,
- no schema for external memories.

## Design Goals

Memory V2 should:

- isolate projects by default,
- support typed entries,
- track privacy and redaction state,
- support safe retrieval,
- preserve V1 compatibility,
- avoid raw identity persistence,
- avoid cross-project leakage,
- be local-first and non-fatal.

## Project Scope

Every V2 entry must include project scope:

- `projectId`
- `workspaceHash`
- `repoRemoteHash`
- `branch`
- `source`

`projectId` should be stable for a repository/workspace, not for a user. If the
repo remote is unavailable, the workspace path may be hashed. Raw absolute paths
should not be stored by default.

Retrieval must require a project scope unless an explicit future cross-project
mode is approved.

## Entry Types

Initial memory entry types:

- `run-summary`
- `project-goal`
- `decision`
- `preference`
- `constraint`
- `risk`
- `integration-note`
- `external-note`
- `learning-summary`

Each entry should have:

- `id`
- `schemaVersion`
- `createdAt`
- `updatedAt`
- `projectScope`
- `type`
- `title`
- `summary`
- `tags`
- `source`
- `links`
- `privacy`
- `redaction`
- `retention`

## Privacy Labels

Privacy labels should be explicit:

- `public`
- `project`
- `private`
- `secret`

Default label is `project`.

Rules:

- `secret` entries are never prompt-injected by default.
- `private` entries require explicit retrieval allowance.
- `project` entries may be used inside the same project.
- `public` entries may be used broadly only after future policy approval.

## Redaction Metadata

Each entry should record redaction state:

- `redacted`: boolean
- `redactionVersion`
- `removedKinds`
- `containsRawIdentity`
- `containsSecrets`
- `safePreview`

Removed kinds may include:

- `phone`
- `email`
- `token`
- `api-key`
- `webhook-secret`
- `request-body`
- `raw-transcript`
- `file-content`
- `absolute-path`

If redaction status is unknown, retrieval should treat the entry as unsafe for
prompt injection.

## Retrieval Scoring

Memory V2 retrieval should score entries using:

- project scope match,
- type match,
- tag overlap,
- keyword overlap,
- recency,
- source trust,
- privacy eligibility,
- linked trajectory/action relevance,
- human-pinned priority if added later.

Hard filters should run before scoring:

- project mismatch,
- privacy not allowed,
- redaction unsafe,
- expired retention,
- source disallowed.

The retrieval result should explain why an entry was included.

## Compatibility With Memory V1

V2 should not delete or rewrite V1. Compatibility can be handled by:

- a V1 reader adapter,
- one-way migration preview,
- optional explicit migration later,
- V1 entries treated as `run-summary`,
- V1 entries assigned `privacy.label = "project"`,
- V1 entries assigned `redaction.redacted = false` only when safe fields are
  used.

Initial V2 retrieval can read V1 summaries as backfill without modifying the V1
file.

## Project Isolation

No cross-project retrieval by default.

Memory V2 must not use entries from another project unless all are true:

- explicit future cross-project mode exists,
- human enables it,
- privacy label permits it,
- redaction is safe,
- source project is visible in the returned context.

This is especially important for client work, target repos, and external
channels.

## Storage Direction

Initial V2 can use local JSON:

- `~/.orquestador-prime/memory-v2.json`

Future scaling may move to SQLite. The JSON schema should keep a top-level
version and entries list:

- `version`
- `entries`
- `indexes`
- `lastUpdatedAt`

Writes should be non-fatal like existing stores.

## Prompt Injection Rules

Memory retrieved for prompts must be summarized, not dumped raw. The context
builder should include:

- title
- summary
- tags
- reason for retrieval
- source
- age
- privacy label

It must not include raw secrets, raw identity, raw request bodies, raw
transcripts, or file contents unless a future explicit mode permits it.

## Supervisor Relationship

The Supervisor may read Memory V2 retrieval results to understand goals,
constraints, and risks. It must not:

- override direct user instruction with stale memory,
- leak private entries,
- infer actions from vague memories,
- approve or dispatch actions based on memory,
- write project goals without an explicit approved store path.

## Safety Review

Before Memory V2 is used in runtime prompts:

- retrieval must be scoped,
- privacy labels must be tested,
- redaction metadata must be present,
- unsafe entries must be filtered,
- no cross-project leakage smoke must pass,
- prompt context must be bounded and summarized.

