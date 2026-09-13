import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';
import { useScheduleStore } from '../../src/stores/scheduleStore';

export default function CalendarScreen() {
  const router = useRouter();
  const { schedules, loadSchedules } = useScheduleStore();
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    loadSchedules();
  }, []);

  const markedDates = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.date]) {
      acc[schedule.date] = {
        marked: true,
        dotColor: Colors.primary,
        selected: schedule.date === selectedDate,
        selectedColor: Colors.primary,
      };
    }
    return acc;
  }, {} as Record<string, any>);

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
  }, []);

  const handleMonthChange = useCallback((month: DateData) => {
  }, []);

  const activeSchedules = schedules.filter(s => s.date === selectedDate);

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: Colors.primary + '20' }]}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{schedules.length}</Text>
          <Text style={styles.statLabel}>Total Schedules</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: Colors.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          </View>
          <Text style={styles.statValue}>{schedules.filter(s => s.is_active).length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: Colors.warning + '20' }]}>
            <Ionicons name="alert-circle" size={20} color={Colors.warning} />
          </View>
          <Text style={styles.statValue}>{schedules.filter(s => !s.is_active).length}</Text>
          <Text style={styles.statLabel}>Paused</Text>
        </View>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          markedDates={markedDates}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
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

      {/* Selected Date Schedules */}
      {selectedDate ? (
        <View style={styles.schedulesContainer}>
          <Text style={styles.schedulesTitle}>
            Schedules for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
          {activeSchedules.length === 0 ? (
            <View style={styles.emptySchedules}>
              <Ionicons name="calendar-outline" size={32} color={Colors.textTertiary} />
              <Text style={styles.emptySchedulesText}>No schedules for this date</Text>
            </View>
          ) : (
            activeSchedules.map(schedule => (
              <View key={schedule.id} style={styles.scheduleCard}>
                <View style={styles.scheduleTime}>
                  <Ionicons name="time" size={16} color={Colors.primary} />
                  <Text style={styles.scheduleTimeText}>{schedule.time}</Text>
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                  {schedule.description ? (
                    <Text style={styles.scheduleDescription} numberOfLines={1}>{schedule.description}</Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  calendarContainer: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  calendar: {
    borderRadius: BorderRadius.lg,
  },
  schedulesContainer: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  schedulesTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  emptySchedules: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },
  emptySchedulesText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: Spacing.md,
    minWidth: 70,
  },
  scheduleTimeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  scheduleDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
