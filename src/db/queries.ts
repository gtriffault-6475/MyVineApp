import type { SQLiteDatabase } from 'expo-sqlite';
import type { Wine, WineStats } from '../types/wine';

export async function getAllWines(db: SQLiteDatabase): Promise<Wine[]> {
  return db.getAllAsync<Wine>(`SELECT * FROM wines ORDER BY drunk_at DESC, created_at DESC`);
}

export async function getWineById(db: SQLiteDatabase, id: number): Promise<Wine | null> {
  return db.getFirstAsync<Wine>(`SELECT * FROM wines WHERE id = ?`, [id]);
}

export async function insertWine(
  db: SQLiteDatabase,
  wine: Omit<Wine, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO wines
      (name, producer, appellation, vintage, score, location_type, restaurant_name,
       drunk_at, food_pairing, photo_uri, comment, buy_again)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      wine.name,
      wine.producer,
      wine.appellation,
      wine.vintage,
      wine.score,
      wine.location_type,
      wine.restaurant_name,
      wine.drunk_at,
      wine.food_pairing,
      wine.photo_uri,
      wine.comment,
      wine.buy_again,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateWine(
  db: SQLiteDatabase,
  id: number,
  wine: Omit<Wine, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  await db.runAsync(
    `UPDATE wines SET
      name = ?, producer = ?, appellation = ?, vintage = ?, score = ?,
      location_type = ?, restaurant_name = ?, drunk_at = ?, food_pairing = ?,
      photo_uri = ?, comment = ?, buy_again = ?,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
     WHERE id = ?`,
    [
      wine.name,
      wine.producer,
      wine.appellation,
      wine.vintage,
      wine.score,
      wine.location_type,
      wine.restaurant_name,
      wine.drunk_at,
      wine.food_pairing,
      wine.photo_uri,
      wine.comment,
      wine.buy_again,
      id,
    ]
  );
}

export async function deleteWine(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(`DELETE FROM wines WHERE id = ?`, [id]);
}

export async function searchWines(
  db: SQLiteDatabase,
  term: string,
  buyAgainOnly: boolean
): Promise<Wine[]> {
  const like = `%${term}%`;
  const base = `SELECT * FROM wines WHERE
    (name LIKE ? OR producer LIKE ? OR appellation LIKE ? OR restaurant_name LIKE ?)
    ${buyAgainOnly ? 'AND buy_again = 1' : ''}
    ORDER BY drunk_at DESC, created_at DESC`;
  return db.getAllAsync<Wine>(base, [like, like, like, like]);
}

export async function getStats(db: SQLiteDatabase): Promise<WineStats> {
  const totals = await db.getFirstAsync<{
    total: number;
    avg_score: number | null;
    buy_again_count: number;
  }>(
    `SELECT COUNT(*) as total,
            AVG(score) as avg_score,
            SUM(buy_again) as buy_again_count
     FROM wines`
  );

  const top_appellations = await db.getAllAsync<{ appellation: string; count: number }>(
    `SELECT appellation, COUNT(*) as count FROM wines
     WHERE appellation IS NOT NULL AND appellation != ''
     GROUP BY appellation ORDER BY count DESC LIMIT 5`
  );

  const top_producers = await db.getAllAsync<{ producer: string; count: number }>(
    `SELECT producer, COUNT(*) as count FROM wines
     WHERE producer IS NOT NULL AND producer != ''
     GROUP BY producer ORDER BY count DESC LIMIT 5`
  );

  return {
    total: totals?.total ?? 0,
    avg_score: totals?.avg_score ?? null,
    buy_again_count: totals?.buy_again_count ?? 0,
    top_appellations,
    top_producers,
  };
}
