# Mobile Design Token Model

Phase: 136B - MOBILE DESIGN SYSTEM BLUEPRINT PLAN

Status: planning / docs-only / future token metadata

## Purpose

The Mobile Design Token Model defines how Phase 136I should represent future
design tokens as source-only advisory metadata. Tokens should make visual
decisions reviewable before any mobile UI implementation exists.

Tokens are not style declarations, theme files, asset files, native config, or
runtime values.

## Future Type Name

Future Phase 136I should define:

- `MobileDesignToken`

It may also define:

- `MobileDesignTokenType`,
- `MobileThemeSupport`,
- `MobileDesignSystemRiskLevel` if a local alias is useful.

## Token Types

Future token types should include:

- `color`,
- `typography`,
- `spacing`,
- `radius`,
- `shadow`,
- `elevation`,
- `opacity`,
- `motion`,
- `focus`,
- `z_index`,
- `touch_target`,
- `unknown`.

Token types are labels for planning only.

## Token Fields

`MobileDesignToken` should include:

- `tokenId`,
- `tokenName`,
- `tokenType`,
- `valueLabel`,
- `semanticRole`,
- `usageGuidance`,
- `accessibilityNotes`,
- `themeSupport`,
- `riskLevel`,
- `limitations`.

## Field Guidance

`tokenId` should be stable and namespaced.

`tokenName` should be human readable.

`tokenType` should indicate the visual system family.

`valueLabel` should describe the value abstractly, such as `surface_primary`,
`body_text`, `space_4`, or `focus_ring_default`. It should not require a raw
production value in planning phases.

`semanticRole` should explain why the token exists, such as primary action,
danger action, surface background, disabled content, body text, divider,
success feedback, or offline status.

`usageGuidance` should describe where the token may be used and where it should
not be used.

`accessibilityNotes` should capture contrast, text scaling, focus visibility,
motion sensitivity, and color-not-only concerns.

`themeSupport` should describe light, dark, system, or future brand variants.

`riskLevel` should reflect accessibility, security, monetization, or safety
impact.

`limitations` should state that the token is advisory metadata and not a style
implementation.

## Theme Support Values

Future `themeSupport` values may include:

- `light_only_review`,
- `dark_only_review`,
- `light_dark_pair_required`,
- `system_theme_required`,
- `brand_variant_future`,
- `unknown`.

## Semantic Token Families

The future defaults should consider:

- surface tokens,
- text tokens,
- action tokens,
- danger tokens,
- success tokens,
- warning tokens,
- offline tokens,
- focus tokens,
- divider tokens,
- disabled tokens,
- spacing tokens,
- radius tokens,
- elevation tokens,
- motion tokens,
- touch target tokens.

## Accessibility Rules

Token metadata should require:

- contrast review for foreground/background pairs,
- color-not-only support for status and risk,
- visible focus posture,
- minimum touch target posture,
- readable text scale posture,
- dark mode contrast review,
- reduced-motion alternatives.

## Integration With Screen Blueprints

Design tokens should map to:

- component slots,
- screen state refs,
- accessibility notes,
- safety notes,
- performance refs,
- testing refs,
- release reference labels.

The mapping should help future implementation choose consistent visual values
without creating UI during Phase 136.

## Risk Rules

High-risk token metadata should be used when:

- token misuse could hide destructive actions,
- contrast or readability is unclear,
- monetization or paywall states need policy review,
- safety/reporting states need trust clarity,
- reduced-motion support is required,
- sensitive data visibility depends on visual hierarchy.

## Safety Boundary

The token model must remain:

- source-only,
- advisory-only,
- metadata-only,
- no style file creation,
- no UI component creation,
- no screen creation,
- no native styling configuration,
- no design asset creation,
- no runtime execution,
- no package changes,
- no provider calls,
- no database or schema mutation,
- no CI activation,
- no memory persistence,
- no git automation from source.
