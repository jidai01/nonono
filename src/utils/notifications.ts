import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleNotification(
  title: string,
  body: string,
  date: Date,
  notificationId?: string
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const existingId = notificationId || `schedule_${Date.now()}`;

  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });

  return id;
}

export async function scheduleWeeklyNotification(
  title: string,
  body: string,
  dayOfWeek: number,
  time: string,
  notificationId?: string
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const targetDate = new Date();
  targetDate.setDate(now.getDate() + ((dayOfWeek - now.getDay() + 7) % 7));
  targetDate.setHours(hours, minutes, 0, 0);

  if (targetDate <= now) {
    targetDate.setDate(targetDate.getDate() + 7);
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: targetDate,
    },
  });

  return id;
}

export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
