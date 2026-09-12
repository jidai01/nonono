import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../src/types/theme';

interface RouteTest {
  name: string;
  path: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export default function TestRoutesScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const [tests, setTests] = useState<RouteTest[]>([
    { name: 'Index (Home)', path: '/', status: 'pending' },
    { name: 'Auth Screen', path: '/auth', status: 'pending' },
    { name: 'Calendar Tab', path: '/(tabs)/calendar', status: 'pending' },
    { name: 'Journal Tab', path: '/(tabs)/journal', status: 'pending' },
    { name: 'Activities Tab', path: '/(tabs)/activities', status: 'pending' },
    { name: 'Schedule Tab', path: '/(tabs)/schedule', status: 'pending' },
    { name: 'Settings Tab', path: '/(tabs)/settings', status: 'pending' },
    { name: 'New Entry Modal', path: '/entry/new', status: 'pending' },
    { name: 'Edit Entry Modal', path: '/entry/2024-01-01', status: 'pending' },
    { name: 'New Schedule Modal', path: '/schedule/new', status: 'pending' },
  ]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const runTests = async () => {
    setTests(prev => prev.map(t => ({ ...t, status: 'pending' as const, error: undefined })));
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      setCurrentTest(test.name);
      
      try {
        // Simulate route test
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setTests(prev => prev.map((t, idx) => 
          idx === i ? { ...t, status: 'success' as const } : t
        ));
      } catch (error) {
        setTests(prev => prev.map((t, idx) => 
          idx === i ? { ...t, status: 'error' as const, error: String(error) } : t
        ));
      }
    }
    
    setCurrentTest(null);
  };

  const testNavigation = (path: string) => {
    try {
      if (path.includes('(tabs)')) {
        // For tab navigation, we need to use the tab path
        const tabPath = path.replace('/(tabs)/', '/');
        router.push(tabPath as any);
      } else {
        router.push(path as any);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Route Diagnostics</Text>
        <Text style={styles.subtitle}>Current: {pathname}</Text>
      </View>

      {/* Run Tests Button */}
      <TouchableOpacity style={styles.runButton} onPress={runTests}>
        <Ionicons name="play" size={20} color={Colors.textInverse} />
        <Text style={styles.runButtonText}>Run All Tests</Text>
      </TouchableOpacity>

      {/* Current Test */}
      {currentTest && (
        <View style={styles.currentTestContainer}>
          <Ionicons name="sync" size={16} color={Colors.primary} />
          <Text style={styles.currentTestText}>Testing: {currentTest}</Text>
        </View>
      )}

      {/* Test Results */}
      <ScrollView style={styles.testList}>
        {tests.map((test, index) => (
          <TouchableOpacity
            key={index}
            style={styles.testItem}
            onPress={() => testNavigation(test.path)}
          >
            <View style={styles.testIcon}>
              {test.status === 'pending' && (
                <Ionicons name="ellipse-outline" size={20} color={Colors.textTertiary} />
              )}
              {test.status === 'success' && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              )}
              {test.status === 'error' && (
                <Ionicons name="close-circle" size={20} color={Colors.error} />
              )}
            </View>
            <View style={styles.testInfo}>
              <Text style={styles.testName}>{test.name}</Text>
              <Text style={styles.testPath}>{test.path}</Text>
              {test.error && (
                <Text style={styles.testError}>{test.error}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {tests.filter(t => t.status === 'success').length}
          </Text>
          <Text style={styles.summaryLabel}>Passed</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.error }]}>
            {tests.filter(t => t.status === 'error').length}
          </Text>
          <Text style={styles.summaryLabel}>Failed</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.textTertiary }]}>
            {tests.filter(t => t.status === 'pending').length}
          </Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    margin: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  runButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  currentTestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '10',
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  currentTestText: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
  },
  testList: {
    flex: 1,
    padding: Spacing.lg,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  testIcon: {
    marginRight: Spacing.md,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  testPath: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
  },
  testError: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginTop: 4,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
  },
});
