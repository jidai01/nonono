import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { useScheduleStore } from '../../src/stores/scheduleStore';
import { useAddictionStore } from '../../src/stores/addictionStore';
import { Schedule } from '../../src/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

export default function ScheduleScreen() {
  const router = useRouter();
  const { schedules, loadSchedules, toggleSchedule, deleteSchedule } = useScheduleStore();
  const { currentAddictionId } = useAddictionStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (currentAddictionId) {
      loadSchedules(currentAddictionId);
    }
  }, [currentAddictionId]);

  const filteredSchedules = schedules.filter(s => s.date === selectedDate);

  const markedDates = schedules.reduce((acc, schedule) => {
    acc[schedule.date] = {
      marked: true,
      dotColor: schedule.is_active ? Colors.primary : Colors.textTertiary,
      selected: schedule.date === selectedDate,
      selectedColor: Colors.primary,
    };
    return acc;
  }, {} as Record<string, any>);

  const handleDeleteSchedule = (id: string) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSchedule(id);
            if (currentAddictionId) {
              await loadSchedules(currentAddictionId);
            }
          },
        },
      ]
    );
  };

  const handleToggle = async (id: string, value: boolean) => {
    const success = await toggleSchedule(id, value);
    if (currentAddictionId) {
      await loadSchedules(currentAddictionId);
    }
  };

  const formatDate = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dateStr + 'T00:00:00');
    selected.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderSchedule = ({ item }: { item: Schedule }) => (
    <TouchableOpacity
      style={[styles.scheduleCard, !item.is_active && styles.scheduleCardInactive]}
      onPress={() => router.push(`/schedule/edit?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.scheduleHeader}>
        <View style={styles.scheduleIconContainer}>
          <Ionicons name="time" size={20} color={Colors.primary} />
        </View>
        <View style={styles.scheduleInfo}>
          <Text style={styles.scheduleTitle}>{item.title}</Text>
          <Text style={styles.scheduleTime}>{item.time}</Text>
        </View>
        <Switch
          value={item.is_active}
          onValueChange={(value) => handleToggle(item.id, value)}
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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Date Selector */}
      <View style={styles.dateSelectorContainer}>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowCalendar(!showCalendar)}
        >
          <Ionicons name="calendar" size={20} color={Colors.primary} />
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>{formatDate(selectedDate)}</Text>
            <Text style={styles.dateValue}>{selectedDate}</Text>
          </View>
          <Ionicons
            name={showCalendar ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.textTertiary}
          />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      {showCalendar && (
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={markedDates}
            onDayPress={(day: DateData) => {
              setSelectedDate(day.dateString);
              setShowCalendar(false);
            }}
            theme={{
              backgroundColor: Colors.surface,
              calendarBackground: Colors.surface,
              textSectionTitleColor: Colors.textTertiary,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.textInverse,
              todayTextColor: Colors.primary,
              dayTextColor: Colors.textPrimary,
              textDisabledColor: Colors.border,
              monthTextColor: Colors.textPrimary,
              arrowColor: Colors.primary,
              textMonthFontWeight: Typography.weights.semibold,
              textDayFontSize: Typography.sizes.md,
              textMonthFontSize: Typography.sizes.lg,
            }}
            style={styles.calendar}
          />
        </View>
      )}

      {/* Schedules List */}
      {filteredSchedules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="alarm-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Schedules</Text>
          <Text style={styles.emptySubtitle}>Create reminders for this date</Text>
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
  dateSelectorContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.small,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  dateValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
  },
  calendarContainer: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  calendar: {
    borderRadius: BorderRadius.lg,
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
