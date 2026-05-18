# App Idea Intake Output Model

Phase: 131B - APP IDEA INTAKE INTERVIEW PLAN

Status: planning model only

## Purpose

The App Idea Intake Output Model defines how a future interview result should
normalize answers into structured mobile planning metadata. The output prepares
Mobile App Factory and the 121-130 advisory layers without running automation
or generating apps.

## Answer Metadata

Future `AppIdeaIntakeAnswer` metadata should include:

- `answerId`
- `questionId`
- `answerText`
- `normalizedValue`
- `confidence`
- `unresolved`
- `needsFollowUp`
- `evidenceRefs`

Answers are caller-supplied or fixture-supplied metadata. The model does not
contact users, collect live evidence, or persist memory.

## Interview Output Metadata

Future `AppIdeaIntakeInterview` metadata should include:

- `interviewId`
- `ideaText`
- `appTypeHypothesis`
- `targetUsers`
- `problemStatement`
- `desiredOutcome`
- `coreFlows`
- `featureCandidates`
- `constraints`
- `assumptions`
- `unansweredQuestions`
- `confidence`
- `riskLevel`
- `requiredApprovals`
- `nextRecommendedArtifact`

## Confidence Model

Recommended confidence labels:

- `high`
- `medium`
- `low`
- `blocked_by_unknowns`

Confidence should reflect how many required questions are answered, how
specific the answers are, whether risk-bearing answers are unresolved, and
whether downstream artifacts can be produced safely.

## Intake Output Mapping

Interview output should map toward Mobile App Factory metadata:

- `ideaText` -> app idea,
- `targetUsers` -> target users,
- `problemStatement` -> safe summary and business goal,
- `appTypeHypothesis` -> supported app type,
- `coreFlows` -> core flows,
- `featureCandidates` -> screen map and MVP feature seeds,
- `platform` answers -> platform priority,
- `auth` answers -> auth needs,
- `offline` answers -> offline needs,
- `monetization` answers -> monetization needs,
- `safety_privacy` answers -> safety needs and approval posture,
- `release` answers -> release target.

## Downstream Metadata Mapping

The normalized output should feed:

- Mobile App Factory Strategy,
- RN/Expo Architecture Profile,
- UX/UI Pattern Catalog,
- Navigation Flow Model,
- State Management Strategy,
- Offline / Cache / Sync Strategy,
- Mobile Security Baseline,
- Performance Checklist,
- Testing Strategy,
- Release Strategy.

The mapping is advisory only. It does not create downstream artifacts unless a
future approved implementation phase explicitly calls helper functions with
caller-supplied metadata.

## Risk And Approval Output

Risk and approval metadata should reflect:

- unresolved required questions,
- sensitive data,
- auth/session needs,
- offline write needs,
- monetization or premium boundaries,
- safety/report/block needs,
- public release ambitions,
- provider or integration assumptions,
- low-confidence app type classification.

High-risk or low-confidence output should recommend human review before later
planning artifacts are treated as implementation-ready.

## Conversational Build Loop Readiness

This output model prepares the future path:

```text
simple idea -> intake interview -> normalized answers
-> mobile strategy -> architecture profile -> UX/navigation/state/security/testing/release metadata
-> future Codex handoff prompt
```

Phase 131B does not automate that loop, invoke agents, generate prompts, or
create apps.

## Safety Boundaries

The output model must remain:

- source-only,
- advisory-only,
- metadata-only,
- no live chat automation,
- no outbound messaging,
- no WhatsApp outbound behavior,
- no OpenClaw operation,
- no Codex invocation,
- no app generation,
- no Expo/EAS execution,
- no native project creation,
- no package changes,
- no provider calls,
- no runtime execution,
- no dashboard mutation,
- no DB/SQL,
- no secrets/env/network,
- no memory persistence,
- no source-control automation from source.
