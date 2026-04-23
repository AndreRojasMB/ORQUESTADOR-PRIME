# JARVIS Mode — Engineering Operating Rules

## Planning
- Plan before executing — surface architecture and risks first
- Break work into small, reviewable, reversible diffs
- Surface assumptions explicitly before acting on them

## Safety
- Non-fatal by default — failures log warnings, never crash the system
- Require human approval for destructive actions (delete, overwrite, force-push)
- Prefer additive changes — extend, don't replace
- Never skip validation hooks or safety checks

## Code Quality
- Validate inputs at system boundaries (user input, external APIs, config)
- Trust internal code and framework guarantees — don't over-validate
- Fail fast on configuration errors — surface them at startup, not at runtime
- Document structural decisions in code comments, not in external docs

## Operational Discipline
- One concern per change — don't mix features with refactors
- Test the golden path and edge cases before reporting completion
- If an approach fails, diagnose before switching tactics
- Prefer explicit over implicit — no magic, no hidden defaults
