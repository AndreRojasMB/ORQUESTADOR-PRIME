// src/audit/repoReader.ts
// Lee la estructura de un repositorio local y extrae archivos clave.
// Nunca lee archivos binarios ni node_modules.
// V2 extension: agregar soporte para .gitignore parsing aquí.

import { readdir, readFile, stat, realpath } from "fs/promises";
import { join, dirname, extname, relative, resolve, sep } from "path";
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

// Carpetas a ignorar siempre (compartido entre buildTree y readRepoFocused).
export const IGNORED_DIRS = new Set([
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

// ─── Focused reader (Phase 32C-UXAUDIT, hardened in 32E-AUDITUX-CORE) ───
// Reads a caller-supplied allowlist of files (plus optional --include
// patterns and import-followed reachables) instead of walking the whole
// tree. Read-only — same fs primitives as readRepo, no writes. Path
// traversal, symlink-escape, ignored dirs, and binary/oversize files
// are all rejected before any read.

export interface FocusedReadOptions {
  maxFiles?:      number;       // default 30, hard cap 200
  maxBytes?:      number;       // default 100_000, hard cap 500_000
  followImports?: 0 | 1 | 2;    // default 0; BFS depth for relative-import follower
  include?:       string[];     // patterns added to seeds via repo-tree expansion
  exclude?:       string[];     // patterns removed from seeds + import-followed
}

export interface FocusedSkippedEntry {
  path:    string;
  reason:  string;
  count?:  number;
}

export interface FocusedReadResult extends RepoStructure {
  skipped:         FocusedSkippedEntry[];
  // Phase 32E-AUDITUX-CORE — surfaced metadata
  reachableCount:  number;
  capsApplied:     string[];
  followDepth:     0 | 1 | 2;
  caps:            { maxFiles: number; maxBytes: number };
  seeds:           { entry: string | null; explicit: string[]; includeMatched: string[] };
  patterns:        { include: string[]; exclude: string[] };
}

const FOCUSED_DEFAULT_MAX        = 30;
const FOCUSED_HARD_CAP           = 200;
const FOCUSED_DEFAULT_MAX_BYTES  = 100_000;
const FOCUSED_MIN_MAX_BYTES      = 1024;
const FOCUSED_HARD_MAX_BYTES     = 500_000;

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

// Returns the matching ignored segment if `rel` traverses any IGNORED_DIRS
// directory (e.g. "node_modules"), else null. POSIX-normalized.
function pathHitsIgnoredDir(rel: string): string | null {
  const norm = rel.replace(/\\/g, "/");
  for (const seg of norm.split("/")) {
    if (seg && IGNORED_DIRS.has(seg)) return seg;
  }
  return null;
}

// Tiny v1 glob matcher — supports `*`, `**`, exact paths, and prefix
// directories ending in `/`. No new dependency.
function compilePattern(raw: string): (target: string) => boolean {
  const p = raw.replace(/\\/g, "/").replace(/^\.\//, "");
  if (p.length === 0) return () => false;

  // Bare directory prefix: pattern ends with "/".
  if (p.endsWith("/")) {
    const prefix = p;
    return (target) => target.replace(/\\/g, "/").startsWith(prefix);
  }

  // No glob chars → exact path match.
  if (!p.includes("*")) {
    return (target) => target.replace(/\\/g, "/") === p;
  }

  // Glob: ** → .* ; * → [^/]* ; escape other regex metachars.
  const escaped = p.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const re = "^" +
    escaped
      .replace(/\*\*/g, "")
      .replace(/\*/g, "[^/]*")
      .replace(//g, ".*") +
    "$";
  const rx = new RegExp(re);
  return (target) => rx.test(target.replace(/\\/g, "/"));
}

// Expand --include patterns against the repo tree (already deny-list aware
// because buildTree skips IGNORED_DIRS). Returns repo-relative file paths
// that match at least one pattern, sorted for stability.
async function expandInclude(
  repoRoot: string,
  patterns: string[],
): Promise<string[]> {
  if (patterns.length === 0) return [];
  const tree = await buildTree(repoRoot, repoRoot);
  const files = tree.filter((p) => !p.endsWith("/"));
  const matchers = patterns.map(compilePattern);
  return files.filter((p) => matchers.some((m) => m(p))).sort();
}

// Extract module specifiers from source via regex. Catches:
//   import x from "..."
//   import "..."
//   import("...")
//   require("...")
//   export ... from "..."
function extractImports(content: string): string[] {
  const specs = new Set<string>();
  const patterns: RegExp[] = [
    /(?:^|[^.\w])import\s+(?:[^"'\n;]+?\s+from\s+)?["']([^"']+)["']/gm,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
    /(?:^|[^.\w])require\s*\(\s*["']([^"']+)["']\s*\)/g,
    /(?:^|[^.\w])export\s+(?:\*|\{[^}]*\})\s+from\s+["']([^"']+)["']/gm,
  ];
  for (const rx of patterns) {
    for (const m of content.matchAll(rx)) {
      const spec = m[1];
      if (spec) specs.add(spec);
    }
  }
  return [...specs];
}

const RESOLVE_EXTS = [".ts", ".tsx", ".js", ".jsx"];

// Resolve a relative import specifier ("./foo", "../bar") against the
// importing file. Tries common extension and index-file conventions.
// Returns absolute path on first hit, else null.
async function resolveRelativeImport(
  importingFileAbs: string,
  spec: string,
): Promise<string | null> {
  const baseDir = dirname(importingFileAbs);
  const baseAbs = resolve(baseDir, spec);

  const candidates: string[] = [];
  // As-is
  candidates.push(baseAbs);
  // Append each extension
  for (const ext of RESOLVE_EXTS) candidates.push(baseAbs + ext);
  // TS NodeNext convention: ".js" specifier may resolve to ".ts"/".tsx"
  if (spec.endsWith(".js")) {
    const stripped = baseAbs.slice(0, -3);
    for (const ext of RESOLVE_EXTS) candidates.push(stripped + ext);
  }
  // index files inside a directory
  for (const ext of RESOLVE_EXTS) candidates.push(join(baseAbs, "index" + ext));

  for (const c of candidates) {
    try {
      const info = await stat(c);
      if (info.isFile()) return c;
    } catch { /* try next */ }
  }
  return null;
}

export async function readRepoFocused(
  repoRoot: string,
  files:    string[],
  options:  FocusedReadOptions = {},
): Promise<FocusedReadResult> {
  const maxFiles = Math.min(
    Math.max(1, options.maxFiles ?? FOCUSED_DEFAULT_MAX),
    FOCUSED_HARD_CAP,
  );
  const maxBytes = Math.min(
    Math.max(FOCUSED_MIN_MAX_BYTES, options.maxBytes ?? FOCUSED_DEFAULT_MAX_BYTES),
    FOCUSED_HARD_MAX_BYTES,
  );
  const followImports = (options.followImports ?? 0) as 0 | 1 | 2;
  const includePatterns = (options.include ?? []).filter((s) => s.length > 0);
  const excludePatterns = (options.exclude ?? []).filter((s) => s.length > 0);

  const rootAbs  = resolve(repoRoot);
  const rootReal = await realpath(rootAbs);

  const skipped: FocusedSkippedEntry[] = [];
  const skippedByKey = new Map<string, FocusedSkippedEntry>();
  const capsApplied: string[] = [];
  const recordSkipped = (path: string, reason: string): void => {
    const key = `${reason}\0${path}`;
    const existing = skippedByKey.get(key);
    if (existing) {
      existing.count = (existing.count ?? 1) + 1;
      return;
    }
    const entry = { path, reason };
    skippedByKey.set(key, entry);
    skipped.push(entry);
  };

  // Expand --include against the repo tree (deny-list aware via buildTree).
  const includeMatched = includePatterns.length > 0
    ? await expandInclude(rootAbs, includePatterns)
    : [];

  // Compose seeds: explicit input (already deduped, entry-first by parseArgs)
  // unioned with includeMatched, deduped while preserving order.
  const explicitSeeds: string[] = [];
  const seenSeed = new Set<string>();
  const enqueueRel = (rel: string): void => {
    const r = rel.trim();
    if (!r || seenSeed.has(r)) return;
    seenSeed.add(r);
    explicitSeeds.push(r);
  };
  for (const f of files) enqueueRel(f);
  for (const m of includeMatched) enqueueRel(m);

  // --exclude removes seeds and follow-imports candidates uniformly.
  const excludeMatchers = excludePatterns.map(compilePattern);
  const passesExclude = (rel: string): boolean =>
    !excludeMatchers.some((m) => m(rel));

  type AcceptedFile = {
    rel:   string;
    abs:   string;
    depth: 0 | 1 | 2;
    size:  number;
  };

  const accepted:    AcceptedFile[] = [];
  const visitedAbs:  Set<string>    = new Set();

  // Validate a candidate path. Records skipped reason on rejection, returns
  // an AcceptedFile on success. Does NOT push to `accepted` (caller does).
  const validate = async (
    rel:   string,
    depth: 0 | 1 | 2,
  ): Promise<AcceptedFile | null> => {
    const absCandidate = resolve(rootAbs, rel);

    // Path-safety / symlink-escape
    if (!(await isInsideRoot(absCandidate, rootReal))) {
      recordSkipped(rel, "outside-repo-or-symlink-escape");
      return null;
    }
    // Deny-list (parity with full readRepo)
    if (pathHitsIgnoredDir(rel) !== null) {
      recordSkipped(rel, "ignored-dir");
      return null;
    }
    // --exclude
    if (!passesExclude(rel)) {
      recordSkipped(rel, "excluded");
      return null;
    }
    // Stat
    let info;
    try {
      info = await stat(absCandidate);
    } catch {
      recordSkipped(rel, "not-found");
      return null;
    }
    if (!info.isFile()) {
      recordSkipped(rel, "not-a-file");
      return null;
    }
    // Per-file size ceiling
    if (info.size > maxBytes) {
      recordSkipped(rel, "over-max-bytes");
      return null;
    }
    // Extension allowlist (binary safety)
    const ext = extname(absCandidate).toLowerCase();
    if (!READABLE_EXTENSIONS.has(ext) && !absCandidate.endsWith(".example")) {
      recordSkipped(rel, "non-readable-extension");
      return null;
    }
    // Dedup by absolute path
    if (visitedAbs.has(absCandidate)) return null;
    visitedAbs.add(absCandidate);
    return { rel, abs: absCandidate, depth, size: info.size };
  };

  // Seeds first.
  for (const rel of explicitSeeds) {
    if (accepted.length >= maxFiles) {
      recordSkipped(rel, "cap-overflow");
      continue;
    }
    const a = await validate(rel, 0);
    if (a) accepted.push(a);
  }

  // BFS: read content, extract imports, enqueue resolvable relatives.
  const contents = new Map<string, string>(); // abs → content
  let head = 0;
  while (head < accepted.length) {
    const cur = accepted[head++]!;
    let content: string;
    try {
      content = await readFile(cur.abs, "utf-8");
    } catch {
      // Validated successfully but read failed: drop from accepted, mark skipped.
      const idx = accepted.findIndex((a) => a.abs === cur.abs);
      if (idx >= 0) accepted.splice(idx, 1);
      visitedAbs.delete(cur.abs);
      recordSkipped(cur.rel, "not-found");
      continue;
    }
    contents.set(cur.abs, content);

    // Stop expanding past followImports depth.
    if (cur.depth >= followImports) continue;
    if (accepted.length >= maxFiles) continue;

    const specs = extractImports(content);
    for (const spec of specs) {
      if (accepted.length >= maxFiles) break;

      // Bare module or alias → not followable.
      if (!spec.startsWith(".") && !spec.startsWith("/")) {
        if (/^[@~#]/.test(spec)) {
          recordSkipped(spec, "import-unresolved-alias");
        } else {
          recordSkipped(spec, "bare-module");
        }
        continue;
      }
      // "/" absolute specifier — not standard in TS source, treat as unresolved.
      if (spec.startsWith("/")) {
        recordSkipped(spec, "import-unresolved");
        continue;
      }

      const resolvedAbs = await resolveRelativeImport(cur.abs, spec);
      if (!resolvedAbs) {
        recordSkipped(spec, "import-unresolved");
        continue;
      }
      const rel = relative(rootAbs, resolvedAbs);
      const nextDepth = (cur.depth + 1) as 0 | 1 | 2;
      const a = await validate(rel, nextDepth);
      if (a) accepted.push(a);
    }
  }

  if (accepted.length >= maxFiles) {
    capsApplied.push(`max-files cap reached at ${maxFiles}`);
  }
  if (excludeMatchers.length > 0) {
    capsApplied.push(`exclude patterns active (${excludePatterns.length})`);
  }
  if (includeMatched.length > 0) {
    capsApplied.push(`include matched ${includeMatched.length} file(s)`);
  }

  // Build keyFiles in BFS order with content.
  const keyFiles: RepoFile[] = [];
  const dirSet = new Set<string>();
  for (const a of accepted) {
    const content = contents.get(a.abs);
    if (content === undefined) continue;
    keyFiles.push({ path: a.rel, content, sizeBytes: a.size });

    let dir = a.rel.replace(/\\/g, "/");
    while (true) {
      const idx = dir.lastIndexOf("/");
      if (idx < 0) break;
      dir = dir.slice(0, idx);
      dirSet.add(dir + "/");
    }
  }

  if (skipped.length > 0) {
    logger.debug(`audit-ux: focused-read skipped ${skipped.length} candidate(s)`);
  }

  // Build a focused tree: directories (alphabetical) followed by files.
  const dirs      = [...dirSet].sort();
  const fileLines = keyFiles.map((f) => f.path).sort();
  const tree      = [...dirs, ...fileLines];

  return {
    root:           rootAbs,
    tree,
    keyFiles,
    totalFiles:     keyFiles.length,
    skipped,
    reachableCount: accepted.length,
    capsApplied,
    followDepth:    followImports,
    caps:           { maxFiles, maxBytes },
    seeds: {
      entry:          files[0] ?? null,
      explicit:       files.slice(0),
      includeMatched,
    },
    patterns: {
      include: includePatterns,
      exclude: excludePatterns,
    },
  };
}
