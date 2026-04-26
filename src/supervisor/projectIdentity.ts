import { createHash } from "crypto";
import { basename, resolve } from "path";
import type { ProjectIdentity } from "./types.js";

function stableHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function slugProjectName(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "project";
}

export function deriveProjectIdentity(projectRoot = process.cwd()): ProjectIdentity {
  const resolvedRoot = resolve(projectRoot);
  const projectName = basename(resolvedRoot) || "project";
  const projectRootHash = stableHash(resolvedRoot);
  const projectId = `${slugProjectName(projectName)}-${projectRootHash.slice(0, 12)}`;

  return {
    projectId,
    projectName,
    projectRoot: resolvedRoot,
    projectRootHash,
  };
}
