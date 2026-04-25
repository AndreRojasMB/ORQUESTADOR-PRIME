// src/audit/repoReader.ts
// Lee la estructura de un repositorio local y extrae archivos clave.
// Nunca lee archivos binarios ni node_modules.
// V2 extension: agregar soporte para .gitignore parsing aquí.

import { readdir, readFile, stat, realpath } from "fs/promises";
import { join, extname, relative, resolve, sep } from "path";
import { logger } from "../observability/logger.js";

// Extensiones de texto que vale la pena leer
const READABLE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx",
  ".json", ".yaml", ".yml", ".toml",
  ".md", ".env.example",
  ".sql", ".prisma",
  ".css", ".scss",
  ".sh", ".dockerfile",
]);

// Carpetas a ignorar siempre
const IGNORED_DIRS = new Set([
  "node_modules", ".git", "dist", "build",
  ".next", ".nuxt", "coverage", ".turbo",
  ".cache", "tmp", "temp",
]);

// Archivos clave que siempre se intentan leer si existen
const KEY_FILES = [
  "package.json",
  "tsconfig.json",
  "README.md",
  ".env.example",
  "docker-compose.yml",
  "docker-compose.yaml",
  "Dockerfile",
  ".github/workflows",
  "prisma/schema.prisma",
];

export interface RepoFile {
  path:    string;   // relativo a la raíz del repo
  content: string;
  sizeBytes: number;
}

export interface RepoStructure {
  root:       string;
  tree:       string[];        // rutas relativas de todos los archivos
  keyFiles:   RepoFile[];      // archivos clave leídos
  totalFiles: number;
}

// Construye el árbol de archivos recursivamente
async function buildTree(
  dir:    string,
  root:   string,
  tree:   string[] = []
): Promise<string[]> {
  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return tree;
  }

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = join(dir, entry.name);
    const relPath  = relative(root, fullPath);

    if (entry.isDirectory()) {
      tree.push(`${relPath}/`);
      await buildTree(fullPath, root, tree);
    } else {
      tree.push(relPath);
    }
  }

  return tree;
}

// Lee un archivo de texto — retorna null si falla o es binario
async function readTextFile(path: string): Promise<string | null> {
  const ext = extname(path).toLowerCase();
  if (!READABLE_EXTENSIONS.has(ext) && !path.endsWith(".example")) {
    return null;
  }

  try {
    const info = await stat(path);
    // Saltar archivos mayores a 100KB
    if (info.size > 100_000) return null;

    const content = await readFile(path, "utf-8");
    return content;
  } catch {
    return null;
  }
}

// Función principal — lee el repo completo
export async function readRepo(repoPath: string): Promise<RepoStructure> {
  const tree = await buildTree(repoPath, repoPath);

  // Leer archivos clave
  const keyFiles: RepoFile[] = [];

  for (const keyPath of KEY_FILES) {
    const fullPath = join(repoPath, keyPath);
    const content  = await readTextFile(fullPath);
    if (content === null) continue;

    const info = await stat(fullPath).catch(() => null);
    keyFiles.push({
      path:      keyPath,
      content,
      sizeBytes: info?.size ?? 0,
    });
  }

  // Si hay pocos archivos totales, leer también src/**
  const srcFiles = tree.filter((f) =>
    f.startsWith("src/") && READABLE_EXTENSIONS.has(extname(f))
  );

  // Leer hasta 20 archivos src más pequeños
  const srcSample = srcFiles.slice(0, 20);
  for (const relPath of srcSample) {
    // Evitar duplicados con keyFiles
    if (keyFiles.some((k) => k.path === relPath)) continue;

    const fullPath = join(repoPath, relPath);
    const content  = await readTextFile(fullPath);
    if (content === null) continue;

    const info = await stat(fullPath).catch(() => null);
    keyFiles.push({
      path:      relPath,
      content,
      sizeBytes: info?.size ?? 0,
    });
  }

  return {
    root:       repoPath,
    tree,
    keyFiles,
    totalFiles: tree.filter((f) => !f.endsWith("/")).length,
  };
}

