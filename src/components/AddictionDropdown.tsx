import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAddictionStore } from '../../src/stores/addictionStore';
import { Addiction, PREDEFINED_ADDICTIONS } from '../../src/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

export default function AddictionDropdown() {
  const { addictions, currentAddictionId, setCurrentAddiction, addAddiction, updateAddiction, deleteAddiction } = useAddictionStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddiction, setEditingAddiction] = useState<Addiction | null>(null);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🎯');
  const [newColor, setNewColor] = useState('#3D8B8B');

  const currentAddiction = addictions.find(a => a.id === currentAddictionId);

  const handleSelect = (addiction: Addiction) => {
    setCurrentAddiction(addiction.id);
    setShowDropdown(false);
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    await addAddiction(newName.trim(), newIcon, newColor);
    setShowAddModal(false);
    setNewName('');
    setNewIcon('🎯');
    setNewColor('#3D8B8B');
  };

  const handleEdit = async () => {
    if (!editingAddiction || !newName.trim()) return;
    await updateAddiction(editingAddiction.id, newName.trim(), newIcon, newColor);
    setShowEditModal(false);
    setEditingAddiction(null);
    setNewName('');
    setNewIcon('🎯');
    setNewColor('#3D8B8B');
  };

  const handleDelete = (addiction: Addiction) => {
    if (addictions.length <= 1) {
      Alert.alert('Error', 'Cannot delete the last addiction');
      return;
    }
    Alert.alert(
      'Delete Addiction',
      `Delete "${addiction.name}" and all its data? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAddiction(addiction.id),
        },
      ]
    );
  };

  const openEditModal = (addiction: Addiction) => {
    setEditingAddiction(addiction);
    setNewName(addiction.name);
    setNewIcon(addiction.icon);
    setNewColor(addiction.color);
    setShowEditModal(true);
    setShowDropdown(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowDropdown(true)}>
        <Text style={styles.currentIcon}>{currentAddiction?.icon || '🎯'}</Text>
        <Text style={styles.currentName} numberOfLines={1}>{currentAddiction?.name || 'Select Addiction'}</Text>
        <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal visible={showDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowDropdown(false)} activeOpacity={1}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Switch Addiction</Text>
            {addictions.map(addiction => (
              <TouchableOpacity
                key={addiction.id}
                style={[styles.dropdownItem, addiction.id === currentAddictionId && styles.dropdownItemActive]}
                onPress={() => handleSelect(addiction)}
                onLongPress={() => openEditModal(addiction)}
              >
                <Text style={styles.dropdownItemIcon}>{addiction.icon}</Text>
                <Text style={[styles.dropdownItemName, addiction.id === currentAddictionId && styles.dropdownItemNameActive]}>
                  {addiction.name}
                </Text>
                {addiction.id === currentAddictionId && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            <View style={styles.dropdownDivider} />
            <TouchableOpacity style={styles.dropdownAddButton} onPress={() => { setShowDropdown(false); setShowAddModal(true); }}>
              <Ionicons name="add-circle" size={20} color={Colors.primary} />
              <Text style={styles.dropdownAddText}>Add New Addiction</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.addModal}>
            <Text style={styles.addModalTitle}>New Addiction</Text>
            <TextInput
              style={styles.input}
              placeholder="Name (e.g., Gaming)"
              placeholderTextColor={Colors.textTertiary}
              value={newName}
              onChangeText={setNewName}
            />
            <Text style={styles.label}>Choose Icon</Text>
            <View style={styles.iconGrid}>
              {PREDEFINED_ADDICTIONS.map(item => (
                <TouchableOpacity
                  key={item.icon}
                  style={[styles.iconOption, newIcon === item.icon && styles.iconOptionActive]}
                  onPress={() => { setNewIcon(item.icon); setNewColor(item.color); }}
                >
                  <Text style={styles.iconOptionText}>{item.icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleAdd}>
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.addModal}>
            <Text style={styles.addModalTitle}>Edit Addiction</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={Colors.textTertiary}
              value={newName}
              onChangeText={setNewName}
            />
            <Text style={styles.label}>Choose Icon</Text>
            <View style={styles.iconGrid}>
              {PREDEFINED_ADDICTIONS.map(item => (
                <TouchableOpacity
                  key={item.icon}
                  style={[styles.iconOption, newIcon === item.icon && styles.iconOptionActive]}
                  onPress={() => { setNewIcon(item.icon); setNewColor(item.color); }}
                >
                  <Text style={styles.iconOptionText}>{item.icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleEdit}>
                <Text style={styles.confirmButtonText}>Save</Text>
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
    marginRight: Spacing.md,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  currentIcon: {
    fontSize: 18,
  },
  currentName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    maxWidth: 120,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: 280,
    maxHeight: 400,
    ...Shadows.large,
  },
  dropdownTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  dropdownItemActive: {
    backgroundColor: Colors.primary + '10',
  },
  dropdownItemIcon: {
    fontSize: 20,
  },
  dropdownItemName: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
  },
  dropdownItemNameActive: {
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  dropdownAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  dropdownAddText: {
    fontSize: Typography.sizes.md,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  addModal: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: 320,
    ...Shadows.large,
  },
  addModalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  iconOptionText: {
    fontSize: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  confirmButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.textInverse,
    fontWeight: Typography.weights.semibold,
  },
});
