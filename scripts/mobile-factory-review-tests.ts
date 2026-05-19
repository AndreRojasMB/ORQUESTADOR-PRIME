import {
  createMobileFactoryReview,
  recommendMobileFactoryNextStep,
  selectMobileFactoryGapsBySeverity,
  summarizeMobileFactoryReview,
} from "../src/pm/mobileFactoryReview.ts";

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const review = createMobileFactoryReview();
const summary = summarizeMobileFactoryReview(review);
const warningGaps = selectMobileFactoryGapsBySeverity(review.gaps, "warning");
const recommendation = recommendMobileFactoryNextStep(review);

assert(review.readiness.coveredPhases.length === 19, "review must cover phases 121-139");
assert(review.readiness.coveredModules.length === 19, "review must cover all mobile factory modules");
assert(review.readiness.completedCapabilities.length === 19, "review must report completed advisory capabilities");
assert(review.readiness.readinessStatus === "ready_with_gaps", "default readiness should preserve known gaps");
assert(review.gaps.length >= 3, "review must include gap analysis");
assert(warningGaps.length >= 2, "review must classify warning gaps");
assert(review.deferredRuntimeItems.length >= 3, "review must include deferred runtime items");
assert(summary.gapCount === review.gaps.length, "summary must count gaps");
assert(summary.deferredRuntimeItemCount === review.deferredRuntimeItems.length, "summary must count deferred items");
assert(summary.recommendedNextPhase === "Phase PILOT-3B", "summary must recommend PILOT-3B when not blocked");
assert(recommendation.nextStep.noExecution === true, "recommendation must remain non-executing");
assert(review.safetyBoundaries.sourceOnly === true, "review must be source-only");
assert(review.safetyBoundaries.metadataOnly === true, "review must be metadata-only");
assert(review.safetyBoundaries.noDryRunRuntime === true, "review must not run runtime dry-run behavior");
assert(review.safetyBoundaries.noAppGeneration === true, "review must not create app artifacts");
assert(review.safetyBoundaries.noCodexRun === true, "review must not run Codex");
assert(review.safetyBoundaries.noProviderExecution === true, "review must not call providers");
assert(review.safetyBoundaries.noDashboardMutation === true, "review must not mutate dashboards");
assert(review.safetyBoundaries.noMemoryPersistence === true, "review must not persist memory");

console.log("Mobile Factory Review smoke tests passed");
console.log(`Covered modules: ${review.readiness.coveredModules.length}`);
console.log(`Gaps: ${review.gaps.length}`);
