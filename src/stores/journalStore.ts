import { create } from 'zustand';
import { JournalEntry, Activity } from '../types';
import * as db from '../db/queries';
import * as Crypto from 'expo-crypto';

interface JournalState {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  activities: Activity[];
  loading: boolean;
  
  // Journal entries
  loadEntries: () => Promise<void>;
  loadEntriesByMonth: (year: number, month: number) => Promise<void>;
  loadEntryByDate: (date: string) => Promise<JournalEntry | null>;
  loadEntryById: (id: string) => Promise<JournalEntry | null>;
  saveEntry: (entry: Omit<JournalEntry, 'created_at' | 'updated_at'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  
  // Activities
  loadActivities: () => Promise<void>;
  addActivity: (activity: Omit<Activity, 'created_at' | 'id'>) => Promise<void>;
  updateActivity: (activity: Omit<Activity, 'created_at'>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  
  // Stats
  getSoberDays: () => Promise<number>;
  getRelapseDays: () => Promise<number>;
  getTotalEntries: () => Promise<number>;
  getCurrentStreak: () => Promise<number>;
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
    set({ currentEntry: entry });
    return entry;
  },

  loadEntryById: async (id: string) => {
    const entry = await db.getEntryById(id);
    set({ currentEntry: entry });
    return entry;
  },

  saveEntry: async (entry) => {
    await db.upsertEntry(entry);
    const entries = await db.getAllEntries();
    set({ entries });
  },

  deleteEntry: async (id) => {
    await db.deleteEntry(id);
    const entries = await db.getAllEntries();
    set({ entries });
  },

  loadActivities: async () => {
    set({ loading: true });
    const activities = await db.getAllActivities();
    set({ activities, loading: false });
  },

  addActivity: async (activity) => {
    const id = Crypto.randomUUID();
    await db.addActivity({ ...activity, id });
    const activities = await db.getAllActivities();
    set({ activities });
  },

  updateActivity: async (activity) => {
    await db.updateActivity(activity);
    const activities = await db.getAllActivities();
    set({ activities });
  },

  deleteActivity: async (id) => {
    await db.deleteActivity(id);
    const activities = await db.getAllActivities();
    set({ activities });
  },

  getSoberDays: async () => {
    return await db.getSoberDays();
  },

  getRelapseDays: async () => {
    return await db.getRelapseDays();
  },

  getTotalEntries: async () => {
    return await db.getTotalEntries();
  },

  getCurrentStreak: async () => {
    return await db.getStreak();
  },

  getLongestStreak: async () => {
    return await db.getLongestStreak();
  },
}));
