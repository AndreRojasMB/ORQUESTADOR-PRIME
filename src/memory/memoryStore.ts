// src/memory/memoryStore.ts
// Persiste y recupera entradas de memoria en un archivo JSON local.
// Ubicación: ~/.orquestador-prime/memory.json
// V2 extension: migrar a SQLite aquí cuando el volumen crezca.

import { readFile, writeFile, mkdir } from "fs/promises";
import { join }                       from "path";
import { homedir }                    from "os";
import type { MemoryStore, MemoryEntry } from "../types.js";
import { logger }                     from "../observability/logger.js";

const MEMORY_DIR  = join(homedir(), ".orquestador-prime");
const MEMORY_FILE = join(MEMORY_DIR, "memory.json");
const MAX_ENTRIES = 100;   // rotar entradas antiguas automáticamente

const EMPTY_STORE: MemoryStore = {
  version: "1.0",
  entries: [],
};

// Lee el store desde disco — retorna store vacío si no existe
export async function readMemoryStore(): Promise<MemoryStore> {
  try {
    const raw = await readFile(MEMORY_FILE, "utf-8");
    return JSON.parse(raw) as MemoryStore;
  } catch {
    return { ...EMPTY_STORE, entries: [] };
  }
}

// Escribe el store a disco — crea el directorio si no existe
export async function writeMemoryStore(store: MemoryStore): Promise<void> {
  try {
    await mkdir(MEMORY_DIR, { recursive: true });
    await writeFile(MEMORY_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    // La memoria nunca debe crashear el sistema principal
    logger.warn("Memory write failed — continuing without persistence", {
      error: String(err),
    });
  }
}

// Agrega una entrada y rota si supera MAX_ENTRIES
export async function appendMemoryEntry(entry: MemoryEntry): Promise<void> {
  const store = await readMemoryStore();

  store.entries.push(entry);
  store.lastRun = entry.timestamp;

  // Rotar — mantener solo las últimas MAX_ENTRIES
  if (store.entries.length > MAX_ENTRIES) {
    store.entries = store.entries.slice(-MAX_ENTRIES);
  }

  await writeMemoryStore(store);
}

// Retorna las últimas N entradas
export async function getRecentEntries(n = 5): Promise<MemoryEntry[]> {
  const store = await readMemoryStore();
  return store.entries.slice(-n);
}

// Retorna entradas que coincidan por tipo o keywords
export async function findRelatedEntries(
  keywords: string[],
  type?: string,
  limit = 3
): Promise<MemoryEntry[]> {
  const store = await readMemoryStore();

  return store.entries
    .filter((e) => {
      const matchesType    = !type || e.type === type;
      const matchesKeyword = keywords.some(
        (kw) =>
          e.keywords.includes(kw) ||
          e.task.toLowerCase().includes(kw.toLowerCase())
      );
      return matchesType && matchesKeyword;
    })
    .slice(-limit);
}

// Limpia todas las entradas — útil para testing
export async function clearMemory(): Promise<void> {
  await writeMemoryStore({ ...EMPTY_STORE, entries: [] });
  logger.info("Memory cleared");
}

// Retorna la ruta del archivo de memoria
export function getMemoryPath(): string {
  return MEMORY_FILE;
}