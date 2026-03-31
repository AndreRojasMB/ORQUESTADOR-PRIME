// src/audit/repoReader.ts
// Lee la estructura de un repositorio local y extrae archivos clave.
// Nunca lee archivos binarios ni node_modules.
// V2 extension: agregar soporte para .gitignore parsing aquí.

import { readdir, readFile, stat } from "fs/promises";
import { join, extname, relative } from "path";

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