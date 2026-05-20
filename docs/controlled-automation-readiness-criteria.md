# Controlled Automation Readiness Criteria

Phase: 146B - CONTROLLED AUTOMATION DECISION PLAN

Status: docs-only / advisory-only / readiness criteria

## Purpose

Define the criteria that must be reviewed before deciding whether to stay
manual, improve dashboard UX, harden report return, or plan a future OpenClaw
bridge.

## Criteria Metadata

Future metadata:

```ts
interface ControlledAutomationReadinessCriterion {
  criterionId: string;
  criterionName: string;
  description: string;
  evidenceRequired: string[];
  passCondition: string;
  warningCondition: string;
  blockCondition: string;
  decisionImpact: string;
}
```

## Criteria

### dashboard_clarity

Description:
: Can the operator understand loop state, blockers, next action, and manual-only
boundaries from `/autopilot/loop`?

Evidence required:

- operator clarity score
- confusion notes
- screenshot or review notes from the static dashboard

Pass condition:
: Operator can identify state, blocker posture, and next phase without opening
multiple docs.

Warning condition:
: Operator understands the state but needs extra docs.

Block condition:
: Operator cannot determine whether to stop or continue.

Decision impact:
: Weak clarity routes to dashboard interaction hardening.

### user_friction_level

Description:
: Overall friction across dashboard, handoff, report return, validation, and
closeout.

Evidence required:

- friction score
- time cost label
- confusion log

Pass condition:
: Friction is low or moderate.

Warning condition:
: Friction is high but safe.

Block condition:
: Friction causes missed evidence or unsafe continuation.

Decision impact:
: High friction routes to hardening before automation.

### manual_transfer_pain_level

Description:
: Measures whether moving prompt text manually is the primary pain.

Evidence required:

- mini test operator note
- manual transfer time estimate
- error or hesitation log

Pass condition:
: Manual transfer is tolerable.

Warning condition:
: Manual transfer is annoying but safe.

Block condition:
: Manual transfer causes repeated errors or unsafe ambiguity.

Decision impact:
: Only high proven pain can justify planning a future OpenClaw path.

### approval_audit_readiness

Description:
: Checks whether protected actions have clear human decisions and evidence.

Evidence required:

- approval decision
- audit evidence
- required approver
- rollback hint

Pass condition:
: Required approvals and evidence are present.

Warning condition:
: Evidence exists but confidence is weak.

Block condition:
: Approval is missing.

Decision impact:
: Missing approval keeps the loop manual.

### abort_rollback_readiness

Description:
: Confirms the operator can stop and recover safely.

Evidence required:

- abort plan
- rollback hint
- stop-condition list

Pass condition:
: Clear stop and recovery path exists.

Warning condition:
: Abort exists but is hard to explain.

Block condition:
: No safe recovery path is documented.

Decision impact:
: Weak abort posture blocks assisted paths.

### report_validation_reliability

Description:
: Checks whether returned reports can be normalized, validated, and closed out.

Evidence required:

- report return record
- validation summary
- closeout status

Pass condition:
: Validation is no-alert or accepted mild-review.

Warning condition:
: Validation needs review but is usable.

Block condition:
: Report is missing, unsafe, or inconsistent.

Decision impact:
: Weak report validation routes to report return hardening.

### dirty_file_safety

Description:
: Confirms unrelated dirty files are understood and not staged.

Evidence required:

- git status summary
- scope check
- staged-file check

Pass condition:
: Dirty files outside scope are known and unstaged.

Warning condition:
: Dirty files are known but create review noise.

Block condition:
: Unknown or out-of-scope staged files appear.

Decision impact:
: Dirty-file uncertainty blocks assisted paths.

### operator_confidence

Description:
: Measures whether the human operator trusts the process enough to repeat it.

Evidence required:

- confidence score
- usefulness score
- improvement notes

Pass condition:
: Operator confidence is high.

Warning condition:
: Operator confidence is medium.

Block condition:
: Operator confidence is low.

Decision impact:
: Low confidence routes to UX hardening or manual-only.

### safety_risk

Description:
: Aggregates approval, report, scope, prompt, session, and rollback risk.

Evidence required:

- risk summary
- blocker list
- warning list
- reviewer decision

Pass condition:
: Risk is low or accepted medium.

Warning condition:
: Risk is medium/high but reviewable.

Block condition:
: Risk is high and unaccepted, or critical.

Decision impact:
: High unaccepted risk keeps the loop manual.

## Readiness Gate

Do not recommend future assisted behavior unless all of these are true:

- mini test completed
- dashboard clarity passed
- manual transfer pain is proven high
- approval/audit readiness passed
- abort/rollback readiness passed
- report validation reliability passed
- dirty file safety passed
- operator confidence is high
- safety risk is low or explicitly accepted by a human reviewer

## Next Recommended Phase

Phase 146I - CONTROLLED AUTOMATION DECISION IMPLEMENTATION.
