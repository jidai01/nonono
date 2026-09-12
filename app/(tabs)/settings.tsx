import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import * as LocalAuth from 'expo-local-authentication';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { ExportData } from '../../src/types';
import { encryptData, decryptData } from '../../src/utils/crypto';
import { getAllEntries, getAllSchedules } from '../../src/db/queries';
import { updateBiometricSetting } from '../../src/utils/auth';

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
      'Passphrase will be used to encrypt your data',
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
      Alert.alert('Error', 'Gagal memilih file');
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
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        {hasBiometric && (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Biometrics</Text>
              <Text style={styles.settingDescription}>
                Use fingerprint or Face ID to login
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometric}
              trackColor={{ false: '#DDD', true: '#4A90D9' }}
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>

        <TouchableOpacity style={styles.settingRow} onPress={handleExport}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Export Data</Text>
            <Text style={styles.settingDescription}>
              Export your data in encrypted format
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={handleImport}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Import Data</Text>
            <Text style={styles.settingDescription}>
              Import data from a previous backup
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: '#FF6B6B' }]}>Logout</Text>
            <Text style={styles.settingDescription}>
              Log out from the app
            </Text>
          </View>
          <Text style={[styles.arrow, { color: '#FF6B6B' }]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Nonono v1.0.0</Text>
        <Text style={styles.footerText}>Data is stored locally on device</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 15,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    paddingVertical: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 12,
    color: '#888',
  },
  arrow: {
    fontSize: 24,
    color: '#CCC',
  },
  footer: {
    alignItems: 'center',
    padding: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
});
