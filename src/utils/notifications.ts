import { Platform, Alert } from 'react-native';
import { formatTime } from './date';

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  // In Expo Go, notifications are not available
  // Show info message that notifications will work in production build
  Alert.alert(
    'Notifications',
    'Notifications will work in the production build. For now, reminders will show as alerts.',
    [{ text: 'OK' }]
  );
  return false;
}

export async function scheduleNotification(
  title: string,
  body: string,
  date: Date,
  notificationId?: string
): Promise<string | null> {
  // Fallback to Alert in Expo Go
  Alert.alert(title, body, [{ text: 'OK' }]);
  return null;
}

export async function scheduleDateNotification(
  title: string,
  body: string,
  dateStr: string,
  time: string,
  notificationId?: string
): Promise<string | null> {
  const displayDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fallback to Alert in Expo Go
  Alert.alert(
    title,
    `${body}\n\nDate: ${displayDate}\nTime: ${formatTime(time)}`,
    [{ text: 'OK' }]
  );
  return null;
}

export async function cancelNotification(notificationId: string): Promise<void> {}

export async function cancelAllNotifications(): Promise<void> {}

export async function getAllScheduledNotifications(): Promise<any[]> {
  return [];
}
