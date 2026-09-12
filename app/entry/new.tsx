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
import { useJournalStore } from '../../src/stores/journalStore';
import { MOOD_EMOJIS, MOOD_LABELS, MoodLevel, PREDEFINED_ACTIVITIES } from '../../src/types';
import * as Crypto from 'expo-crypto';

export default function NewEntryScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { currentEntry, loadEntryByDate, saveEntry, activities, loadActivities, addActivity, deleteActivity } = useJournalStore();

  const [mood, setMood] = useState<MoodLevel>(3);
  const [feelings, setFeelings] = useState('');
  const [isRelapse, setIsRelapse] = useState(false);
  const [relapseNotes, setRelapseNotes] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState('');

  const entryDate = date || new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadEntryByDate(entryDate);
  }, [entryDate]);

  useEffect(() => {
    if (currentEntry) {
      setMood(currentEntry.mood as MoodLevel);
      setFeelings(currentEntry.feelings);
      setIsRelapse(currentEntry.is_relapse);
      setRelapseNotes(currentEntry.relapse_notes);
    }
  }, [currentEntry]);

  const handleSave = async () => {
    const entryId = currentEntry?.id || Crypto.randomUUID();

    await saveEntry({
      id: entryId,
      date: entryDate,
      mood,
      feelings,
      is_relapse: isRelapse,
      relapse_notes: isRelapse ? relapseNotes : '',
    });

    // Add selected activities
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

    router.back();
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.dateText}>{entryDate}</Text>

        <Text style={styles.sectionTitle}>Bagaimana perasaanmu hari ini?</Text>
        <View style={styles.moodContainer}>
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.moodButton, mood === level && styles.moodButtonSelected]}
              onPress={() => setMood(level as MoodLevel)}
            >
              <Text style={styles.moodEmoji}>{MOOD_EMOJIS[level as MoodLevel]}</Text>
              <Text style={styles.moodLabel}>{MOOD_LABELS[level as MoodLevel]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Tulis jurnal harianmu</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Ceritakan perasaanmu hari ini..."
          multiline
          textAlignVertical="top"
          value={feelings}
          onChangeText={setFeelings}
        />

        <View style={styles.relapseContainer}>
          <View style={styles.relapseHeader}>
            <Text style={styles.sectionTitle}>Apakah kamu mengalami relapse hari ini?</Text>
            <TouchableOpacity
              style={[styles.toggleButton, isRelapse && styles.toggleButtonActive]}
              onPress={() => setIsRelapse(!isRelapse)}
            >
              <Text style={[styles.toggleText, isRelapse && styles.toggleTextActive]}>
                {isRelapse ? 'Ya' : 'Tidak'}
              </Text>
            </TouchableOpacity>
          </View>

          {isRelapse && (
            <TextInput
              style={[styles.textArea, styles.relapseInput]}
              placeholder="Ceritakan apa yang terjadi..."
              multiline
              textAlignVertical="top"
              value={relapseNotes}
              onChangeText={setRelapseNotes}
            />
          )}
        </View>

        <Text style={styles.sectionTitle}>Aktivitas pencegahan yang dilakukan</Text>
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

        <TextInput
          style={styles.input}
          placeholder="Atau tulis aktivitas lain..."
          value={customActivity}
          onChangeText={setCustomActivity}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Simpan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  moodButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#EEE',
    minWidth: 60,
  },
  moodButtonSelected: {
    borderColor: '#4A90D9',
    backgroundColor: '#F0F7FF',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 5,
  },
  moodLabel: {
    fontSize: 10,
    color: '#666',
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 20,
  },
  relapseContainer: {
    marginBottom: 20,
  },
  relapseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  toggleButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  toggleText: {
    color: '#666',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: 'white',
  },
  relapseInput: {
    marginTop: 12,
    borderColor: '#FF6B6B',
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  activityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  activityChipSelected: {
    backgroundColor: '#4A90D9',
    borderColor: '#4A90D9',
  },
  activityChipText: {
    fontSize: 12,
    color: '#666',
  },
  activityChipTextSelected: {
    color: 'white',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
