import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname } from "path";

export async function readJsonStore<T>(
  path: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): Promise<T> {
  try {
    const raw = (await readFile(path, "utf-8")).replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw) as unknown;
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export async function writeJsonStore<T>(
  path: string,
  value: T,
): Promise<boolean> {
  try {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf-8");
    return true;
  } catch {
    return false;
  }
}
