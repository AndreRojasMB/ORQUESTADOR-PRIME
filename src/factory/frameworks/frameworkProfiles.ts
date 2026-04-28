import type { LanguageId } from "../languages/types.js";
import type {
  FrameworkArchitecturePattern,
  FrameworkCommandRecommendation,
  FrameworkConfigNote,
  FrameworkDependencyStrategy,
  FrameworkDetectionSignal,
  FrameworkId,
  FrameworkPackagingNote,
  FrameworkProfile,
  FrameworkProfileBoundarySet,
  FrameworkProfileConfidence,
  FrameworkProjectStructure,
  FrameworkReviewHeuristic,
  FrameworkRisk,
  FrameworkSecurityNote,
  FrameworkTestingNote,
} from "./types.js";

export const supportedFrameworkIds = [
  "aspnet-core",
  "wpf-mvvm",
  "winui",
  "maui",
  "spring-boot",
  "fastapi",
  "django",
  "react",
  "nextjs",
  "electron",
  "tauri",
  "qt-cpp",
  "rest-api",
  "graphql",
  "microservices",
  "modular-monolith",
] as const satisfies readonly FrameworkId[];

export const frameworkProfileBoundaries: FrameworkProfileBoundarySet = {
  advisoryOnly: true,
  sourceOnly: true,
  noProviderCalls: true,
  noNetwork: true,
  noFilesystemReads: true,
  noFilesystemWrites: true,
  noFilesystemScanning: true,
  noCommandExecution: true,
  noDependencyInstallation: true,
  noPackageChanges: true,
  noWorkflowChanges: true,
  noRuntimeChanges: true,
  noStoreMutation: true,
  noActionDispatch: true,
  noProposalCreation: true,
  noScaffolding: true,
  noGeneratedSystems: true,
  noAutomaticCodeModification: true,
  noProductionReadinessClaims: true,
  noDeploymentGuarantees: true,
  noFrameworkDetectionOverclaims: true,
};

const allServiceLanguages: LanguageId[] = [
  "csharp",
  "java",
  "kotlin",
  "python",
  "javascript",
  "typescript",
  "go",
];

const signal = (
  signalId: string,
  kind: FrameworkDetectionSignal["kind"],
  value: string,
  description: string,
  confidence: FrameworkProfileConfidence,
): FrameworkDetectionSignal => ({
  signalId,
  kind,
  value,
  description,
  confidence,
});

const command = (
  commandId: string,
  commandText: string,
  purpose: string,
  category: FrameworkCommandRecommendation["category"],
  assumption: string,
): FrameworkCommandRecommendation => ({
  commandId,
  command: commandText,
  purpose,
  category,
  assumption,
  advisoryOnly: true,
  notExecuted: true,
});

const dependency = (
  strategyId: string,
  packageManagers: string[],
  manifestFiles: string[],
  lockFiles: string[],
  dependencyNotes: string[],
  updateNotes: string[],
  assumptions: string[],
): FrameworkDependencyStrategy => ({
  strategyId,
  packageManagers,
  manifestFiles,
  lockFiles,
  dependencyNotes,
  updateNotes,
  assumptions,
});

const structure = (
  commonRoots: string[],
  sourceFolders: string[],
  testFolders: string[],
  configFiles: string[],
  buildFiles: string[],
  routingOrUiSignals: string[],
  notes: string[],
): FrameworkProjectStructure => ({
  commonRoots,
  sourceFolders,
  testFolders,
  configFiles,
  buildFiles,
  routingOrUiSignals,
  notes,
});

const config = (
  noteId: string,
  safeMessage: string,
  assumption: string,
): FrameworkConfigNote => ({
  noteId,
  safeMessage,
  assumption,
});

const pattern = (
  patternId: string,
  name: string,
  safeMessage: string,
  tradeoffs: string[],
): FrameworkArchitecturePattern => ({
  patternId,
  name,
  safeMessage,
  tradeoffs,
});

const security = (
  noteId: string,
  severity: FrameworkSecurityNote["severity"],
  safeMessage: string,
): FrameworkSecurityNote => ({
  noteId,
  severity,
  safeMessage,
});

const testing = (
  noteId: string,
  safeMessage: string,
  recommendedChecks: string[],
  assumption: string,
): FrameworkTestingNote => ({
  noteId,
  safeMessage,
  recommendedChecks,
  assumption,
});

const packaging = (
  noteId: string,
  safeMessage: string,
  assumption: string,
): FrameworkPackagingNote => ({
  noteId,
  safeMessage,
  assumption,
});

const heuristic = (
  heuristicId: string,
  title: string,
  safeMessage: string,
  tags: string[],
): FrameworkReviewHeuristic => ({
  heuristicId,
  title,
  safeMessage,
  tags,
});

const risk = (
  riskId: string,
  title: string,
  safeMessage: string,
  severity: FrameworkRisk["severity"],
  mitigation: string,
): FrameworkRisk => ({
  riskId,
  title,
  safeMessage,
  severity,
  mitigation,
});

const profile = (
  input: Omit<FrameworkProfile, "schemaVersion" | "advisoryOnly" | "boundaries">,
): FrameworkProfile => ({
  ...input,
  schemaVersion: "1.0",
  advisoryOnly: true,
  boundaries: frameworkProfileBoundaries,
});

const dotnetDependency = dependency(
  "dotnet-dependencies",
  ["NuGet", "dotnet"],
  [".csproj", ".sln", "Directory.Packages.props"],
  ["packages.lock.json"],
  ["Review central package management and target framework before changing dependencies."],
  ["Treat package updates as reviewable work with build and test evidence."],
  ["The .NET SDK and NuGet configuration may not be available in the caller environment."],
);

const nodeDependency = dependency(
  "node-dependencies",
  ["npm", "pnpm", "yarn"],
  ["package.json"],
  ["package-lock.json", "pnpm-lock.yaml", "yarn.lock"],
  ["Prefer one package manager and one lockfile per project."],
  ["Review dependency updates with tests and bundle impact in mind."],
  ["Node package manager tooling may not be installed in the caller environment."],
);

const pythonDependency = dependency(
  "python-dependencies",
  ["pip", "uv", "poetry", "pipenv"],
  ["pyproject.toml", "requirements.txt"],
  ["uv.lock", "poetry.lock", "Pipfile.lock"],
  ["Prefer one Python dependency workflow per project."],
  ["Review dependency updates with tests and environment assumptions."],
  ["Python tooling may not be installed in the caller environment."],
);

const jvmDependency = dependency(
  "jvm-dependencies",
  ["Maven", "Gradle"],
  ["pom.xml", "build.gradle", "build.gradle.kts"],
  ["gradle.lockfile"],
  ["Use the existing build tool and dependency constraints when present."],
  ["Review dependency updates with unit and integration checks."],
  ["JDK, Maven, and Gradle availability are caller assumptions."],
);

