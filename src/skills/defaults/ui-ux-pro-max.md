# UI/UX Pro Max — Design Intelligence Rules

## Visual Hierarchy
- Establish clear content hierarchy: primary action > secondary > tertiary
- Use size, weight, and contrast to signal importance — never color alone
- Limit to 2-3 font sizes per view; use spacing to create groupings

## Spacing & Layout
- Use a consistent spacing scale (4px base: 4, 8, 12, 16, 24, 32, 48)
- Maintain minimum 16px touch targets (48px recommended for mobile)
- Prefer CSS Grid for page layout, Flexbox for component-level alignment

## Motion & Timing
- Enter animations: 200-300ms ease-out
- Exit animations: 150-200ms ease-in
- Never animate layout properties (width, height, top, left) — use transform
- Respect prefers-reduced-motion: disable non-essential animations

## Accessibility
- All interactive elements must have visible focus indicators
- Color contrast: minimum 4.5:1 for text, 3:1 for large text and UI components
- Every image needs alt text; decorative images use alt=""
- Form inputs require associated labels — never placeholder-only

## Design Tokens
- Define colors, spacing, typography, and shadows as tokens — not raw values
- Dark mode: never invert colors — define a separate token set
- Limit palette to 1 primary, 1 accent, 3-4 neutrals

## Motion Library Selection
- Default to CSS transitions for single-property state changes (hover, focus, toggle)
- Reach for Framer Motion in React projects needing AnimatePresence, layout animations, or gestures
- Reach for GSAP when you need long multi-target choreography or scroll-linked timelines (ScrollTrigger)
- Reach for Anime.js (optional) for SVG path/line draw-ons, fine-grained stagger, or short DOM timelines
- Do not mix two animation libraries in the same component — pick one per concern
- Anime.js is optional: assume it is not installed unless package.json says otherwise; suggest `npm install animejs` explicitly before using it, never silently
- Never let the library choice bypass reduced-motion rules — accessibility wins

## Anti-Patterns
- No horizontal scroll on mobile viewports
- No auto-playing media without user opt-in
- No disabled buttons without explanation of why
- No modals for simple confirmations — use inline feedback
- No layout shift after content loads (reserve space for async content)
