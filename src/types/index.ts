export interface Settings {
  id: number;
  password_hash: string;
  salt: string;
  recovery_code_hash: string;
  biometric_enabled: boolean;
  device_lock_enabled: boolean;
  created_at: string;
}

export interface Addiction {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  addiction_id: string;
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
  addiction_id: string;
  name: string;
  duration_minutes: number;
  notes: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  addiction_id: string;
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
  addictions: Addiction[];
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

export const PREDEFINED_ADDICTIONS = [
  { name: 'Gaming', icon: '🎮', color: '#6B5CE7' },
  { name: 'Smoking', icon: '🚬', color: '#8B8B8B' },
  { name: 'Alcohol', icon: '🍷', color: '#C45B5B' },
  { name: 'Social Media', icon: '📱', color: '#4A90D9' },
  { name: 'Gambling', icon: '🎰', color: '#D4A843' },
  { name: 'Junk Food', icon: '🍔', color: '#E8917A' },
  { name: 'Shopping', icon: '🛍️', color: '#D47A9E' },
  { name: 'Caffeine', icon: '☕', color: '#8B6F47' },
  { name: 'Pornography', icon: '🔞', color: '#9B59B6' },
  { name: 'Drugs', icon: '💊', color: '#E74C3C' },
];
