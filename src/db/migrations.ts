import type { SQLiteDatabase } from 'expo-sqlite';
import {
  CREATE_WINES_TABLE,
  CREATE_INDEXES,
  CREATE_META_TABLE,
  DB_VERSION,
} from './schema';

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_META_TABLE);

  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM meta WHERE key = 'db_version'`
  );
  const currentVersion = row ? parseInt(row.value, 10) : 0;

  if (currentVersion >= DB_VERSION) return;

  if (currentVersion < 1) {
    await db.execAsync(CREATE_WINES_TABLE);
    await db.execAsync(CREATE_INDEXES);
  }

  await db.runAsync(
    `INSERT OR REPLACE INTO meta(key, value) VALUES ('db_version', ?)`,
    [DB_VERSION.toString()]
  );
}
