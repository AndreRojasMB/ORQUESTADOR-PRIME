// src/skills/skillStore.ts
// Reads skill markdown files from ~/.orquestador-prime/skills/.
// Copies default skills from the repo if user copies don't exist.
// All operations are non-fatal — skill issues never crash the system.

import { readFile, writeFile, mkdir, access } from "fs/promises";
import { join, dirname } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";
import { logger } from "../observability/logger.js";

const SKILLS_DIR = join(homedir(), ".orquestador-prime", "skills");
const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULTS_DIR = join(__dirname, "defaults");

const KNOWN_DEFAULTS = ["ui-ux-pro-max", "jarvis-mode"];

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies default skill files to the user skills directory if they don't exist.
 * Non-fatal — logs warnings on failure.
 */
export async function ensureDefaults(): Promise<void> {
  try {
    await mkdir(SKILLS_DIR, { recursive: true });

    for (const name of KNOWN_DEFAULTS) {
      const userPath = join(SKILLS_DIR, `${name}.md`);
      if (await fileExists(userPath)) continue;

      const defaultPath = join(DEFAULTS_DIR, `${name}.md`);
      if (!(await fileExists(defaultPath))) {
        logger.debug(`Skill default not found: ${defaultPath}`);
        continue;
      }

      try {
        const content = await readFile(defaultPath, "utf-8");
        await writeFile(userPath, content, "utf-8");
        logger.debug(`Skill default copied: ${name}`);
      } catch (err) {
        logger.warn(`Failed to copy skill default: ${name}`, {
          error: String(err),
        });
      }
    }
  } catch (err) {
    logger.warn("Failed to ensure skill defaults", {
      error: String(err),
    });
  }
}

/**
 * Loads a skill by name from the user skills directory.
 * Returns the markdown content, or null if not found/unreadable.
 */
export async function loadSkill(name: string): Promise<string | null> {
  try {
    const skillPath = join(SKILLS_DIR, `${name}.md`);
    return await readFile(skillPath, "utf-8");
  } catch {
    logger.debug(`Skill not found or unreadable: ${name}`);
    return null;
  }
}
