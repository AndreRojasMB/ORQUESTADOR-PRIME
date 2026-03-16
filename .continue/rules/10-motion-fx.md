---
name: UI Motion & Visual FX Rules
globs: ["**/*.gsap.*", "**/animations/**", "**/motion/**", "**/effects/**"]
description: Scroll animations, micro-interactions, and visual FX rules.
---

# UI Motion & Visual FX Rules

- Prefer CSS transitions for simple state changes; use GSAP or Framer Motion for complex sequences.
- All scroll-triggered animations must use IntersectionObserver or ScrollTrigger; never use raw scroll listeners directly unless strictly necessary.
- Respect prefers-reduced-motion; all animations must have a no-motion fallback.
- Avoid animating layout-triggering properties like width, height, top, and left; prefer transform and opacity.
- Lenis or equivalent smooth-scroll tools must not conflict with native browser scroll behavior.
- 3D effects require an explicit performance budget and must not degrade the whole page experience.
- Animations should enhance content, not obstruct it or delay interaction.
- Document timing values and easing curves as named constants, not magic numbers.