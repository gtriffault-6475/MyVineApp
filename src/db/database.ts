import SQLite from 'react-native-sqlite-storage';
import { runMigrations } from './migrations';

SQLite.enablePromise(true);

let instance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!instance) {
    instance = await SQLite.openDatabase({ name: 'myvine.db', location: 'default' });
    await runMigrations(instance);
  }
  return instance;
}
