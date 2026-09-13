import { Platform } from 'react-native';
import { getDatabase } from './schema';
import { Settings, JournalEntry, Activity, Schedule, Addiction } from '../types';

const SETTINGS_KEY = 'nonono_settings';

function getWebStorage() {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key),
    };
  }
  return null;
}

// Settings
export async function getSettings(): Promise<Settings | null> {
  try {
    const webStorage = getWebStorage();
    if (webStorage) {
      const data = webStorage.getItem(SETTINGS_KEY);
      if (data) return JSON.parse(data);
    } else {
      const SecureStore = require('expo-secure-store');
      const data = await SecureStore.getItemAsync(SETTINGS_KEY);
      if (data) return JSON.parse(data);
    }
  } catch {}
  return null;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } else {
    const SecureStore = require('expo-secure-store');
    await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
  }
}

export async function deleteSettings(): Promise<void> {
  const webStorage = getWebStorage();
  if (webStorage) {
    webStorage.removeItem(SETTINGS_KEY);
  } else {
    const SecureStore = require('expo-secure-store');
    await SecureStore.deleteItemAsync(SETTINGS_KEY);
  }
}

export async function hasSettings(): Promise<boolean> {
  const settings = await getSettings();
  return settings !== null;
}

// Addictions
export async function getAllAddictions(): Promise<Addiction[]> {
  const db = await getDatabase();
  return db.getAllAsync<Addiction>(
    'SELECT * FROM addictions ORDER BY created_at'
  );
}

export async function addAddiction(addiction: Omit<Addiction, 'created_at'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR IGNORE INTO addictions (id, name, icon, color) VALUES (?, ?, ?, ?)',
    [addiction.id, addiction.name, addiction.icon, addiction.color]
  );
}

// Journal Entries
export async function getAllEntries(addictionId?: string): Promise<JournalEntry[]> {
  const db = await getDatabase();
  if (addictionId) {
    return db.getAllAsync<JournalEntry>(
      'SELECT * FROM journal_entries WHERE addiction_id = ? ORDER BY date DESC',
      [addictionId]
    );
  }
  return db.getAllAsync<JournalEntry>(
    'SELECT * FROM journal_entries ORDER BY date DESC'
  );
}

export async function getEntryByDate(date: string, addictionId?: string): Promise<JournalEntry | null> {
  const db = await getDatabase();
  if (addictionId) {
    return db.getFirstAsync<JournalEntry>(
      'SELECT * FROM journal_entries WHERE date = ? AND addiction_id = ?',
      [date, addictionId]
    );
  }
  return db.getFirstAsync<JournalEntry>(
    'SELECT * FROM journal_entries WHERE date = ?',
    [date]
  );
}

export async function getEntriesByMonth(year: number, month: number, addictionId?: string): Promise<JournalEntry[]> {
  const db = await getDatabase();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  if (addictionId) {
    return db.getAllAsync<JournalEntry>(
      'SELECT * FROM journal_entries WHERE date BETWEEN ? AND ? AND addiction_id = ? ORDER BY date',
      [startDate, endDate, addictionId]
    );
  }
  return db.getAllAsync<JournalEntry>(
    'SELECT * FROM journal_entries WHERE date BETWEEN ? AND ? ORDER BY date',
    [startDate, endDate]
  );
}

export async function getEntryById(id: string): Promise<JournalEntry | null> {
  const db = await getDatabase();
  return db.getFirstAsync<JournalEntry>(
    'SELECT * FROM journal_entries WHERE id = ?',
    [id]
  );
}

