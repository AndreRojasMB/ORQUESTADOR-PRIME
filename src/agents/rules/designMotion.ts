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
