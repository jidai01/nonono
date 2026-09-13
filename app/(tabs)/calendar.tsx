import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useJournalStore } from '../../src/stores/journalStore';
import { useAddictionStore } from '../../src/stores/addictionStore';
import { Schedule } from '../../src/types';
import { getSchedulesByDate } from '../../src/db/queries';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

export default function CalendarScreen() {
  const router = useRouter();
  const { entries, loadEntriesByMonth, loadEntryByDate, getSoberDays, getRelapseDays, getTotalEntries, getCurrentStreak, getLongestStreak } = useJournalStore();
  const { currentAddictionId } = useAddictionStore();
  const [selectedDate, setSelectedDate] = useState('');
  const [stats, setStats] = useState({
    soberDays: 0,
    relapseDays: 0,
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [selectedSchedules, setSelectedSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    if (currentAddictionId) {
      loadData();
    }
  }, [currentAddictionId]);

  const loadData = async () => {
    if (!currentAddictionId) return;
    const now = new Date();
    await loadEntriesByMonth(now.getFullYear(), now.getMonth() + 1, currentAddictionId);
    await loadStats();
  };

  const loadStats = async () => {
    if (!currentAddictionId) return;
    const [soberDays, relapseDays, totalEntries, currentStreak, longestStreak] = await Promise.all([
      getSoberDays(currentAddictionId),
      getRelapseDays(currentAddictionId),
      getTotalEntries(currentAddictionId),
      getCurrentStreak(currentAddictionId),
      getLongestStreak(currentAddictionId),
    ]);
    setStats({ soberDays, relapseDays, totalEntries, currentStreak, longestStreak });
  };

  const markedDates = entries.reduce((acc, entry) => {
    acc[entry.date] = {
      marked: true,
      dotColor: entry.is_relapse ? Colors.calendarRelapse : Colors.calendarSober,
      selected: entry.date === selectedDate,
      selectedColor: entry.is_relapse ? Colors.calendarRelapse : Colors.primary,
    };
    return acc;
  }, {} as Record<string, any>);

  const handleDayPress = useCallback(async (day: DateData) => {
    setSelectedDate(day.dateString);
    if (currentAddictionId) {
      const entry = await loadEntryByDate(day.dateString, currentAddictionId);
      setSelectedEntry(entry);
      const schedules = await getSchedulesByDate(day.dateString, currentAddictionId);
      setSelectedSchedules(schedules);
    }
  }, [currentAddictionId]);

  const handleMonthChange = useCallback((month: DateData) => {
    if (currentAddictionId) {
      loadEntriesByMonth(month.year, month.month, currentAddictionId);
    }
  }, [currentAddictionId]);

  const handleAddEntry = () => {
    router.push(`/entry/new?date=${selectedDate || new Date().toISOString().split('T')[0]}`);
  };

  const handleViewEntry = () => {
    if (selectedEntry) {
      router.push(`/entry/${selectedEntry.id}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Stats */}
      <View style={styles.heroStats}>
        <View style={styles.heroStatMain}>
          <View style={styles.heroStatIconContainer}>
            <Ionicons name="flame" size={32} color={Colors.success} />
          </View>
          <Text style={styles.heroStatValue}>{stats.currentStreak}</Text>
          <Text style={styles.heroStatLabel}>Day Streak</Text>
        </View>
        <View style={styles.heroStatSecondary}>
          <View style={styles.heroStatRow}>
            <View style={styles.heroStatItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.calendarSober} />
              <Text style={styles.heroStatItemValue}>{stats.soberDays}</Text>
              <Text style={styles.heroStatItemLabel}>Sober</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Ionicons name="alert-circle" size={20} color={Colors.calendarRelapse} />
              <Text style={styles.heroStatItemValue}>{stats.relapseDays}</Text>
              <Text style={styles.heroStatItemLabel}>Relapsed</Text>
            </View>
          </View>
          <View style={styles.heroStatRow}>
            <View style={styles.heroStatItem}>
              <Ionicons name="book" size={20} color={Colors.info} />
              <Text style={styles.heroStatItemValue}>{stats.totalEntries}</Text>
              <Text style={styles.heroStatItemLabel}>Entries</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Ionicons name="trophy" size={20} color={Colors.warning} />
              <Text style={styles.heroStatItemValue}>{stats.longestStreak}</Text>
              <Text style={styles.heroStatItemLabel}>Best</Text>
            </View>
          </View>
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

      {/* Selected Date Section */}
      <View style={styles.selectedSection}>
        {selectedDate ? (
          <>
            <View style={styles.selectedHeader}>
              <Text style={styles.selectedDate}>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              {selectedEntry && (
                <View style={[
                  styles.entryBadge,
                  selectedEntry.is_relapse ? styles.entryBadgeRelapse : styles.entryBadgeSober,
                ]}>
                  <Text style={styles.entryBadgeText}>
                    {selectedEntry.is_relapse ? 'Relapse' : 'Sober'}
                  </Text>
                </View>
              )}
            </View>

            {/* Schedules for this date */}
            {selectedSchedules.length > 0 && (
              <View style={styles.schedulesContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time-outline" size={18} color={Colors.primary} />
                  <Text style={styles.sectionHeaderText}>Schedule ({selectedSchedules.length})</Text>
                </View>
                {selectedSchedules.map((schedule) => (
                  <TouchableOpacity
                    key={schedule.id}
                    style={styles.scheduleItem}
                    onPress={() => router.push(`/schedule/edit?id=${schedule.id}`)}
                  >
                    <View style={styles.scheduleTimeContainer}>
                      <Text style={styles.scheduleTime}>{schedule.time}</Text>
                    </View>
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                      {schedule.description ? (
                        <Text style={styles.scheduleDescription} numberOfLines={1}>{schedule.description}</Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Journal Entry */}
            {selectedEntry ? (
              <TouchableOpacity style={styles.entryPreview} onPress={handleViewEntry}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="book-outline" size={18} color={Colors.info} />
                  <Text style={styles.sectionHeaderText}>Journal Entry</Text>
                </View>
                <View style={styles.entryPreviewContent}>
                  <View style={styles.entryPreviewHeader}>
                    <Text style={styles.entryMood}>
                      {selectedEntry.mood === 1 ? '😞' : selectedEntry.mood === 2 ? '😔' : selectedEntry.mood === 3 ? '😐' : selectedEntry.mood === 4 ? '🙂' : '😊'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                  </View>
                  {selectedEntry.feelings ? (
                    <Text style={styles.entryFeelings} numberOfLines={2}>
                      {selectedEntry.feelings}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.addEntryButton} onPress={handleAddEntry}>
                <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                <Text style={styles.addEntryText}>Add Journal Entry</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.noDateSelected}>
            <Ionicons name="calendar-outline" size={32} color={Colors.textTertiary} />
            <Text style={styles.noDateText}>Select a date to view schedules and entries</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  heroStatMain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
    paddingRight: Spacing.lg,
  },
  heroStatIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  heroStatValue: {
    fontSize: 40,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
    lineHeight: 44,
  },
  heroStatLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  heroStatSecondary: {
    flex: 1.5,
    paddingLeft: Spacing.lg,
    justifyContent: 'center',
  },
  heroStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  heroStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatItemValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  heroStatItemLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.borderLight,
  },
  calendarContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  calendar: {
    borderRadius: BorderRadius.lg,
  },
  selectedSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  selectedDate: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  entryBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  entryBadgeSober: {
    backgroundColor: Colors.calendarSober + '20',
  },
  entryBadgeRelapse: {
    backgroundColor: Colors.calendarRelapse + '20',
  },
  entryBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  entryPreview: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  entryPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryMood: {
    fontSize: 32,
  },
  entryFeelings: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
  addEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  addEntryText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.primary,
  },
  noDateSelected: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  noDateText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
});
