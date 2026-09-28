import type { Migration } from './entries';
import { CURRENT_SCHEMA_VERSION } from './types';

/**
 * Migration registry: `migrations[v]` upgrades a raw backup from schema
 * version `v` to `v + 1`. Version 1 is the initial format, so the registry
 * starts empty; every future format change adds exactly one entry here.
 */
export const migrations: Record<number, Migration> = {};

export function latestSchemaVersion(): number {
  return CURRENT_SCHEMA_VERSION;
}
