import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { runMigrations } from './migrations';

SQLite.enablePromise(true);

let instance: SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLiteDatabase> {
  if (!instance) {
    instance = await SQLite.openDatabase({ name: 'myvine.db', location: 'default' });
    await runMigrations(instance);
  }
  return instance;
}
