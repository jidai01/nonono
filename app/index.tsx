import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';

export default function IndexScreen() {
  const router = useRouter();
  const { isSetupComplete, isAuthenticated, loading } = useAuthStore();

  useEffect(() => {
    if (loading) return;

    if (!isSetupComplete) {
      router.replace('/auth');
    } else if (!isAuthenticated) {
      router.replace('/auth');
    } else {
      router.replace('/(tabs)');
    }
  }, [isSetupComplete, isAuthenticated, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4A90D9" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
});
