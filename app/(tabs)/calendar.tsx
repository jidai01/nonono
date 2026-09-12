import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useJournalStore } from '../../src/stores/journalStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

export default function CalendarScreen() {
  const router = useRouter();
  const { entries, loadEntriesByMonth, loadEntryByDate } = useJournalStore();
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const now = new Date();
    loadEntriesByMonth(now.getFullYear(), now.getMonth() + 1);
  }, []);

  const markedDates = entries.reduce((acc, entry) => {
    acc[entry.date] = {
      marked: true,
      dotColor: entry.is_relapse ? Colors.calendarRelapse : Colors.calendarSober,
      selected: entry.date === selectedDate,
      selectedColor: entry.is_relapse ? Colors.calendarRelapse : Colors.primary,
    };
    return acc;
  }, {} as Record<string, any>);

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
    loadEntryByDate(day.dateString);
    router.push(`/entry/${day.dateString}`);
  }, []);

  const handleMonthChange = useCallback((month: DateData) => {
    loadEntriesByMonth(month.year, month.month);
  }, []);

  const soberDays = entries.filter(e => !e.is_relapse).length;
  const relapseDays = entries.filter(e => e.is_relapse).length;

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: Colors.success + '20' }]}>
            <Ionicons name="flame" size={20} color={Colors.success} />
          </View>
          <Text style={styles.statValue}>{soberDays}</Text>
          <Text style={styles.statLabel}>Sober Days</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: Colors.primary + '20' }]}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{entries.length}</Text>
          <Text style={styles.statLabel}>Total Entries</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: Colors.error + '20' }]}>
            <Ionicons name="alert-circle" size={20} color={Colors.error} />
          </View>
          <Text style={styles.statValue}>{relapseDays}</Text>
          <Text style={styles.statLabel}>Relapses</Text>
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

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.calendarSober }]} />
          <Text style={styles.legendText}>Sober Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.calendarRelapse }]} />
          <Text style={styles.legendText}>Relapse</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.calendarEmpty }]} />
          <Text style={styles.legendText}>No Entry</Text>
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
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.xl,
    marginTop: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
});
