import { Platform, Alert } from 'react-native';

let notificationHandler: any = null;

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    Alert.alert(
      'Notifikasi',
      'Fitur notifikasi tersedia di development build, bukan Expo Go.',
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
    'Notifikasi',
    'Fitur notifikasi tersedia di development build, bukan Expo Go.',
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
    'Notifikasi',
    `Pengingat "${title}" akan aktif setelah build ke device.\nHari: ${['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][dayOfWeek]}\nJam: ${time}`,
    [{ text: 'OK' }]
  );
  return null;
}

export async function cancelNotification(notificationId: string): Promise<void> {}

export async function cancelAllNotifications(): Promise<void> {}

export async function getAllScheduledNotifications(): Promise<any[]> {
  return [];
}
