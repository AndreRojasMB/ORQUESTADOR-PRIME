import { access, readFile, stat } from "fs/promises";
import { join } from "path";

export const DEFAULT_VIERNES_WINDOWS_PATH =
  "C:\\Users\\Franco Andre\\OneDrive - Universidad Privada del Valle\\Documents\\CodexAutomatizaciones";

export function windowsPathToWslPath(pathValue: string): string {
  const normalized = pathValue.trim().replace(/\\/g, "/");
  const driveMatch = /^([A-Za-z]):\/(.*)$/.exec(normalized);
  if (!driveMatch) return normalized;

  const drive = driveMatch[1]?.toLowerCase();
  const rest = driveMatch[2] ?? "";
  return `/mnt/${drive}/${rest}`.replace(/\/+/g, "/");
}

function wslMountPathToWindowsPath(pathValue: string): string | undefined {
  const match = /^\/mnt\/([A-Za-z])\/(.*)$/.exec(pathValue.trim());
  if (!match) return undefined;

  const drive = match[1]?.toUpperCase();
  const rest = (match[2] ?? "").replace(/\//g, "\\");
  return drive ? `${drive}:\\${rest}` : undefined;
}

function filesystemPathForRuntime(pathValue: string): string {
  if (process.platform !== "win32") return pathValue;
  return wslMountPathToWindowsPath(pathValue) ?? pathValue;
}

export const DEFAULT_VIERNES_WSL_PATH = windowsPathToWslPath(
  DEFAULT_VIERNES_WINDOWS_PATH,
);

export interface ViernesWorkspaceKeyFiles {
  packageJson: boolean;
  readme: boolean;
  env: boolean;
  envLocal: boolean;
  src: boolean;
  app: boolean;
  scripts: boolean;
  docs: boolean;
}

export interface ViernesWorkspaceDiscoveryResult {
  exists: boolean;
  rootPath: string;
  packageJsonExists: boolean;
  detectedStack?: readonly string[];
  scripts: readonly string[];
  keyFiles: ViernesWorkspaceKeyFiles;
  keyFilesPresent: readonly string[];
}

export interface ViernesWorkspaceDiscoveryOptions {
  rootPath?: string;
  windowsPath?: string;
}

async function exists(pathValue: string): Promise<boolean> {
  try {
    await access(pathValue);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(pathValue: string): Promise<boolean> {
  try {
    return (await stat(pathValue)).isDirectory();
  } catch {
    return false;
  }
}

async function readPackageJson(
  pathValue: string,
): Promise<Record<string, unknown> | undefined> {
  try {
    const raw = await readFile(pathValue, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

function scriptNames(packageJson: Record<string, unknown> | undefined): string[] {
  const scripts = packageJson?.scripts;
  if (!scripts || typeof scripts !== "object" || Array.isArray(scripts)) {
    return [];
  }

  return Object.keys(scripts as Record<string, unknown>).sort();
}

function dependencyNames(packageJson: Record<string, unknown> | undefined): string[] {
  const names = new Set<string>();
  for (const section of ["dependencies", "devDependencies", "peerDependencies"]) {
    const value = packageJson?.[section];
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    for (const name of Object.keys(value as Record<string, unknown>)) {
      names.add(name);
    }
  }
  return [...names];
}

function detectStack(
  packageJson: Record<string, unknown> | undefined,
  keyFiles: ViernesWorkspaceKeyFiles,
): string[] {
  const deps = dependencyNames(packageJson);
  const stack = new Set<string>();

  if (packageJson) stack.add("node");
  if (deps.includes("typescript") || deps.includes("tsx")) stack.add("typescript");
  if (deps.includes("next")) stack.add("next");
  if (deps.includes("react")) stack.add("react");
  if (deps.includes("express")) stack.add("express");
  if (deps.includes("zod")) stack.add("zod");
  if (keyFiles.src) stack.add("src");
  if (keyFiles.app) stack.add("app");

  return [...stack].sort();
}

function presentKeyFiles(keyFiles: ViernesWorkspaceKeyFiles): string[] {
  const names: Array<[keyof ViernesWorkspaceKeyFiles, string]> = [
    ["packageJson", "package.json"],
    ["readme", "README.md"],
    ["env", ".env"],
    ["envLocal", ".env.local"],
    ["src", "src/"],
    ["app", "app/"],
    ["scripts", "scripts/"],
    ["docs", "docs/"],
  ];

  return names
    .filter(([key]) => keyFiles[key])
    .map(([, label]) => label);
}

export async function discoverViernesWorkspace(
  options: ViernesWorkspaceDiscoveryOptions = {},
): Promise<ViernesWorkspaceDiscoveryResult> {
  const rootPath =
    options.rootPath ??
    (options.windowsPath
      ? windowsPathToWslPath(options.windowsPath)
      : DEFAULT_VIERNES_WSL_PATH);
  const filesystemRootPath = filesystemPathForRuntime(rootPath);
  const rootExists = await isDirectory(filesystemRootPath);
  const packageJsonPath = join(filesystemRootPath, "package.json");
  const keyFiles: ViernesWorkspaceKeyFiles = {
    packageJson: rootExists && (await exists(packageJsonPath)),
    readme:
      rootExists &&
      ((await exists(join(filesystemRootPath, "README.md"))) ||
        (await exists(join(filesystemRootPath, "readme.md")))),
    env: rootExists && (await exists(join(filesystemRootPath, ".env"))),
    envLocal: rootExists && (await exists(join(filesystemRootPath, ".env.local"))),
    src: rootExists && (await isDirectory(join(filesystemRootPath, "src"))),
    app: rootExists && (await isDirectory(join(filesystemRootPath, "app"))),
    scripts: rootExists && (await isDirectory(join(filesystemRootPath, "scripts"))),
    docs: rootExists && (await isDirectory(join(filesystemRootPath, "docs"))),
  };
  const packageJson = keyFiles.packageJson
    ? await readPackageJson(packageJsonPath)
    : undefined;
  const stack = detectStack(packageJson, keyFiles);

  return {
    exists: rootExists,
    rootPath,
    packageJsonExists: keyFiles.packageJson,
    ...(stack.length > 0 ? { detectedStack: stack } : {}),
    scripts: scriptNames(packageJson),
    keyFiles,
    keyFilesPresent: presentKeyFiles(keyFiles),
  };
}
