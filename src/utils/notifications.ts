import { Platform, Alert } from 'react-native';
import { formatTime } from './date';

let notificationsAvailable = false;

async function checkNotificationsAvailable(): Promise<boolean> {
  if (notificationsAvailable) return true;
  
  try {
    const Notifications = require('expo-notifications');
    notificationsAvailable = true;
    return true;
  } catch {
    notificationsAvailable = false;
    return false;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const available = await checkNotificationsAvailable();
  
  if (!available) {
    Alert.alert(
      'Notifications',
      'Notifications will work in the production build. For now, reminders will show as alerts.',
      [{ text: 'OK' }]
    );
    return false;
  }

  try {
    const Notifications = require('expo-notifications');
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive schedule reminders.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.log('Notification permission error:', error);
    return false;
  }
}

export async function scheduleNotification(
  title: string,
  body: string,
  date: Date,
  notificationId?: string
): Promise<string | null> {
  const available = await checkNotificationsAvailable();
  
  if (!available) {
    Alert.alert(title, body, [{ text: 'OK' }]);
    return null;
  }

  try {
    const Notifications = require('expo-notifications');
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const id = await Notifications.scheduleNotificationAsync({
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
    console.log('Schedule notification error:', error);
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

  if (triggerDate <= new Date()) {
    Alert.alert(
      title,
      `${body}\n\nDate: ${displayDate}\nTime: ${formatTime(time)}`,
      [{ text: 'OK' }]
    );
    return null;
  }

  return await scheduleNotification(
    title,
    `${body}\n\nDate: ${displayDate}\nTime: ${formatTime(time)}`,
    triggerDate,
    notificationId
  );
}

export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    const available = await checkNotificationsAvailable();
    if (!available) return;
    
    const Notifications = require('expo-notifications');
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.log('Cancel notification error:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    const available = await checkNotificationsAvailable();
    if (!available) return;
    
    const Notifications = require('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Cancel all notifications error:', error);
  }
}

export async function getAllScheduledNotifications(): Promise<any[]> {
  try {
    const available = await checkNotificationsAvailable();
    if (!available) return [];
    
    const Notifications = require('expo-notifications');
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Get notifications error:', error);
    return [];
  }
}
