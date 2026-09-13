import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useJournalStore } from '../../src/stores/journalStore';
import { useAddictionStore } from '../../src/stores/addictionStore';
import { MoodLevel, MOOD_LABELS, MOOD_EMOJIS } from '../../src/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

export default function NewEntryScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { loadEntryByDate, saveEntry, currentEntry } = useJournalStore();
  const { currentAddictionId } = useAddictionStore();
  
  const [mood, setMood] = useState<MoodLevel>(3);
  const [feelings, setFeelings] = useState('');
  const [isRelapse, setIsRelapse] = useState(false);
  const [relapseNotes, setRelapseNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const entryDate = date || new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (currentAddictionId) {
      loadEntryByDate(entryDate, currentAddictionId);
    }
  }, [entryDate, currentAddictionId]);

  useEffect(() => {
    if (currentEntry) {
      setMood((currentEntry.mood || 3) as MoodLevel);
      setFeelings(currentEntry.feelings || '');
      setIsRelapse(!!currentEntry.is_relapse);
      setRelapseNotes(currentEntry.relapse_notes || '');
    }
  }, [currentEntry]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const entryId = currentEntry?.id || `${currentAddictionId}_${entryDate}`;
      await saveEntry({
        id: entryId,
        addiction_id: currentAddictionId || 'default',
        date: entryDate,
        mood,
        feelings,
        is_relapse: isRelapse,
        relapse_notes: relapseNotes,
      });

      Alert.alert(
        'Saved',
        isRelapse ? 'Entry saved. Tomorrow is a new day.' : 'Entry saved. Keep going.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{formatDate(entryDate)}</Text>
      </View>

      {/* Mood Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <View style={styles.moodContainer}>
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.moodButton,
                mood === level && styles.moodButtonActive,
                mood === level && level <= 2 && styles.moodButtonNegative,
                mood === level && level >= 4 && styles.moodButtonPositive,
              ]}
              onPress={() => setMood(level as MoodLevel)}
            >
              <Text style={styles.moodEmoji}>{MOOD_EMOJIS[level as MoodLevel]}</Text>
              <Text style={[
                styles.moodLabel,
                mood === level && styles.moodLabelActive,
              ]}>
                {MOOD_LABELS[level as MoodLevel]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Feelings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's on your mind?</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="Share your thoughts, feelings, or what happened today..."
          placeholderTextColor={Colors.textTertiary}
          value={feelings}
          onChangeText={setFeelings}
        />
      </View>

      {/* Relapse Toggle */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.relapseToggle, isRelapse && styles.relapseToggleActive]}
          onPress={() => setIsRelapse(!isRelapse)}
        >
          <View style={styles.relapseToggleContent}>
            <Ionicons
              name={isRelapse ? 'alert-circle' : 'alert-circle-outline'}
              size={24}
              color={isRelapse ? Colors.error : Colors.textSecondary}
            />
            <View style={styles.relapseToggleText}>
              <Text style={[styles.relapseToggleTitle, isRelapse && styles.relapseToggleTitleActive]}>
                Mark as Relapse
              </Text>
              <Text style={styles.relapseToggleDescription}>
                It's okay to be honest with yourself
              </Text>
            </View>
          </View>
          <View style={[styles.toggleSwitch, isRelapse && styles.toggleSwitchActive]}>
            <View style={[styles.toggleKnob, isRelapse && styles.toggleKnobActive]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Relapse Notes */}
      {isRelapse && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What happened? (optional)</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Understanding what happened can help prevent it next time..."
            placeholderTextColor={Colors.textTertiary}
            value={relapseNotes}
            onChangeText={setRelapseNotes}
          />
        </View>
      )}

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Ionicons name="checkmark-circle" size={20} color={Colors.textInverse} />
        <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Entry'}</Text>
      </TouchableOpacity>
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
  dateHeader: {
    marginBottom: Spacing.xl,
  },
  dateText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.small,
  },
  moodButtonActive: {
    borderColor: Colors.primary,
    transform: [{ scale: 1.05 }],
  },
  moodButtonNegative: {
    borderColor: Colors.error,
  },
  moodButtonPositive: {
    borderColor: Colors.success,
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
  moodLabelActive: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    ...Shadows.small,
  },
  relapseToggle: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  relapseToggleActive: {
    backgroundColor: Colors.error + '10',
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  relapseToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  relapseToggleText: {
    flex: 1,
  },
  relapseToggleTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  relapseToggleTitleActive: {
    color: Colors.error,
  },
  relapseToggleDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: Colors.error,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    ...Shadows.medium,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textInverse,
  },
});
