import { Platform, Alert } from 'react-native';
import { formatTime } from './date';

export async function requestNotificationPermissions(): Promise<boolean> {
  // Notifications not available in Expo Go SDK 53+
  return false;
}

export async function scheduleNotification(
  title: string,
  body: string,
  date: Date,
  notificationId?: string
): Promise<string | null> {
  // In Expo Go, we can only show immediate alerts
  // Scheduled notifications require development build
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

  const [hours, minutes] = time.split(':').map(Number);
  const triggerDate = new Date(dateStr + 'T00:00:00');
  triggerDate.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const isPast = triggerDate <= now;

  if (isPast) {
    // Schedule is in the past, show immediate reminder
    Alert.alert(
      title,
      `${body}\n\nDate: ${displayDate}\nTime: ${formatTime(time)}\n\n⚠️ This schedule has already passed.`,
      [{ text: 'OK' }]
    );
  } else {
    // Calculate time until notification
    const timeUntil = triggerDate.getTime() - now.getTime();
    const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
    const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

    let timeMessage = '';
    if (hoursUntil > 0) {
      timeMessage = `${hoursUntil}h ${minutesUntil}m`;
    } else {
      timeMessage = `${minutesUntil}m`;
    }

    // Show confirmation that schedule was set
    Alert.alert(
      'Schedule Set ✓',
      `${title}\n\n📅 ${displayDate}\n⏰ ${formatTime(time)}\n\n🔔 Reminder in ${timeMessage}\n\nNote: Real notifications require a development build.`,
      [{ text: 'OK' }]
    );
  }

  return null;
}

export async function cancelNotification(notificationId: string): Promise<void> {}

export async function cancelAllNotifications(): Promise<void> {}

export async function getAllScheduledNotifications(): Promise<any[]> {
  return [];
}
