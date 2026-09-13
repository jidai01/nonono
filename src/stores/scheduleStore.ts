import { create } from 'zustand';
import { Schedule } from '../types';
import * as db from '../db/queries';
import * as Crypto from 'expo-crypto';
import { scheduleDateNotification, cancelNotification } from '../utils/notifications';

interface ScheduleState {
  schedules: Schedule[];
  loading: boolean;
  loadSchedules: (addictionId: string) => Promise<void>;
  loadSchedulesByDate: (date: string, addictionId: string) => Promise<void>;
  addSchedule: (schedule: Omit<Schedule, 'id' | 'created_at'>) => Promise<void>;
  updateSchedule: (schedule: Schedule) => Promise<void>;
  toggleSchedule: (id: string, isActive: boolean) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedules: [],
  loading: false,

  loadSchedules: async (addictionId) => {
    set({ loading: true });
    const schedules = await db.getAllSchedules(addictionId);
    set({ schedules, loading: false });
  },

  loadSchedulesByDate: async (date, addictionId) => {
    set({ loading: true });
    const schedules = await db.getSchedulesByDate(date, addictionId);
    set({ schedules, loading: false });
  },

  addSchedule: async (schedule) => {
    const id = Crypto.randomUUID();
    await db.upsertSchedule({ ...schedule, id });

    if (schedule.is_active) {
      await scheduleDateNotification(
        schedule.title,
        schedule.description || 'Time for your activity!',
        schedule.date,
        schedule.time,
        `schedule_${id}`
      );
    }
  },

  updateSchedule: async (schedule) => {
    await db.upsertSchedule(schedule);

    if (schedule.is_active) {
      await scheduleDateNotification(
        schedule.title,
        schedule.description || 'Time for your activity!',
        schedule.date,
        schedule.time,
        `schedule_${schedule.id}`
      );
    } else {
      await cancelNotification(`schedule_${schedule.id}`);
    }
  },

  toggleSchedule: async (id, isActive) => {
    const schedule = (await db.getAllSchedules()).find(s => s.id === id);
    if (schedule) {
      await db.upsertSchedule({ ...schedule, is_active: isActive });

      if (isActive) {
        await scheduleDateNotification(
          schedule.title,
          schedule.description || 'Time for your activity!',
          schedule.date,
          schedule.time,
          `schedule_${id}`
        );
      } else {
        await cancelNotification(`schedule_${id}`);
      }
    }
  },

  deleteSchedule: async (id) => {
    await db.deleteSchedule(id);
    await cancelNotification(`schedule_${id}`);
  },
}));
