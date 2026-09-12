import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/stores/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootLayout() {
  const { init, loading } = useAuthStore();

  useEffect(() => {
    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3D8B8B" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="entry/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="entry/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="schedule/new" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7F6',
  },
});
