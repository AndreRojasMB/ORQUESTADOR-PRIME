import type {
  LanguageCommandRecommendation,
  LanguageDependencyStrategy,
  LanguageDetectionSignal,
  LanguageId,
  LanguagePackagingNote,
  LanguageProfile,
  LanguageProfileBoundarySet,
  LanguageProfileConfidence,
  LanguageProjectStructure,
  LanguageReviewHeuristic,
  LanguageRisk,
  LanguageSafeExecutionNote,
  LanguageStaticCheck,
} from "./types.js";

export const supportedLanguageIds = [
  "python",
  "csharp",
  "java",
  "kotlin",
  "javascript",
  "typescript",
  "cpp",
  "sql",
  "bash",
  "powershell",
  "go",
] as const satisfies readonly LanguageId[];

export const languageProfileBoundaries: LanguageProfileBoundarySet = {
  advisoryOnly: true,
  sourceOnly: true,
  noProviderCalls: true,
  noNetwork: true,
  noFilesystemReads: true,
  noFilesystemWrites: true,
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
};

const signal = (
  signalId: string,
  kind: LanguageDetectionSignal["kind"],
  value: string,
  description: string,
  confidence: LanguageProfileConfidence,
): LanguageDetectionSignal => ({
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
  category: LanguageCommandRecommendation["category"],
  assumption: string,
): LanguageCommandRecommendation => ({
  commandId,
  command: commandText,
  purpose,
  category,
  assumption,
  advisoryOnly: true,
  notExecuted: true,
});

const staticCheck = (
  checkId: string,
  name: string,
  commandText: string | undefined,
  purpose: string,
  assumption: string,
): LanguageStaticCheck => ({
  checkId,
  name,
  ...(commandText ? { command: commandText } : {}),
  purpose,
  assumption,
  advisoryOnly: true,
  notExecuted: true,
});

const note = (
  noteId: string,
  severity: LanguageSafeExecutionNote["severity"],
  safeMessage: string,
): LanguageSafeExecutionNote => ({
  noteId,
  severity,
  safeMessage,
});

const packageNote = (
  noteId: string,
  safeMessage: string,
  assumption: string,
): LanguagePackagingNote => ({
  noteId,
  safeMessage,
  assumption,
});

const heuristic = (
  heuristicId: string,
  title: string,
  safeMessage: string,
  tags: string[],
): LanguageReviewHeuristic => ({
  heuristicId,
  title,
  safeMessage,
  tags,
});

const risk = (
  riskId: string,
  title: string,
  safeMessage: string,
  severity: LanguageRisk["severity"],
  mitigation: string,
): LanguageRisk => ({
  riskId,
  title,
  safeMessage,
  severity,
  mitigation,
});

const dependency = (
  strategyId: string,
  packageManagers: string[],
  manifestFiles: string[],
  lockFiles: string[],
  dependencyNotes: string[],
  updateNotes: string[],
  assumptions: string[],
): LanguageDependencyStrategy => ({
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
  notes: string[],
): LanguageProjectStructure => ({
  commonRoots,
  sourceFolders,
  testFolders,
  configFiles,
  buildFiles,
  notes,
});

const profile = (input: Omit<LanguageProfile, "schemaVersion" | "advisoryOnly" | "boundaries">): LanguageProfile => ({
  ...input,
  schemaVersion: "1.0",
  advisoryOnly: true,
  boundaries: languageProfileBoundaries,
});

export const languageProfiles: readonly LanguageProfile[] = [
  profile({
    id: "python",
    displayName: "Python",
    ecosystemNotes: ["Common for APIs, data work, scripts, automation, and backend services."],
    detectionSignals: [
      signal("python-pyproject", "file", "pyproject.toml", "Modern Python project metadata.", "high"),
      signal("python-requirements", "file", "requirements.txt", "Pinned or starter dependency list.", "medium"),
      signal("python-extension", "extension", ".py", "Python source file extension.", "high"),
      signal("python-src", "folder", "src/", "Common package source layout.", "medium"),
      signal("python-tests", "folder", "tests/", "Common test folder.", "medium"),
    ],
    projectStructure: structure(
      ["pyproject.toml", "requirements.txt", "setup.cfg"],
      ["src/", "app/", "package/"],
      ["tests/"],
      ["pyproject.toml", "pytest.ini", "mypy.ini"],
      ["pyproject.toml", "setup.py"],
      ["Virtual environment and tool availability are assumptions, not guarantees."],
    ),
    commandRecommendations: [
      command("python-test-pytest", "python -m pytest", "Run tests when pytest is available.", "test", "pytest may not be installed."),
      command("python-lint-ruff", "ruff check .", "Run lint checks when Ruff is configured.", "lint", "Ruff may not be installed."),
      command("python-type-mypy", "mypy .", "Run type checks when mypy is configured.", "typecheck", "mypy may not be installed."),
    ],
    dependencyStrategy: dependency(
      "python-dependencies",
      ["pip", "uv", "poetry", "pipenv"],
      ["pyproject.toml", "requirements.txt", "Pipfile"],
      ["uv.lock", "poetry.lock", "Pipfile.lock"],
      ["Prefer one dependency manager per project.", "Review generated lockfiles before changing dependency strategy."],
      ["Treat dependency updates as reviewable changes with tests."],
      ["Tooling may not be installed in the current environment."],
    ),
    staticChecks: [
      staticCheck("python-ruff", "Ruff", "ruff check .", "Lint and import/order checks.", "Ruff configuration is project-specific."),
      staticCheck("python-mypy", "mypy", "mypy .", "Optional static typing checks.", "Typing coverage may be partial."),
    ],
    safeExecutionNotes: [
      note("python-env", "warn", "Confirm virtual environment and dependency manager before running commands."),
      note("python-migrations", "high", "Review migration and data scripts before any live execution."),
    ],
    packagingNotes: [
      packageNote("python-wheel", "Packaging may use wheels, editable installs, or container images.", "Project metadata decides packaging behavior."),
    ],
    reviewHeuristics: [
      heuristic("python-imports", "Import boundaries", "Check package boundaries, circular imports, and side effects at import time.", ["imports", "architecture"]),
      heuristic("python-errors", "Error handling", "Review exception handling and logging around IO, data, and service boundaries.", ["reliability"]),
    ],
    risks: [
      risk("python-env-drift", "Environment drift", "Local and deployment Python environments can diverge.", "medium", "Pin versions and document runtime assumptions."),
      risk("python-dynamic-types", "Runtime type surprises", "Dynamic typing can hide contract issues until tests run.", "medium", "Use focused tests and optional type checks."),
    ],
    assumptions: ["Python tooling recommendations are advisory strings only.", "Commands are never executed by the language profile module."],
    confidence: "medium",
  }),
  profile({
    id: "csharp",
    displayName: "C#",
    ecosystemNotes: ["Common for .NET APIs, desktop apps, enterprise services, and tooling."],
    detectionSignals: [
      signal("csharp-project", "file", ".csproj", "C# project file suffix.", "high"),
      signal("csharp-solution", "file", ".sln", "Visual Studio solution file.", "high"),
      signal("csharp-program", "file", "Program.cs", "Common application entry file.", "medium"),
      signal("csharp-extension", "extension", ".cs", "C# source file extension.", "high"),
    ],
    projectStructure: structure(
      [".sln", "src/", "tests/"],
      ["src/", "Services/", "Controllers/"],
      ["tests/", "test/"],
      ["Directory.Build.props", "NuGet.config", "appsettings.json"],
      [".csproj", ".sln"],
      ["Project style can vary between SDK-style, legacy .NET Framework, and multi-project solutions."],
    ),
    commandRecommendations: [
      command("csharp-build", "dotnet build", "Build .NET projects when SDK tooling is available.", "build", ".NET SDK may not be installed."),
      command("csharp-test", "dotnet test", "Run tests when test projects are present.", "test", "Test adapters may not be installed."),
    ],
    dependencyStrategy: dependency(
      "csharp-dependencies",
      ["NuGet", "dotnet CLI"],
      [".csproj", "Directory.Packages.props", "packages.config"],
      ["packages.lock.json"],
      ["Prefer central package management when already present.", "Review transitive dependency changes carefully."],
      ["Use restore/build/test review before accepting dependency updates."],
      [".NET SDK availability is an environment assumption."],
    ),
    staticChecks: [
      staticCheck("csharp-format", "dotnet format", "dotnet format --verify-no-changes", "Formatting and analyzer checks.", "dotnet-format support depends on SDK/project setup."),
    ],
    safeExecutionNotes: [
      note("csharp-sdk", "warn", "Confirm target framework and installed SDK before command use."),
      note("csharp-config", "high", "Review appsettings and secret handling before deployment planning."),
    ],
    packagingNotes: [
      packageNote("csharp-publish", "Packaging may use dotnet publish, containers, or platform-specific deployment.", "Runtime identifier and target framework are project-specific."),
    ],
    reviewHeuristics: [
      heuristic("csharp-async", "Async boundaries", "Review async flow, cancellation, and exception behavior.", ["async", "reliability"]),
      heuristic("csharp-di", "Dependency injection", "Check service lifetimes and registration boundaries.", ["architecture"]),
    ],
    risks: [
      risk("csharp-framework-mismatch", "Framework mismatch", "Target framework may not match runtime environment.", "medium", "Confirm SDK and runtime assumptions."),
      risk("csharp-nullability", "Nullability gaps", "Nullable reference settings may be missing or inconsistent.", "medium", "Review nullability annotations and warnings."),
    ],
    assumptions: ["dotnet recommendations are advisory strings only.", "Commands are never executed by the language profile module."],
    confidence: "medium",
  }),
  profile({
    id: "java",
    displayName: "Java",
    ecosystemNotes: ["Common for enterprise services, Android-adjacent libraries, backend APIs, and batch systems."],
    detectionSignals: [
      signal("java-maven", "file", "pom.xml", "Maven project metadata.", "high"),
      signal("java-gradle", "file", "build.gradle", "Gradle project metadata.", "high"),
      signal("java-source", "folder", "src/main/java", "Conventional Java source folder.", "high"),
      signal("java-extension", "extension", ".java", "Java source file extension.", "high"),
    ],
    projectStructure: structure(
      ["pom.xml", "build.gradle", "src/"],
      ["src/main/java"],
      ["src/test/java"],
      ["pom.xml", "build.gradle", "settings.gradle"],
      ["pom.xml", "build.gradle"],
      ["Build conventions depend on Maven, Gradle, or custom enterprise tooling."],
    ),
    commandRecommendations: [
      command("java-maven-test", "mvn test", "Run Maven tests when Maven is configured.", "test", "Maven may not be installed."),
      command("java-gradle-test", "gradle test", "Run Gradle tests when Gradle is configured.", "test", "Gradle or wrapper availability is project-specific."),
    ],
    dependencyStrategy: dependency(
      "java-dependencies",
      ["Maven", "Gradle"],
      ["pom.xml", "build.gradle", "build.gradle.kts"],
      ["gradle.lockfile"],
      ["Keep build tool choice consistent.", "Review repository and plugin settings before dependency changes."],
      ["Use build/test checks after dependency updates."],
      ["JDK and build tool versions are assumptions."],
    ),
    staticChecks: [
      staticCheck("java-checkstyle", "Checkstyle", undefined, "Style and convention checks when configured.", "Configuration varies by project."),
      staticCheck("java-spotbugs", "SpotBugs", undefined, "Static bug finding when configured.", "Plugin availability is project-specific."),
    ],
    safeExecutionNotes: [
      note("java-jdk", "warn", "Confirm JDK version, build tool, and wrapper policy before command use."),
      note("java-profiles", "high", "Review active profiles and environment-specific settings before deployment planning."),
    ],
    packagingNotes: [
      packageNote("java-artifacts", "Packaging may produce JAR, WAR, or container artifacts.", "Artifact type depends on build configuration."),
    ],
    reviewHeuristics: [
      heuristic("java-layers", "Layer boundaries", "Review controller, service, repository, and transaction boundaries.", ["architecture"]),
      heuristic("java-concurrency", "Concurrency", "Check thread safety, resource cleanup, and blocking calls.", ["reliability"]),
    ],
    risks: [
      risk("java-build-complexity", "Build complexity", "Plugins and profiles can change behavior significantly.", "medium", "Inspect build metadata before planning changes."),
      risk("java-version-drift", "JDK drift", "Local and deployment JDK versions can diverge.", "medium", "Document source, target, and runtime versions."),
    ],
    assumptions: ["Maven and Gradle commands are advisory strings only.", "Commands are never executed by the language profile module."],
    confidence: "medium",
  }),
  profile({
    id: "kotlin",
    displayName: "Kotlin",
    ecosystemNotes: ["Common for JVM services, Android apps, multiplatform libraries, and Gradle-based projects."],
    detectionSignals: [
      signal("kotlin-extension", "extension", ".kt", "Kotlin source file extension.", "high"),
      signal("kotlin-gradle-kts", "file", "build.gradle.kts", "Gradle Kotlin DSL build file.", "high"),
      signal("kotlin-source", "folder", "src/main/kotlin", "Conventional Kotlin source folder.", "high"),
      signal("kotlin-android", "content_hint", "com.android.application", "Android Gradle plugin hint.", "medium"),
    ],
    projectStructure: structure(
      ["build.gradle.kts", "settings.gradle.kts", "src/"],
      ["src/main/kotlin", "app/src/main/java", "app/src/main/kotlin"],
      ["src/test/kotlin", "app/src/test/"],
      ["build.gradle.kts", "settings.gradle.kts", "gradle.properties"],
      ["build.gradle.kts"],
      ["Kotlin may target JVM, Android, JS, or multiplatform; do not infer target without metadata."],
    ),
    commandRecommendations: [
      command("kotlin-gradle-test", "gradle test", "Run Gradle tests when configured.", "test", "Gradle or wrapper availability is project-specific."),
      command("kotlin-gradle-check", "gradle check", "Run configured checks when available.", "lint", "Check tasks depend on project plugins."),
    ],
    dependencyStrategy: dependency(
      "kotlin-dependencies",
      ["Gradle", "Maven"],
      ["build.gradle.kts", "pom.xml"],
      ["gradle.lockfile"],
      ["Review plugin versions and target platforms together.", "Avoid assuming Android or JVM target without signals."],
      ["Run configured checks after dependency or plugin updates."],
      ["JDK, Gradle, and platform plugins are assumptions."],
    ),
    staticChecks: [
      staticCheck("kotlin-ktlint", "ktlint", undefined, "Kotlin style checks when configured.", "Tooling may be plugin-provided."),
      staticCheck("kotlin-detekt", "detekt", undefined, "Static analysis when configured.", "Configuration varies by project."),
    ],
    safeExecutionNotes: [
      note("kotlin-target", "warn", "Confirm JVM, Android, or multiplatform target before recommendations are treated as complete."),
      note("kotlin-gradle", "warn", "Gradle tasks are advisory until wrapper and plugin setup are confirmed."),
    ],
    packagingNotes: [
      packageNote("kotlin-packaging", "Packaging depends on JVM, Android, or multiplatform target.", "Target platform must be reviewed from project metadata."),
    ],
    reviewHeuristics: [
      heuristic("kotlin-null", "Null safety", "Review platform types, nullable contracts, and Java interop boundaries.", ["safety"]),
      heuristic("kotlin-coroutines", "Coroutines", "Check coroutine scopes, cancellation, and dispatcher use.", ["concurrency"]),
    ],
    risks: [
      risk("kotlin-target-overclaim", "Target overclaim", "Kotlin target cannot be assumed from extension alone.", "medium", "Use build metadata before framework or platform conclusions."),
      risk("kotlin-plugin-drift", "Plugin drift", "Gradle plugin versions can constrain language features.", "medium", "Review plugin and Kotlin versions together."),
    ],
    assumptions: ["Gradle recommendations are advisory strings only.", "Commands are never executed by the language profile module."],
    confidence: "medium",
  }),
  profile({
    id: "javascript",
    displayName: "JavaScript",
    ecosystemNotes: ["Common for frontend apps, Node services, scripts, and tooling."],
    detectionSignals: [
      signal("javascript-package", "file", "package.json", "Node package manifest.", "high"),
      signal("javascript-extension", "extension", ".js", "JavaScript source file extension.", "high"),
      signal("javascript-lock-npm", "file", "package-lock.json", "npm lockfile.", "medium"),
      signal("javascript-lock-yarn", "file", "yarn.lock", "Yarn lockfile.", "medium"),
      signal("javascript-lock-pnpm", "file", "pnpm-lock.yaml", "pnpm lockfile.", "medium"),
    ],
    projectStructure: structure(
      ["package.json", "src/", "test/"],
      ["src/", "lib/", "app/"],
      ["test/", "tests/", "__tests__/"],
      ["package.json", "eslint.config.js", ".eslintrc"],
      ["package.json"],
      ["Package scripts are project-specific and should be inspected before use."],
    ),
    commandRecommendations: [
      command("javascript-npm-test", "npm test", "Run package test script when defined.", "test", "package.json script may not exist."),
      command("javascript-pnpm-test", "pnpm test", "Run package test script with pnpm when configured.", "test", "pnpm may not be installed."),
      command("javascript-yarn-test", "yarn test", "Run package test script with Yarn when configured.", "test", "Yarn may not be installed."),
    ],
    dependencyStrategy: dependency(
      "javascript-dependencies",
      ["npm", "pnpm", "yarn"],
      ["package.json"],
      ["package-lock.json", "pnpm-lock.yaml", "yarn.lock"],
      ["Use the lockfile to infer package manager preference.", "Avoid mixing package managers without review."],
      ["Review lockfile diffs after dependency updates."],
      ["Package manager availability is an assumption."],
    ),
    staticChecks: [
      staticCheck("javascript-eslint", "ESLint", "npm run lint", "Lint checks when script exists.", "Lint script and config may not exist."),
      staticCheck("javascript-test", "Test script", "npm test", "Project-defined tests.", "Test script may be absent or custom."),
    ],
    safeExecutionNotes: [
      note("javascript-scripts", "high", "Inspect package scripts before running them because scripts can perform arbitrary project actions."),
      note("javascript-lockfile", "warn", "Respect the existing lockfile and package manager convention."),
    ],
    packagingNotes: [
      packageNote("javascript-package", "Packaging may use bundlers, Node packages, or container images.", "Framework and script metadata define package behavior."),
    ],
    reviewHeuristics: [
      heuristic("javascript-async", "Async behavior", "Review promise chains, error handling, and unhandled rejections.", ["reliability"]),
      heuristic("javascript-supply-chain", "Supply chain", "Review package scripts and dependency trust boundaries.", ["security"]),
    ],
    risks: [
      risk("javascript-script-risk", "Script ambiguity", "Package scripts can do more than their names imply.", "high", "Read scripts before use and keep recommendations advisory."),
      risk("javascript-type-gaps", "Type gaps", "Plain JavaScript may lack static contracts.", "medium", "Use tests and runtime validation where appropriate."),
    ],
    assumptions: ["npm, pnpm, and Yarn commands are advisory strings only.", "Commands are never executed by the language profile module."],
    confidence: "medium",
  }),
  profile({
    id: "typescript",
    displayName: "TypeScript",
    ecosystemNotes: ["Common for frontend apps, Node services, CLIs, full-stack frameworks, and shared packages."],
    detectionSignals: [
      signal("typescript-config", "file", "tsconfig.json", "TypeScript compiler configuration.", "high"),
      signal("typescript-extension", "extension", ".ts", "TypeScript source file extension.", "high"),
      signal("typescript-react-extension", "extension", ".tsx", "TypeScript React source file extension.", "high"),
      signal("typescript-package", "file", "package.json", "Node package manifest.", "medium"),
    ],
    projectStructure: structure(
      ["package.json", "tsconfig.json", "src/"],
      ["src/", "app/", "packages/"],
      ["test/", "tests/", "__tests__/"],
      ["tsconfig.json", "eslint.config.js", "vitest.config.ts"],
      ["package.json", "tsconfig.json"],
      ["Framework cannot be inferred from TypeScript alone; use package metadata and routes/components as follow-up signals."],
    ),
    commandRecommendations: [
      command("typescript-check", "tsc --noEmit", "Run TypeScript type checks when compiler is available.", "typecheck", "TypeScript may not be installed locally."),
      command("typescript-npm-test", "npm test", "Run package test script when defined.", "test", "package.json script may not exist."),
      command("typescript-pnpm-test", "pnpm test", "Run package test script with pnpm when configured.", "test", "pnpm may not be installed."),
      command("typescript-yarn-test", "yarn test", "Run package test script with Yarn when configured.", "test", "Yarn may not be installed."),
      command("typescript-npm-lint", "npm run lint", "Run package lint script when defined.", "lint", "Lint script and config may not exist."),
    ],
    dependencyStrategy: dependency(
      "typescript-dependencies",
      ["npm", "pnpm", "yarn"],
      ["package.json", "tsconfig.json"],
      ["package-lock.json", "pnpm-lock.yaml", "yarn.lock"],
      ["Keep TypeScript, framework, and lint versions aligned.", "Avoid assuming package manager without lockfile/script review."],
      ["Review lockfile and typecheck impact after dependency changes."],
      ["Node.js, package manager, and TypeScript compiler availability are assumptions."],
    ),
    staticChecks: [
      staticCheck("typescript-tsc", "TypeScript compiler", "tsc --noEmit", "Static type checking.", "Compiler and tsconfig must exist."),
      staticCheck("typescript-eslint", "ESLint", "npm run lint", "Lint checks when configured.", "Script and config may be absent."),
    ],
    safeExecutionNotes: [
      note("typescript-package-scripts", "high", "Inspect package scripts before running them because scripts can perform project-specific actions."),
      note("typescript-framework", "warn", "Do not infer framework from TypeScript without additional project signals."),
    ],
    packagingNotes: [
      packageNote("typescript-build", "Packaging may use transpilation, bundling, or framework-specific build output.", "Build behavior is framework and script dependent."),
    ],
    reviewHeuristics: [
      heuristic("typescript-types", "Type boundaries", "Review public types, unknown/any usage, and validation at IO boundaries.", ["types", "safety"]),
      heuristic("typescript-module-system", "Module mode", "Check ESM/CommonJS settings and import extension behavior.", ["build"]),
    ],
    risks: [
      risk("typescript-config-drift", "Configuration drift", "tsconfig, package type, and runtime loader can disagree.", "medium", "Review module settings together."),
      risk("typescript-script-risk", "Script ambiguity", "Package scripts may perform arbitrary tasks.", "high", "Read scripts before use and keep recommendations advisory."),
    ],
    assumptions: ["TypeScript commands are advisory strings only.", "Commands are never executed by the language profile module."],
    confidence: "medium",
  }),
  profile({
    id: "cpp",
    displayName: "C++",
    ecosystemNotes: ["Common for native libraries, systems software, games, performance-sensitive services, and embedded tooling."],
    detectionSignals: [
      signal("cpp-cmake", "file", "CMakeLists.txt", "CMake project metadata.", "high"),
      signal("cpp-makefile", "file", "Makefile", "Make-based build metadata.", "medium"),
      signal("cpp-source", "extension", ".cpp", "C++ source file extension.", "high"),
      signal("cpp-header", "extension", ".hpp", "C++ header file extension.", "medium"),
    ],
    projectStructure: structure(
      ["CMakeLists.txt", "Makefile", "src/", "include/"],
      ["src/", "include/"],
      ["tests/", "test/"],
      ["CMakeLists.txt", "conanfile.txt", "vcpkg.json"],
      ["CMakeLists.txt", "Makefile"],
      ["Native build commands can be platform and compiler specific."],
    ),
    commandRecommendations: [
      command("cpp-cmake-configure", "cmake -S . -B build", "Configure CMake build when appropriate.", "build", "CMake and compiler toolchain may not be installed."),
      command("cpp-cmake-build", "cmake --build build", "Build configured CMake project.", "build", "Build directory and generator are assumptions."),
      command("cpp-ctest", "ctest --test-dir build", "Run CTest tests when configured.", "test", "CTest setup may not exist."),
    ],
    dependencyStrategy: dependency(
      "cpp-dependencies",
      ["CMake", "vcpkg", "Conan", "system packages"],
      ["CMakeLists.txt", "vcpkg.json", "conanfile.txt"],
      ["vcpkg-lock.json", "conan.lock"],
      ["Prefer the dependency manager already present.", "Native dependencies can require platform-specific review."],
      ["Review ABI, compiler, and platform impact before dependency changes."],
      ["Compiler, linker, and native dependency availability are assumptions."],
    ),
    staticChecks: [
      staticCheck("cpp-clang-tidy", "clang-tidy", undefined, "Static analysis when configured.", "Toolchain and compilation database may be required."),
      staticCheck("cpp-format", "clang-format", undefined, "Formatting when configured.", "Style file may not exist."),
    ],
    safeExecutionNotes: [
      note("cpp-native-build", "high", "Native build commands can run compiler, linker, and custom build steps; inspect build files first."),
      note("cpp-platform", "warn", "Confirm operating system, compiler, architecture, and build generator before planning execution."),
    ],
    packagingNotes: [
      packageNote("cpp-artifacts", "Packaging may produce libraries, binaries, installers, or container images.", "Artifact format depends on build metadata."),
    ],
    reviewHeuristics: [
      heuristic("cpp-memory", "Memory safety", "Review ownership, lifetimes, bounds, and resource cleanup.", ["safety"]),
      heuristic("cpp-build", "Build reproducibility", "Check compiler flags, dependency versions, and generated artifacts policy.", ["build"]),
    ],
    risks: [
      risk("cpp-platform-drift", "Platform drift", "Native behavior can differ by compiler and OS.", "high", "Document platform assumptions and test matrix."),
      risk("cpp-memory-risk", "Memory safety risk", "Manual memory and concurrency errors can be severe.", "high", "Use review, sanitizers, and tests when available."),
    ],
    assumptions: ["C++ commands are advisory strings only.", "Commands are never executed by the language profile module."],
    confidence: "medium",
  }),
  profile({
    id: "sql",
    displayName: "SQL",
    ecosystemNotes: ["Common for migrations, reporting, analytics, database functions, and seed/reference data."],
    detectionSignals: [
      signal("sql-extension", "extension", ".sql", "SQL file extension.", "high"),
      signal("sql-migrations", "folder", "migrations/", "Common migration folder.", "medium"),
      signal("sql-db", "folder", "db/", "Common database folder.", "medium"),
      signal("sql-schema", "file", "schema.sql", "Schema planning file.", "medium"),
    ],
    projectStructure: structure(
      ["migrations/", "db/", "sql/"],
      ["migrations/", "queries/", "procedures/"],
      ["tests/", "fixtures/"],
      ["schema.sql", "migration config"],
      ["migration tool config"],
      ["Database dialect and migration tooling must be identified before planning changes."],
    ),
    commandRecommendations: [
      command("sql-validate-review", "review SQL with the project migration tool in dry-run mode when available", "Review SQL through project-specific safe validation.", "inspect", "Migration tool and dry-run support are assumptions."),
    ],
    dependencyStrategy: dependency(
      "sql-dependencies",
      ["project migration tool", "database client"],
      ["migration config", "schema metadata"],
      [],
      ["Treat database dialect and migration tool as explicit assumptions.", "Do not infer production database access from SQL files."],
      ["Review SQL changes with backups, rollbacks, and dry-run support where available."],
      ["Database access and tooling are not assumed."],
    ),
    staticChecks: [
      staticCheck("sql-lint", "SQL linter", undefined, "Dialect-aware linting when configured.", "SQL dialect and linter may not be known."),
    ],
    safeExecutionNotes: [
      note("sql-review-first", "high", "Review SQL manually and use safe validation before any database interaction."),
      note("sql-destructive", "high", "Avoid destructive SQL guidance in advisory profiles."),
    ],
    packagingNotes: [
      packageNote("sql-migrations", "SQL packaging usually follows migration tooling or application release process.", "Migration tool and database dialect are assumptions."),
    ],
    reviewHeuristics: [
      heuristic("sql-transactions", "Transaction safety", "Review transaction boundaries, rollback strategy, and lock impact.", ["database"]),
      heuristic("sql-permissions", "Data access", "Check permissions, sensitive columns, and retention assumptions.", ["security"]),
    ],
    risks: [
      risk("sql-destructive-risk", "Destructive change risk", "Database changes can cause irreversible data loss if reviewed poorly.", "high", "Require backups, rollback plan, and human review."),
      risk("sql-dialect-risk", "Dialect mismatch", "SQL syntax and behavior vary by database engine.", "medium", "Confirm database dialect before recommendations are used."),
    ],
    assumptions: ["SQL recommendations are advisory strings only.", "No database access is performed by the language profile module."],
    confidence: "medium",
  }),
  profile({
    id: "bash",
    displayName: "Bash",
    ecosystemNotes: ["Common for local automation, CI helper scripts, provisioning snippets, and developer tooling."],
    detectionSignals: [
      signal("bash-extension", "extension", ".sh", "Shell script file extension.", "high"),
      signal("bash-shebang", "content_hint", "#!/usr/bin/env bash", "Bash shebang hint.", "high"),
      signal("bash-scripts-folder", "folder", "scripts/", "Common helper script folder.", "medium"),
    ],
    projectStructure: structure(
      ["scripts/", "bin/"],
      ["scripts/", "bin/"],
      ["tests/", "test/"],
      [".shellcheckrc"],
      ["Makefile"],
      ["Shell behavior depends on OS, shell version, permissions, and environment variables."],
    ),
    commandRecommendations: [
      command("bash-shellcheck", "shellcheck scripts/*.sh", "Run ShellCheck when scripts and tool are available.", "lint", "ShellCheck may not be installed and glob scope is illustrative."),
      command("bash-parse", "bash -n script.sh", "Syntax-check a specific reviewed script.", "inspect", "Script path must be reviewed and supplied by a human."),
    ],
    dependencyStrategy: dependency(
      "bash-dependencies",
      ["system shell", "project tools"],
      ["scripts/*.sh", "Makefile"],
      [],
      ["Document required external commands.", "Avoid hidden assumptions about shell, OS, and environment."],
      ["Review script dependencies before changing automation."],
      ["Shell and external command availability are assumptions."],
    ),
    staticChecks: [
      staticCheck("bash-shellcheck-static", "ShellCheck", "shellcheck scripts/*.sh", "Static shell analysis when available.", "Tooling and paths are assumptions."),
    ],
    safeExecutionNotes: [
      note("bash-strict-mode", "high", "Review quoting, strict mode, traps, and variable expansion before any shell use."),
      note("bash-destructive", "high", "Treat deletion, permission, and process-control commands as high-risk review items."),
    ],
    packagingNotes: [
      packageNote("bash-distribution", "Scripts may be distributed with packages, containers, or operational runbooks.", "Execution environment must be documented separately."),
    ],
    reviewHeuristics: [
      heuristic("bash-quoting", "Quoting and expansion", "Review quoting, word splitting, globbing, and unset variable behavior.", ["safety"]),
      heuristic("bash-idempotency", "Idempotency", "Check repeat-run behavior and cleanup paths.", ["operations"]),
    ],
    risks: [
      risk("bash-environment-risk", "Environment-sensitive behavior", "Scripts can behave differently across shells and environments.", "high", "Document shell assumptions and use static checks."),
      risk("bash-destructive-risk", "Destructive command risk", "Shell automation can change files, permissions, processes, or services.", "high", "Require human review before any execution plan."),
    ],
    assumptions: ["Bash recommendations are advisory strings only.", "Commands are never executed by the language profile module."],
    confidence: "medium",
  }),
  profile({
    id: "powershell",
    displayName: "PowerShell",
    ecosystemNotes: ["Common for Windows automation, cross-platform operational scripts, Azure tooling, and admin tasks."],
    detectionSignals: [
      signal("powershell-extension", "extension", ".ps1", "PowerShell script extension.", "high"),
      signal("powershell-module", "extension", ".psm1", "PowerShell module extension.", "high"),
      signal("powershell-manifest", "extension", ".psd1", "PowerShell data or module manifest.", "medium"),
    ],
    projectStructure: structure(
      ["scripts/", "modules/"],
      ["scripts/", "modules/"],
      ["tests/", "test/"],
      ["PSScriptAnalyzerSettings.psd1"],
      [".psd1", ".psm1"],
      ["PowerShell behavior depends on edition, platform, policy, and module availability."],
    ),
    commandRecommendations: [
      command("powershell-analyzer", "Invoke-ScriptAnalyzer -Path scripts", "Run static analysis when PSScriptAnalyzer is available.", "lint", "PSScriptAnalyzer may not be installed."),
      command("powershell-pester", "Invoke-Pester", "Run Pester tests when configured.", "test", "Pester may not be installed or configured."),
    ],
    dependencyStrategy: dependency(
      "powershell-dependencies",
      ["PowerShell Gallery", "local modules"],
      [".psd1", ".psm1"],
      [],
      ["Document module versions and trusted sources.", "Review platform-specific assumptions."],
      ["Review module and policy changes before operational use."],
      ["PowerShell edition, policy, and modules are assumptions."],
    ),
    staticChecks: [
      staticCheck("powershell-script-analyzer", "PSScriptAnalyzer", "Invoke-ScriptAnalyzer -Path scripts", "PowerShell static analysis when available.", "Tooling and paths are assumptions."),
    ],
    safeExecutionNotes: [
      note("powershell-policy", "high", "Review execution policy, signing, and platform assumptions before any script use."),
      note("powershell-expression", "high", "Avoid uncontrolled dynamic expression execution patterns."),
    ],
    packagingNotes: [
      packageNote("powershell-module", "Packaging may use modules, signed scripts, or operational runbooks.", "Distribution and signing requirements are project-specific."),
    ],
    reviewHeuristics: [
      heuristic("powershell-parameters", "Parameter safety", "Review parameter validation, quoting, and pipeline input handling.", ["safety"]),
      heuristic("powershell-platform", "Platform behavior", "Check Windows PowerShell vs PowerShell 7 compatibility assumptions.", ["platform"]),
    ],
    risks: [
      risk("powershell-policy-risk", "Policy and privilege risk", "Scripts may require elevated privileges or policy changes.", "high", "Document privilege assumptions and require review."),
      risk("powershell-platform-risk", "Platform drift", "Cmdlet behavior can vary by platform and PowerShell edition.", "medium", "Confirm target platform before operational planning."),
    ],
    assumptions: ["PowerShell recommendations are advisory strings only.", "Commands are never executed by the language profile module."],
    confidence: "medium",
  }),
  profile({
    id: "go",
    displayName: "Go",
    ecosystemNotes: ["Common for APIs, CLIs, infrastructure tooling, services, and distributed systems."],
    detectionSignals: [
      signal("go-mod", "file", "go.mod", "Go module manifest.", "high"),
      signal("go-sum", "file", "go.sum", "Go dependency checksum file.", "medium"),
      signal("go-extension", "extension", ".go", "Go source file extension.", "high"),
      signal("go-cmd", "folder", "cmd/", "Common command entry folder.", "medium"),
      signal("go-internal", "folder", "internal/", "Common internal package boundary.", "medium"),
    ],
    projectStructure: structure(
      ["go.mod", "cmd/", "internal/"],
      ["cmd/", "internal/", "pkg/"],
      ["tests/", "test/", "internal/"],
      ["go.mod", "go.sum"],
      ["go.mod"],
      ["Go modules usually define dependency and package boundaries."],
    ),
    commandRecommendations: [
      command("go-test", "go test ./...", "Run Go tests when Go tooling is available.", "test", "Go may not be installed."),
      command("go-vet", "go vet ./...", "Run Go vet checks when Go tooling is available.", "lint", "Go may not be installed."),
      command("go-fmt", "gofmt -w", "Format reviewed Go files when explicitly approved.", "format", "Formatting modifies files and must be approved before use."),
    ],
    dependencyStrategy: dependency(
      "go-dependencies",
      ["go modules"],
      ["go.mod"],
      ["go.sum"],
      ["Review module path and replace directives.", "Treat dependency changes as source-reviewed changes."],
      ["Run tests and vet after dependency changes when approved."],
      ["Go toolchain availability is an assumption."],
    ),
    staticChecks: [
      staticCheck("go-vet-static", "go vet", "go vet ./...", "Static checks from Go tooling.", "Go toolchain may not be installed."),
      staticCheck("go-test-static", "go test", "go test ./...", "Compile and test packages.", "Tests may have external dependencies."),
    ],
    safeExecutionNotes: [
      note("go-tests", "warn", "Go tests may perform integration behavior; inspect tests before use."),
      note("go-format", "warn", "gofmt with write flags changes files and needs explicit approval."),
    ],
    packagingNotes: [
      packageNote("go-build", "Packaging may produce static binaries, containers, or OS-specific artifacts.", "Target OS and architecture are assumptions."),
    ],
    reviewHeuristics: [
      heuristic("go-errors", "Error handling", "Review error wrapping, returns, and context propagation.", ["reliability"]),
      heuristic("go-concurrency", "Concurrency", "Check goroutine lifecycle, channels, cancellation, and data races.", ["concurrency"]),
    ],
    risks: [
      risk("go-integration-tests", "Integration test side effects", "Tests may connect to services or use environment-specific resources.", "medium", "Inspect tests and configuration before running."),
      risk("go-cross-compile", "Cross-compile assumptions", "Build targets depend on OS, architecture, and cgo use.", "medium", "Document target platform assumptions."),
    ],
    assumptions: ["Go commands are advisory strings only.", "Commands are never executed by the language profile module."],
    confidence: "medium",
  }),
];

export const listLanguageProfiles = (): LanguageProfile[] =>
  languageProfiles.map((profileItem) => ({ ...profileItem }));
