# Risk Approval Signal

Phase: 43B-H
Status: local advisory foundation

This document defines the local risk/approval signal layer. The layer reads
explicit metadata and returns a recommendation. It does not enforce runtime
behavior and it is not an approval system.

## Purpose

The risk signal helps decide whether a task looks safe enough to continue or
whether a human should pause and inspect the work first.

It can combine:

- task metadata,
- eval report status,
- permission result metadata,
- workspace status metadata,
- supervisor advisory risks,
- multi-agent consensus metadata,
- proposed action/tool metadata,
- redaction findings.

The output is JSON and includes `advisoryOnly: true`.

## Advisory Boundary

The signal may recommend caution, review, or explicit approval. It cannot:

- approve or reject proposals,
- grant or consume second approval,
- dispatch actions,
- create proposals,
- execute tools,
- call providers,
- use network access,
- mutate stores,
- change channel behavior.

Future phases may read the signal as one input to a real approval gate, but this
phase does not wire it into any gate.

## Input Sources

The CLI accepts explicit JSON input with:

- `taskId`
- `task`
- `taskMetadata`
- `proposedActions`
- `permission`
- `workspace`
- `supervisor`
- `multiAgent`
- `sensitiveData`
- `evalReport`

An eval report may also be supplied separately with `--eval-report=<path>`.
All reads are local file reads. Baseline comparison and eval generation remain
owned by the eval CLI.

## Decision Values

The signal recommends one of:

- `proceed`
- `proceed_with_warnings`
- `pause_for_review`
- `require_explicit_approval`
- `block_until_fixed`

Warnings remain advisory. A passing signal is not permission to execute risky
behavior.

## Risk Reasons

Reason codes are stable enough for local reports and smoke tests. Examples:

- `eval.missing`
- `eval.warn`
- `eval.fail`
- `eval.privacy_unsafe`
- `permission.blocked`
- `action.explicit_approval_required`
- `action.forbidden_category`
- `workspace.blocked`
- `supervisor.blockers.present`
- `multi_agent.needs_review`
- `sensitive.secrets_or_body`
- `sensitive.identity_redacted`

## CLI Usage

Default local assessment:

```bash
npm run risk:assess
```

Pretty output:

```bash
npm run risk:assess -- --pretty
```

Assess explicit input:

```bash
npm run risk:assess -- --input=/tmp/orq-risk-input.json
```

Include an explicit eval report:

```bash
npm run risk:assess -- --input=/tmp/orq-risk-input.json --eval-report=/tmp/orq-evals-report.json
```

Write only to an explicit output path:

```bash
npm run risk:assess -- --input=/tmp/orq-risk-input.json --out=/tmp/orq-risk-signal.json
```

## Examples

Low-risk task:

```json
{
  "taskId": "local-doc-review",
  "task": "Review local documentation wording.",
  "evalReport": {
    "summary": { "status": "pass", "failed": 0, "warned": 0 }
  }
}
```

Expected recommendation: `proceed`.

Eval warning:

```json
{
  "taskId": "frontend-polish",
  "task": "Adjust button spacing.",
  "evalReport": {
    "summary": { "status": "warn", "failed": 0, "warned": 2 }
  }
}
```

Expected recommendation: `proceed_with_warnings`.

Eval failure:

```json
{
  "taskId": "router-change",
  "task": "Change routing behavior.",
  "evalReport": {
    "summary": { "status": "fail", "failed": 1, "warned": 0 }
  }
}
```

Expected recommendation: `pause_for_review`.

Permission blocked:

```json
{
  "taskId": "repo-mutation",
  "task": "Perform a real repository mutation.",
  "permission": {
    "status": "blocked",
    "reasonCode": "permission-denied"
  },
  "proposedActions": [
    {
      "toolId": "repo.file_write.real",
      "category": "file-write",
      "mutatesRepo": true,
      "realExecution": true
    }
  ]
}
```

Expected recommendation: `require_explicit_approval`.

Forbidden category:

```json
{
  "taskId": "dangerous-op",
  "task": "Remove repository data.",
  "proposedActions": [
    {
      "category": "file-delete",
      "realExecution": true
    }
  ]
}
```

Expected recommendation: `block_until_fixed`.

## Redaction

The risk CLI redacts common sensitive patterns before producing previews:

- email addresses,
- phone-like values,
- tokens and API keys,
- authorization values,
- body-like payload labels,
- full local paths where possible.

The signal reports `sensitiveDataFlags` with removed kinds and booleans instead
of raw sensitive values.

## Relationship With Evals

Eval reports are signals, not approvals.

Recommended interpretation:

- eval failure should pause risky work,
- eval warning should not block by default,
- unsafe privacy output should block until fixed,
- passing evals do not authorize dispatch, approval, or real execution.

## Relationship With Future Approval Gates

A future phase may feed this signal into an approval review surface. That future
gate must still require the existing permission checks, proposal approval,
second approval when applicable, dispatch gates, and audit behavior.

This phase only creates the local signal and CLI.
