import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import type { Wine, WineStats, WineSearchFilters } from '../types/wine';

export async function getAllWines(db: SQLiteDatabase): Promise<Wine[]> {
  const [results] = await db.executeSql(
    `SELECT * FROM wines ORDER BY drunk_at DESC, created_at DESC`
  );
  const rows: Wine[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    rows.push(results.rows.item(i) as Wine);
  }
  return rows;
}

export async function getWineById(
  db: SQLiteDatabase,
  id: number
): Promise<Wine | null> {
  const [results] = await db.executeSql(`SELECT * FROM wines WHERE id = ?`, [id]);
  return results.rows.length > 0 ? (results.rows.item(0) as Wine) : null;
}

export async function insertWine(
  db: SQLiteDatabase,
  wine: Omit<Wine, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const [results] = await db.executeSql(
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
  return results.insertId;
}

export async function updateWine(
  db: SQLiteDatabase,
  id: number,
  wine: Omit<Wine, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  await db.executeSql(
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
  await db.executeSql(`DELETE FROM wines WHERE id = ?`, [id]);
}

const SORT_CLAUSES: Record<WineSearchFilters['sortBy'], string> = {
  date_desc: 'drunk_at DESC, created_at DESC',
  date_asc: 'drunk_at ASC, created_at ASC',
  score_desc: 'score DESC, drunk_at DESC',
  score_asc: 'score ASC, drunk_at DESC',
  name_asc: 'name ASC',
  vintage_desc: 'vintage DESC, drunk_at DESC',
};

export async function searchWines(
  db: SQLiteDatabase,
  filters: WineSearchFilters
): Promise<Wine[]> {
  const conditions: string[] = [];
  const params: (string | number | null)[] = [];

  if (filters.term.trim()) {
    const like = `%${filters.term.trim()}%`;
    conditions.push(
      '(name LIKE ? OR producer LIKE ? OR appellation LIKE ? OR restaurant_name LIKE ? OR food_pairing LIKE ?)'
    );
    params.push(like, like, like, like, like);
  }

  if (filters.buyAgainOnly) {
    conditions.push('buy_again = 1');
  }

  if (filters.locationType) {
    conditions.push('location_type = ?');
    params.push(filters.locationType);
  }

  if (filters.scoreMin !== null) {
    conditions.push('score >= ?');
    params.push(filters.scoreMin);
  }

  if (filters.scoreMax !== null) {
    conditions.push('score <= ?');
    params.push(filters.scoreMax);
  }

  if (filters.dateFrom) {
    conditions.push('drunk_at >= ?');
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    conditions.push('drunk_at <= ?');
    params.push(filters.dateTo);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const order = SORT_CLAUSES[filters.sortBy];

  const [results] = await db.executeSql(
    `SELECT * FROM wines ${where} ORDER BY ${order}`,
    params
  );
  const rows: Wine[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    rows.push(results.rows.item(i) as Wine);
  }
  return rows;
}

export async function getStats(db: SQLiteDatabase): Promise<WineStats> {
  const [totalsResult] = await db.executeSql(
    `SELECT COUNT(*) as total,
            AVG(score) as avg_score,
            SUM(buy_again) as buy_again_count
     FROM wines`
  );
  const totals =
    totalsResult.rows.length > 0
      ? (totalsResult.rows.item(0) as {
          total: number;
          avg_score: number | null;
          buy_again_count: number;
        })
      : null;

  const [appellationsResult] = await db.executeSql(
    `SELECT appellation, COUNT(*) as count FROM wines
     WHERE appellation IS NOT NULL AND appellation != ''
     GROUP BY appellation ORDER BY count DESC LIMIT 5`
  );
  const top_appellations: { appellation: string; count: number }[] = [];
  for (let i = 0; i < appellationsResult.rows.length; i++) {
    top_appellations.push(
      appellationsResult.rows.item(i) as { appellation: string; count: number }
    );
  }

  const [producersResult] = await db.executeSql(
    `SELECT producer, COUNT(*) as count FROM wines
     WHERE producer IS NOT NULL AND producer != ''
     GROUP BY producer ORDER BY count DESC LIMIT 5`
  );
  const top_producers: { producer: string; count: number }[] = [];
  for (let i = 0; i < producersResult.rows.length; i++) {
    top_producers.push(
      producersResult.rows.item(i) as { producer: string; count: number }
    );
  }

  return {
    total: totals?.total ?? 0,
    avg_score: totals?.avg_score ?? null,
    buy_again_count: totals?.buy_again_count ?? 0,
    top_appellations,
    top_producers,
  };
}
