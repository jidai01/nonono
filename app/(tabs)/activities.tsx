import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useJournalStore } from '../../src/stores/journalStore';
import { PREDEFINED_ACTIVITIES, Activity } from '../../src/types';
import * as Crypto from 'expo-crypto';

export default function ActivitiesScreen() {
  const { activities, loadActivities, addActivity, deleteActivity } = useJournalStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPredefined, setSelectedPredefined] = useState<string | null>(null);

  const handleAddActivity = async () => {
    if (!newActivityName && !selectedPredefined) {
      Alert.alert('Error', 'Pilih atau masukkan nama aktivitas');
      return;
    }

    const activityName = selectedPredefined || newActivityName;

    // We need an entry_id, for now we'll use today's date
    const today = new Date().toISOString().split('T')[0];

    await addActivity({
      entry_id: today,
      name: activityName,
      duration_minutes: parseInt(duration) || 0,
      notes,
    });

    setShowAddModal(false);
    setNewActivityName('');
    setDuration('');
    setNotes('');
    setSelectedPredefined(null);
  };

  const handleDeleteActivity = (id: string) => {
    Alert.alert(
      'Hapus Aktivitas',
      'Apakah kamu yakin ingin menghapus aktivitas ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => deleteActivity(id) },
      ]
    );
  };

  const renderActivity = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      style={styles.activityCard}
      onLongPress={() => handleDeleteActivity(item.id)}
    >
      <View style={styles.activityHeader}>
        <Text style={styles.activityName}>{item.name}</Text>
        {item.duration_minutes > 0 && (
          <Text style={styles.activityDuration}>{item.duration_minutes} menit</Text>
        )}
      </View>
      {item.notes ? (
        <Text style={styles.activityNotes}>{item.notes}</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {activities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🏃</Text>
          <Text style={styles.emptyText}>Belum ada aktivitas</Text>
          <Text style={styles.emptySubtext}>Catat aktivitas pencegahan yang kamu lakukan</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivity}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Aktivitas</Text>

            <Text style={styles.sectionTitle}>Aktivitas Umum:</Text>
            <View style={styles.predefinedContainer}>
              {PREDEFINED_ACTIVITIES.map(activity => (
                <TouchableOpacity
                  key={activity}
                  style={[
                    styles.predefinedItem,
                    selectedPredefined === activity && styles.predefinedItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedPredefined(activity);
                    setNewActivityName('');
                  }}
                >
                  <Text
                    style={[
                      styles.predefinedText,
                      selectedPredefined === activity && styles.predefinedTextSelected,
                    ]}
                  >
                    {activity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Atau masukkan aktivitas lain..."
              value={newActivityName}
              onChangeText={text => {
                setNewActivityName(text);
                setSelectedPredefined(null);
              }}
            />

            <TextInput
              style={styles.input}
              placeholder="Durasi (menit)"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />

            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Catatan (opsional)"
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
                <Text style={styles.addButtonText}>Tambah</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  listContent: {
    padding: 15,
  },
  activityCard: {
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
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityDuration: {
    fontSize: 14,
    color: '#4A90D9',
  },
  activityNotes: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
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
    textAlign: 'center',
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  predefinedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  predefinedItem: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  predefinedItemSelected: {
    backgroundColor: '#4A90D9',
  },
  predefinedText: {
    fontSize: 12,
    color: '#666',
  },
  predefinedTextSelected: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#4A90D9',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