export async function upsertEntry(entry: Omit<JournalEntry, 'created_at' | 'updated_at'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO journal_entries (id, addiction_id, date, mood, feelings, is_relapse, relapse_notes, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET
       addiction_id = excluded.addiction_id,
       mood = excluded.mood,
       feelings = excluded.feelings,
       is_relapse = excluded.is_relapse,
       relapse_notes = excluded.relapse_notes,
       updated_at = CURRENT_TIMESTAMP`,
    [entry.id, entry.addiction_id, entry.date, entry.mood, entry.feelings, entry.is_relapse ? 1 : 0, entry.relapse_notes]
  );
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM journal_entries WHERE id = ?', [id]);
}

export async function getSoberDays(addictionId?: string): Promise<number> {
  const db = await getDatabase();
  if (addictionId) {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM journal_entries WHERE is_relapse = 0 AND addiction_id = ?',
      [addictionId]
    );
    return result?.count || 0;
  }
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM journal_entries WHERE is_relapse = 0'
  );
  return result?.count || 0;
}

export async function getRelapseDays(addictionId?: string): Promise<number> {
  const db = await getDatabase();
  if (addictionId) {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM journal_entries WHERE is_relapse = 1 AND addiction_id = ?',
      [addictionId]
    );
    return result?.count || 0;
  }
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM journal_entries WHERE is_relapse = 1'
  );
  return result?.count || 0;
}

export async function getTotalEntries(addictionId?: string): Promise<number> {
  const db = await getDatabase();
  if (addictionId) {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM journal_entries WHERE addiction_id = ?',
      [addictionId]
    );
    return result?.count || 0;
  }
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM journal_entries'
  );
  return result?.count || 0;
}

// Activities
export async function getAllActivities(addictionId?: string): Promise<Activity[]> {
  const db = await getDatabase();
  if (addictionId) {
    return db.getAllAsync<Activity>(
      'SELECT * FROM activities WHERE addiction_id = ? ORDER BY created_at DESC',
      [addictionId]
    );
  }
  return db.getAllAsync<Activity>(
    'SELECT * FROM activities ORDER BY created_at DESC'
  );
}

export async function addActivity(activity: Omit<Activity, 'created_at'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO activities (id, addiction_id, name, duration_minutes, notes) VALUES (?, ?, ?, ?, ?)',
    [activity.id, activity.addiction_id, activity.name, activity.duration_minutes, activity.notes]
  );
}

export async function updateActivity(activity: Omit<Activity, 'created_at'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE activities SET name = ?, duration_minutes = ?, notes = ? WHERE id = ?',
    [activity.name, activity.duration_minutes, activity.notes, activity.id]
  );
}

export async function deleteActivity(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM activities WHERE id = ?', [id]);
}

export async function getUniqueActivityNames(addictionId?: string): Promise<string[]> {
  const db = await getDatabase();
  if (addictionId) {
    const rows = await db.getAllAsync<{ name: string }>(
      'SELECT DISTINCT name FROM activities WHERE addiction_id = ? ORDER BY name',
      [addictionId]
    );
    return rows.map(r => r.name);
  }
  const rows = await db.getAllAsync<{ name: string }>(
    'SELECT DISTINCT name FROM activities ORDER BY name'
  );
  return rows.map(r => r.name);
}

// Schedules
export async function getAllSchedules(addictionId?: string): Promise<Schedule[]> {
  const db = await getDatabase();
  if (addictionId) {
    return db.getAllAsync<Schedule>(
      'SELECT * FROM schedules WHERE addiction_id = ? ORDER BY date, time',
      [addictionId]
    );
  }
  return db.getAllAsync<Schedule>(
    'SELECT * FROM schedules ORDER BY date, time'
  );
}

export async function getSchedulesByDate(date: string, addictionId?: string): Promise<Schedule[]> {
  const db = await getDatabase();
  if (addictionId) {
    return db.getAllAsync<Schedule>(
      'SELECT * FROM schedules WHERE date = ? AND is_active = 1 AND addiction_id = ? ORDER BY time',
      [date, addictionId]
    );
  }
  return db.getAllAsync<Schedule>(
    'SELECT * FROM schedules WHERE date = ? AND is_active = 1 ORDER BY time',
    [date]
  );
}

export async function getUpcomingSchedules(addictionId?: string): Promise<Schedule[]> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  if (addictionId) {
    return db.getAllAsync<Schedule>(
      'SELECT * FROM schedules WHERE date >= ? AND is_active = 1 AND addiction_id = ? ORDER BY date, time',
      [today, addictionId]
    );
  }
  return db.getAllAsync<Schedule>(
    'SELECT * FROM schedules WHERE date >= ? AND is_active = 1 ORDER BY date, time',
    [today]
  );
}

export async function upsertSchedule(schedule: Omit<Schedule, 'created_at'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO schedules (id, addiction_id, title, description, date, time, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       addiction_id = excluded.addiction_id,
       title = excluded.title,
       description = excluded.description,
       date = excluded.date,
       time = excluded.time,
       is_active = excluded.is_active`,
    [schedule.id, schedule.addiction_id, schedule.title, schedule.description, schedule.date, schedule.time, schedule.is_active ? 1 : 0]
  );
}

export async function deleteSchedule(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM schedules WHERE id = ?', [id]);
}

// Stats
export async function getStreak(addictionId?: string): Promise<number> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  let entries: JournalEntry[];
  if (addictionId) {
    entries = await db.getAllAsync<JournalEntry>(
      'SELECT * FROM journal_entries WHERE addiction_id = ? ORDER BY date DESC',
      [addictionId]
    );
  } else {
    entries = await db.getAllAsync<JournalEntry>(
      'SELECT * FROM journal_entries ORDER BY date DESC'
    );
  }

  if (entries.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date(today);

  for (const entry of entries) {
    const entryDate = new Date(entry.date);
    const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) break;
    if (entry.is_relapse) break;

    streak++;
    currentDate = entryDate;
  }

  return streak;
}

export async function getLongestStreak(addictionId?: string): Promise<number> {
  const db = await getDatabase();
  let entries: JournalEntry[];
  if (addictionId) {
    entries = await db.getAllAsync<JournalEntry>(
      'SELECT * FROM journal_entries WHERE addiction_id = ? ORDER BY date ASC',
      [addictionId]
    );
  } else {
    entries = await db.getAllAsync<JournalEntry>(
      'SELECT * FROM journal_entries ORDER BY date ASC'
    );
  }

  if (entries.length === 0) return 0;

  let longestStreak = 0;
  let currentStreak = 0;

  for (const entry of entries) {
    if (entry.is_relapse) {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 0;
    } else {
      currentStreak++;
    }
  }

  return Math.max(longestStreak, currentStreak);
}
