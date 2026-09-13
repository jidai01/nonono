import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView, TextInput, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { ExportData } from '../../src/types';
import { encryptData, decryptData } from '../../src/utils/crypto';
import { getAllEntries, getAllActivities, getAllSchedules } from '../../src/db/queries';
import { updateBiometricSetting, updateDeviceLockSetting } from '../../src/utils/auth';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, hasPassword, hasDeviceLock, setupPassword, changePassword, removePassword, resetPassword, logout } = useAuthStore();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const [deviceLockEnabled, setDeviceLockEnabled] = useState(false);

  // Modal states
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Form states
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [showRecoveryCode, setShowRecoveryCode] = useState(false);
  const [generatedRecoveryCode, setGeneratedRecoveryCode] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    try {
      const LocalAuth = require('expo-local-authentication');
      const hasHardware = await LocalAuth.hasHardwareAsync();
      const isEnrolled = await LocalAuth.isEnrolledAsync();
      setHasBiometric(hasHardware && isEnrolled);
      setBiometricEnabled(settings?.biometric_enabled || false);
    } catch {
      setHasBiometric(false);
    }
    setDeviceLockEnabled(settings?.device_lock_enabled || false);
  };

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      try {
        const LocalAuth = require('expo-local-authentication');
        const result = await LocalAuth.authenticateAsync({
          promptMessage: 'Verify to enable biometrics',
          cancelLabel: 'Cancel',
        });
        if (result.success) {
          await updateBiometricSetting(true);
          setBiometricEnabled(true);
        }
      } catch {}
    } else {
      await updateBiometricSetting(false);
      setBiometricEnabled(false);
    }
  };

  const toggleDeviceLock = async (value: boolean) => {
    if (value) {
      const result = await require('../../src/utils/auth').authenticateWithDeviceLock();
      if (result) {
        await updateDeviceLockSetting(true);
        setDeviceLockEnabled(true);
      }
    } else {
      await updateDeviceLockSetting(false);
      setDeviceLockEnabled(false);
    }
  };

  const handleSetupPassword = async () => {
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const code = await setupPassword(password);
    setGeneratedRecoveryCode(code);
    setShowRecoveryCode(true);
    setShowSetupModal(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Enter current password');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      Alert.alert('Success', 'Password changed successfully');
      setShowChangeModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      Alert.alert('Error', 'Current password is incorrect');
    }
  };

  const handleRemovePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Enter your password to confirm');
      return;
    }

    const success = await removePassword(currentPassword);
    if (success) {
      Alert.alert('Success', 'Password removed');
      setShowRemoveModal(false);
      setCurrentPassword('');
    } else {
      Alert.alert('Error', 'Password is incorrect');
    }
  };

  const handleResetPassword = async () => {
    if (!recoveryCode) {
      Alert.alert('Error', 'Enter your recovery code');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const success = await resetPassword(recoveryCode, newPassword);
    if (success) {
      Alert.alert('Success', 'Password reset successfully');
      setShowResetModal(false);
      setRecoveryCode('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      Alert.alert('Error', 'Invalid recovery code');
    }
  };

  const handleExport = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Storage permission is needed to export data.');
        return;
      }
    }

    Alert.prompt(
      'Enter Passphrase',
      'This passphrase will encrypt your data',
      async (passphrase) => {
        if (!passphrase) return;

        try {
          const entries = await getAllEntries();
          const activities = await getAllActivities();
          const schedules = await getAllSchedules();

          const exportData: ExportData = {
            version: '1.0.0',
            exported_at: new Date().toISOString(),
            settings: {
              password_hash: settings?.password_hash || '',
              salt: settings?.salt || '',
              recovery_code_hash: settings?.recovery_code_hash || '',
              biometric_enabled: settings?.biometric_enabled || false,
              created_at: settings?.created_at || '',
            },
            journal_entries: entries,
            activities: activities,
            schedules: schedules,
          };

          const encrypted = await encryptData(exportData, passphrase);
          const fileName = `nonono_backup_${Date.now()}.encrypted`;
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;
          await FileSystem.writeAsStringAsync(fileUri, encrypted);

          if (Platform.OS !== 'web') {
            try {
              const MediaLibrary = await import('expo-media-library');
              const asset = await MediaLibrary.createAssetAsync(fileUri);
              const album = await MediaLibrary.getAlbumAsync('nonono');
              if (album) {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
              } else {
                await MediaLibrary.createAlbumAsync('nonono', asset, false);
              }
            } catch (e) {
              console.log('MediaLibrary not available, file saved to app directory');
            }
          }

          Alert.alert(
            'Export Successful',
            `Data has been saved as:\n${fileName}`,
            [{ text: 'OK' }]
          );
        } catch (error) {
          Alert.alert('Error', 'Failed to export data');
        }
      },
      'secure-text'
    );
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      Alert.prompt(
        'Enter Passphrase',
        'Enter the passphrase used during export',
        async (passphrase) => {
          if (!passphrase) return;

          try {
            const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
            const decrypted = await decryptData(fileContent, passphrase);

            if (!decrypted) {
              Alert.alert('Error', 'Wrong passphrase or corrupted file');
              return;
            }

            Alert.alert(
              'Import Successful',
              'Data will be imported. The app will restart.',
              [{ text: 'OK' }]
            );
          } catch (error) {
            Alert.alert('Error', 'Failed to import data');
          }
        },
        'secure-text'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'You will be logged out from the app',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const renderPasswordModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    children: React.ReactNode
  ) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.sectionContent}>
          {!hasPassword ? (
            <TouchableOpacity style={styles.settingRow} onPress={() => setShowSetupModal(true)}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="lock-closed" size={20} color={Colors.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Set Password</Text>
                <Text style={styles.settingDescription}>
                  Add password to protect your data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.settingRow} onPress={() => setShowChangeModal(true)}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="key" size={20} color={Colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Change Password</Text>
                  <Text style={styles.settingDescription}>
                    Update your password
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.settingRow} onPress={() => setShowRemoveModal(true)}>
                <View style={[styles.settingIconContainer, { backgroundColor: Colors.error + '15' }]}>
                  <Ionicons name="lock-open" size={20} color={Colors.error} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: Colors.error }]}>Remove Password</Text>
                  <Text style={styles.settingDescription}>
                    Disable password protection
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            </>
          )}

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={() => setShowResetModal(true)}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="refresh" size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Reset Password</Text>
              <Text style={styles.settingDescription}>
                Use recovery code to reset password
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>

          {hasBiometric && (
            <>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="finger-print" size={20} color={Colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Biometrics</Text>
                  <Text style={styles.settingDescription}>
                    Use fingerprint or Face ID
                  </Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={toggleBiometric}
                  trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                  thumbColor={biometricEnabled ? Colors.primary : Colors.textTertiary}
                />
              </View>
            </>
          )}

          {/* Device Lock */}
          {hasDeviceLock && (
            <>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="phone-portrait" size={20} color={Colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Device Lock</Text>
                  <Text style={styles.settingDescription}>
                    Use device PIN, pattern, or password
                  </Text>
                </View>
                <Switch
                  value={deviceLockEnabled}
                  onValueChange={toggleDeviceLock}
                  trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                  thumbColor={deviceLockEnabled ? Colors.primary : Colors.textTertiary}
                />
              </View>
            </>
          )}
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.sectionContent}>
          <TouchableOpacity style={styles.settingRow} onPress={handleExport}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="cloud-upload" size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.settingDescription}>
                Export your data in encrypted format
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={handleImport}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="cloud-download" size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Import Data</Text>
              <Text style={styles.settingDescription}>
                Import data from a previous backup
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>nonono v1.0.0</Text>
        <Text style={styles.footerSubtext}>Data is stored locally on your device</Text>
      </View>

      {/* Setup Password Modal */}
      {renderPasswordModal(showSetupModal, () => setShowSetupModal(false), 'Set Password',
        <View>
          <Text style={styles.modalDescription}>
            Create a password to protect your journal entries and data.
          </Text>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>
              After setting your password, you will receive a <Text style={styles.bold}>Recovery Code</Text>. 
              Save it somewhere safe — it's the only way to reset your password if you forget it.
            </Text>
          </View>
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter password"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm password"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.modalButton} onPress={handleSetupPassword}>
            <Text style={styles.modalButtonText}>Set Password</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Change Password Modal */}
      {renderPasswordModal(showChangeModal, () => setShowChangeModal(false), 'Change Password',
        <View>
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="Current password"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
              <Ionicons name={showCurrentPassword ? 'eye' : 'eye-off'} size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="New password"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowNewPassword(!showNewPassword)}>
              <Ionicons name={showNewPassword ? 'eye' : 'eye-off'} size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm new password"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.modalButton} onPress={handleChangePassword}>
            <Text style={styles.modalButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Remove Password Modal */}
      {renderPasswordModal(showRemoveModal, () => setShowRemoveModal(false), 'Remove Password',
        <View>
          <Text style={styles.modalDescription}>
            Enter your password to remove password protection.
          </Text>
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter password"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
              <Ionicons name={showCurrentPassword ? 'eye' : 'eye-off'} size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.modalButton, { backgroundColor: Colors.error }]} onPress={handleRemovePassword}>
            <Text style={styles.modalButtonText}>Remove Password</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reset Password Modal */}
      {renderPasswordModal(showResetModal, () => setShowResetModal(false), 'Reset Password',
        <View>
          <Text style={styles.modalDescription}>
            Enter your recovery code and set a new password.
          </Text>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>
              Your recovery code was shown when you first set your password (e.g., <Text style={styles.bold}>ABCD-1234-EFGH-5678</Text>).
            </Text>
          </View>
          <TextInput
            style={styles.modalInput}
            placeholder="Recovery code"
            placeholderTextColor={Colors.textTertiary}
            value={recoveryCode}
            onChangeText={setRecoveryCode}
            autoCapitalize="characters"
          />
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="New password"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowNewPassword(!showNewPassword)}>
              <Ionicons name={showNewPassword ? 'eye' : 'eye-off'} size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm new password"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.modalButton} onPress={handleResetPassword}>
            <Text style={styles.modalButtonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recovery Code Modal */}
      {renderPasswordModal(showRecoveryCode, () => setShowRecoveryCode(false), 'Save Recovery Code',
        <View>
          <View style={styles.recoveryCodeContainer}>
            <Ionicons name="key" size={32} color={Colors.primary} />
            <Text style={styles.recoveryCodeLabel}>Your Recovery Code</Text>
            <Text style={styles.recoveryCodeValue}>{generatedRecoveryCode}</Text>
            <Text style={styles.recoveryCodeDescription}>
              Save this code somewhere safe. You'll need it to reset your password if you forget it.
            </Text>
          </View>
          <TouchableOpacity style={styles.modalButton} onPress={() => setShowRecoveryCode(false)}>
            <Text style={styles.modalButtonText}>I've Saved It</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 72,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxxl,
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  footerSubtext: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
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
  modalDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: Typography.sizes.md * 1.5,
  },
  modalInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eyeButton: {
    padding: Spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.5,
  },
  bold: {
    fontWeight: Typography.weights.semibold,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  modalButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  recoveryCodeContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  recoveryCodeLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  recoveryCodeValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  recoveryCodeDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: Typography.sizes.sm * 1.5,
  },
});
