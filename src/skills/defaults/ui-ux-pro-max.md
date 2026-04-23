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

## Anti-Patterns
- No horizontal scroll on mobile viewports
- No auto-playing media without user opt-in
- No disabled buttons without explanation of why
- No modals for simple confirmations — use inline feedback
- No layout shift after content loads (reserve space for async content)
