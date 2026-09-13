import * as SQLite from 'expo-sqlite';
import { seedTestData } from './seeder';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('nonono.db');
  await initDatabase(db);
  await migrateAddictionId(db);
  await seedTestData(db);
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = OFF;

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      recovery_code_hash TEXT NOT NULL,
      biometric_enabled INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS addictions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '🎯',
      color TEXT DEFAULT '#3D8B8B',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      addiction_id TEXT DEFAULT 'default',
      date TEXT NOT NULL,
      mood INTEGER NOT NULL DEFAULT 3,
      feelings TEXT DEFAULT '',
      is_relapse INTEGER DEFAULT 0,
      relapse_notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(date);
    CREATE INDEX IF NOT EXISTS idx_journal_addiction ON journal_entries(addiction_id);
  `);

  await migrateActivities(database);
  await migrateSchedules(database);
}

async function migrateAddictionId(database: SQLite.SQLiteDatabase) {
  try {
    const journalCols = await database.getAllAsync<{ name: string }>(
      "PRAGMA table_info(journal_entries)"
    );
    if (!journalCols.some(c => c.name === 'addiction_id')) {
      await database.execAsync(`ALTER TABLE journal_entries ADD COLUMN addiction_id TEXT DEFAULT 'default'`);
      await database.execAsync(`UPDATE journal_entries SET addiction_id = 'default' WHERE addiction_id IS NULL`);
      await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_journal_addiction ON journal_entries(addiction_id)`);
    }

    const actCols = await database.getAllAsync<{ name: string }>(
      "PRAGMA table_info(activities)"
    );
    if (!actCols.some(c => c.name === 'addiction_id')) {
      await database.execAsync(`ALTER TABLE activities ADD COLUMN addiction_id TEXT DEFAULT 'default'`);
      await database.execAsync(`UPDATE activities SET addiction_id = 'default' WHERE addiction_id IS NULL`);
    }

    const schedCols = await database.getAllAsync<{ name: string }>(
      "PRAGMA table_info(schedules)"
    );
    if (!schedCols.some(c => c.name === 'addiction_id')) {
      await database.execAsync(`ALTER TABLE schedules ADD COLUMN addiction_id TEXT DEFAULT 'default'`);
      await database.execAsync(`UPDATE schedules SET addiction_id = 'default' WHERE addiction_id IS NULL`);
    }
  } catch (error) {
    console.error('[schema] Migration error:', error);
  }
}

async function migrateActivities(database: SQLite.SQLiteDatabase) {
  const tableInfo = await database.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='activities'"
  );

  if (!tableInfo) {
    await database.execAsync(`
      CREATE TABLE activities (
        id TEXT PRIMARY KEY,
        addiction_id TEXT DEFAULT 'default',
        name TEXT NOT NULL,
        duration_minutes INTEGER DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    return;
  }

  const columns = await database.getAllAsync<{ name: string }>(
    "PRAGMA table_info(activities)"
  );
  const hasEntryId = columns.some(c => c.name === 'entry_id');

  if (hasEntryId) {
    await database.execAsync(`DROP TABLE IF EXISTS activities`);
    await database.execAsync(`
      CREATE TABLE activities (
        id TEXT PRIMARY KEY,
        addiction_id TEXT DEFAULT 'default',
        name TEXT NOT NULL,
        duration_minutes INTEGER DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
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
          addiction_id TEXT DEFAULT 'default',
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
          addiction_id TEXT DEFAULT 'default',
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
        addiction_id TEXT DEFAULT 'default',
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
