import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const database = await SQLite.openDatabaseAsync('physiosan.db');
    await initializeDatabase(database);
    db = database;
    return database;
  })();

  return dbPromise;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Physio profile: id, name, surgery_date, fracture_type
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL DEFAULT 'Patient',
      surgery_date TEXT,
      fracture_type TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Exercise completion logs (local cache, Supabase is source of truth when configured)
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      reps_completed INTEGER NOT NULL DEFAULT 0,
      pain_level INTEGER NOT NULL DEFAULT 0 CHECK (pain_level >= 0 AND pain_level <= 10),
      timestamp TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Assessments: QuickDASH, PRWE, ROM
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      dash_score REAL,
      prwe_score REAL,
      rom_degrees REAL,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Therapist-prescribed exercise parameters (sets, reps, hold seconds)
    CREATE TABLE IF NOT EXISTS exercise_prescriptions (
      user_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      sets INTEGER NOT NULL DEFAULT 3,
      reps INTEGER NOT NULL DEFAULT 10,
      hold_seconds INTEGER NOT NULL DEFAULT 5,
      PRIMARY KEY (user_id, exercise_id)
    );

    CREATE INDEX IF NOT EXISTS idx_logs_user ON logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_assessments_user_date ON assessments(user_id, date);
  `);
}
