import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('nonono.db');
  await initDatabase(db);
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      recovery_code_hash TEXT NOT NULL,
      biometric_enabled INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      mood INTEGER NOT NULL DEFAULT 3,
      feelings TEXT DEFAULT '',
      is_relapse INTEGER DEFAULT 0,
      relapse_notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      entry_id TEXT NOT NULL,
      name TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(date);
    CREATE INDEX IF NOT EXISTS idx_activities_entry ON activities(entry_id);
  `);

  await migrateSchedules(database);
}

async function migrateSchedules(database: SQLite.SQLiteDatabase) {
  try {
    const tableInfo = await database.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schedules'"
    );

    if (!tableInfo) {
      await database.execAsync(`
        CREATE TABLE schedules (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT DEFAULT '',
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
      `);
      return;
    }

    const columns = await database.getAllAsync<{ name: string }>(
      "PRAGMA table_info(schedules)"
    );
    const hasDateCol = columns.some(c => c.name === 'date');

    if (!hasDateCol) {
      await database.execAsync(`DROP TABLE IF EXISTS schedules`);
      await database.execAsync(`
        CREATE TABLE schedules (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT DEFAULT '',
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
      `);
    }
  } catch (error) {
    console.error('Migration error:', error);
    await database.execAsync(`DROP TABLE IF EXISTS schedules`);
    await database.execAsync(`
      CREATE TABLE schedules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
    `);
  }
}
