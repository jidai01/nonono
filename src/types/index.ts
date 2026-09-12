export interface Settings {
  id: number;
  password_hash: string;
  salt: string;
  recovery_code_hash: string;
  biometric_enabled: boolean;
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
  entry_id: string;
  name: string;
  duration_minutes: number;
  notes: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  title: string;
  description: string;
  day_of_week: number;
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
  1: 'Sangat Buruk',
  2: 'Buruk',
  3: 'Biasa',
  4: 'Baik',
  5: 'Sangat Baik',
};

export const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: '😞',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😊',
};

export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const PREDEFINED_ACTIVITIES = [
  'Olahraga',
  'Meditasi',
  'Membaca',
  'Berkumpul dengan Teman',
  'Hobi Baru',
  'Jurnal',
  'Mendengarkan Musik',
  'Memasak',
  'Berjalan-jalan',
  'Yoga',
];
