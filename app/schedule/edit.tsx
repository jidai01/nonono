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
  Modal,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useScheduleStore } from '../../src/stores/scheduleStore';
import { useAddictionStore } from '../../src/stores/addictionStore';
import { getUniqueActivityNames } from '../../src/db/queries';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

export default function EditScheduleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { schedules, loadSchedules, updateSchedule, deleteSchedule } = useScheduleStore();
  const { currentAddictionId } = useAddictionStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [activityNames, setActivityNames] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');

  useEffect(() => {
    loadSchedules();
    loadActivities();
  }, []);

  useEffect(() => {
    if (id && schedules.length > 0) {
      const schedule = schedules.find(s => s.id === id);
      if (schedule) {
        setTitle(schedule.title);
        setDescription(schedule.description || '');
        setSelectedDate(schedule.date);
        setTime(schedule.time);
        setSelectedHour(schedule.time.split(':')[0]);
        setSelectedMinute(schedule.time.split(':')[1]);
      }
    }
  }, [id, schedules]);

  const loadActivities = async () => {
    const names = await getUniqueActivityNames();
    setActivityNames(names);
  };

  const handleSelectActivity = (name: string) => {
    setTitle(name);
    setShowActivityPicker(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Enter a schedule title');
      return;
    }

    const schedule = schedules.find(s => s.id === id);
    if (schedule) {
      await updateSchedule({
        ...schedule,
        title: title.trim(),
        description: description.trim(),
        date: selectedDate,
        time,
      });
    }

    router.dismiss();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteSchedule(id);
            }
            router.dismiss();
          },
        },
      ]
    );
  };

  const handleConfirmTime = () => {
    setTime(`${selectedHour}:${selectedMinute}`);
    setShowTimePicker(false);
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismiss()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Schedule</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveHeaderButton}>
          <Text style={styles.saveHeaderButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Activity Selector */}
        {activityNames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Fill from Activity</Text>
            <Text style={styles.sectionDescription}>Select an existing activity to auto-fill the title</Text>
            <TouchableOpacity
              style={styles.activitySelector}
              onPress={() => setShowActivityPicker(true)}
            >
              <Ionicons name="fitness" size={18} color={Colors.primary} />
              <Text style={styles.activitySelectorText}>
                {title || 'Choose from existing activities'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Title Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Title *</Text>
          <Text style={styles.sectionDescription}>What activity do you want to schedule?</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="pencil" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., Morning Exercise, Reading Time"
              placeholderTextColor={Colors.textTertiary}
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionDescription}>Add details about this schedule (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g., 30 minutes of cardio at the park"
            placeholderTextColor={Colors.textTertiary}
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date *</Text>
          <Text style={styles.sectionDescription}>When should this activity happen?</Text>
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

        {/* Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time *</Text>
          <Text style={styles.sectionDescription}>What time should this activity start?</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time" size={18} color={Colors.primary} style={styles.inputIcon} />
            <Text style={styles.inputText}>{formatTimeDisplay(time)}</Text>
            <Ionicons name="chevron-down" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
          <Text style={styles.deleteButtonText}>Delete Schedule</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerContent}>
            <View style={styles.timePickerHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.timePickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.timePickerTitle}>Select Time</Text>
              <TouchableOpacity onPress={handleConfirmTime}>
                <Text style={styles.timePickerDone}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerBody}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Hour</Text>
                <FlatList
                  data={HOURS}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.timeItem, selectedHour === item && styles.timeItemSelected]}
                      onPress={() => setSelectedHour(item)}
                    >
                      <Text style={[styles.timeItemText, selectedHour === item && styles.timeItemTextSelected]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  style={styles.timeList}
                />
              </View>

              <Text style={styles.timeSeparator}>:</Text>

              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Minute</Text>
                <FlatList
                  data={MINUTES}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.timeItem, selectedMinute === item && styles.timeItemSelected]}
                      onPress={() => setSelectedMinute(item)}
                    >
                      <Text style={[styles.timeItemText, selectedMinute === item && styles.timeItemTextSelected]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  style={styles.timeList}
                />
              </View>
            </View>

            <View style={styles.timePreview}>
              <Ionicons name="time" size={24} color={Colors.primary} />
              <Text style={styles.timePreviewText}>
                {formatTimeDisplay(`${selectedHour}:${selectedMinute}`)}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Activity Picker Modal */}
      <Modal
        visible={showActivityPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActivityPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.activityPickerContent}>
            <View style={styles.activityPickerHeader}>
              <TouchableOpacity onPress={() => setShowActivityPicker(false)}>
                <Text style={styles.activityPickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.activityPickerTitle}>Select Activity</Text>
              <View style={{ width: 60 }} />
            </View>
            <FlatList
              data={activityNames}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.activityItem}
                  onPress={() => handleSelectActivity(item)}
                >
                  <Ionicons name="fitness" size={18} color={Colors.primary} />
                  <Text style={styles.activityItemText}>{item}</Text>
                  {title === item && (
                    <Ionicons name="checkmark" size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No activities found</Text>
              }
            />
          </View>
        </View>
      </Modal>
      </View>
      </TouchableWithoutFeedback>
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
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
  },
  inputText: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  timePickerContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xxxl,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timePickerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  timePickerCancel: {
    fontSize: Typography.sizes.md,
    color: Colors.textTertiary,
  },
  timePickerDone: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  timePickerBody: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeColumnLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
    fontWeight: Typography.weights.medium,
  },
  timeList: {
    height: 180,
    width: 70,
  },
  timeItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  timeItemSelected: {
    backgroundColor: Colors.primary + '20',
  },
  timeItemText: {
    fontSize: Typography.sizes.xl,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  timeItemTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  timePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
  },
  timePreviewText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  activitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadows.small,
  },
  activitySelectorText: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
  activityPickerContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '60%',
  },
  activityPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityPickerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  activityPickerCancel: {
    fontSize: Typography.sizes.md,
    color: Colors.textTertiary,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  activityItemText: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: Spacing.xxl,
  },
});
