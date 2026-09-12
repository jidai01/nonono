import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../src/types/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          ...Shadows.medium,
        },
        tabBarLabelStyle: {
          fontSize: Typography.sizes.xs,
          fontWeight: Typography.weights.medium,
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.textInverse,
        headerTitleStyle: {
          fontWeight: Typography.weights.semibold,
          fontSize: Typography.sizes.lg,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          headerTitle: 'Recovery Calendar',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: color + '15',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="calendar" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          headerTitle: 'Daily Journal',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: color + '15',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="book" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          headerTitle: 'Prevention Activities',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: color + '15',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="fitness" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          headerTitle: 'Schedule & Reminders',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: color + '15',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="alarm" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: color + '15',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="settings" size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
