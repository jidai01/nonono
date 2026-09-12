import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useJournalStore } from '../../src/stores/journalStore';
import { MOOD_EMOJIS, JournalEntry } from '../../src/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

export default function JournalScreen() {
  const router = useRouter();
  const { entries, loadEntries } = useJournalStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const filteredEntries = entries.filter(entry =>
    entry.feelings.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.date.includes(searchQuery)
  );

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      style={[styles.entryCard, item.is_relapse && styles.relapseCard]}
      onPress={() => router.push(`/entry/${item.date}`)}
      activeOpacity={0.7}
    >
      <View style={styles.entryHeader}>
        <View style={styles.entryDateContainer}>
          <Text style={styles.entryDate}>{item.date}</Text>
          {item.is_relapse && (
            <View style={styles.relapseBadge}>
              <Text style={styles.relapseBadgeText}>Relapse</Text>
            </View>
          )}
        </View>
        <View style={styles.moodContainer}>
          <Text style={styles.moodEmoji}>{MOOD_EMOJIS[item.mood as keyof typeof MOOD_EMOJIS]}</Text>
        </View>
      </View>
      {item.feelings ? (
        <Text style={styles.entryContent} numberOfLines={2}>
          {item.feelings}
        </Text>
      ) : null}
      <View style={styles.entryFooter}>
        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search entries..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="book-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Journal Entries</Text>
          <Text style={styles.emptySubtitle}>Start recording your daily feelings and thoughts</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          renderItem={renderEntry}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/entry/new')}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    ...Shadows.small,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.lg,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  entryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  relapseCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  entryDateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  entryDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  relapseBadge: {
    backgroundColor: Colors.error + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  relapseBadgeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    fontWeight: Typography.weights.medium,
  },
  moodContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 20,
  },
  entryContent: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * Typography.lineHeights.relaxed,
    marginBottom: Spacing.sm,
  },
  entryFooter: {
    alignItems: 'flex-end',
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
