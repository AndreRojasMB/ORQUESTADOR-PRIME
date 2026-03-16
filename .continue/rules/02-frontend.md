---
name: Frontend Rules
globs: ["**/*.tsx", "**/*.jsx", "**/*.css", "**/*.scss", "**/*.module.css"]
description: UI, component, and UX rules for frontend work.
---

# Frontend Rules

- Favor localized component changes over broad UI rewrites.
- Reuse existing components, tokens, and patterns before adding new abstractions.
- Keep state as local as possible; only lift it when multiple consumers require it.
- Include loading, empty, error, and success states when behavior changes.
- Do not move backend or security logic into the client.
- Preserve accessibility basics: labels, keyboard access, visible states, semantic structure.
- Avoid unnecessary visual churn while implementing functional changes.
- When changing routes or page structure, note impacted navigation paths.
- Mention likely files touched before making large UI edits.
- Do not implement scroll-triggered animations, parallax, or 
  motion effects directly; delegate to the UI/Motion agent context.
- Prefer CSS custom properties (design tokens) over hardcoded values.
- Use TypeScript strict mode; avoid `any` types in component props.