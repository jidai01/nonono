export interface Settings {
  id: number;
  password_hash: string;
  salt: string;
  recovery_code_hash: string;
  biometric_enabled: boolean;
  device_lock_enabled: boolean;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  feelings: string;
  is_relapse: boolean;
  relapse_notes: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  name: string;
  duration_minutes: number;
  notes: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  is_active: boolean;
  created_at: string;
}

export interface ExportData {
  version: string;
  exported_at: string;
  settings: Omit<Settings, 'id'>;
  journal_entries: JournalEntry[];
  activities: Activity[];
  schedules: Schedule[];
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: 'Terrible',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: '😞',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😊',
};

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const PREDEFINED_ACTIVITIES = [
  'Exercise',
  'Meditation',
  'Reading',
  'Socializing',
  'New Hobby',
  'Journaling',
  'Listening to Music',
  'Cooking',
  'Walking',
  'Yoga',
];
