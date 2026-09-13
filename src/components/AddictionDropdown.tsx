import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
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

  const handleDelete = (addiction: Addiction) => {
    if (addictions.length <= 1) {
      Alert.alert('Error', 'You need at least one addiction');
      return;
    }
    setShowDropdown(false);
    Alert.alert(
      'Delete',
      `Delete "${addiction.name}"? All its data will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAddiction(addiction.id);
          },
        },
      ]
    );
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Enter a name');
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

  const openEditModal = (addiction: Addiction) => {
    setEditingAddiction(addiction);
    setNewName(addiction.name);
    setNewIcon(addiction.icon);
    setNewColor(addiction.color);
    setShowDropdown(false);
    setShowEditModal(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowDropdown(true)}>
        <Text style={styles.currentIcon}>{currentAddiction?.icon || '🎯'}</Text>
        <Text style={styles.currentName} numberOfLines={1}>{currentAddiction?.name || 'Select'}</Text>
        <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={showDropdown} transparent animationType="fade">
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayTouch} onPress={() => setShowDropdown(false)} activeOpacity={1} />
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Switch Addiction</Text>
            {addictions.map(addiction => (
              <View key={addiction.id} style={styles.dropdownItemRow}>
                <TouchableOpacity
                  style={[styles.dropdownItem, addiction.id === currentAddictionId && styles.dropdownItemActive]}
                  onPress={() => handleSelect(addiction)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownItemIcon}>{addiction.icon}</Text>
                  <Text style={[styles.dropdownItemName, addiction.id === currentAddictionId && styles.dropdownItemNameActive]}>
                    {addiction.name}
                  </Text>
                  {addiction.id === currentAddictionId && (
                    <Ionicons name="checkmark" size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(addiction)}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.divider} />
            <TouchableOpacity style={styles.addBtn} onPress={() => { setShowDropdown(false); setShowAddModal(true); }}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.addBtnText}>Add New</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editBtn} onPress={() => { if (currentAddiction) openEditModal(currentAddiction); }}>
              <Ionicons name="create-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.editBtnText}>Edit Current</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayTouch} onPress={() => setShowAddModal(false)} activeOpacity={1} />
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Addiction</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Name" placeholderTextColor={Colors.textTertiary} value={newName} onChangeText={setNewName} />
            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconGrid}>
              {PREDEFINED_ADDICTIONS.map(item => (
                <TouchableOpacity key={item.icon} style={[styles.iconOption, newIcon === item.icon && styles.iconOptionActive]} onPress={() => { setNewIcon(item.icon); setNewColor(item.color); }}>
                  <Text style={styles.iconText}>{item.icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowAddModal(false)}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirm} onPress={handleAdd}>
                <Text style={styles.btnConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayTouch} onPress={() => setShowEditModal(false)} activeOpacity={1} />
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Addiction</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Name" placeholderTextColor={Colors.textTertiary} value={newName} onChangeText={setNewName} />
            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconGrid}>
              {PREDEFINED_ADDICTIONS.map(item => (
                <TouchableOpacity key={item.icon} style={[styles.iconOption, newIcon === item.icon && styles.iconOptionActive]} onPress={() => { setNewIcon(item.icon); setNewColor(item.color); }}>
                  <Text style={styles.iconText}>{item.icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowEditModal(false)}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirm} onPress={handleEdit}>
                <Text style={styles.btnConfirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginRight: Spacing.md },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 6,
  },
  currentIcon: { fontSize: 16 },
  currentName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    maxWidth: 100,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  dropdown: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: 260,
    ...Shadows.large,
  },
  dropdownTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dropdownItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dropdownItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  dropdownItemActive: { backgroundColor: Colors.primary + '10' },
  dropdownItemIcon: { fontSize: 20 },
  dropdownItemName: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
  },
  dropdownItemNameActive: {
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  deleteBtn: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  addBtnText: {
    fontSize: Typography.sizes.md,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  editBtnText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: 300,
    ...Shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
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
    width: 42,
    height: 42,
    borderRadius: 21,
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
  iconText: { fontSize: 20 },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  btnCancel: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  btnCancelText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  btnConfirm: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  btnConfirmText: {
    fontSize: Typography.sizes.md,
    color: Colors.textInverse,
    fontWeight: Typography.weights.semibold,
  },
});
