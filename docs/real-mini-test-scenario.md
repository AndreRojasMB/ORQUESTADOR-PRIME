# Real Mini Test Scenario

Phase: 147B - REAL MINI TEST EXECUTION PLAN

Status: docs-only / advisory-only / scenario planning

## Scenario Name

Habit Mini Loop Trial

## Idea

```text
Quiero una app movil simple de habitos con progreso diario, recordatorios y una
pantalla de estadisticas.
```

## Goal

Validate whether a human operator can move from a simple app idea to a safe
manual loop closeout with enough evidence to choose A/B/C.

## Starting State

Expected starting state:

- project path: `/home/varyan/projects/ORQUESTADOR-PRIME`
- branch: `dev`
- static dashboard route exists: `/autopilot/loop`
- controlled automation decision says real mini test is required first
- unrelated dirty files, if present, are known and not staged

## Test Roles

Operator:
: Human who follows the test instructions and records evidence.

Reviewer:
: Human who checks stop conditions, validation, closeout, and A/B/C decision.

Codex Session:
: A separate human-managed session. Source code does not start or control it.

## Expected Prompt Package

The prompt package should include:

- project path
- branch
- task
- mode
- idea text
- allowed files
- forbidden files
- boundaries
- verification plan
- final report format
- stop conditions
- commit/push posture

The prompt package must preserve:

- human approval required
- source-side action unavailable
- manual transfer only

## Expected Report Shape

The returned report should include:

- phase
- files inspected
- files modified
- summary
- safety guarantees
- tests/scripts
- commands executed
- scope check
- forbidden grep
- commit/push
- next recommended phase

Missing sections become review or blocker evidence.

## Planned Steps

### Step 1: Prepare Repo State

Record:

- branch
- known dirty files
- staged files
- protected scope warnings

Stop if unknown staged files appear.

### Step 2: Review Dashboard

Open or read the static dashboard state:

- current loop status
- manual-only warning
- approval/audit evidence
- validation card
- closeout card
- next action card

Record dashboard clarity score.

### Step 3: Select Idea

Use only the habit mini idea. Do not add provider setup, production data, secret
material, or dashboard mutation goals.

### Step 4: Select Prompt Draft Metadata

Use existing safe metadata or a human-prepared prompt package. Confirm it is
bounded and not source-action-ready.

### Step 5: Approve Handoff

Confirm:

- approved for manual transfer
- no blocking handoff issues
- human approval evidence exists
- source-side action remains unavailable

### Step 6: Human-Managed Codex Session

The human operator transfers the prompt manually into a separate session and
runs that session manually.

Record:

- target session label
- manual transfer evidence
- friction notes

### Step 7: Submit Report Manually

The human operator submits the returned report into the review context.

Record:

- report label
- report completeness
- missing sections

### Step 8: Validate And Close Out

Review:

- validation status
- alert level
- blockers
- warnings
- closeout status
- next-action recommendation

### Step 9: Decide A/B/C

Use the decision output model:

- A: return to main roadmap
- B: improve dashboard/UX
- C: plan controlled OpenClaw path
- Blocked: repair safety or validation

## Expected End State

The test ends with:

- completed evaluation rubric
- decision output
- stop-condition status
- next recommended phase

No source-side external action is introduced by this plan.