export const frameworkProfiles: readonly FrameworkProfile[] = [
  profile({
    id: "aspnet-core",
    displayName: "ASP.NET Core",
    category: "web_backend",
    compatibleLanguageIds: ["csharp"],
    ecosystemNotes: ["Common for .NET web APIs, MVC apps, minimal APIs, and enterprise services."],
    detectionSignals: [
      signal("aspnet-csproj", "file", ".csproj", "SDK-style project file can describe an ASP.NET Core app.", "high"),
      signal("aspnet-sln", "file", ".sln", "Solution file often groups API and test projects.", "medium"),
      signal("aspnet-program", "file", "Program.cs", "Common ASP.NET Core startup entry point.", "medium"),
      signal("aspnet-controllers", "folder", "Controllers/", "MVC or Web API controller folder.", "medium"),
      signal("aspnet-web-builder", "content_hint", "WebApplication.CreateBuilder", "Common minimal hosting startup hint.", "high"),
      signal("aspnet-mapget", "content_hint", "MapGet", "Possible minimal API route mapping hint.", "medium"),
    ],
    projectStructure: structure(
      [".sln", "src/", "tests/"],
      ["Controllers/", "Endpoints/", "Services/", "Models/"],
      ["tests/", "Test/"],
      ["appsettings.json", "appsettings.Development.json", "Directory.Build.props"],
      [".csproj", ".sln"],
      ["Controllers/", "MapGet", "MapPost", "UseRouting"],
      ["Startup style can vary between controller-based APIs, Razor/MVC, and minimal APIs."],
    ),
    commandRecommendations: [
      command("aspnet-build", "dotnet build", "Build .NET projects when SDK tooling is available.", "build", ".NET SDK may not be installed."),
      command("aspnet-test", "dotnet test", "Run .NET tests when test projects exist.", "test", "Test projects and SDK tooling may not be present."),
    ],
    dependencyStrategy: dotnetDependency,
    configNotes: [
      config("aspnet-appsettings", "Review appsettings files, environment overrides, and secret boundaries.", "Configuration files may be split by environment."),
      config("aspnet-auth", "Confirm authentication, authorization, and middleware ordering with human review.", "Security model depends on project requirements."),
    ],
    architecturePatterns: [
      pattern("aspnet-middleware", "Middleware pipeline", "Request behavior is shaped by middleware ordering and endpoint routing.", ["Clear composition", "Order-sensitive behavior"]),
      pattern("aspnet-api", "Controller or minimal API", "Both styles can be valid; avoid assuming one from partial signals.", ["Fast endpoints", "Different testing style"]),
    ],
    securityNotes: [
      security("aspnet-secrets", "high", "Keep secrets outside committed configuration and review auth defaults."),
      security("aspnet-validation", "warn", "Validate request models and error responses at API boundaries."),
    ],
    testingNotes: [
      testing("aspnet-tests", "Prefer unit tests plus integration checks for routing and middleware.", ["dotnet test"], "Project may not include integration test setup."),
    ],
    packagingNotes: [
      packaging("aspnet-publish", "Publishing may use dotnet publish, containers, or platform packaging.", "Deployment target is an assumption, not a promise."),
    ],
    reviewHeuristics: [
      heuristic("aspnet-boundaries", "Service boundaries", "Check controller thickness, service abstractions, and dependency injection lifetimes.", ["architecture", "review"]),
      heuristic("aspnet-routing", "Routing clarity", "Review route naming, versioning, validation, and response contracts.", ["api", "routing"]),
    ],
    risks: [
      risk("aspnet-config", "Configuration drift", "Environment-specific config can hide runtime differences.", "medium", "Document environment assumptions and review secrets handling."),
      risk("aspnet-auth-order", "Auth middleware ordering", "Middleware order can change access behavior.", "high", "Review pipeline order and add focused tests."),
    ],
    assumptions: ["Commands are advisory strings only.", "Profile signals describe possible ASP.NET Core usage without certainty."],
    confidence: "medium",
  }),
  profile({
    id: "wpf-mvvm",
    displayName: "WPF / MVVM",
    category: "desktop_ui",
    compatibleLanguageIds: ["csharp"],
    ecosystemNotes: ["Common for Windows desktop applications using XAML and MVVM separation."],
    detectionSignals: [
      signal("wpf-xaml", "extension", ".xaml", "WPF view markup file.", "high"),
      signal("wpf-viewmodel", "content_hint", "ViewModel", "Common MVVM naming hint.", "medium"),
      signal("wpf-csproj", "file", ".csproj", "C# project file can describe a WPF app.", "medium"),
      signal("wpf-app-xaml", "file", "App.xaml", "Common WPF application entry markup.", "high"),
    ],
    projectStructure: structure(
      [".sln", "src/"],
      ["Views/", "ViewModels/", "Models/", "Services/"],
      ["tests/"],
      ["App.xaml", "app.config"],
      [".csproj", ".sln"],
      ["Views/", "ViewModels/", "Commands/", "Bindings"],
      ["Desktop UI structure varies by MVVM toolkit and legacy conventions."],
    ),
    commandRecommendations: [
      command("wpf-build", "dotnet build", "Build the desktop solution when SDK tooling is available.", "build", ".NET SDK and Windows desktop workload may not be installed."),
      command("wpf-test", "dotnet test", "Run available unit tests for view models and services.", "test", "UI tests may need specialized setup."),
    ],
    dependencyStrategy: dotnetDependency,
    configNotes: [
      config("wpf-platform", "Confirm Windows desktop target framework and runtime assumptions.", "Target platform can differ by project."),
      config("wpf-binding", "Review binding paths and validation strategy for view model changes.", "Binding behavior depends on runtime UI context."),
    ],
    architecturePatterns: [
      pattern("wpf-mvvm", "MVVM separation", "Keep UI markup, view models, and services separated where practical.", ["Testable view models", "Binding complexity"]),
    ],
    securityNotes: [
      security("wpf-local-data", "warn", "Review local data storage, credential boundaries, and file access prompts."),
    ],
    testingNotes: [
      testing("wpf-viewmodel-tests", "Prioritize deterministic view model and service tests.", ["dotnet test"], "UI automation support may not exist."),
    ],
    packagingNotes: [
      packaging("wpf-packaging", "Desktop packaging may involve MSIX, ClickOnce, installer tooling, or simple publish output.", "Signing and installer choices require project context."),
    ],
    reviewHeuristics: [
      heuristic("wpf-threading", "UI threading", "Check dispatcher usage and long-running work around UI updates.", ["desktop", "threading"]),
      heuristic("wpf-bindings", "Binding reliability", "Review property change notifications and validation feedback.", ["ui", "mvvm"]),
    ],
    risks: [
      risk("wpf-ui-blocking", "Blocking UI work", "Long work on the UI thread can freeze desktop interactions.", "high", "Move work behind async service boundaries and test responsiveness."),
    ],
    assumptions: ["Windows desktop workload may be required.", "Profile metadata does not package or alter desktop apps."],
    confidence: "medium",
  }),
  profile({
    id: "winui",
    displayName: "WinUI",
    category: "desktop_ui",
    compatibleLanguageIds: ["csharp"],
    ecosystemNotes: ["Windows App SDK UI framework for modern Windows desktop applications."],
    detectionSignals: [
      signal("winui-xaml", "extension", ".xaml", "WinUI view markup file.", "medium"),
      signal("winui-manifest", "file", "Package.appxmanifest", "Windows app package manifest.", "medium"),
      signal("winui-sdk", "content_hint", "WindowsAppSDK", "Possible Windows App SDK reference.", "high"),
      signal("winui-csproj", "file", ".csproj", "C# project file can describe a WinUI app.", "medium"),
    ],
    projectStructure: structure(
      [".sln", "src/"],
      ["Views/", "ViewModels/", "Assets/", "Services/"],
      ["tests/"],
      ["Package.appxmanifest", "appsettings.json"],
      [".csproj", ".sln"],
      ["App.xaml", "MainWindow.xaml", "Views/"],
      ["WinUI projects usually carry Windows platform and packaging assumptions."],
    ),
    commandRecommendations: [
      command("winui-build", "dotnet build", "Build the WinUI project when the required workload is available.", "build", ".NET SDK and Windows App SDK workload may not be installed."),
      command("winui-test", "dotnet test", "Run available non-UI tests.", "test", "UI tests may require Windows-specific tooling."),
    ],
    dependencyStrategy: dotnetDependency,
    configNotes: [
      config("winui-platform", "Confirm Windows App SDK version, target framework, and packaging assumptions.", "Platform support is project-specific."),
      config("winui-signing", "Review signing and package identity decisions before release planning.", "Signing material is outside this source-only profile."),
    ],
    architecturePatterns: [
      pattern("winui-desktop", "Windows desktop UI", "Separate UI state from services to keep platform-specific code reviewable.", ["Native Windows UX", "Platform-specific lifecycle"]),
    ],
    securityNotes: [
      security("winui-permissions", "warn", "Review local permissions, app capabilities, and sensitive local storage."),
    ],
    testingNotes: [
      testing("winui-tests", "Use service and view model tests first, with UI checks where tooling exists.", ["dotnet test"], "Windows UI test infrastructure may be absent."),
    ],
    packagingNotes: [
      packaging("winui-msix", "Packaging often involves MSIX or Windows App SDK publishing choices.", "Signing and distribution channels are assumptions."),
    ],
    reviewHeuristics: [
      heuristic("winui-platform", "Platform assumptions", "Check Windows-only APIs and graceful handling of unavailable capabilities.", ["platform"]),
    ],
    risks: [
      risk("winui-packaging", "Packaging complexity", "Windows package identity and signing can add delivery risk.", "medium", "Plan packaging review separately from source changes."),
    ],
    assumptions: ["Windows App SDK tooling may be required.", "This profile does not assert deployability."],
    confidence: "medium",
  }),
  profile({
    id: "maui",
    displayName: ".NET MAUI",
    category: "mobile_cross_platform",
    compatibleLanguageIds: ["csharp"],
    ecosystemNotes: ["Cross-platform .NET UI framework for mobile and desktop targets."],
    detectionSignals: [
      signal("maui-program", "file", "MauiProgram.cs", "Common MAUI startup file.", "high"),
      signal("maui-platforms", "folder", "Platforms/", "MAUI platform-specific project folder.", "high"),
      signal("maui-sdk", "content_hint", "Microsoft.Maui", "Possible MAUI SDK reference.", "high"),
      signal("maui-xaml", "extension", ".xaml", "MAUI UI markup file.", "medium"),
    ],
    projectStructure: structure(
      [".sln", "src/"],
      ["Platforms/", "Resources/", "Views/", "ViewModels/", "Services/"],
      ["tests/"],
      ["MauiProgram.cs", "appsettings.json"],
      [".csproj", ".sln"],
      ["Platforms/", "Resources/", "Views/"],
      ["MAUI projects can target several platforms with separate permission and packaging needs."],
    ),
    commandRecommendations: [
      command("maui-build", "dotnet build", "Build the project when MAUI workloads are available.", "build", "MAUI workloads may not be installed."),
      command("maui-test", "dotnet test", "Run available shared logic tests.", "test", "Device or simulator tests need extra setup."),
    ],
    dependencyStrategy: dotnetDependency,
    configNotes: [
      config("maui-targets", "Confirm target platforms, permissions, and device support assumptions.", "Target platforms are business and tooling decisions."),
      config("maui-resources", "Review resource handling, localization, and platform overrides.", "Resource conventions vary by app."),
    ],
    architecturePatterns: [
      pattern("maui-shared-ui", "Shared cross-platform UI", "Shared views reduce duplication but can hide platform-specific behavior.", ["Shared code", "Platform edge cases"]),
    ],
    securityNotes: [
      security("maui-permissions", "high", "Review mobile permissions, secure storage, and platform capability prompts."),
    ],
    testingNotes: [
      testing("maui-tests", "Test shared logic separately from platform UI checks.", ["dotnet test"], "Device coverage is an external test planning choice."),
    ],
    packagingNotes: [
      packaging("maui-packaging", "Mobile and desktop packaging require platform-specific signing and store review planning.", "Distribution channels are assumptions."),
    ],
    reviewHeuristics: [
      heuristic("maui-platforms", "Platform differences", "Check platform-specific service implementations and permission prompts.", ["mobile", "platform"]),
    ],
    risks: [
      risk("maui-device-matrix", "Device matrix scope", "Different devices and OS versions can create testing gaps.", "high", "Keep target platform assumptions explicit and bounded."),
    ],
    assumptions: ["MAUI workloads and platform tooling may not be installed.", "This profile only describes review metadata."],
    confidence: "medium",
  }),
  profile({
    id: "spring-boot",
    displayName: "Spring Boot",
    category: "web_backend",
    compatibleLanguageIds: ["java", "kotlin"],
    ecosystemNotes: ["Common JVM framework for APIs, services, scheduled jobs, and enterprise backends."],
    detectionSignals: [
      signal("spring-pom", "file", "pom.xml", "Maven manifest may include Spring Boot dependencies.", "medium"),
      signal("spring-gradle", "file", "build.gradle", "Gradle manifest may include Spring Boot plugins.", "medium"),
      signal("spring-gradle-kts", "file", "build.gradle.kts", "Kotlin Gradle manifest may include Spring Boot plugins.", "medium"),
      signal("spring-app-yml", "file", "application.yml", "Common Spring Boot configuration file.", "medium"),
      signal("spring-java", "folder", "src/main/java", "Common Java source root.", "medium"),
      signal("spring-kotlin", "folder", "src/main/kotlin", "Common Kotlin source root.", "medium"),
      signal("spring-annotation", "content_hint", "SpringBootApplication", "Primary Spring Boot annotation hint.", "high"),
    ],
    projectStructure: structure(
      ["src/main/", "src/test/"],
      ["src/main/java", "src/main/kotlin"],
      ["src/test/java", "src/test/kotlin"],
      ["application.yml", "application.properties"],
      ["pom.xml", "build.gradle", "build.gradle.kts"],
      ["Controller", "RestController", "Repository", "Service"],
      ["Spring Boot structure varies between layered services, hexagonal modules, and generated starters."],
    ),
    commandRecommendations: [
      command("spring-maven-test", "mvn test", "Run Maven tests when Maven is the project build tool.", "test", "Maven and JDK may not be installed."),
      command("spring-gradle-test", "gradle test", "Run Gradle tests when Gradle is the project build tool.", "test", "Gradle and JDK may not be installed."),
      command("spring-gradle-build", "gradle build", "Build Gradle projects when configured.", "build", "Use the project wrapper if present."),
    ],
    dependencyStrategy: jvmDependency,
    configNotes: [
      config("spring-profiles", "Review Spring profiles, externalized config, and secret boundaries.", "Profile activation is environment-specific."),
      config("spring-security", "Confirm authentication and authorization configuration with project requirements.", "Security configuration varies widely."),
    ],
    architecturePatterns: [
      pattern("spring-di", "Dependency injection", "Spring components depend on bean lifecycle and configuration.", ["Strong conventions", "Hidden wiring if untested"]),
      pattern("spring-layered", "Layered service", "Controllers, services, and repositories are common but not mandatory.", ["Clear separation", "Potential boilerplate"]),
    ],
    securityNotes: [
      security("spring-config", "high", "Review config values, profiles, and secret handling before release planning."),
      security("spring-auth", "warn", "Check route and method security boundaries where Spring Security is used."),
    ],
    testingNotes: [
      testing("spring-tests", "Use unit tests plus focused slice or integration checks where context startup matters.", ["mvn test", "gradle test"], "Build tool and test setup are project-specific."),
    ],
    packagingNotes: [
      packaging("spring-jar", "Packaging often uses executable jars or container images.", "Runtime and platform choice are assumptions."),
    ],
    reviewHeuristics: [
      heuristic("spring-transactions", "Transaction boundaries", "Review service methods, persistence boundaries, and retry behavior.", ["transactions", "persistence"]),
      heuristic("spring-config-review", "Configuration clarity", "Check profile-specific config and fallback behavior.", ["config"]),
    ],
    risks: [
      risk("spring-context", "Context startup cost", "Broad integration tests can become slow or brittle.", "medium", "Use focused test slices and clear config fixtures."),
    ],
    assumptions: ["JDK and build tooling may not be available.", "Spring Boot signals do not guarantee a complete service shape."],
    confidence: "medium",
  }),
  profile({
    id: "fastapi",
    displayName: "FastAPI",
    category: "web_backend",
    compatibleLanguageIds: ["python"],
    ecosystemNotes: ["Python ASGI framework commonly used for typed APIs and async-capable services."],
    detectionSignals: [
      signal("fastapi-main", "file", "main.py", "Common FastAPI entry file.", "medium"),
      signal("fastapi-router", "content_hint", "APIRouter", "FastAPI router usage hint.", "high"),
      signal("fastapi-app", "content_hint", "FastAPI", "FastAPI application construction hint.", "high"),
      signal("fastapi-requirements", "file", "requirements.txt", "Dependency list may include FastAPI.", "low"),
      signal("fastapi-pyproject", "file", "pyproject.toml", "Modern Python project metadata.", "low"),
    ],
    projectStructure: structure(
      ["app/", "src/", "tests/"],
      ["app/", "routers/", "services/", "schemas/"],
      ["tests/"],
      ["pyproject.toml", "requirements.txt"],
      ["pyproject.toml"],
      ["APIRouter", "Depends", "Pydantic"],
      ["FastAPI apps can be synchronous, asynchronous, or mixed."],
    ),
    commandRecommendations: [
      command("fastapi-test", "python -m pytest", "Run tests when pytest is configured.", "test", "pytest may not be installed."),
      command("fastapi-lint", "ruff check .", "Run lint checks when Ruff is configured.", "lint", "Ruff may not be installed."),
    ],
    dependencyStrategy: pythonDependency,
    configNotes: [
      config("fastapi-settings", "Review settings loading, environment assumptions, and secret boundaries.", "Settings library and layout are project-specific."),
      config("fastapi-async", "Confirm async dependencies and blocking work are separated.", "Async behavior depends on implementation details."),
    ],
    architecturePatterns: [
      pattern("fastapi-router-service", "Router/service split", "Routers can stay thin while services hold business behavior.", ["Reviewable API contracts", "Potential extra layers"]),
    ],
    securityNotes: [
      security("fastapi-auth", "high", "Review authentication dependencies and authorization checks for each route family."),
      security("fastapi-validation", "warn", "Check request and response models for bounded validation behavior."),
    ],
    testingNotes: [
      testing("fastapi-tests", "Use API tests for route contracts and unit tests for service logic.", ["python -m pytest"], "Test client setup may vary."),
    ],
    packagingNotes: [
      packaging("fastapi-asgi", "Packaging often depends on ASGI server and platform assumptions.", "Server and hosting choices are outside this profile."),
    ],
    reviewHeuristics: [
      heuristic("fastapi-dependencies", "Dependency boundaries", "Review dependency injection, transaction scopes, and request lifecycle behavior.", ["api", "lifecycle"]),
    ],
    risks: [
      risk("fastapi-blocking", "Blocking async paths", "Blocking work inside async routes can reduce responsiveness.", "high", "Separate blocking work and add focused performance review notes."),
    ],
    assumptions: ["Python API tooling may not be installed.", "Deployment details are advisory assumptions only."],
    confidence: "medium",
  }),
  profile({
    id: "django",
    displayName: "Django",
    category: "web_backend",
    compatibleLanguageIds: ["python"],
    ecosystemNotes: ["Python web framework with batteries-included admin, ORM, auth, and app conventions."],
    detectionSignals: [
      signal("django-manage", "file", "manage.py", "Common Django project entry utility.", "high"),
      signal("django-settings", "file", "settings.py", "Django settings module file.", "medium"),
      signal("django-migrations", "folder", "migrations/", "Django app migration folder.", "medium"),
      signal("django-import", "content_hint", "django", "Django import hint.", "medium"),
    ],
    projectStructure: structure(
      ["manage.py", "apps/", "tests/"],
      ["apps/", "project/", "templates/", "static/"],
      ["tests/"],
      ["settings.py", "urls.py", "wsgi.py", "asgi.py"],
      ["pyproject.toml", "requirements.txt"],
      ["urls.py", "views.py", "models.py", "admin.py"],
      ["Django projects can be monolithic or split into many reusable apps."],
    ),
    commandRecommendations: [
      command("django-test", "python manage.py test", "Run Django tests when project settings are configured.", "test", "Django settings and dependencies may not be available."),
      command("django-check", "python manage.py check", "Run Django system checks when dependencies are present.", "inspect", "Django project configuration may be incomplete locally."),
    ],
    dependencyStrategy: pythonDependency,
    configNotes: [
      config("django-settings", "Review settings modules, environment split, and secret boundaries.", "Settings are often environment-specific."),
      config("django-migrations-review", "Review migrations as data-change plans before applying them anywhere.", "Migration application is outside this profile."),
    ],
    architecturePatterns: [
      pattern("django-apps", "Django apps", "Apps group models, views, admin, and routes around domain areas.", ["Strong conventions", "Potential app coupling"]),
    ],
    securityNotes: [
      security("django-secret-key", "high", "Keep secret keys and credentials outside committed settings."),
      security("django-auth-admin", "warn", "Review admin exposure, auth checks, and middleware settings."),
    ],
    testingNotes: [
      testing("django-tests", "Use model, view, and permission tests around domain behavior.", ["python manage.py test"], "Configured settings are required."),
    ],
    packagingNotes: [
      packaging("django-runtime", "Runtime planning depends on WSGI or ASGI server, static assets, and environment config.", "Hosting choices are assumptions."),
    ],
    reviewHeuristics: [
      heuristic("django-models", "Model boundaries", "Review model methods, query behavior, and migration impact.", ["orm", "data"]),
    ],
    risks: [
      risk("django-migration-risk", "Migration review gap", "Unreviewed migrations can affect production data plans.", "high", "Treat migrations as separate reviewed changes."),
    ],
    assumptions: ["Django commands are advisory strings only.", "No migration is applied by this profile."],
    confidence: "medium",
  }),
  profile({
    id: "react",
    displayName: "React",
    category: "frontend_ui",
    compatibleLanguageIds: ["javascript", "typescript"],
    ecosystemNotes: ["Frontend UI library used with many build tools and routing patterns."],
    detectionSignals: [
      signal("react-jsx", "extension", ".jsx", "React JSX source file.", "medium"),
      signal("react-tsx", "extension", ".tsx", "React TypeScript JSX source file.", "medium"),
      signal("react-components", "folder", "components/", "Common component folder.", "medium"),
      signal("react-package", "package", "react", "React dependency name.", "high"),
    ],
    projectStructure: structure(
      ["src/", "app/", "components/"],
      ["src/", "components/", "pages/"],
      ["tests/", "__tests__/"],
      ["package.json", "vite.config.ts", "tsconfig.json"],
      ["package.json"],
      ["components/", ".jsx", ".tsx", "hooks/"],
      ["React may be used with Vite, Next.js, Create React App, custom bundlers, or monorepos."],
    ),
    commandRecommendations: [
      command("react-test", "npm test", "Run project tests when npm scripts define them.", "test", "The project may use pnpm, yarn, or a different test script."),
      command("react-lint", "npm run lint", "Run lint checks when a lint script exists.", "lint", "Lint tooling and scripts may not be configured."),
    ],
    dependencyStrategy: nodeDependency,
    configNotes: [
      config("react-bundler", "Identify the bundler or framework before assuming routes or build behavior.", "Signals may overlap with Next.js or other React frameworks."),
      config("react-state", "Review state management and data fetching assumptions with the app architecture.", "State tooling is project-specific."),
    ],
    architecturePatterns: [
      pattern("react-components", "Component composition", "Keep components focused and separate view concerns from data and side effects.", ["Reusable UI", "Prop drilling or state sprawl"]),
    ],
    securityNotes: [
      security("react-xss", "warn", "Review HTML injection paths, external links, and untrusted rendered content."),
    ],
    testingNotes: [
      testing("react-tests", "Use component and user-flow tests where tooling exists.", ["npm test"], "Test runner and package manager may differ."),
    ],
    packagingNotes: [
      packaging("react-build", "Build output depends on bundler and hosting assumptions.", "Hosting target is not inferred from React alone."),
    ],
    reviewHeuristics: [
      heuristic("react-effects", "Effect discipline", "Review effect dependencies, cleanup, and data loading boundaries.", ["frontend", "state"]),
    ],
    risks: [
      risk("react-framework-ambiguity", "Framework ambiguity", "React signals can also appear inside Next.js, Electron, or Tauri apps.", "medium", "Use scoring as a hint and review surrounding files."),
    ],
    assumptions: ["Node tooling may not be installed.", "React profile detection is advisory and not certain."],
    confidence: "medium",
  }),
  profile({
    id: "nextjs",
    displayName: "Next.js",
    category: "frontend_ui",
    compatibleLanguageIds: ["javascript", "typescript"],
    ecosystemNotes: ["React framework for routing, server rendering, static generation, and full-stack app conventions."],
    detectionSignals: [
      signal("next-config-js", "file", "next.config.js", "Next.js config file.", "high"),
      signal("next-config-mjs", "file", "next.config.mjs", "Next.js config file.", "high"),
      signal("next-app-router", "folder", "app/", "Possible App Router folder.", "medium"),
      signal("next-pages-router", "folder", "pages/", "Possible Pages Router folder.", "medium"),
      signal("next-package", "package", "next", "Next.js dependency name.", "high"),
    ],
    projectStructure: structure(
      ["app/", "pages/", "src/"],
      ["app/", "pages/", "components/", "lib/"],
      ["tests/", "__tests__/"],
      ["next.config.js", "next.config.mjs", "tsconfig.json"],
      ["package.json"],
      ["app/", "pages/", "layout.tsx", "page.tsx", "api/"],
      ["App Router and Pages Router signals can coexist during migrations."],
    ),
    commandRecommendations: [
      command("next-build", "npm run build", "Build the app when the package script is defined.", "build", "Package manager and scripts may differ."),
      command("next-test", "npm test", "Run tests when configured.", "test", "Test runner may not be configured."),
      command("next-lint", "npm run lint", "Run lint checks when configured.", "lint", "Lint script may not exist."),
    ],
    dependencyStrategy: nodeDependency,
    configNotes: [
      config("next-router-mode", "Record whether App Router, Pages Router, or a mixed migration is present before planning changes.", "Folder signals alone are not proof of routing mode."),
      config("next-env", "Review server and client environment variable boundaries.", "Runtime environment is project-specific."),
    ],
    architecturePatterns: [
      pattern("next-server-client", "Server/client boundary", "Review component boundaries and data fetching location before changes.", ["Powerful routing", "Boundary confusion risk"]),
    ],
    securityNotes: [
      security("next-env-boundary", "high", "Check public and server-only environment variables carefully."),
      security("next-api-auth", "warn", "Review route handlers and API routes for auth and validation boundaries."),
    ],
    testingNotes: [
      testing("next-tests", "Combine component tests with route and data-loading checks where configured.", ["npm test", "npm run build"], "Build scripts and test tools may vary."),
    ],
    packagingNotes: [
      packaging("next-output", "Output behavior depends on Next.js config and hosting assumptions.", "No hosting target is guaranteed by this profile."),
    ],
    reviewHeuristics: [
      heuristic("next-rendering", "Rendering mode clarity", "Check static, server, and client rendering assumptions for each route family.", ["routing", "rendering"]),
    ],
    risks: [
      risk("next-boundary-confusion", "Server/client boundary drift", "Incorrect boundaries can leak data or break interactivity.", "high", "Review imports, environment variables, and route placement."),
    ],
    assumptions: ["Next.js commands are advisory strings only.", "Router mode is a review hint, not an asserted fact."],
    confidence: "medium",
  }),
  profile({
    id: "electron",
    displayName: "Electron",
    category: "desktop_shell",
    compatibleLanguageIds: ["javascript", "typescript"],
    ecosystemNotes: ["Desktop shell for web technologies with main, renderer, and preload process boundaries."],
    detectionSignals: [
      signal("electron-package", "package", "electron", "Electron dependency name.", "high"),
      signal("electron-main", "content_hint", "BrowserWindow", "Electron main process window hint.", "medium"),
      signal("electron-preload", "file", "preload.js", "Common preload script file.", "medium"),
      signal("electron-renderer", "folder", "renderer/", "Common renderer folder.", "medium"),
    ],
    projectStructure: structure(
      ["src/", "app/", "renderer/"],
      ["main/", "preload/", "renderer/", "src/"],
      ["tests/"],
      ["package.json", "electron-builder.yml"],
      ["package.json"],
      ["main", "preload", "renderer", "BrowserWindow"],
      ["Electron projects need clear process and bridge boundaries."],
    ),
    commandRecommendations: [
      command("electron-test", "npm test", "Run configured tests.", "test", "Package scripts and test tools may differ."),
      command("electron-lint", "npm run lint", "Run lint checks when configured.", "lint", "Lint script may not exist."),
    ],
    dependencyStrategy: nodeDependency,
    configNotes: [
      config("electron-processes", "Separate main, preload, and renderer responsibilities in review notes.", "Project layout may vary."),
      config("electron-packaging", "Review packaging and signing assumptions separately from source metadata.", "Packaging tools vary by project."),
    ],
    architecturePatterns: [
      pattern("electron-bridge", "Preload bridge", "Use a narrow reviewed bridge between renderer and desktop capabilities.", ["Web UI reuse", "Security-sensitive boundary"]),
    ],
    securityNotes: [
      security("electron-isolation", "high", "Review context isolation, preload exposure, and untrusted content handling."),
      security("electron-desktop-capabilities", "high", "Keep desktop capabilities behind narrow reviewed APIs."),
    ],
    testingNotes: [
      testing("electron-tests", "Test shared logic and bridge contracts separately from packaged desktop flows.", ["npm test"], "Desktop automation may need additional tooling."),
    ],
    packagingNotes: [
      packaging("electron-packaging", "Desktop packaging can involve signing, auto-update, and platform-specific installers.", "Distribution channel is an assumption."),
    ],
    reviewHeuristics: [
      heuristic("electron-preload", "Preload surface", "Review every exposed preload API for least privilege.", ["desktop", "security"]),
    ],
    risks: [
      risk("electron-security", "Desktop privilege exposure", "Renderer compromise can become more serious if bridge boundaries are broad.", "high", "Keep bridge APIs narrow and audited."),
    ],
    assumptions: ["Desktop packaging tooling may not be installed.", "This profile does not package or run apps."],
    confidence: "medium",
  }),
  profile({
    id: "tauri",
    displayName: "Tauri",
    category: "desktop_shell",
    compatibleLanguageIds: ["javascript", "typescript"],
    ecosystemNotes: ["Desktop app toolkit that combines a web frontend with native capabilities. Rust tooling is noted as a future profile assumption, not a current LanguageId."],
    detectionSignals: [
      signal("tauri-config", "file", "tauri.conf.json", "Tauri configuration file.", "high"),
      signal("tauri-src", "folder", "src-tauri/", "Tauri native project folder.", "high"),
      signal("tauri-package", "package", "@tauri-apps/api", "Tauri frontend package hint.", "medium"),
      signal("tauri-bridge", "content_hint", "invoke(", "Tauri bridge call hint.", "medium"),
    ],
    projectStructure: structure(
      ["src/", "src-tauri/"],
      ["src/", "app/", "components/", "src-tauri/"],
      ["tests/"],
      ["tauri.conf.json", "package.json"],
      ["package.json"],
      ["src-tauri/", "tauri.conf.json", "invoke("],
      ["Tauri includes native tooling assumptions outside the current supported language list."],
    ),
    commandRecommendations: [
      command("tauri-frontend-test", "npm test", "Run frontend tests when configured.", "test", "Package manager and scripts may differ."),
      command("tauri-frontend-build", "npm run build", "Build frontend assets when configured.", "build", "Frontend build scripts may not exist."),
    ],
    dependencyStrategy: nodeDependency,
    configNotes: [
      config("tauri-native-tooling", "Record native and Rust tooling as assumptions until a Rust language profile exists.", "Rust is not a supported language ID in this phase."),
      config("tauri-capabilities", "Review bridge capabilities and frontend/native contracts.", "Capability model depends on project configuration."),
    ],
    architecturePatterns: [
      pattern("tauri-bridge", "Frontend/native bridge", "Keep frontend bridge calls narrow, typed, and reviewable.", ["Small desktop shell", "Native boundary complexity"]),
    ],
    securityNotes: [
      security("tauri-bridge-review", "high", "Review bridge commands and allowed capabilities before release planning."),
    ],
    testingNotes: [
      testing("tauri-tests", "Test frontend behavior and bridge contract assumptions separately.", ["npm test"], "Native checks require tooling outside this profile."),
    ],
    packagingNotes: [
      packaging("tauri-packaging", "Packaging depends on native toolchains, signing, and platform-specific targets.", "Native packaging support is an assumption."),
    ],
    reviewHeuristics: [
      heuristic("tauri-native-boundary", "Native boundary", "Check that native calls are explicit, minimal, and documented.", ["desktop", "security"]),
    ],
    risks: [
      risk("tauri-tooling-gap", "Native tooling gap", "Native build and signing assumptions can block delivery planning.", "medium", "List native tooling as a separate planning dependency."),
    ],
    assumptions: ["Rust is not modeled as a supported language ID yet.", "Native toolchain availability is an assumption for future phases."],
    confidence: "medium",
  }),
  profile({
    id: "qt-cpp",
    displayName: "Qt/C++",
    category: "native_ui",
    compatibleLanguageIds: ["cpp"],
    ecosystemNotes: ["Native desktop and embedded UI framework commonly paired with C++ and Qt tooling."],
    detectionSignals: [
      signal("qt-cmake", "file", "CMakeLists.txt", "CMake build file can describe a Qt project.", "medium"),
      signal("qt-pro", "extension", ".pro", "Qt qmake project file.", "high"),
      signal("qt-ui", "extension", ".ui", "Qt Designer UI file.", "high"),
      signal("qt-cpp", "extension", ".cpp", "C++ source file.", "medium"),
      signal("qt-hpp", "extension", ".hpp", "C++ header file.", "medium"),
    ],
    projectStructure: structure(
      ["src/", "include/", "tests/"],
      ["src/", "include/", "ui/"],
      ["tests/"],
      ["CMakeLists.txt", "*.pro"],
      ["CMakeLists.txt", "*.pro"],
      [".ui", "QObject", "signals", "slots"],
      ["Qt projects vary between widgets, QML, and platform-specific packaging."],
    ),
    commandRecommendations: [
      command("qt-cmake-configure", "cmake -S . -B build", "Configure a CMake project when Qt and CMake are available.", "build", "CMake and Qt tooling may not be installed."),
      command("qt-cmake-build", "cmake --build build", "Build a configured CMake project.", "build", "A configured build directory may not exist."),
    ],
    dependencyStrategy: dependency(
      "qt-dependencies",
      ["CMake", "qmake", "vcpkg", "Conan"],
      ["CMakeLists.txt", "*.pro"],
      ["vcpkg.json", "conanfile.txt"],
      ["Native dependency strategy depends on toolchain and platform."],
      ["Review native dependency updates with platform builds."],
      ["Qt and C++ build tooling may not be installed."],
    ),
    configNotes: [
      config("qt-platform", "Record target platforms, compiler, and Qt version assumptions.", "Native build behavior is platform-specific."),
      config("qt-resources", "Review resource, translation, and UI file conventions.", "Qt resource layout varies."),
    ],
    architecturePatterns: [
      pattern("qt-ui-core", "UI/core split", "Keep UI event handling separated from domain and IO logic.", ["Native performance", "Toolchain complexity"]),
    ],
    securityNotes: [
      security("qt-native-input", "warn", "Review native input parsing, file handling, and plugin loading boundaries."),
    ],
    testingNotes: [
      testing("qt-tests", "Use unit tests for core logic and focused UI checks where tooling exists.", ["cmake --build build"], "Test framework and build setup may vary."),
    ],
    packagingNotes: [
      packaging("qt-native-packaging", "Native packaging depends on Qt deployment tools and platform-specific installers.", "Packaging target is an assumption."),
    ],
    reviewHeuristics: [
      heuristic("qt-threading", "Thread affinity", "Review signal/slot threading and UI thread affinity.", ["native", "threading"]),
    ],
    risks: [
      risk("qt-platform-drift", "Platform drift", "Native UI behavior can differ across platforms and Qt versions.", "medium", "Capture target platform assumptions early."),
    ],
    assumptions: ["Native toolchain availability is not assumed.", "This profile does not configure or build Qt projects."],
    confidence: "medium",
  }),
  profile({
    id: "rest-api",
    displayName: "REST APIs",
    category: "api_architecture",
    compatibleLanguageIds: allServiceLanguages,
    ecosystemNotes: ["Architectural profile for HTTP APIs across supported service languages."],
    detectionSignals: [
      signal("rest-openapi", "file", "openapi.yaml", "OpenAPI contract file.", "high"),
      signal("rest-swagger", "file", "swagger.json", "Swagger/OpenAPI contract file.", "high"),
      signal("rest-controllers", "folder", "controllers/", "Common API controller folder.", "medium"),
      signal("rest-routes", "folder", "routes/", "Common routing folder.", "medium"),
    ],
    projectStructure: structure(
      ["src/", "app/", "api/"],
      ["controllers/", "routes/", "handlers/", "services/"],
      ["tests/"],
      ["openapi.yaml", "swagger.json"],
      ["package.json", "pom.xml", ".csproj", "go.mod", "pyproject.toml"],
      ["routes/", "controllers/", "handlers/", "OpenAPI"],
      ["REST is an architectural style and must be interpreted with language and framework context."],
    ),
    commandRecommendations: [
      command("rest-contract-check", "npm test", "Run configured API or contract checks where present.", "test", "Actual test command depends on the project stack."),
    ],
    dependencyStrategy: dependency(
      "rest-dependencies",
      ["Stack-specific package manager"],
      ["package.json", "pom.xml", ".csproj", "go.mod", "pyproject.toml"],
      ["Stack-specific lockfile"],
      ["Use the underlying language and framework dependency strategy."],
      ["Review API dependency changes with contract tests where available."],
      ["Underlying tooling may not be installed."],
    ),
    configNotes: [
      config("rest-contracts", "Review API contracts, versioning, authentication, validation, and observability assumptions.", "Contract tooling varies by stack."),
    ],
    architecturePatterns: [
      pattern("rest-resources", "Resource-oriented API", "Use clear resource naming, validation, and response contracts.", ["Widely understood", "Can become inconsistent without governance"]),
    ],
    securityNotes: [
      security("rest-auth", "high", "Review auth, rate limits, input validation, and error disclosure."),
    ],
    testingNotes: [
      testing("rest-tests", "Use contract, authorization, and validation tests where available.", ["Stack-specific test command"], "No universal test command applies."),
    ],
    packagingNotes: [
      packaging("rest-runtime", "Packaging follows the selected language and framework runtime.", "Runtime stack is an external planning input."),
    ],
    reviewHeuristics: [
      heuristic("rest-versioning", "Versioning and contracts", "Check compatibility, versioning, and error response consistency.", ["api", "contracts"]),
    ],
    risks: [
      risk("rest-contract-drift", "Contract drift", "Implementation can diverge from documented contracts.", "medium", "Tie contract review to tests and release notes."),
    ],
    assumptions: ["REST profile is architectural metadata only.", "Commands are placeholders for stack-specific review."],
    confidence: "low",
  }),
  profile({
    id: "graphql",
    displayName: "GraphQL",
    category: "api_architecture",
    compatibleLanguageIds: allServiceLanguages,
    ecosystemNotes: ["API architecture centered on typed schema, resolvers, queries, and mutations."],
    detectionSignals: [
      signal("graphql-schema", "file", "schema.graphql", "GraphQL schema file.", "high"),
      signal("graphql-extension", "extension", ".graphql", "GraphQL schema or operation file.", "high"),
      signal("graphql-resolvers", "folder", "resolvers/", "Common resolver folder.", "medium"),
      signal("graphql-package", "package", "graphql", "GraphQL dependency name.", "medium"),
    ],
    projectStructure: structure(
      ["src/", "schema/", "api/"],
      ["schema/", "resolvers/", "types/", "services/"],
      ["tests/"],
      ["schema.graphql", "codegen.yml"],
      ["package.json", "pom.xml", ".csproj", "go.mod", "pyproject.toml"],
      ["schema.graphql", "resolvers/", "queries/", "mutations/"],
      ["GraphQL structure depends heavily on server implementation and schema governance."],
    ),
    commandRecommendations: [
      command("graphql-tests", "npm test", "Run configured schema or resolver tests where present.", "test", "Actual command depends on stack and tooling."),
    ],
    dependencyStrategy: dependency(
      "graphql-dependencies",
      ["Stack-specific package manager"],
      ["package.json", "pom.xml", ".csproj", "go.mod", "pyproject.toml"],
      ["Stack-specific lockfile"],
      ["Use the underlying language and GraphQL server dependency strategy."],
      ["Review schema and resolver dependency updates with tests."],
      ["Underlying tooling may not be installed."],
    ),
    configNotes: [
      config("graphql-schema", "Review schema ownership, authorization, query complexity, and caching assumptions.", "Implementation details vary by server stack."),
    ],
    architecturePatterns: [
      pattern("graphql-schema-first", "Schema-centered API", "Schema clarity and resolver boundaries drive maintainability.", ["Flexible clients", "Complex authorization and performance review"]),
    ],
    securityNotes: [
      security("graphql-query-complexity", "high", "Review query complexity controls, authorization, and introspection policy."),
    ],
    testingNotes: [
      testing("graphql-tests", "Use schema validation, resolver tests, and authorization checks.", ["Stack-specific test command"], "Test tooling depends on implementation."),
    ],
    packagingNotes: [
      packaging("graphql-runtime", "Packaging follows the selected service framework and runtime.", "Runtime stack is an external planning input."),
    ],
    reviewHeuristics: [
      heuristic("graphql-n-plus-one", "Resolver performance", "Check resolver batching and N+1 query risks.", ["api", "performance"]),
    ],
    risks: [
      risk("graphql-auth", "Field-level authorization gaps", "Nested data access can hide authorization issues.", "high", "Review auth at resolver and field boundaries."),
    ],
    assumptions: ["GraphQL profile does not infer a specific server framework.", "Commands are advisory only."],
    confidence: "low",
  }),
  profile({
    id: "microservices",
    displayName: "Microservices",
    category: "architecture",
    compatibleLanguageIds: allServiceLanguages,
    ecosystemNotes: ["Architecture profile for independently deployable services and distributed boundaries."],
    detectionSignals: [
      signal("microservices-compose", "file", "docker-compose.yml", "Multiple local services may be described.", "medium"),
      signal("microservices-services", "folder", "services/", "Common services root.", "medium"),
      signal("microservices-apps", "folder", "apps/", "Common monorepo apps root.", "low"),
      signal("microservices-k8s", "folder", "k8s/", "Possible service deployment manifests.", "low"),
    ],
    projectStructure: structure(
      ["services/", "apps/", "packages/"],
      ["services/*/src/", "apps/*/src/"],
      ["services/*/tests/", "apps/*/tests/"],
      ["docker-compose.yml", "k8s/"],
      ["Stack-specific build files"],
      ["services/", "apps/", "contracts/", "events/"],
      ["Microservices signals are weak without architecture documentation and service ownership context."],
    ),
    commandRecommendations: [
      command("microservices-tests", "npm test", "Run stack-specific tests for changed services where configured.", "test", "Actual command depends on each service stack."),
    ],
    dependencyStrategy: dependency(
      "microservices-dependencies",
      ["Stack-specific package managers"],
      ["Service-specific manifests"],
      ["Service-specific lockfiles"],
      ["Keep dependency strategy local to each service unless the monorepo defines shared policy."],
      ["Review shared contract and dependency changes across affected services."],
      ["Tooling varies per service."],
    ),
    configNotes: [
      config("microservices-boundaries", "Record service ownership, contracts, observability, and operational assumptions.", "Service boundaries require human review."),
      config("microservices-consistency", "Plan consistency and failure behavior explicitly.", "Distributed behavior is architecture-specific."),
    ],
    architecturePatterns: [
      pattern("microservices-boundaries", "Service boundaries", "Services should own clear capabilities and contracts.", ["Independent change", "Distributed complexity"]),
      pattern("microservices-observability", "Observability first", "Distributed systems need logging, tracing, metrics, and alert ownership.", ["Better diagnosis", "Operational overhead"]),
    ],
    securityNotes: [
      security("microservices-auth", "high", "Review service-to-service auth, secrets handling, and boundary enforcement."),
    ],
    testingNotes: [
      testing("microservices-tests", "Use unit, contract, and integration checks for changed service boundaries.", ["Stack-specific test command"], "No universal command applies."),
    ],
    packagingNotes: [
      packaging("microservices-delivery", "Delivery planning depends on service ownership, platform, and release coordination.", "Deployment path is not guaranteed."),
    ],
    reviewHeuristics: [
      heuristic("microservices-contracts", "Contract ownership", "Check API and event contracts before splitting responsibilities.", ["architecture", "contracts"]),
    ],
    risks: [
      risk("microservices-distributed-complexity", "Distributed complexity", "Small services can add operational and consistency burden.", "high", "Justify boundaries with ownership, scale, or release needs."),
    ],
    assumptions: ["Microservices profile is an advisory architecture profile.", "No service is created or modified."],
    confidence: "low",
  }),
  profile({
    id: "modular-monolith",
    displayName: "Modular Monolith",
    category: "architecture",
    compatibleLanguageIds: allServiceLanguages,
    ecosystemNotes: ["Architecture profile for one deployable system with explicit internal module boundaries."],
    detectionSignals: [
      signal("modular-modules", "folder", "modules/", "Common module root.", "medium"),
      signal("modular-packages", "folder", "packages/", "Common package or workspace root.", "low"),
      signal("modular-contexts", "folder", "bounded-contexts/", "Possible domain boundary folder.", "medium"),
      signal("modular-src", "folder", "src/", "Common source root.", "low"),
    ],
    projectStructure: structure(
      ["src/", "modules/", "packages/"],
      ["modules/", "src/modules/", "packages/"],
      ["tests/", "modules/*/tests/"],
      ["Stack-specific config files"],
      ["Stack-specific build files"],
      ["modules/", "internal/", "contracts/"],
      ["Modular monoliths require conventions to keep boundaries meaningful."],
    ),
    commandRecommendations: [
      command("modular-tests", "npm test", "Run stack-specific tests when configured.", "test", "Actual command depends on the chosen language and framework."),
    ],
    dependencyStrategy: dependency(
      "modular-dependencies",
      ["Stack-specific package managers"],
      ["Stack-specific manifests"],
      ["Stack-specific lockfiles"],
      ["Keep module boundaries clear even when dependencies are shared in one deployable."],
      ["Review cross-module dependency changes carefully."],
      ["Underlying tooling may not be installed."],
    ),
    configNotes: [
      config("modular-boundaries", "Document module ownership, internal contracts, and allowed dependency directions.", "Boundary rules are project-specific."),
      config("modular-transactions", "Review transaction boundaries and shared data access assumptions.", "Persistence model varies by stack."),
    ],
    architecturePatterns: [
      pattern("modular-boundaries", "Explicit modules", "Modules should encapsulate related business capabilities behind internal contracts.", ["Simpler operations", "Boundary discipline required"]),
      pattern("modular-migration-path", "Future extraction path", "Clear modules can ease later service extraction if needed.", ["Evolution path", "Initial discipline cost"]),
    ],
    securityNotes: [
      security("modular-internal-access", "warn", "Review internal access controls and cross-module data exposure."),
    ],
    testingNotes: [
      testing("modular-tests", "Use module-level tests plus integration checks for cross-module flows.", ["Stack-specific test command"], "Test command depends on stack."),
    ],
    packagingNotes: [
      packaging("modular-delivery", "Packaging usually follows a single application release path.", "Runtime stack is an external planning input."),
    ],
    reviewHeuristics: [
      heuristic("modular-coupling", "Coupling direction", "Check module imports and data ownership boundaries.", ["architecture", "modularity"]),
    ],
    risks: [
      risk("modular-boundary-erosion", "Boundary erosion", "Modules can become folders without enforced dependency direction.", "medium", "Document ownership and add architectural checks later if approved."),
    ],
    assumptions: ["Modular monolith profile is advisory architecture metadata.", "No modules are created by this profile."],
    confidence: "low",
  }),
];

export const listFrameworkProfiles = (): FrameworkProfile[] =>
  frameworkProfiles.map((item) => ({ ...item }));
