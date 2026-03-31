// src/scaffold/scaffoldWriter.ts
// Escribe la estructura de archivos generada en disco.
// Crea directorios recursivamente y nunca sobreescribe sin confirmación.
// V2 extension: agregar modo --dry-run para preview sin escribir.

import { mkdir, writeFile, access } from "fs/promises";
import { dirname, join }            from "path";
import { logger }                   from "../observability/logger.js";

export interface ScaffoldFile {
  path:    string;   // relativo al output dir
  content: string;
}

export interface ScaffoldResult {
  outputDir:     string;
  filesWritten:  string[];
  filesSkipped:  string[];
  totalFiles:    number;
}

// Verifica si un archivo ya existe
async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// Escribe un archivo creando su directorio si no existe
async function writeScaffoldFile(
  fullPath: string,
  content:  string,
  overwrite: boolean
): Promise<"written" | "skipped"> {
  if (!overwrite && await fileExists(fullPath)) {
    return "skipped";
  }

  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, "utf-8");
  return "written";
}

// Función principal — escribe todos los archivos del scaffold
export async function writeScaffold(
  files:     ScaffoldFile[],
  outputDir: string,
  overwrite  = false
): Promise<ScaffoldResult> {
  const filesWritten:  string[] = [];
  const filesSkipped:  string[] = [];

  logger.info(`Writing scaffold to: ${outputDir}`);

  // Crear directorio raíz
  await mkdir(outputDir, { recursive: true });

  for (const file of files) {
    const fullPath = join(outputDir, file.path);
    const result   = await writeScaffoldFile(fullPath, file.content, overwrite);

    if (result === "written") {
      filesWritten.push(file.path);
      logger.debug(`  ✓ ${file.path}`);
    } else {
      filesSkipped.push(file.path);
      logger.debug(`  ⟳ ${file.path} (skipped — already exists)`);
    }
  }

  return {
    outputDir,
    filesWritten,
    filesSkipped,
    totalFiles: files.length,
  };
}