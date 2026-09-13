import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useJournalStore } from '../../src/stores/journalStore';
import { PREDEFINED_ACTIVITIES, Activity } from '../../src/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

export default function ActivitiesScreen() {
  const { activities, loadActivities, addActivity, updateActivity, deleteActivity } = useJournalStore();
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPredefined, setSelectedPredefined] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const openAddModal = () => {
    setEditingActivity(null);
    setActivityName('');
    setDuration('');
    setNotes('');
    setSelectedPredefined(null);
    setShowModal(true);
  };

  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityName(activity.name);
    setDuration(activity.duration_minutes > 0 ? String(activity.duration_minutes) : '');
    setNotes(activity.notes || '');
    setSelectedPredefined(PREDEFINED_ACTIVITIES.includes(activity.name) ? activity.name : null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!activityName && !selectedPredefined) {
      Alert.alert('Error', 'Select or enter an activity name');
      return;
    }

    const name = selectedPredefined || activityName;

    if (editingActivity) {
      await updateActivity({
        ...editingActivity,
        name,
        duration_minutes: parseInt(duration) || 0,
        notes,
      });
    } else {
      await addActivity({
        name,
        duration_minutes: parseInt(duration) || 0,
        notes,
      });
    }

    setShowModal(false);
    setEditingActivity(null);
    setActivityName('');
    setDuration('');
    setNotes('');
    setSelectedPredefined(null);
  };

  const handleDeleteActivity = (id: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteActivity(id) },
      ]
    );
  };

  const renderActivity = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => openEditModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.activityIconContainer}>
        <Ionicons name="flash" size={20} color={Colors.accent} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityName}>{item.name}</Text>
        <View style={styles.activityMeta}>
          {item.duration_minutes > 0 && (
            <View style={styles.activityMetaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.activityMetaText}>{item.duration_minutes} min</Text>
            </View>
          )}
          {item.notes ? (
            <View style={styles.activityMetaItem}>
              <Ionicons name="document-text-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.activityMetaText} numberOfLines={1}>{item.notes}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDeleteActivity(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={18} color={Colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {activities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="fitness-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No Activities Yet</Text>
          <Text style={styles.emptySubtitle}>Record the prevention activities you've done</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivity}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openAddModal} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingActivity ? 'Edit Activity' : 'Add Activity'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>Common Activities</Text>
            <View style={styles.predefinedContainer}>
              {PREDEFINED_ACTIVITIES.map(activity => (
                <TouchableOpacity
                  key={activity}
                  style={[
                    styles.predefinedChip,
                    selectedPredefined === activity && styles.predefinedChipSelected,
                  ]}
                  onPress={() => {
                    setSelectedPredefined(activity);
                    setActivityName('');
                  }}
                >
                  <Text style={[
                    styles.predefinedChipText,
                    selectedPredefined === activity && styles.predefinedChipTextSelected,
                  ]}>
                    {activity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Or enter custom activity..."
              placeholderTextColor={Colors.textTertiary}
              value={activityName}
              onChangeText={text => {
                setActivityName(text);
                setSelectedPredefined(null);
              }}
            />

            <TextInput
              style={styles.input}
              placeholder="Duration (minutes)"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />

            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notes (optional)"
              placeholderTextColor={Colors.textTertiary}
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleSave}>
                <Text style={styles.addButtonText}>{editingActivity ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  activityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  activityMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityMetaText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    maxWidth: 100,
  },
  deleteButton: {
    padding: Spacing.sm,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    width: '100%',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  sectionLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  predefinedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  predefinedChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  predefinedChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  predefinedChipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  predefinedChipTextSelected: {
    color: Colors.textInverse,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  addButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
  },
  addButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textInverse,
  },
});
