import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useJournalStore } from '../../src/stores/journalStore';
import { PREDEFINED_ACTIVITIES, Activity } from '../../src/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

export default function ActivitiesScreen() {
  const { activities, loadActivities, addActivity, deleteActivity } = useJournalStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPredefined, setSelectedPredefined] = useState<string | null>(null);

  const handleAddActivity = async () => {
    if (!newActivityName && !selectedPredefined) {
      Alert.alert('Error', 'Select or enter an activity name');
      return;
    }

    const activityName = selectedPredefined || newActivityName;
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
      onLongPress={() => handleDeleteActivity(item.id)}
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
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Activities List */}
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

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </TouchableOpacity>

      {/* Add Activity Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Activity</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Predefined Activities */}
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
                    setNewActivityName('');
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

            {/* Custom Activity Input */}
            <TextInput
              style={styles.input}
              placeholder="Or enter custom activity..."
              placeholderTextColor={Colors.textTertiary}
              value={newActivityName}
              onChangeText={text => {
                setNewActivityName(text);
                setSelectedPredefined(null);
              }}
            />

            {/* Duration Input */}
            <TextInput
              style={styles.input}
              placeholder="Duration (minutes)"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />

            {/* Notes Input */}
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notes (optional)"
              placeholderTextColor={Colors.textTertiary}
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
                <Text style={styles.addButtonText}>Add Activity</Text>
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
