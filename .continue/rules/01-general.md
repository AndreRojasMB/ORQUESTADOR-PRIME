---
name: General Engineering Guardrails
alwaysApply: true
description: Global repository rules for safe, reviewable AI-assisted development.
---

# General Engineering Guardrails

- Prefer plan-first for any non-trivial or multi-file task.
- Keep diffs small, reversible, and easy to review.
- Do not rename, move, or delete files unless the task explicitly requires it.
- Respect existing architecture and conventions before introducing new patterns.
- Do not introduce new dependencies unless there is a clear justification.
- Preserve public APIs unless the task explicitly requires breaking changes.
- If a change affects architecture, add a short note in documentation or the PR description.
- Surface assumptions instead of inventing facts about the repo.
- Always mention validation steps for behavioral changes.
- Treat destructive commands, publish actions, deploys, schema-destructive migrations, and branch-protection changes as human-approval steps.