import { migrations } from './migrations';
import { parseDraftEntries, parsePlaygroundEntries, parseProgressEntries } from './entries';
import { BACKUP_APP, BACKUP_FORMAT, CURRENT_SCHEMA_VERSION, type BackupFile } from './types';

export type BackupErrorReason = 'invalid-file' | 'newer-version';

export class BackupError extends Error {
  constructor(
    readonly reason: BackupErrorReason,
    message: string,
  ) {
    super(message);
    this.name = 'BackupError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Validates a raw backup payload, runs schema migrations and returns a typed
 * file. Throws BackupError for structurally invalid or too-new files.
 */
export function parseBackupFile(raw: unknown): BackupFile {
  if (!isRecord(raw)) {
    throw new BackupError('invalid-file', 'Backup payload is not an object');
  }
  if (raw['format'] !== BACKUP_FORMAT || raw['app'] !== BACKUP_APP) {
    throw new BackupError('invalid-file', 'Not a WebCraft backup file');
  }
  const schemaVersion = raw['schemaVersion'];
  if (typeof schemaVersion !== 'number' || !Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new BackupError('invalid-file', 'Invalid schema version');
  }
  if (schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new BackupError(
      'newer-version',
      `Backup schema v${schemaVersion} is newer than supported v${CURRENT_SCHEMA_VERSION}`,
    );
  }

  let working: Record<string, unknown> = raw;
  for (let version = schemaVersion; version < CURRENT_SCHEMA_VERSION; version += 1) {
    const migrate = migrations[version];
    if (!migrate) {
      throw new BackupError('invalid-file', `Missing migration for schema v${version}`);
    }
    working = migrate(working);
  }

  const data = working['data'];
  if (!isRecord(data)) {
    throw new BackupError('invalid-file', 'Backup data section is missing');
  }
  const settings = isRecord(data['settings']) ? data['settings'] : {};

  return {
    format: BACKUP_FORMAT,
    app: BACKUP_APP,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: typeof working['exportedAt'] === 'string' ? working['exportedAt'] : '',
    includesSensitive: working['includesSensitive'] === true,
    data: {
      progress: parseProgressEntries(data['progress']),
      drafts: parseDraftEntries(data['drafts']),
      playground: parsePlaygroundEntries(data['playground']),
      settings,
    },
  };
}

/** Parses a JSON string (e.g. from a File input) into a backup file. */
export function parseBackupJson(text: string): BackupFile {
  let raw: unknown;
  try {
    raw = JSON.parse(text) as unknown;
  } catch {
    throw new BackupError('invalid-file', 'File is not valid JSON');
  }
  return parseBackupFile(raw);
}
