import { create } from 'zustand';
import { JournalEntry, Activity } from '../types';
import * as db from '../db/queries';
import * as Crypto from 'expo-crypto';

interface JournalState {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  activities: Activity[];
  loading: boolean;

  loadEntries: (addictionId: string) => Promise<void>;
  loadEntriesByMonth: (year: number, month: number, addictionId: string) => Promise<void>;
  loadEntryByDate: (date: string, addictionId: string) => Promise<JournalEntry | null>;
  loadEntryById: (id: string) => Promise<JournalEntry | null>;
  saveEntry: (entry: Omit<JournalEntry, 'created_at' | 'updated_at'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;

  loadActivities: (addictionId: string) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'created_at' | 'id'> & { addiction_id: string }) => Promise<void>;
  updateActivity: (activity: Omit<Activity, 'created_at'>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  getSoberDays: (addictionId: string) => Promise<number>;
  getRelapseDays: (addictionId: string) => Promise<number>;
  getTotalEntries: (addictionId: string) => Promise<number>;
  getCurrentStreak: (addictionId: string) => Promise<number>;
  getLongestStreak: (addictionId: string) => Promise<number>;
}

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  currentEntry: null,
  activities: [],
  loading: false,

  loadEntries: async (addictionId) => {
    set({ loading: true });
    const entries = await db.getAllEntries(addictionId);
    set({ entries, loading: false });
  },

  loadEntriesByMonth: async (year, month, addictionId) => {
    set({ loading: true });
    const entries = await db.getEntriesByMonth(year, month, addictionId);
    set({ entries, loading: false });
  },

  loadEntryByDate: async (date, addictionId) => {
    const entry = await db.getEntryByDate(date, addictionId);
    set({ currentEntry: entry });
    return entry;
  },

  loadEntryById: async (id) => {
    const entry = await db.getEntryById(id);
    set({ currentEntry: entry });
    return entry;
  },

  saveEntry: async (entry) => {
    await db.upsertEntry(entry);
  },

  deleteEntry: async (id) => {
    await db.deleteEntry(id);
  },

  loadActivities: async (addictionId) => {
    set({ loading: true });
    const activities = await db.getAllActivities(addictionId);
    set({ activities, loading: false });
  },

  addActivity: async (activity) => {
    const id = Crypto.randomUUID();
    await db.addActivity({ ...activity, id });
  },

  updateActivity: async (activity) => {
    await db.updateActivity(activity);
  },

  deleteActivity: async (id) => {
    await db.deleteActivity(id);
  },

  getSoberDays: async (addictionId) => {
    return await db.getSoberDays(addictionId);
  },

  getRelapseDays: async (addictionId) => {
    return await db.getRelapseDays(addictionId);
  },

  getTotalEntries: async (addictionId) => {
    return await db.getTotalEntries(addictionId);
  },

  getCurrentStreak: async (addictionId) => {
    return await db.getStreak(addictionId);
  },

  getLongestStreak: async (addictionId) => {
    return await db.getLongestStreak(addictionId);
  },
}));
