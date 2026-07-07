import { SQLiteDatabase } from 'react-native-sqlite-storage';
import type { Cave } from '../types/cave';

export async function getAllCaves(db: SQLiteDatabase): Promise<Cave[]> {
  const [results] = await db.executeSql(`SELECT * FROM caves ORDER BY id ASC`);
  const rows: Cave[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    rows.push(results.rows.item(i) as Cave);
  }
  return rows;
}

export async function getCaveById(db: SQLiteDatabase, id: number): Promise<Cave | null> {
  const [results] = await db.executeSql(`SELECT * FROM caves WHERE id = ?`, [id]);
  return results.rows.length > 0 ? (results.rows.item(0) as Cave) : null;
}

export async function insertCave(db: SQLiteDatabase, name: string): Promise<number> {
  const [results] = await db.executeSql(`INSERT INTO caves (name) VALUES (?)`, [name]);
  return results.insertId;
}

export async function updateCave(db: SQLiteDatabase, id: number, name: string): Promise<void> {
  await db.executeSql(
    `UPDATE caves SET name = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`,
    [name, id]
  );
}

export async function deleteCave(db: SQLiteDatabase, id: number): Promise<void> {
  await db.executeSql(`DELETE FROM caves WHERE id = ?`, [id]);
}
