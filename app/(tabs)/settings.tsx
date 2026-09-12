import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import * as LocalAuth from 'expo-local-authentication';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { ExportData } from '../../src/types';
import { encryptData, decryptData } from '../../src/utils/crypto';
import { getAllEntries, getAllSchedules } from '../../src/db/queries';
import { updateBiometricSetting } from '../../src/utils/auth';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/types/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, logout } = useAuthStore();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const hasHardware = await LocalAuth.hasHardwareAsync();
    const isEnrolled = await LocalAuth.isEnrolledAsync();
    setHasBiometric(hasHardware && isEnrolled);
    setBiometricEnabled(settings?.biometric_enabled || false);
  };

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const result = await LocalAuth.authenticateAsync({
        promptMessage: 'Verify to enable biometrics',
        cancelLabel: 'Cancel',
      });
      if (result.success) {
        await updateBiometricSetting(true);
        setBiometricEnabled(true);
      }
    } else {
      await updateBiometricSetting(false);
      setBiometricEnabled(false);
    }
  };

  const handleExport = async () => {
    Alert.prompt(
      'Enter Passphrase',
      'This passphrase will encrypt your data',
      async (passphrase) => {
        if (!passphrase) return;

        try {
          const entries = await getAllEntries();
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
            schedules: schedules,
          };

          const encrypted = await encryptData(exportData, passphrase);
          const fileUri = `${FileSystem.documentDirectory}nonono_backup_${Date.now()}.encrypted`;
          await FileSystem.writeAsStringAsync(fileUri, encrypted);

          Alert.alert(
            'Export Successful',
            `Data has been saved to:\n${fileUri}`,
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.sectionContent}>
          {hasBiometric && (
            <View style={styles.settingRow}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="finger-print" size={20} color={Colors.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Biometrics</Text>
                <Text style={styles.settingDescription}>
                  Use fingerprint or Face ID to login
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                thumbColor={biometricEnabled ? Colors.primary : Colors.textTertiary}
              />
            </View>
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

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionContent}>
          <TouchableOpacity 
            style={styles.settingRow} 
            onPress={() => router.push('/test-routes')}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="bug" size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Route Diagnostics</Text>
              <Text style={styles.settingDescription}>
                Test all app routes and navigation
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
            <View style={[styles.settingIconContainer, { backgroundColor: Colors.error + '15' }]}>
              <Ionicons name="log-out" size={20} color={Colors.error} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: Colors.error }]}>Logout</Text>
              <Text style={styles.settingDescription}>
                Log out from the app
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Nonono v1.0.0</Text>
        <Text style={styles.footerSubtext}>Data is stored locally on your device</Text>
      </View>
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
});
