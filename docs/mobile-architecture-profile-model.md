# Mobile Architecture Profile Model

Phase: 122B - REACT NATIVE / EXPO ARCHITECTURE PROFILE PLAN

Status: planning / metadata model / docs-only

## Purpose

The Mobile Architecture Profile Model defines the future metadata contract for
React Native / Expo architecture recommendations. It consumes Mobile App
Factory strategy metadata and returns an advisory architecture profile for PM,
SOLID, and Autopilot review.

It does not generate apps, create folders, configure mobile tooling, execute
release commands, or mutate runtime systems.

## Future Metadata Contract

Future `MobileArchitectureProfile` metadata should include:

- `profileId`
- `appType`
- `platformPriority`
- `recommendedNavigation`
- `recommendedProjectStructure`
- `stateManagementProfile`
- `dataAccessProfile`
- `offlineProfile`
- `authProfile`
- `securityProfile`
- `testingProfile`
- `releaseProfile`
- `riskLevel`
- `requiredApprovals`
- `limitations`

All fields should be caller-supplied, derived from caller-supplied Mobile App
Factory metadata, or static advisory defaults. The profile must not inspect a
real app or workspace.

## App Type Input

The profile should accept Mobile App Factory app types:

- `habit_gamified_app`
- `social_freemium_app`
- `marketplace_app`
- `erp_mobile_field_ops_app`
- `education_app`
- `service_booking_app`
- `dashboard_companion_app`
- `ai_assistant_mobile_app`
- `unknown_mobile_app`

Each app type should influence risk and architecture posture, not trigger
template generation.

## Recommended Navigation Metadata

`recommendedNavigation` should describe:

- root route posture,
- onboarding flow posture,
- auth gate posture,
- tab or stack posture,
- modal posture,
- deep link posture,
- settings and support posture,
- offline recovery posture,
- accessibility expectations for navigation.

For future Expo Router planning, the profile may describe route groups and
screen ownership as metadata only. It must not create `app/` files.

## Recommended Project Structure Metadata

`recommendedProjectStructure` should describe planned layers:

- `app_routes`
- `screens`
- `components`
- `features`
- `domain`
- `services`
- `repositories`
- `state`
- `theme`
- `mocks`
- `tests`
- `config`
- `native_future`
- `release_future`

Each layer should include:

- purpose,
- allowed responsibilities,
- forbidden responsibilities,
- review-required responsibilities,
- SOLID principles to review,
- PM risk surfaces,
- Autopilot handoff notes.

## State Management Profile

`stateManagementProfile` should describe:

- local UI state,
- feature state,
- server cache state,
- offline queue state,
- auth/session state,
- persisted preferences,
- state ownership boundaries,
- performance concerns around re-render pressure.

The profile may recommend keeping state small, colocated, and feature-owned
until requirements justify broader stores. It must not install state libraries
or write store modules.

## Data Access Profile

`dataAccessProfile` should describe:

- API client boundary,
- repository boundary,
- DTO/domain mapping posture,
- validation posture,
- error normalization,
- retry posture,
- provider boundary,
- backend dependency risk.

The profile must keep provider and network behavior future-gated. It does not
call APIs or create clients.

## Offline Profile

`offlineProfile` should describe:

- cache needs,
- local persistence needs,
- offline queue needs,
- conflict handling,
- sync recovery,
- stale data messaging,
- privacy risk,
- human approval requirements.

Offline support should remain advisory until a future implementation phase
approves storage and sync behavior.

## Auth And Security Profiles

`authProfile` should describe:

- anonymous, signed-in, or role-based posture,
- session lifecycle,
- recovery path,
- account deletion needs,
- permission prompts,
- privacy review,
- sensitive data handling,
- secure storage needs.

`securityProfile` should describe:

- device permission risks,
- abuse risks,
- content safety risks,
- payment or premium risks,
- provider trust boundaries,
- approval requirements.

The profile does not configure credentials, providers, stores, or payments.

## Testing Profile

`testingProfile` should describe:

- unit test targets,
- component test targets,
- navigation review,
- accessibility review,
- offline behavior review,
- auth flow review,
- release smoke checklist,
- device coverage matrix,
- performance review targets.

Performance review targets should plan for FPS, re-render pressure, startup
time, bundle size, list virtualization, and native boundary risk before real
implementation. No tests are run in Phase 122B.

## Release Profile

`releaseProfile` should describe:

- internal demo readiness,
- beta readiness,
- store candidate readiness,
- enterprise distribution posture,
- privacy policy readiness,
- crash reporting posture,
- analytics posture,
- platform policy review,
- rollout and rollback notes,
- required approvals.

Release metadata remains future-gated. It does not create builds, submit apps,
publish updates, change package scripts, or activate workflows.

## Risk And Approval Model

Risk should be elevated when metadata includes:

- auth or sensitive data,
- payments or premium monetization,
- marketplace transactions,
- offline queue and sync needs,
- push notification needs,
- provider dependency pressure,
- native module needs,
- platform policy concerns,
- enterprise distribution,
- AI assistant safety concerns.

Approval requirements should identify what must be reviewed before a future
implementation phase.

## Conversational Build Loop Contract

The future Conversational Build Loop may use this profile to transform:

- a raw idea,
- Mobile App Factory intake,
- app type,
- screen map,
- flow list,
- safety needs,
- release target,

into:

- architecture recommendation,
- layer model,
- screen ownership plan,
- risk and approval plan,
- phase split,
- Codex handoff prompt draft.

Phase 122B only defines that contract. It does not implement the loop, generate
prompts automatically, or start Codex.

## Future 122I Scope

If approved, Phase 122I may implement:

- `docs/react-native-expo-architecture-profile.md`
- optional `src/pm/mobileArchitectureProfile.ts`
- optional `scripts/mobile-architecture-profile-tests.ts`

The implementation must remain source-only and pure. It must not generate apps,
run mobile tooling, create native folders, mutate package manifests, activate
CI, call providers, write memory, or execute runtime behavior.

## Next Phase

After 122I, the next formal target should be:

- Phase 123B - MOBILE UX/UI PATTERN CATALOG PLAN
