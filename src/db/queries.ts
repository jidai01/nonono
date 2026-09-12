import { getDatabase } from './schema';
import { Settings, JournalEntry, Activity, Schedule } from '../types';
import * as SecureStore from 'expo-secure-store';

const SETTINGS_KEY = 'nonono_settings';

// Settings
export async function getSettings(): Promise<Settings | null> {
  try {
    const data = await SecureStore.getItemAsync(SETTINGS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return null;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
}

export async function hasSettings(): Promise<boolean> {
  const settings = await getSettings();
  return settings !== null;
}

// Journal Entries
export async function getAllEntries(): Promise<JournalEntry[]> {
  const db = await getDatabase();
  return db.getAllAsync<JournalEntry>(
    'SELECT * FROM journal_entries ORDER BY date DESC'
  );
}

export async function getEntryByDate(date: string): Promise<JournalEntry | null> {
  const db = await getDatabase();
  return db.getFirstAsync<JournalEntry>(
    'SELECT * FROM journal_entries WHERE date = ?',
    [date]
  );
}

export async function getEntriesByMonth(year: number, month: number): Promise<JournalEntry[]> {
  const db = await getDatabase();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  return db.getAllAsync<JournalEntry>(
    'SELECT * FROM journal_entries WHERE date BETWEEN ? AND ? ORDER BY date',
    [startDate, endDate]
  );
}

export async function upsertEntry(entry: Omit<JournalEntry, 'created_at' | 'updated_at'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO journal_entries (id, date, mood, feelings, is_relapse, relapse_notes, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET
       mood = excluded.mood,
       feelings = excluded.feelings,
       is_relapse = excluded.is_relapse,
       relapse_notes = excluded.relapse_notes,
       updated_at = CURRENT_TIMESTAMP`,
    [entry.id, entry.date, entry.mood, entry.feelings, entry.is_relapse ? 1 : 0, entry.relapse_notes]
  );
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM journal_entries WHERE id = ?', [id]);
}

// Activities
export async function getActivitiesByEntry(entryId: string): Promise<Activity[]> {
  const db = await getDatabase();
  return db.getAllAsync<Activity>(
    'SELECT * FROM activities WHERE entry_id = ? ORDER BY created_at',
    [entryId]
  );
}

export async function addActivity(activity: Omit<Activity, 'created_at'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO activities (id, entry_id, name, duration_minutes, notes) VALUES (?, ?, ?, ?, ?)',
    [activity.id, activity.entry_id, activity.name, activity.duration_minutes, activity.notes]
  );
}

export async function updateActivity(activity: Activity): Promise<void> {
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

// Schedules
export async function getAllSchedules(): Promise<Schedule[]> {
  const db = await getDatabase();
  return db.getAllAsync<Schedule>(
    'SELECT * FROM schedules ORDER BY date, time'
  );
}

export async function getSchedulesByDate(date: string): Promise<Schedule[]> {
  const db = await getDatabase();
  return db.getAllAsync<Schedule>(
    'SELECT * FROM schedules WHERE date = ? AND is_active = 1 ORDER BY time',
    [date]
  );
}

export async function getUpcomingSchedules(): Promise<Schedule[]> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  return db.getAllAsync<Schedule>(
    'SELECT * FROM schedules WHERE date >= ? AND is_active = 1 ORDER BY date, time',
    [today]
  );
}

export async function upsertSchedule(schedule: Omit<Schedule, 'created_at'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO schedules (id, title, description, date, time, is_active)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       date = excluded.date,
       time = excluded.time,
       is_active = excluded.is_active`,
    [schedule.id, schedule.title, schedule.description, schedule.date, schedule.time, schedule.is_active ? 1 : 0]
  );
}

export async function deleteSchedule(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM schedules WHERE id = ?', [id]);
}

// Stats
export async function getStreak(): Promise<number> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const entries = await db.getAllAsync<JournalEntry>(
    'SELECT * FROM journal_entries ORDER BY date DESC'
  );

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

export async function getLongestStreak(): Promise<number> {
  const db = await getDatabase();
  const entries = await db.getAllAsync<JournalEntry>(
    'SELECT * FROM journal_entries ORDER BY date ASC'
  );

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
