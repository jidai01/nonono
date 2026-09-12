import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useJournalStore } from '../../src/stores/journalStore';
import { MOOD_EMOJIS, MOOD_LABELS, MoodLevel, PREDEFINED_ACTIVITIES } from '../../src/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';
import * as Crypto from 'expo-crypto';

export default function EditEntryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentEntry, loadEntryByDate, saveEntry, activities, loadActivities, addActivity, deleteActivity } = useJournalStore();

  const [mood, setMood] = useState<MoodLevel>(3);
  const [feelings, setFeelings] = useState('');
  const [isRelapse, setIsRelapse] = useState(false);
  const [relapseNotes, setRelapseNotes] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState('');
  const [selectedDate, setSelectedDate] = useState(id || new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    loadEntryByDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (currentEntry) {
      setMood(currentEntry.mood as MoodLevel);
      setFeelings(currentEntry.feelings);
      setIsRelapse(currentEntry.is_relapse);
      setRelapseNotes(currentEntry.relapse_notes);
    }
  }, [currentEntry]);

  useEffect(() => {
    if (activities.length > 0) {
      setSelectedActivities(activities.map(a => a.name));
    }
  }, [activities]);

  const handleSave = async () => {
    const entryId = currentEntry?.id || Crypto.randomUUID();

    await saveEntry({
      id: entryId,
      date: selectedDate,
      mood,
      feelings,
      is_relapse: isRelapse,
      relapse_notes: isRelapse ? relapseNotes : '',
    });

    for (const activity of activities) {
      await deleteActivity(activity.id);
    }

    for (const activityName of selectedActivities) {
      await addActivity({
        entry_id: entryId,
        name: activityName,
        duration_minutes: 0,
        notes: '',
      });
    }

    if (customActivity) {
      await addActivity({
        entry_id: entryId,
        name: customActivity,
        duration_minutes: 0,
        notes: '',
      });
    }

    router.dismiss();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (currentEntry) {
              const { deleteEntry } = require('../../src/db/queries');
              await deleteEntry(currentEntry.id);
            }
            router.dismiss();
          },
        },
      ]
    );
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismiss()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Entry</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveHeaderButton}>
          <Text style={styles.saveHeaderButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Ionicons name="calendar" size={18} color={Colors.primary} style={styles.inputIcon} />
            <Text style={styles.inputText}>{formatDate(selectedDate)}</Text>
            <Ionicons
              name={showCalendar ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>

          {showCalendar && (
            <View style={styles.calendarContainer}>
              <Calendar
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    selectedColor: Colors.primary,
                  },
                }}
                onDayPress={(day) => {
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
        </View>

        {/* Mood Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood</Text>
          <View style={styles.moodContainer}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.moodButton, mood === level && styles.moodButtonSelected]}
                onPress={() => setMood(level as MoodLevel)}
              >
                <Text style={styles.moodEmoji}>{MOOD_EMOJIS[level as MoodLevel]}</Text>
                <Text style={[styles.moodLabel, mood === level && styles.moodLabelSelected]}>
                  {MOOD_LABELS[level as MoodLevel]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Journal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journal</Text>
          <View style={styles.inputContainerTextArea}>
            <Ionicons name="pencil" size={18} color={Colors.textTertiary} style={styles.inputIconTop} />
            <TextInput
              style={styles.textArea}
              placeholder="Tell me about your feelings today..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              textAlignVertical="top"
              value={feelings}
              onChangeText={setFeelings}
            />
          </View>
        </View>

        {/* Relapse Section */}
        <View style={styles.section}>
          <View style={styles.relapseHeader}>
            <Text style={styles.sectionTitle}>Relapse</Text>
            <TouchableOpacity
              style={[styles.toggleButton, isRelapse && styles.toggleButtonActive]}
              onPress={() => setIsRelapse(!isRelapse)}
            >
              <Ionicons
                name={isRelapse ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={isRelapse ? Colors.textInverse : Colors.textTertiary}
              />
              <Text style={[styles.toggleText, isRelapse && styles.toggleTextActive]}>
                {isRelapse ? 'Yes' : 'No'}
              </Text>
            </TouchableOpacity>
          </View>

          {isRelapse && (
            <View style={[styles.inputContainerTextArea, styles.relapseInputContainer]}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} style={styles.inputIconTop} />
              <TextInput
                style={styles.textArea}
                placeholder="Tell me what happened..."
                placeholderTextColor={Colors.textTertiary}
                multiline
                textAlignVertical="top"
                value={relapseNotes}
                onChangeText={setRelapseNotes}
              />
            </View>
          )}
        </View>

        {/* Activities Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities</Text>
          <View style={styles.activitiesGrid}>
            {PREDEFINED_ACTIVITIES.map((activity) => (
              <TouchableOpacity
                key={activity}
                style={[
                  styles.activityChip,
                  selectedActivities.includes(activity) && styles.activityChipSelected,
                ]}
                onPress={() => toggleActivity(activity)}
              >
                <Ionicons
                  name={selectedActivities.includes(activity) ? 'checkmark' : 'add'}
                  size={14}
                  color={selectedActivities.includes(activity) ? Colors.textInverse : Colors.primary}
                />
                <Text
                  style={[
                    styles.activityChipText,
                    selectedActivities.includes(activity) && styles.activityChipTextSelected,
                  ]}
                >
                  {activity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="create" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Or enter custom activity..."
              placeholderTextColor={Colors.textTertiary}
              value={customActivity}
              onChangeText={setCustomActivity}
            />
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
          <Text style={styles.deleteButtonText}>Delete Entry</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  saveHeaderButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  saveHeaderButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  inputContainerTextArea: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  inputIcon: {
    marginLeft: Spacing.md,
  },
  inputIconTop: {
    marginLeft: Spacing.md,
    marginTop: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
  },
  inputText: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
  textArea: {
    padding: Spacing.lg,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    minHeight: 100,
  },
  calendarContainer: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  calendar: {
    borderRadius: BorderRadius.lg,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  moodButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  moodButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  moodLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
  },
  moodLabelSelected: {
    color: Colors.primary,
  },
  relapseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleButtonActive: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  toggleText: {
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
    fontSize: Typography.sizes.sm,
  },
  toggleTextActive: {
    color: Colors.textInverse,
  },
  relapseInputContainer: {
    marginTop: Spacing.md,
    borderColor: Colors.error + '50',
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  activityChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  activityChipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  activityChipTextSelected: {
    color: Colors.textInverse,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.xl,
    backgroundColor: Colors.error + '10',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  deleteButtonText: {
    color: Colors.error,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
});
