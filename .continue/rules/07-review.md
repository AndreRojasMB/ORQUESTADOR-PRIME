---
name: Review Rules
alwaysApply: true
description: Review-first engineering checklist for AI-proposed changes.
---

# Review Rules

- Before finalizing, summarize what changed and why.
- List likely impacted files or modules.
- State key risks, regressions, and assumptions.
- Provide a concise validation checklist: typecheck, tests, lint, manual checks.
- Prefer draft PRs until validation is complete.
- If the change is larger than expected, propose splitting it into smaller PRs.
- Keep commit strategy coherent: one logical change per commit or per PR slice.
- Never assume merge to main is automatic.
- If the change involves an external integration, verify the 
  Integration agent has reviewed adapter boundaries.
- Check that no agent has crossed its domain boundary 
  (e.g. Frontend writing DB queries directly).