import { useState } from 'react';
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
  FlatList,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useScheduleStore } from '../../src/stores/scheduleStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

export default function NewScheduleScreen() {
  const router = useRouter();
  const { addSchedule } = useScheduleStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const initialHour = time.split(':')[0];
  const initialMinute = time.split(':')[1];
  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Enter a schedule title');
      return;
    }

    await addSchedule({
      title: title.trim(),
      description: description.trim(),
      date: selectedDate,
      time,
      is_active: true,
    });

    router.dismiss();
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

  const renderTimeItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.timeItem}>
      <Text style={styles.timeItemText}>{item}</Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>New Schedule</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveHeaderButton}>
          <Text style={styles.saveHeaderButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Title</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="pencil" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., Morning Exercise"
              placeholderTextColor={Colors.textTertiary}
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Details about the activity..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Ionicons name="calendar" size={18} color={Colors.primary} />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
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
          <Text style={styles.sectionTitle}>Time</Text>
          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time" size={18} color={Colors.primary} />
            <Text style={styles.timeText}>{formatTimeDisplay(time)}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
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
              {/* Hour Picker */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Hour</Text>
                <FlatList
                  data={HOURS}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.timeItem,
                        selectedHour === item && styles.timeItemSelected,
                      ]}
                      onPress={() => setSelectedHour(item)}
                    >
                      <Text
                        style={[
                          styles.timeItemText,
                          selectedHour === item && styles.timeItemTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  style={styles.timeList}
                />
              </View>

              {/* Separator */}
              <Text style={styles.timeSeparator}>:</Text>

              {/* Minute Picker */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Minute</Text>
                <FlatList
                  data={MINUTES}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.timeItem,
                        selectedMinute === item && styles.timeItemSelected,
                      ]}
                      onPress={() => setSelectedMinute(item)}
                    >
                      <Text
                        style={[
                          styles.timeItemText,
                          selectedMinute === item && styles.timeItemTextSelected,
                        ]}
                      >
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

            {/* Preview */}
            <View style={styles.timePreview}>
              <Ionicons name="time" size={24} color={Colors.primary} />
              <Text style={styles.timePreviewText}>
                {formatTimeDisplay(`${selectedHour}:${selectedMinute}`)}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
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
  inputIcon: {
    marginLeft: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
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
  dateSelector: {
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
  dateText: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
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
  timeSelector: {
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
  timeText: {
    flex: 1,
    fontSize: Typography.sizes.lg,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
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
});
