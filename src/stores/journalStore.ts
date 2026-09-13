import { create } from 'zustand';
import { Activity } from '../types';
import * as db from '../db/queries';
import * as Crypto from 'expo-crypto';

interface ActivityState {
  activities: Activity[];
  loading: boolean;
  loadActivities: () => Promise<void>;
  addActivity: (activity: Omit<Activity, 'created_at' | 'id'>) => Promise<void>;
  updateActivity: (activity: Omit<Activity, 'created_at'>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

export const useJournalStore = create<ActivityState>((set) => ({
  activities: [],
  loading: false,

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
}));
