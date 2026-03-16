---
name: UX/UI Design Rules
globs: ["**/*.figma", "**/design/**", "**/tokens/**", "**/*.stories.*", "**/styles/**"]
description: Accessibility, design system, and user experience rules.
---

# UX/UI Design Rules

- Validate accessibility with WCAG 2.1 AA as the baseline minimum.
- Use design tokens for all color, spacing, and typography values.
- Every interactive element must have visible focus, hover, disabled, and loading states.
- Do not introduce new components if an existing one can be extended.
- Document component variants and usage context in Storybook or equivalent.
- Use a mobile-first layout and validate at 375px, 768px, and 1440px breakpoints.
- Motion and animation decisions belong to the UI/Motion agent; UX defines intent, not implementation.