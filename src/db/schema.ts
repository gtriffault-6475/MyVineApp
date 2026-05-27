export const DB_NAME = 'myvine.db';
export const DB_VERSION = 2;

export const CREATE_WINES_TABLE = `
  CREATE TABLE IF NOT EXISTS wines (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    producer        TEXT,
    appellation     TEXT,
    vintage         INTEGER,
    score           REAL,
    location_type   TEXT    NOT NULL DEFAULT 'home'
                    CHECK(location_type IN ('home','friend','restaurant')),
    restaurant_name TEXT,
    drunk_at        TEXT    NOT NULL,
    food_pairing    TEXT,
    photo_uri       TEXT,
    comment         TEXT,
    companion       TEXT,
    buy_again       INTEGER NOT NULL DEFAULT 0
                    CHECK(buy_again IN (0,1)),
    created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
`;

export const CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_wines_drunk_at    ON wines(drunk_at DESC);
  CREATE INDEX IF NOT EXISTS idx_wines_score       ON wines(score DESC);
  CREATE INDEX IF NOT EXISTS idx_wines_producer    ON wines(producer);
  CREATE INDEX IF NOT EXISTS idx_wines_appellation ON wines(appellation);
`;

export const CREATE_META_TABLE = `
  CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;
