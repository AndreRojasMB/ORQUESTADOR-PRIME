// src/agents/rules/designMotion.ts
// Shared design and motion rules consumed by agent instructions.
// Phase 26A — additive only, no runtime behavior changes.

export const MOTION_RULES = `
Animation Timing:
- Micro-interactions (hover, toggle, press): 200–300ms
- Component enter/exit (modals, dropdowns, toasts): 300–400ms
- Page/view transitions: 400–600ms
- Never exceed 600ms for any animation

Easing:
- Enters: ease-out (fast start, gentle land)
- Exits: ease-in (gentle start, fast out)
- State changes: ease-in-out
- Never use linear for UI motion

Enter Transitions:
- Fade in + translateY(8–12px) from below
- Or scale from 0.95 + fade in
- Combine opacity + one transform only

Exit Transitions:
- Reverse of enter direction
- Duration = 80% of enter duration
- Opacity always reaches 0

Stagger:
- 50–80ms delay between sibling items
- Maximum 5 items before grouping remaining as one batch
- First item appears immediately (no delay)

Performance:
- Only animate transform and opacity
- Never animate width, height, top, left, margin, padding
- Use will-change sparingly and remove after animation
- Prefer CSS transitions for simple state changes
- Use requestAnimationFrame or GSAP for complex sequences

Reduced Motion (prefers-reduced-motion: reduce):
- Disable all transform-based motion
- Keep opacity fades, capped at 200ms
- Ensure no information is lost without animation
- Use instant state changes as fallback

Anti-Patterns:
- No bounce or elastic easing on functional UI
- No animations longer than 600ms
- No animating layout-triggering properties
- No motion that blocks or delays user interaction
- No decorative animation that cannot be disabled
- No parallax without reduced-motion fallback
`.trim();

export const DESIGN_TOKEN_RULES = `
Design Tokens:
- Always use CSS custom properties / design tokens for visual values
- Never use raw hex colors, pixel sizes, or magic numbers inline

Spacing Scale (4px base):
- 4, 8, 12, 16, 24, 32, 48, 64, 96
- Use consistent spacing from this scale for all margin/padding/gap

Border Radius:
- small: 4px — inputs, chips
- medium: 8px — cards, containers
- large: 12px — modals, panels
- pill: 9999px — tags, badges

Elevation / Shadows:
- sm: subtle depth for cards and dropdowns
- md: moderate lift for floating elements
- lg: strong depth for modals and overlays
- Use elevation tokens, not ad-hoc box-shadow values

Typography:
- Use the existing type scale — never invent new font sizes
- Respect line-height and letter-spacing tokens
- Ensure sufficient contrast (WCAG AA minimum)

Color:
- Use semantic color tokens (primary, secondary, error, warning, success)
- Support dark mode via token layer, not conditional overrides
- Ensure 4.5:1 contrast ratio for text, 3:1 for large text and UI
`.trim();

export const ANIMATION_LIBRARY_RULES = `
Motion Library Selection:
- Use motion only when it clarifies state, direction, or hierarchy. When in doubt, do nothing.
- Default to CSS transitions for single-property state changes (hover, focus, toggle).
- Reach for a library only when CSS can't express the need.

When to pick CSS:
- Micro-interactions on a single element (one transform + opacity, < 300ms).
- Any state change that's already covered by a :hover / :focus / data-attribute rule.
- No dependency, no JS cost — always the first choice.

When to pick Framer Motion:
- React projects that already use it, or need AnimatePresence for mount/unmount.
- Layout animations driven by React state changes.
- Drag/gesture interactions on components.
- Preferred for component-local motion inside a React tree.

When to pick GSAP:
- Long, multi-target choreography or scroll-linked sequences (ScrollTrigger).
- High-density timelines where frame-accurate control matters.
- Projects already using GSAP — do not introduce a second heavy library.

When to pick Anime.js (optional):
- SVG path draw-on, line morph, or shape stroke animation (its strongest use case).
- Grid / text-split stagger with \`anime.stagger()\` where Framer's stagger is too coarse.
- Short DOM timelines that don't justify GSAP's footprint.
- Projects that already depend on Anime.js.

Optionality contract for Anime.js:
- Assume Anime.js is NOT installed unless the task brief, package.json, or existing imports indicate otherwise.
- Do not emit \`import anime from "animejs"\` without first confirming the dependency exists, or
  without including a visible install instruction (\`npm install animejs\`) in the generated plan/blueprint.
- If unsure whether the project has Anime.js, fall back to CSS or Framer Motion.
- Never silently add Anime.js to a scaffold or starter template.

React usage pattern (Anime.js):
- Use useRef for each animation target; avoid class-based selectors when a ref works.
- Start the animation inside useEffect after mount; capture the returned instance so you can
  pause / seek / remove it on cleanup.
- For lists, apply \`delay: anime.stagger(60)\` (matches the 50–80ms stagger rule).
- Keep timelines short-lived and idempotent — tear down on unmount.
- Do not mix Anime.js and Framer Motion within the same component. Pick one per concern.

Accessibility (applies to every library):
- Branch on \`window.matchMedia("(prefers-reduced-motion: reduce)").matches\` before playing any non-CSS animation.
- Under reduced motion: skip transforms, cap opacity fades at 200ms, set the final state immediately.
- Animation must never block user input or hide critical content behind completion.
- Library choice cannot bypass MOTION_RULES — reduced-motion remains authoritative.

Library per motion category:
- Micro-interactions (hover, press, toggle) — CSS preferred; Framer acceptable; Anime overkill.
- Enter/exit transitions — Framer (AnimatePresence) for React; Anime viable if already present.
- Stagger / list reveal — Framer or Anime (Anime strength); CSS for tiny lists.
- Scroll-linked — GSAP ScrollTrigger or Framer scroll utilities; Anime + IntersectionObserver as a lighter alternative.
- SVG path / line / stroke — Anime preferred; GSAP second; rarely feasible in CSS.
- Timelines / multi-step choreography — GSAP or Anime; Framer is limited here.
`.trim();

export const LAYOUT_RULES = `
Vertical Rhythm:
- Use consistent vertical spacing from the spacing scale
- Section gaps should follow a predictable pattern (e.g., 48 or 64 between sections)
- Component internal spacing should use smaller scale values (8, 12, 16)

Container Widths:
- Prose/text content: max-width 65ch
- Standard content: max-width 1024px
- Wide content: max-width 1280px
- Always center containers with auto margins

Grid and Flexbox:
- CSS Grid for 2D layouts (cards grid, dashboard panels)
- Flexbox for 1D layouts (navbars, button groups, inline items)
- Prefer gap over margin for spacing between siblings

Responsive:
- Mobile-first — base styles for small screens, enhance upward
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- Test content at every breakpoint, not just desktop

Accessibility Layout:
- Logical reading order must match visual order
- Focus order must follow visual flow
- Touch targets minimum 44x44px
- Ensure layouts remain usable at 200% zoom
`.trim();
