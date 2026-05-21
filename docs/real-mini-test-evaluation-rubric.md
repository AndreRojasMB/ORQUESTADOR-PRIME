# Real Mini Test Evaluation Rubric

Phase: 147B - REAL MINI TEST EXECUTION PLAN

Status: docs-only / advisory-only / evaluation rubric

## Purpose

Define how the operator scores the real mini test after completing or stopping
the manual loop.

Use a 1-5 score for each category:

- `1`: failed or unsafe
- `2`: confusing or hard to repeat
- `3`: usable with clear rough edges
- `4`: useful with minor cleanup
- `5`: clear, repeatable, and safe

## Rubric Fields

### Dashboard Clarity

Question:
: Could the operator understand current state, blockers, and next action from
the static dashboard?

Score guidance:

- `1`: dashboard misled the operator
- `3`: dashboard helped but docs were still required
- `5`: dashboard made state and next step clear

### Prompt Clarity

Question:
: Was the prompt package bounded, complete, and easy to trust?

Score guidance:

- `1`: boundaries missing or unsafe
- `3`: usable but required interpretation
- `5`: complete, bounded, and clear

### Copy/Paste Friction

Question:
: Was manual prompt transfer tolerable?

Score guidance:

- `1`: transfer caused safety concern or repeated error
- `3`: transfer was annoying but safe
- `5`: transfer was quick and tolerable

Decision note:
: Low score here may support option C only if other safety scores are strong.

### Codex Report Quality

Question:
: Did the returned report include the required sections and useful evidence?

Score guidance:

- `1`: report missing or unsafe
- `3`: report usable with missing or weak parts
- `5`: report complete and easy to validate

### Validation Reliability

Question:
: Did validation classify the report clearly?

Score guidance:

- `1`: validation could not decide
- `3`: validation needed human interpretation
- `5`: validation status and alert were clear

### Closeout Clarity

Question:
: Did closeout produce a clear status and next step?

Score guidance:

- `1`: closeout conflicted with validation
- `3`: closeout worked but needed review
- `5`: closeout was obvious and safe

### User Confidence

Question:
: Would the operator repeat this loop?

Score guidance:

- `1`: no
- `3`: yes, with assistance
- `5`: yes, confidently

### Total Manual Effort

Question:
: Was the manual workload acceptable?

Score guidance:

- `1`: too high
- `3`: moderate
- `5`: low

### Usefulness

Question:
: Did the test produce useful product/roadmap evidence?

Score guidance:

- `1`: no useful decision
- `3`: partial decision
- `5`: clear A/B/C decision

### Safety Confidence

Question:
: Did the operator feel the loop stayed within safety boundaries?

Score guidance:

- `1`: unsafe or unclear
- `3`: safe but required careful review
- `5`: safe and clearly bounded

## Summary Metrics

Record:

```text
dashboardClarity:
promptClarity:
copyPasteFriction:
codexReportQuality:
validationReliability:
closeoutClarity:
userConfidence:
totalManualEffort:
usefulness:
safetyConfidence:

averageScore:
lowestScore:
highestFrictionCategory:
blockingIssuePresent:
```

## Decision Thresholds

A - Return to main roadmap:

- safety confidence >= 4
- dashboard clarity >= 4
- validation reliability >= 4
- closeout clarity >= 4
- copy/paste friction >= 3

B - Improve dashboard/UX:

- dashboard clarity <= 3
- closeout clarity <= 3
- user confidence <= 3
- safety confidence remains acceptable

C - Plan controlled OpenClaw path:

- copy/paste friction <= 2
- dashboard clarity >= 4
- approval/audit posture is strong
- abort/rollback posture is strong
- safety confidence >= 4

Blocked:

- safety confidence <= 2
- validation reliability <= 2
- report quality <= 2
- any stop condition triggered

## Required Narrative Notes

After scoring, record:

- what slowed the operator most
- what made the operator confident
- what evidence was missing or weak
- whether dashboard helped enough
- whether manual transfer was acceptable
- final A/B/C/Blocked recommendation
