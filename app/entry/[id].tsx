import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useJournalStore } from '../../src/stores/journalStore';
import { MoodLevel, MOOD_LABELS, MOOD_EMOJIS } from '../../src/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

export default function EntryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loadEntryById, deleteEntry, currentEntry } = useJournalStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEntryById(id).then(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await deleteEntry(id);
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (currentEntry) {
      router.push(`/entry/new?date=${currentEntry.date}`);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!currentEntry) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.emptyText}>No entry found for this date</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const mood = (currentEntry.mood || 3) as MoodLevel;
  const feelings = currentEntry.feelings || '';
  const relapseNotes = currentEntry.relapse_notes || '';
  const isRelapse = !!currentEntry.is_relapse;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Ionicons name="create-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Ionicons name="trash-outline" size={24} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Date */}
        <Text style={styles.dateText}>{formatDate(currentEntry.date)}</Text>

        {/* Mood */}
        <View style={styles.moodSection}>
          <Text style={styles.moodEmoji}>{MOOD_EMOJIS[mood]}</Text>
          <Text style={styles.moodLabel}>{MOOD_LABELS[mood]}</Text>
        </View>

        {/* Relapse Badge */}
        {isRelapse && (
          <View style={styles.relapseBadge}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={styles.relapseBadgeText}>Relapse</Text>
          </View>
        )}

        {/* Feelings */}
        {feelings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Feelings</Text>
            <Text style={styles.sectionContent}>{feelings}</Text>
          </View>
        )}

        {/* Relapse Notes */}
        {isRelapse && relapseNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Relapse Notes</Text>
            <Text style={styles.sectionContent}>{relapseNotes}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.md,
    color: Colors.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
  },
  backButton: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textInverse,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  dateText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  moodSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  moodEmoji: {
    fontSize: 48,
  },
  moodLabel: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  relapseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.error + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xl,
  },
  relapseBadgeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.error,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.md * Typography.lineHeights.relaxed,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
});
