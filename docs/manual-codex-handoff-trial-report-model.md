# Manual Codex Handoff Trial Report Model

Phase: PILOT-5B - MANUAL CODEX HANDOFF TRIAL PLAN

Status: report and validation model / docs-only

## Purpose

This document defines the expected report shape and validation approach for the
manual handoff trial. The report is returned by a separate manual Codex session
and then checked as metadata.

## Expected Report Fields

The returned report should include:

- `phase`
- `files inspected`
- `files modified`
- `implementation or plan summary`
- `safety guarantees`
- `tests/scripts`
- `commands executed`
- `scope check`
- `forbidden grep`
- `commit/push`
- `next recommended phase`

For a B-mode target, the expected commit/push section is:

- No commit.
- No push.

## Report Field Expectations

### Phase

Must match:

- `TRIAL-1B - SAMPLE MOBILE IDEA BLUEPRINT DRY-RUN PLAN`

### Files Inspected

Should list only files needed for the target prompt. Expected examples:

- Autopilot handoff docs
- Conversational Build Loop docs
- selected source model files, read-only
- `package.json`, read-only
- `tsconfig.json`, read-only

### Files Modified

For the recommended trial, files modified should be docs-only and within the
target phase scope. If the target is pure read-only, this can be empty.

### Summary

Should summarize:

- target phase
- manual handoff context
- plan artifact created or reviewed
- safety boundaries preserved
- remaining risks

### Safety Guarantees

Should explicitly confirm:

- source-only
- advisory-only
- metadata-only
- manual copy only
- no Codex launch from source
- no prompt insertion automation
- no system copy automation
- no OpenClaw operation
- no WhatsApp outbound
- no provider calls
- no source-stage file writes
- no package/workflow changes
- no DB/SQL
- no dashboard mutation
- no secret material or network access
- no memory persistence
- no source-control behavior from source

### Tests And Commands

Should list:

- typecheck command and result, if requested
- smoke or docs check command and result, if requested
- diff checks
- scope checks
- forbidden grep result

If WSL Node is unavailable, the report should say so and identify the fallback.

### Scope Check

Should include:

- `git status --short --branch`
- `git diff --name-only`
- `git diff --cached --name-only`
- whether dirty files outside scope were staged

### Forbidden Grep

Should report:

- no matches in target files, or
- allowed historical/advisory matches with exact paths and explanation

Unexplained matches should trigger review.

## Validation Model

Autopilot should validate:

- phase matches expected phase
- mode matches expected mode
- required report fields are present
- modified files stay within allowed scope
- forbidden files are not modified
- staged files are within allowed scope
- required commands are reported
- required tests or smoke checks are reported
- forbidden grep result is clean or reviewed
- commit/push status matches phase mode
- report does not claim provider, dashboard, DB, package, workflow, runtime, or
  secret-material activity

## Expected Validation Status

Possible statuses:

- `passed`: report satisfies expected handoff metadata
- `needs_review`: warnings exist but no hard stop
- `failed`: report misses required evidence or reports failed checks
- `blocked`: forbidden scope or unsafe claim appears

Recommended first trial expectation:

- `passed` if report is complete and docs-only
- `needs_review` if historical advisory grep matches require explanation

## Next-Action Mapping

Validation should feed next-action coordination:

- `passed` in B-mode -> continue to matching I phase
- `needs_review` -> request human review
- `failed` -> retry target phase or fix report
- `blocked` -> stop and require human-reviewed plan

Closeout should then classify:

- completed local-only for B-mode clean plans
- needs human review for warnings
- unsafe scope for blocked validation

## Success Criteria

Report validation succeeds if:

- report shape is complete
- target phase and mode match
- scope is respected
- dirty external files are not staged
- command and smoke evidence is present
- forbidden grep is clean or reviewed
- B-mode has no commit/push
- no unsafe source-driven action is claimed

## Block Criteria

Validation blocks if:

- report phase is wrong
- report omits required sections
- forbidden files are modified
- dirty external files are staged
- package/workflow/provider/dashboard/DB surfaces are modified
- source-stage runtime behavior is claimed
- secret material or environment values appear
- commit/push appears in a B-mode trial
- manual copy evidence is absent

## Limitations

- validation checks report metadata, not live runtime state
- human review is still required for ambiguous findings
- no external systems are queried
- no memory update is persisted
- no source-control action is triggered by validation
