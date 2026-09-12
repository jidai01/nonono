import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4A90D9',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#4A90D9',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Kalender',
          headerTitle: 'Kalender Pemulihan',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Jurnal',
          headerTitle: 'Jurnal Harian',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>📝</Text>,
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Aktivitas',
          headerTitle: 'Aktivitas Pencegahan',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🏃</Text>,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Jadwal',
          headerTitle: 'Jadwal & Pengingat',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>⏰</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Pengaturan',
          headerTitle: 'Pengaturan',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
