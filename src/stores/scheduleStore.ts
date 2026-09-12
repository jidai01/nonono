import { create } from 'zustand';
import { Schedule } from '../types';
import * as db from '../db/queries';
import * as Crypto from 'expo-crypto';
import * as Notifications from '../utils/notifications';

interface ScheduleState {
  schedules: Schedule[];
  loading: boolean;
  loadSchedules: () => Promise<void>;
  loadSchedulesByDay: (dayOfWeek: number) => Promise<void>;
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

  loadSchedulesByDay: async (dayOfWeek: number) => {
    set({ loading: true });
    const schedules = await db.getSchedulesByDay(dayOfWeek);
    set({ schedules, loading: false });
  },

  addSchedule: async (schedule) => {
    const id = Crypto.randomUUID();
    await db.upsertSchedule({ ...schedule, id });

    if (schedule.is_active) {
      await Notifications.scheduleWeeklyNotification(
        schedule.title,
        schedule.description || 'Saatnya melakukan aktivitas!',
        schedule.day_of_week,
        schedule.time,
        `schedule_${id}`
      );
    }
  },

  toggleSchedule: async (id, isActive) => {
    const schedule = useScheduleStore.getState().schedules.find(s => s.id === id);
    if (schedule) {
      await db.upsertSchedule({ ...schedule, is_active: isActive });

      if (isActive) {
        await Notifications.scheduleWeeklyNotification(
          schedule.title,
          schedule.description || 'Saatnya melakukan aktivitas!',
          schedule.day_of_week,
          schedule.time,
          `schedule_${id}`
        );
      } else {
        await Notifications.cancelNotification(`schedule_${id}`);
      }

      const schedules = await db.getAllSchedules();
      set({ schedules });
    }
  },

  deleteSchedule: async (id) => {
    await db.deleteSchedule(id);
    await Notifications.cancelNotification(`schedule_${id}`);
    const schedules = await db.getAllSchedules();
    set({ schedules });
  },
}));
