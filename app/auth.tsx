import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import * as LocalAuth from 'expo-local-authentication';

export default function AuthScreen() {
  const router = useRouter();
  const { isSetupComplete, isAuthenticated, setupPassword, login, loginWithBiometric, settings } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [showRecoveryCode, setShowRecoveryCode] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const hasHardware = await LocalAuth.hasHardwareAsync();
    const isEnrolled = await LocalAuth.isEnrolledAsync();
    setHasBiometric(hasHardware && isEnrolled);
  };

  const handleSetup = async () => {
    if (password.length < 6) {
      Alert.alert('Error', 'Password harus minimal 6 karakter');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password tidak cocok');
      return;
    }

    try {
      const code = await setupPassword(password);
      setRecoveryCode(code);
      setShowRecoveryCode(true);
    } catch (error) {
      Alert.alert('Error', 'Gagal membuat password');
    }
  };

  const handleLogin = async () => {
    const success = await login(password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Password salah');
    }
  };

  const handleBiometricLogin = async () => {
    const success = await loginWithBiometric();
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const handleRecoveryCodeDone = () => {
    router.replace('/(tabs)');
  };

  if (showRecoveryCode) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Kode Pemulihan</Text>
          <Text style={styles.subtitle}>
            Simpan kode ini di tempat aman. Kode ini hanya ditampilkan sekali.
          </Text>
          <View style={styles.recoveryCodeContainer}>
            <Text style={styles.recoveryCode}>{recoveryCode}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleRecoveryCodeDone}>
            <Text style={styles.buttonText}>Saya sudah menyimpan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.appName}>Nonono</Text>
          <Text style={styles.tagline}>Pemulihan Dimulai dari Sini</Text>

          {!isSetupComplete ? (
            <>
              <Text style={styles.title}>Buat Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Konfirmasi password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity style={styles.button} onPress={handleSetup}>
                <Text style={styles.buttonText}>Buat Password</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Masuk</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Masuk</Text>
              </TouchableOpacity>

              {hasBiometric && settings?.biometric_enabled && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                >
                  <Text style={styles.biometricText}>Gunakan Biometrik</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4A90D9',
    textAlign: 'center',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
  },
  button: {
    backgroundColor: '#4A90D9',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    borderWidth: 1,
    borderColor: '#4A90D9',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  biometricText: {
    color: '#4A90D9',
    fontSize: 16,
    fontWeight: '600',
  },
  recoveryCodeContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  recoveryCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    letterSpacing: 2,
  },
});
