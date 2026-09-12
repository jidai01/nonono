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
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/stores/authStore';
import * as LocalAuth from 'expo-local-authentication';

export default function AuthScreen() {
  const router = useRouter();
  const { isSetupComplete, isAuthenticated, setupPassword, login, loginWithBiometric, settings } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
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
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const code = await setupPassword(password);
      setRecoveryCode(code);
      setShowRecoveryCode(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to create password');
    }
  };

  const handleLogin = async () => {
    const success = await login(password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Wrong password');
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
          <Text style={styles.title}>Recovery Code</Text>
          <Text style={styles.subtitle}>
            Save this code in a safe place. This code is shown only once.
          </Text>
          <View style={styles.recoveryCodeContainer}>
            <Text style={styles.recoveryCode}>{recoveryCode}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleRecoveryCodeDone}>
            <Text style={styles.buttonText}>I've saved it</Text>
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
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="pulse" size={40} color="white" />
            </View>
          </View>
          <Text style={styles.appName}>Nonono</Text>
          <Text style={styles.tagline}>Recovery Starts Here</Text>

          {!isSetupComplete ? (
            <>
              <Text style={styles.title}>Create Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={24}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye' : 'eye-off'}
                    size={24}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && (
                <View style={styles.validationRow}>
                  <Ionicons
                    name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                    size={18}
                    color={passwordsMatch ? '#4CAF50' : '#FF6B6B'}
                  />
                  <Text style={[styles.validationText, { color: passwordsMatch ? '#4CAF50' : '#FF6B6B' }]}>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.button, (!passwordsMatch || password.length < 6) && styles.buttonDisabled]}
                onPress={handleSetup}
                disabled={!passwordsMatch || password.length < 6}
              >
                <Text style={styles.buttonText}>Create Password</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Login</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={24}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              {hasBiometric && settings?.biometric_enabled && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                >
                  <Text style={styles.biometricText}>Use Biometrics</Text>
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
    borderRadius: 24,
    padding: 35,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#4A90D9',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginBottom: 35,
    fontStyle: 'italic',
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 15,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  validationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#4A90D9',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#B0C4DE',
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
