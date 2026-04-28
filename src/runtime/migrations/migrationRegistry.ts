import type { MigrationDefinition } from "./types.js";

const MIGRATION_REGISTRY: MigrationDefinition[] = [];

export function getMigrationDefinitions(): MigrationDefinition[] {
  return MIGRATION_REGISTRY.map((definition) => ({
    ...definition,
    validationNotes: definition.validationNotes.slice(),
  }));
}

export function findMigrationDefinitions(input: {
  storeId: string;
  fromVersion: string;
  toVersion?: string;
}): MigrationDefinition[] {
  return getMigrationDefinitions().filter((definition) => {
    if (definition.storeId !== input.storeId) return false;
    if (definition.fromVersion !== input.fromVersion) return false;
    if (input.toVersion && definition.toVersion !== input.toVersion) {
      return false;
    }
    return true;
  });
}
