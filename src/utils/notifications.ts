import { Platform, Alert } from 'react-native';

let notificationHandler: any = null;

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    Alert.alert(
      'Notifications',
      'Notification features are available in development build, not Expo Go.',
      [{ text: 'OK' }]
    );
    return false;
  }
  return true;
}

export async function scheduleNotification(
  title: string,
  body: string,
  date: Date,
  notificationId?: string
): Promise<string | null> {
  Alert.alert(
    'Notifications',
    'Notification features are available in development build, not Expo Go.',
    [{ text: 'OK' }]
  );
  return null;
}

export async function scheduleWeeklyNotification(
  title: string,
  body: string,
  dayOfWeek: number,
  time: string,
  notificationId?: string
): Promise<string | null> {
  Alert.alert(
    'Notifications',
    `Reminder "${title}" will be active after building to device.\nDay: ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayOfWeek]}\nTime: ${time}`,
    [{ text: 'OK' }]
  );
  return null;
}

export async function cancelNotification(notificationId: string): Promise<void> {}

export async function cancelAllNotifications(): Promise<void> {}

export async function getAllScheduledNotifications(): Promise<any[]> {
  return [];
}
