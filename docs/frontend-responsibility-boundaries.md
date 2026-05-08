# Phase 117B - Frontend Responsibility Boundaries

## Boundary Statement

Frontend Responsibility Rules are planned as generic source-only architecture metadata. They define how frontend responsibilities should be described and reviewed without touching the real dashboard or running any UI tooling.

The layer is a review vocabulary, not a frontend validator, route analyzer, dashboard editor, or refactor engine.

## Allowed Behavior

Future implementation may:

- Accept caller-supplied component metadata.
- Accept caller-supplied responsibility metadata.
- Accept caller-supplied evidence references.
- Create frontend responsibility findings.
- Create UI boundary rules.
- Summarize severity, risk, approval, PM escalation, and Autopilot context.
- Link findings to SOLID principles, architecture smells, checklist items, and validator reports.
- Warn that dashboard write paths are future-gated.

## Forbidden Behavior

Future implementation must not:

- Modify `dashboard/**`.
- Mutate dashboard state.
- Refactor dashboard components.
- Inspect concrete dashboard implementation files.
- Read or write files from source modules.
- Scan folders.
- Parse source trees.
- Detect imports automatically.
- Launch processes.
- Access environment variables.
- Use network calls.
- Call providers or connectors.
- Invoke OpenClaw.
- Send WhatsApp messages.
- Run n8n workflows.
- Persist memory.
- Run git operations from source.
- Deploy or mutate DB/SQL state.
- Approve itself or bypass human review.

## Dashboard Boundary

Dashboard work remains out of scope for Phase 117B and the planned 117I implementation. Dashboard write paths may be named only as abstract future-gated risk metadata.

No dashboard source file should be opened for implementation analysis, modified, validated, or staged in this phase. Existing dirty dashboard files must remain outside scope.

## Frontend Metadata Boundary

The future layer should accept only metadata such as:

- Component reference labels.
- Responsibility category labels.
- Caller-supplied evidence references.
- Caller-supplied affected layer metadata.
- Caller-supplied risk and approval posture.
- Caller-supplied related smell or SOLID references.

Missing metadata should become `needs_review` or an evidence gap in future reports. It must not become permission to read frontend files.

## UI Responsibility Boundary

Frontend responsibilities should remain separated:

- Presentation renders UI and receives data.
- Containers orchestrate state and adapter metadata.
- Effects stay isolated and reviewable.
- Routing stays separate from visual-only components.
- Form validation stays separate from provider writes.
- Accessibility is explicit review metadata.
- Design-system styling does not carry runtime behavior.
- Dashboard writes remain future-gated.

## PM and Autopilot Boundary

Frontend findings can feed PM and Autopilot context, but they cannot trigger:

- PM state mutation.
- Handoff execution.
- Memory persistence.
- Next-action execution.
- Closeout execution.
- Commit or push operations.
- Dashboard changes.

## Stop Conditions

The future layer should mark findings as blocking or review-required when supplied metadata indicates:

- A presentational component owns writes, provider behavior, or runtime behavior.
- A container mixes unrelated visual, routing, data, and side-effect responsibilities.
- A form submission path implies external behavior without approval metadata.
- A dashboard write path is treated as safe without a future gate.
- Accessibility responsibility is absent for interactive components.
- Provider or runtime concerns leak into UI metadata.
