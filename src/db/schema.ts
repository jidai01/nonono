import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('nonono.db');
  await initDatabase(db);
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`PRAGMA journal_mode = WAL;`);
  await database.execAsync(`PRAGMA foreign_keys = OFF;`);

  // Settings
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      recovery_code_hash TEXT NOT NULL,
      biometric_enabled INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Addictions
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS addictions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '🎯',
      color TEXT DEFAULT '#3D8B8B',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Journal entries - recreate if missing addiction_id
  await ensureColumn(database, 'journal_entries', 'addiction_id', "TEXT DEFAULT 'default'");
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(date);`);
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_journal_addiction ON journal_entries(addiction_id);`);

  // Activities - recreate if missing addiction_id
  await ensureTableWithAddictionId(database, 'activities', `
    id TEXT PRIMARY KEY,
    addiction_id TEXT DEFAULT 'default',
    name TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  `);

  // Schedules - recreate if missing addiction_id
  await ensureTableWithAddictionId(database, 'schedules', `
    id TEXT PRIMARY KEY,
    addiction_id TEXT DEFAULT 'default',
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  `);
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);`);
}

async function ensureColumn(
  database: SQLite.SQLiteDatabase,
  table: string,
  column: string,
  definition: string
) {
  try {
    const cols = await database.getAllAsync<{ name: string }>(
      `PRAGMA table_info(${table})`
    );
    if (!cols.some(c => c.name === column)) {
      console.log(`[schema] Adding column ${column} to ${table}`);
      await database.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      await database.execAsync(`UPDATE ${table} SET ${column} = 'default' WHERE ${column} IS NULL`);
    }
  } catch (error) {
    console.log(`[schema] Recreating table ${table}`);
    await database.execAsync(`DROP TABLE IF EXISTS ${table}`);
    await database.execAsync(`CREATE TABLE ${table} (${definition.replace(/TEXT DEFAULT 'default'/, "TEXT DEFAULT 'default'")});`);
  }
}

async function ensureTableWithAddictionId(
  database: SQLite.SQLiteDatabase,
  table: string,
  columns: string
) {
  try {
    const tableInfo = await database.getFirstAsync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`
    );

    if (!tableInfo) {
      await database.execAsync(`CREATE TABLE ${table} (${columns});`);
      return;
    }

    const cols = await database.getAllAsync<{ name: string }>(
      `PRAGMA table_info(${table})`
    );

    if (!cols.some(c => c.name === 'addiction_id')) {
      console.log(`[schema] Adding addiction_id to ${table}`);
      await database.execAsync(`ALTER TABLE ${table} ADD COLUMN addiction_id TEXT DEFAULT 'default'`);
      await database.execAsync(`UPDATE ${table} SET addiction_id = 'default' WHERE addiction_id IS NULL`);
    }
  } catch (error) {
    console.error(`[schema] Error ensuring ${table}:`, error);
    await database.execAsync(`DROP TABLE IF EXISTS ${table}`);
    await database.execAsync(`CREATE TABLE ${table} (${columns});`);
  }
}
