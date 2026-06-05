import { SQLiteDatabase } from 'react-native-sqlite-storage';
import type { CellarEntry } from '../types/cellar';

export async function getAllCellarEntries(db: SQLiteDatabase): Promise<CellarEntry[]> {
  const [results] = await db.executeSql(
    `SELECT * FROM cellar WHERE archived = 0 ORDER BY name ASC, vintage ASC`
  );
  const rows: CellarEntry[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    rows.push(results.rows.item(i) as CellarEntry);
  }
  return rows;
}

export async function getArchivedCellarEntries(db: SQLiteDatabase): Promise<CellarEntry[]> {
  const [results] = await db.executeSql(
    `SELECT * FROM cellar WHERE archived = 1 ORDER BY updated_at DESC`
  );
  const rows: CellarEntry[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    rows.push(results.rows.item(i) as CellarEntry);
  }
  return rows;
}

export async function getCellarEntryById(db: SQLiteDatabase, id: number): Promise<CellarEntry | null> {
  const [results] = await db.executeSql(`SELECT * FROM cellar WHERE id = ?`, [id]);
  return results.rows.length > 0 ? (results.rows.item(0) as CellarEntry) : null;
}

export async function insertCellarEntry(
  db: SQLiteDatabase,
  entry: Omit<CellarEntry, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const [results] = await db.executeSql(
    `INSERT INTO cellar
      (name, producer, appellation, vintage, quantity, quantity_initial,
       purchase_date, purchase_price, optimal_from, optimal_to,
       storage_location, notes, photo_uri, archived)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.name, entry.producer, entry.appellation, entry.vintage,
      entry.quantity, entry.quantity_initial, entry.purchase_date,
      entry.purchase_price, entry.optimal_from, entry.optimal_to,
      entry.storage_location, entry.notes, entry.photo_uri, entry.archived,
    ]
  );
  return results.insertId;
}

export async function updateCellarEntry(
  db: SQLiteDatabase,
  id: number,
  entry: Omit<CellarEntry, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  await db.executeSql(
    `UPDATE cellar SET
      name = ?, producer = ?, appellation = ?, vintage = ?,
      quantity = ?, quantity_initial = ?, purchase_date = ?,
      purchase_price = ?, optimal_from = ?, optimal_to = ?,
      storage_location = ?, notes = ?, photo_uri = ?, archived = ?,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
     WHERE id = ?`,
    [
      entry.name, entry.producer, entry.appellation, entry.vintage,
      entry.quantity, entry.quantity_initial, entry.purchase_date,
      entry.purchase_price, entry.optimal_from, entry.optimal_to,
      entry.storage_location, entry.notes, entry.photo_uri, entry.archived,
      id,
    ]
  );
}

export async function decrementCellarQuantity(db: SQLiteDatabase, id: number): Promise<void> {
  await db.executeSql(
    `UPDATE cellar SET
      quantity = MAX(0, quantity - 1),
      archived = CASE WHEN quantity <= 1 THEN 1 ELSE 0 END,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
     WHERE id = ?`,
    [id]
  );
}

export async function deleteCellarEntry(db: SQLiteDatabase, id: number): Promise<void> {
  await db.executeSql(`DELETE FROM cellar WHERE id = ?`, [id]);
}

export async function searchCellarEntries(
  db: SQLiteDatabase,
  term: string,
  includeArchived = false,
): Promise<CellarEntry[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (!includeArchived) {
    conditions.push('archived = 0');
  }

  if (term.trim()) {
    const like = `%${term.trim()}%`;
    conditions.push('(name LIKE ? OR producer LIKE ? OR appellation LIKE ? OR storage_location LIKE ?)');
    params.push(like, like, like, like);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [results] = await db.executeSql(
    `SELECT * FROM cellar ${where} ORDER BY name ASC, vintage ASC`,
    params
  );
  const rows: CellarEntry[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    rows.push(results.rows.item(i) as CellarEntry);
  }
  return rows;
}
