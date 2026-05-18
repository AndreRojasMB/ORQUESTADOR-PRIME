import {
  buildDefaultMobileNavigationPatterns,
  createMobileNavigationFlow,
  createMobileNavigationState,
  createMobileRoute,
  selectProtectedRoutes,
  selectRoutesByType,
  summarizeMobileNavigationFlow,
} from "../src/pm/mobileNavigationFlowModel.js";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const route = createMobileRoute({
  routeId: "route:smoke-protected",
  routeName: "Smoke Protected",
  routePath: "/smoke/protected",
  routeType: "protected",
  parentRouteId: "route:home",
  screenPatternRefs: ["ux-empty-loading-error-resilient"],
  requiredAuth: true,
  allowedRoles: ["operator"],
  requiredPermissions: ["smoke_access"],
  params: [],
  deepLinkAliases: ["/smoke/protected"],
  guards: ["auth_required", "role_required"],
  fallbackRoute: "route:auth",
  loadingStateRef: "state-loading-progressive",
  emptyStateRef: "state-empty-first-run",
  errorStateRef: "state-error-retry",
  accessibilityNotes: ["Use a clear route title."],
  safetyNotes: ["No live authorization is performed."],
  riskLevel: "medium",
});

const state = createMobileNavigationState({
  stateId: "nav-state:smoke-auth",
  stateType: "auth_required",
  trigger: "Protected smoke route requested.",
  currentRoute: "route:smoke-protected",
  nextRoute: "route:auth",
  guardCondition: "auth_required metadata is present",
  fallbackBehavior: "preserve return intent as metadata",
  userMessage: "Sign in to continue.",
  recoveryAction: "Return to home or sign in.",
  analyticsHint: "Track guard category only.",
  riskLevel: "medium",
});

const patterns = buildDefaultMobileNavigationPatterns();
const flow = createMobileNavigationFlow({
  flowId: "mobile-navigation-flow-smoke",
  appType: "marketplace_app",
  authNeeds: ["account required for saved vendors"],
  onboardingNeeds: ["first-run education"],
  monetizationNeeds: ["premium listing review"],
  safetyNeeds: ["report vendor path"],
  roleNeeds: ["operator"],
  permissionNeeds: ["messaging_access"],
  screenMap: ["Home", "Browse", "Product Detail", "Messages", "Settings"],
  routes: [route],
  navigationStates: [state],
});
const protectedRoutes = selectProtectedRoutes(flow);
const protectedByType = selectRoutesByType(flow, "protected");
const summary = summarizeMobileNavigationFlow(flow);

assert(patterns.includes("tab_first"), "default patterns should include tab_first");
assert(patterns.includes("auth_gate"), "default patterns should include auth_gate");
assert(route.safetyBoundaries.noRouteFileGeneration, "route creation must preserve no route file generation");
assert(state.safetyBoundaries.noRuntimeExecution, "state creation must preserve no runtime execution");
assert(flow.navigationPattern.includes("marketplace_browse_detail"), "marketplace flow should recommend browse/detail");
assert(flow.navigationPattern.includes("auth_gate"), "auth needs should recommend auth gate");
assert(protectedRoutes.length === 1, "protected route selection should find protected smoke route");
assert(protectedByType.length === 1, "route type selection should find protected route");
assert(summary.routeCount === flow.routes.length, "summary should reflect route count");
assert(summary.protectedRouteCount === protectedRoutes.length, "summary should reflect protected route count");
assert(flow.safetyBoundaries.noAppGeneration, "flow must not assume app generation");
assert(flow.safetyBoundaries.noMobileToolingExecution, "flow must not assume mobile tooling");
assert(flow.safetyBoundaries.noPackageChanges, "flow must not assume package changes");

console.log("Mobile Navigation Flow Model smoke tests passed");
console.log(`Patterns: ${flow.navigationPattern.length}`);
console.log(`Routes: ${summary.routeCount}`);
console.log(`Protected routes: ${summary.protectedRouteCount}`);
