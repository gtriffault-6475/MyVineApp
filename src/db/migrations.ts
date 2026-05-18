import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import {
  CREATE_WINES_TABLE,
  CREATE_INDEXES,
  CREATE_META_TABLE,
  DB_VERSION,
} from './schema';

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.executeSql(CREATE_META_TABLE);

  const [metaResults] = await db.executeSql(
    `SELECT value FROM meta WHERE key = 'db_version'`
  );
  const row = metaResults.rows.length > 0 ? metaResults.rows.item(0) as { value: string } : null;
  const currentVersion = row ? parseInt(row.value, 10) : 0;

  if (currentVersion >= DB_VERSION) return;

  if (currentVersion < 1) {
    await db.executeSql(CREATE_WINES_TABLE);
    // executeSql handles one statement at a time; split the index statements
    const indexStatements = CREATE_INDEXES
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of indexStatements) {
      await db.executeSql(stmt);
    }
  }

  await db.executeSql(
    `INSERT OR REPLACE INTO meta(key, value) VALUES ('db_version', ?)`,
    [DB_VERSION.toString()]
  );
}
