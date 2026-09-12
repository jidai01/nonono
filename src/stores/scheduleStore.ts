import { create } from 'zustand';
import { Schedule } from '../types';
import * as db from '../db/queries';
import * as Crypto from 'expo-crypto';

interface ScheduleState {
  schedules: Schedule[];
  loading: boolean;
  loadSchedules: () => Promise<void>;
  loadSchedulesByDate: (date: string) => Promise<void>;
  addSchedule: (schedule: Omit<Schedule, 'id' | 'created_at'>) => Promise<void>;
  toggleSchedule: (id: string, isActive: boolean) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedules: [],
  loading: false,

  loadSchedules: async () => {
    set({ loading: true });
    const schedules = await db.getAllSchedules();
    set({ schedules, loading: false });
  },

  loadSchedulesByDate: async (date: string) => {
    set({ loading: true });
    const schedules = await db.getSchedulesByDate(date);
    set({ schedules, loading: false });
  },

  addSchedule: async (schedule) => {
    const id = Crypto.randomUUID();
    await db.upsertSchedule({ ...schedule, id });
    const schedules = await db.getAllSchedules();
    set({ schedules });
  },

  toggleSchedule: async (id, isActive) => {
    const schedule = useScheduleStore.getState().schedules.find(s => s.id === id);
    if (schedule) {
      await db.upsertSchedule({ ...schedule, is_active: isActive });
      const schedules = await db.getAllSchedules();
      set({ schedules });
    }
  },

  deleteSchedule: async (id) => {
    await db.deleteSchedule(id);
    const schedules = await db.getAllSchedules();
    set({ schedules });
  },
}));
