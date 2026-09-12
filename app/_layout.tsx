import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/stores/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../src/types/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { init, loading } = useAuthStore();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="auth"
          options={{
            animation: 'fade',
            animationDuration: 200,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: 'fade',
            animationDuration: 200,
          }}
        />
        <Stack.Screen
          name="entry/new"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="entry/[id]"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="schedule/new"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            animationDuration: 300,
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
