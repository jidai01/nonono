import { Platform, Alert } from 'react-native';
import { formatTime } from './date';

let Notifications: any = null;
let notificationsAvailable: boolean | null = null;

async function getNotificationsModule() {
  if (notificationsAvailable !== null) return Notifications;
  
  try {
    Notifications = require('expo-notifications');
    // Test if it actually works by checking if we can set handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    notificationsAvailable = true;
    return Notifications;
  } catch (error) {
    notificationsAvailable = false;
    return null;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const module = await getNotificationsModule();
  if (!module) {
    return false;
  }

  try {
    const { status: existingStatus } = await module.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await module.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Notification permissions not available');
    return false;
  }
}

export async function scheduleNotification(
  title: string,
  body: string,
  date: Date,
  notificationId?: string
): Promise<string | null> {
  const module = await getNotificationsModule();
  if (!module) {
    // Fallback to Alert
    Alert.alert(title, body, [{ text: 'OK' }]);
    return null;
  }

  try {
    const id = await module.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        date,
      },
    });
    return id;
  } catch (error) {
    // Fallback to Alert
    Alert.alert(title, body, [{ text: 'OK' }]);
    return null;
  }
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
      `${body}\n\nDate: ${displayDate}\nTime: ${formatTime(time)}\n\nThis schedule has already passed.`,
      [{ text: 'OK' }]
    );
    return null;
  }

  const module = await getNotificationsModule();
  if (!module) {
    // Fallback to Alert with timing info
    const timeUntil = triggerDate.getTime() - now.getTime();
    const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
    const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
    const timeMessage = hoursUntil > 0 ? `${hoursUntil}h ${minutesUntil}m` : `${minutesUntil}m`;

    Alert.alert(
      'Schedule Set',
      `${title}\n\n${displayDate} at ${formatTime(time)}\n\nReminder in ${timeMessage}`,
      [{ text: 'OK' }]
    );
    return null;
  }

  try {
    const id = await module.scheduleNotificationAsync({
      content: {
        title,
        body: `${body}\n\n${displayDate} at ${formatTime(time)}`,
        sound: true,
      },
      trigger: {
        date: triggerDate,
      },
    });
    return id;
  } catch (error) {
    // Fallback to Alert
    Alert.alert(
      'Schedule Set',
      `${title}\n\n${displayDate} at ${formatTime(time)}`,
      [{ text: 'OK' }]
    );
    return null;
  }
}

export async function cancelNotification(notificationId: string): Promise<void> {
  const module = await getNotificationsModule();
  if (!module) return;

  try {
    await module.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn('Failed to cancel notification');
  }
}

export async function cancelAllNotifications(): Promise<void> {
  const module = await getNotificationsModule();
  if (!module) return;

  try {
    await module.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('Failed to cancel all notifications');
  }
}

export async function getAllScheduledNotifications(): Promise<any[]> {
  const module = await getNotificationsModule();
  if (!module) return [];

  try {
    return await module.getAllScheduledNotificationsAsync();
  } catch (error) {
    return [];
  }
}
