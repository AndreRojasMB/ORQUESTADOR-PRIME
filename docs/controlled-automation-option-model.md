# Controlled Automation Option Model

Phase: 146B - CONTROLLED AUTOMATION DECISION PLAN

Status: docs-only / advisory-only / option model

## Purpose

Define the decision option metadata for choosing the next loop path after the
static dashboard preview.

## Option Metadata

Future metadata:

```ts
interface ControlledAutomationOption {
  optionId: string;
  optionName: string;
  description: string;
  benefit: string;
  risk: string;
  requiredReadiness: string[];
  requiredApproval: string[];
  implementationCost: string;
  safetyLevel: string;
  recommendation: string;
}
```

## Options

### manual_dashboard_only

`optionName`
: Manual + Static Dashboard Only

`description`
: Keep the loop fully manual and use `/autopilot/loop` as the operator review
surface.

`benefit`
: Highest safety and lowest implementation risk.

`risk`
: Manual transfer friction may remain unresolved.

`requiredReadiness`
:
- static dashboard can explain state clearly
- operator understands manual-only boundaries
- report return remains usable

`requiredApproval`
:
- human approval before next phase

`implementationCost`
: low

`safetyLevel`
: highest

`recommendation`
: baseline path until real mini test evidence exists.

### dashboard_interaction_hardening

`optionName`
: Dashboard Interaction Hardening

`description`
: Improve the static dashboard with clearer empty/error states, navigation,
filtering, fixture selection, or evidence detail before considering automation.

`benefit`
: Reduces operator confusion without adding external action risk.

`risk`
: Can delay learning from a real mini test if overdone.

`requiredReadiness`
:
- dashboard clarity is weak
- manual transfer pain is not yet proven as the main issue
- no blocking safety risk exists

`requiredApproval`
:
- human approval for dashboard-only scope

`implementationCost`
: medium

`safetyLevel`
: high

`recommendation`
: choose if the operator cannot easily interpret `/autopilot/loop`.

### controlled_openclaw_paste_future

`optionName`
: Controlled OpenClaw Paste Bridge Future

`description`
: Plan a future human-approved bridge that may help with prompt insertion into a
verified target session.

`benefit`
: Could reduce manual transfer friction if that is the proven bottleneck.

`risk`
: Wrong focus, wrong session, stale prompt, and accidental send risks are high.

`requiredReadiness`
:
- real mini test completed
- manual transfer pain is high
- approval/audit gates pass
- target session verification model is accepted
- abort path is explicit
- report validation is reliable

`requiredApproval`
:
- before OpenClaw activation
- before focus target
- before prompt insertion
- before send
- before accepting report
- before next phase

`implementationCost`
: high

`safetyLevel`
: low until proven, medium only after gates pass

`recommendation`
: do not choose before the real mini test.

### controlled_report_return_future

`optionName`
: Controlled Report Return Hardening Future

`description`
: Improve the report return path before any assisted prompt-transfer path.

`benefit`
: Strengthens validation, closeout, and next-action reliability.

`risk`
: Does not reduce prompt transfer effort.

`requiredReadiness`
:
- report completeness is weak or inconsistent
- validation warnings are frequent
- closeout confidence is low

`requiredApproval`
:
- human approval for report-return hardening scope

`implementationCost`
: medium

`safetyLevel`
: high

`recommendation`
: choose if report validation is the weak link.

### defer_until_real_test

`optionName`
: Defer Until Real Mini Test

`description`
: Run one real mini test before selecting dashboard hardening, OpenClaw path, or
roadmap return.

`benefit`
: Produces observed friction data and avoids premature automation.

`risk`
: Slower than immediately choosing a build path.

`requiredReadiness`
:
- operator guide exists
- execution report template exists
- static dashboard exists
- approval/audit metadata exists
- report return validator exists

`requiredApproval`
:
- human approval to run the mini test manually

`implementationCost`
: low

`safetyLevel`
: high

`recommendation`
: primary recommendation for Phase 146B.

## Selection Priority

1. Safety issue -> `manual_dashboard_only`
2. Weak report return -> `controlled_report_return_future`
3. Weak dashboard clarity -> `dashboard_interaction_hardening`
4. High manual transfer pain after mini test -> `controlled_openclaw_paste_future`
5. Missing evidence -> `defer_until_real_test`

## Next Recommended Phase

Phase 146I - CONTROLLED AUTOMATION DECISION IMPLEMENTATION.
