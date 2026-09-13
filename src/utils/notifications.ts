import { Platform, Alert } from 'react-native';
import { formatTime } from './date';

let notificationsModule: any = null;
let moduleChecked = false;

async function getNotificationsModule() {
  if (moduleChecked) return notificationsModule;
  
  try {
    notificationsModule = require('expo-notifications');
    moduleChecked = true;
    return notificationsModule;
  } catch (error) {
    console.log('[notifications] expo-notifications not available:', error);
    moduleChecked = true;
    notificationsModule = null;
    return null;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const Notifications = await getNotificationsModule();
  
  if (!Notifications) {
    Alert.alert(
      'Notifications',
      'Notifications will work in the production build. For now, reminders will show as alerts.',
      [{ text: 'OK' }]
    );
    return false;
  }

  try {
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
    console.log('[notifications] Permission request error:', error);
    Alert.alert(
      'Notifications',
      'Notifications will work in the production build. For now, reminders will show as alerts.',
      [{ text: 'OK' }]
    );
    return false;
  }
}

export async function scheduleNotification(
  title: string,
  body: string,
  date: Date,
  notificationId?: string
): Promise<string | null> {
  const Notifications = await getNotificationsModule();
  
  if (!Notifications) {
    Alert.alert(title, body, [{ text: 'OK' }]);
    return null;
  }

  try {
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
    console.log('[notifications] Schedule error:', error);
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
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;
  
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.log('[notifications] Cancel error:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('[notifications] Cancel all error:', error);
  }
}

export async function getAllScheduledNotifications(): Promise<any[]> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return [];
  
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('[notifications] Get all error:', error);
    return [];
  }
}
