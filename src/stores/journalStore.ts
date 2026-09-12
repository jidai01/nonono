import { create } from 'zustand';
import { JournalEntry, Activity } from '../types';
import * as db from '../db/queries';
import * as Crypto from 'expo-crypto';

interface JournalState {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  activities: Activity[];
  loading: boolean;
  loadEntries: () => Promise<void>;
  loadEntriesByMonth: (year: number, month: number) => Promise<void>;
  loadEntryByDate: (date: string) => Promise<void>;
  loadActivities: (entryId: string) => Promise<void>;
  saveEntry: (entry: Omit<JournalEntry, 'created_at' | 'updated_at'>) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'created_at' | 'id'>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  getStreak: () => Promise<number>;
  getLongestStreak: () => Promise<number>;
}

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  currentEntry: null,
  activities: [],
  loading: false,

  loadEntries: async () => {
    set({ loading: true });
    const entries = await db.getAllEntries();
    set({ entries, loading: false });
  },

  loadEntriesByMonth: async (year: number, month: number) => {
    set({ loading: true });
    const entries = await db.getEntriesByMonth(year, month);
    set({ entries, loading: false });
  },

  loadEntryByDate: async (date: string) => {
    const entry = await db.getEntryByDate(date);
    if (entry) {
      const activities = await db.getActivitiesByEntry(entry.id);
      set({ currentEntry: entry, activities });
    } else {
      set({ currentEntry: null, activities: [] });
    }
  },

  loadActivities: async (entryId: string) => {
    const activities = await db.getActivitiesByEntry(entryId);
    set({ activities });
  },

  saveEntry: async (entry) => {
    await db.upsertEntry(entry);
  },

  addActivity: async (activity) => {
    const id = Crypto.randomUUID();
    await db.addActivity({ ...activity, id });
  },

  deleteActivity: async (id) => {
    await db.deleteActivity(id);
  },

  getStreak: async () => {
    return await db.getStreak();
  },

  getLongestStreak: async () => {
    return await db.getLongestStreak();
  },
}));
