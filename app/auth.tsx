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
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../src/types/theme';

export default function AuthScreen() {
  const router = useRouter();
  const {
    isAuthenticated,
    hasPassword,
    hasDeviceLock,
    setupPassword,
    login,
    loginWithBiometric,
    loginWithDeviceLock,
    skipAuth,
  } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [showRecoveryCode, setShowRecoveryCode] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/calendar');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    try {
      const LocalAuth = require('expo-local-authentication');
      const hasHardware = await LocalAuth.hasHardwareAsync();
      const isEnrolled = await LocalAuth.isEnrolledAsync();
      setHasBiometric(hasHardware && isEnrolled);
    } catch {
      setHasBiometric(false);
    }
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
      router.replace('/(tabs)/calendar');
    } else {
      Alert.alert('Error', 'Wrong password');
    }
  };

  const handleBiometricLogin = async () => {
    const success = await loginWithBiometric();
    if (success) {
      router.replace('/(tabs)/calendar');
    }
  };

  const handleDeviceLockLogin = async () => {
    const success = await loginWithDeviceLock();
    if (success) {
      router.replace('/(tabs)/calendar');
    }
  };

  const handleSkip = () => {
    skipAuth();
    router.replace('/(tabs)/calendar');
  };

  const handleRecoveryCodeDone = () => {
    router.replace('/(tabs)');
  };

  if (showRecoveryCode) {
    return (
      <View style={styles.container}>
        <View style={styles.recoveryCard}>
          <View style={styles.recoveryIconContainer}>
            <Ionicons name="key" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.recoveryTitle}>Save Your Recovery Code</Text>
          <Text style={styles.recoverySubtitle}>
            Store this code somewhere safe. It's your only way to recover your data if you forget your password.
          </Text>
          <View style={styles.recoveryCodeBox}>
            <Text style={styles.recoveryCode}>{recoveryCode}</Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleRecoveryCodeDone}>
            <Text style={styles.primaryButtonText}>I've Saved It</Text>
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
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="pulse" size={36} color={Colors.textInverse} />
            </View>
          </View>

          {/* App Name */}
          <Text style={styles.appName}>Nonono</Text>
          <Text style={styles.tagline}>Your recovery journey starts here</Text>

          {/* Form Card */}
          <View style={styles.formCard}>
            {!isSetup ? (
              <>
                <Text style={styles.formTitle}>Create Your Password</Text>
                
                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    placeholderTextColor={Colors.textTertiary}
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
                      size={20}
                      color={Colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor={Colors.textTertiary}
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
                      size={20}
                      color={Colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Password Match Indicator */}
                {confirmPassword.length > 0 && (
                  <View style={styles.validationRow}>
                    <Ionicons
                      name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={passwordsMatch ? Colors.success : Colors.error}
                    />
                    <Text style={[styles.validationText, { color: passwordsMatch ? Colors.success : Colors.error }]}>
                      {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </Text>
                  </View>
                )}

                {/* Create Password Button */}
                <TouchableOpacity
                  style={[styles.primaryButton, (!passwordsMatch || password.length < 6) && styles.primaryButtonDisabled]}
                  onPress={handleSetup}
                  disabled={!passwordsMatch || password.length < 6}
                >
                  <Text style={styles.primaryButtonText}>Create Password</Text>
                </TouchableOpacity>

                {/* Skip */}
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                  <Text style={styles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.formTitle}>Welcome Back</Text>
                
                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    placeholderTextColor={Colors.textTertiary}
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
                      size={20}
                      color={Colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                  <Text style={styles.primaryButtonText}>Login</Text>
                </TouchableOpacity>

                {/* Alternative Login Methods */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.altLoginRow}>
                  {hasBiometric && (
                    <TouchableOpacity style={styles.altLoginButton} onPress={handleBiometricLogin}>
                      <Ionicons name="finger-print" size={24} color={Colors.primary} />
                      <Text style={styles.altLoginText}>Biometric</Text>
                    </TouchableOpacity>
                  )}
                  {hasDeviceLock && (
                    <TouchableOpacity style={styles.altLoginButton} onPress={handleDeviceLockLogin}>
                      <Ionicons name="phone-portrait" size={24} color={Colors.primary} />
                      <Text style={styles.altLoginText}>Device Lock</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Skip */}
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                  <Text style={styles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Your data stays on your device.{'\n'}Private. Secure. Yours.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxxl,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
  },
  appName: {
    fontSize: Typography.sizes.display,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxxl,
    fontStyle: 'italic',
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 360,
    ...Shadows.medium,
  },
  formTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginLeft: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
  },
  eyeButton: {
    padding: Spacing.md,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  validationText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadows.small,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
  },
  altLoginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  altLoginButton: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 80,
  },
  altLoginText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  skipButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
  },
  recoveryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    margin: Spacing.xl,
    alignItems: 'center',
    ...Shadows.large,
  },
  recoveryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  recoveryTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  recoverySubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
  recoveryCodeBox: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  recoveryCode: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  footer: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xxl,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.relaxed,
  },
});
