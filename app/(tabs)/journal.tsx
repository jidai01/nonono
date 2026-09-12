import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useJournalStore } from '../../src/stores/journalStore';
import { MOOD_EMOJIS, MOOD_LABELS, JournalEntry } from '../../src/types';

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
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{item.date}</Text>
        <View style={styles.moodContainer}>
          <Text style={styles.moodEmoji}>{MOOD_EMOJIS[item.mood as keyof typeof MOOD_EMOJIS]}</Text>
          <Text style={styles.moodText}>{MOOD_LABELS[item.mood as keyof typeof MOOD_LABELS]}</Text>
        </View>
      </View>
      {item.feelings ? (
        <Text style={styles.entryContent} numberOfLines={3}>
          {item.feelings}
        </Text>
      ) : null}
      {item.is_relapse && (
        <View style={styles.relapseBadge}>
          <Text style={styles.relapseText}>Relapse</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search entries..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyText}>No journal entries yet</Text>
          <Text style={styles.emptySubtext}>Start recording your daily feelings</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          renderItem={renderEntry}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/entry/new')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  listContent: {
    padding: 15,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  relapseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryDate: {
    fontSize: 14,
    color: '#888',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodText: {
    fontSize: 12,
    color: '#666',
  },
  entryContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  relapseBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  relapseText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
    marginTop: -2,
  },
});
