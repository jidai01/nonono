import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useScheduleStore } from '../../src/stores/scheduleStore';
import { DAY_NAMES, Schedule } from '../../src/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

export default function ScheduleScreen() {
  const router = useRouter();
  const { schedules, loadSchedules, toggleSchedule, deleteSchedule } = useScheduleStore();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const filteredSchedules = selectedDay !== null
    ? schedules.filter(s => s.day_of_week === selectedDay)
    : schedules;

  const handleDeleteSchedule = (id: string) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSchedule(id) },
      ]
    );
  };

  const renderSchedule = ({ item }: { item: Schedule }) => (
    <View style={[styles.scheduleCard, !item.is_active && styles.scheduleCardInactive]}>
      <View style={styles.scheduleHeader}>
        <View style={styles.scheduleIconContainer}>
          <Ionicons name="time" size={20} color={Colors.primary} />
        </View>
        <View style={styles.scheduleInfo}>
          <Text style={styles.scheduleTitle}>{item.title}</Text>
          <Text style={styles.scheduleTime}>{item.time}</Text>
          <Text style={styles.scheduleDay}>{DAY_NAMES[item.day_of_week]}</Text>
        </View>
        <Switch
          value={item.is_active}
          onValueChange={(value) => toggleSchedule(item.id, value)}
          trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
          thumbColor={item.is_active ? Colors.primary : Colors.textTertiary}
        />
      </View>
      {item.description ? (
        <Text style={styles.scheduleDescription}>{item.description}</Text>
      ) : null}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteSchedule(item.id)}
      >
        <Ionicons name="trash-outline" size={16} color={Colors.error} />
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Day Selector */}
      <View style={styles.daySelectorContainer}>
        <FlatList
          data={DAY_NAMES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelector}
          keyExtractor={(item, index) => item}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.dayButton,
                selectedDay === index && styles.dayButtonSelected,
              ]}
              onPress={() => setSelectedDay(selectedDay === index ? null : index)}
            >
              <Text style={[
                styles.dayText,
                selectedDay === index && styles.dayTextSelected,
              ]}>
                {item.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Schedules List */}
      {filteredSchedules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="alarm-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Schedules</Text>
          <Text style={styles.emptySubtitle}>Create reminders for your prevention activities</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSchedules}
          renderItem={renderSchedule}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/schedule/new')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  daySelectorContainer: {
    backgroundColor: Colors.surface,
    ...Shadows.small,
  },
  daySelector: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dayButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  dayTextSelected: {
    color: Colors.textInverse,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  scheduleCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  scheduleCardInactive: {
    opacity: 0.6,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  scheduleTime: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  scheduleDay: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  scheduleDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  deleteButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.error,
    fontWeight: Typography.weights.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * Typography.lineHeights.relaxed,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
  },
});