// ─── Focused reader (Phase 32C-UXAUDIT) ─────────────────────────
// Reads a caller-supplied allowlist of files instead of walking the
// whole tree. Read-only — same fs primitives as readRepo, no writes.
// Path traversal and symlink-escape are rejected before any read.

export interface FocusedReadOptions {
  maxFiles?: number;        // default 30, hard cap 100
}

export interface FocusedReadResult extends RepoStructure {
  skipped: Array<{ path: string; reason: string }>;
}

const FOCUSED_DEFAULT_MAX = 30;
const FOCUSED_HARD_CAP    = 100;

async function isInsideRoot(absPath: string, repoRootReal: string): Promise<boolean> {
  // realpath resolves symlinks; require the result to be under repoRootReal.
  let real: string;
  try {
    real = await realpath(absPath);
  } catch {
    // realpath can fail for not-yet-created paths; for an audit reader the
    // file must already exist, so treat resolve failure as outside.
    return false;
  }
  if (real === repoRootReal) return true;
  return real.startsWith(repoRootReal + sep);
}

export async function readRepoFocused(
  repoRoot: string,
  files:    string[],
  options:  FocusedReadOptions = {},
): Promise<FocusedReadResult> {
  const cap = Math.min(
    Math.max(1, options.maxFiles ?? FOCUSED_DEFAULT_MAX),
    FOCUSED_HARD_CAP,
  );

  const rootAbs  = resolve(repoRoot);
  const rootReal = await realpath(rootAbs);

  // Dedupe input order-preserving; cap at limit.
  const seen = new Set<string>();
  const requested: string[] = [];
  for (const raw of files) {
    const r = raw.trim();
    if (!r) continue;
    if (seen.has(r)) continue;
    seen.add(r);
    requested.push(r);
  }
  const overflow = requested.length > cap ? requested.length - cap : 0;
  const limited  = requested.slice(0, cap);

  const keyFiles: RepoFile[] = [];
  const skipped: Array<{ path: string; reason: string }> = [];
  const dirSet = new Set<string>();

  for (const rel of limited) {
    const candidate = resolve(rootAbs, rel);
    if (!(await isInsideRoot(candidate, rootReal))) {
      skipped.push({ path: rel, reason: "outside-repo-or-symlink-escape" });
      continue;
    }
    let info;
    try {
      info = await stat(candidate);
    } catch {
      skipped.push({ path: rel, reason: "not-found" });
      continue;
    }
    if (!info.isFile()) {
      skipped.push({ path: rel, reason: "not-a-file" });
      continue;
    }
    if (info.size > 100_000) {
      skipped.push({ path: rel, reason: "too-large" });
      continue;
    }
    const content = await readTextFile(candidate);
    if (content === null) {
      skipped.push({ path: rel, reason: "non-readable-extension" });
      continue;
    }
    const relInRepo = relative(rootAbs, candidate);
    keyFiles.push({ path: relInRepo, content, sizeBytes: info.size });

    // Record parent directory chain for the focused tree.
    let dir = relInRepo;
    while (true) {
      const idx = dir.lastIndexOf("/");
      if (idx < 0) break;
      dir = dir.slice(0, idx);
      dirSet.add(dir + "/");
    }
  }

  if (overflow > 0) {
    logger.warn(`audit-ux: focused-read capped at ${cap} files; ${overflow} extra ignored`);
  }

  // Build a focused tree: directories (alphabetical) followed by files.
  const dirs  = [...dirSet].sort();
  const fileLines = keyFiles.map((f) => f.path).sort();
  const tree = [...dirs, ...fileLines];

  return {
    root:       rootAbs,
    tree,
    keyFiles,
    totalFiles: keyFiles.length,
    skipped,
  };
}