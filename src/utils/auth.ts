import * as Crypto from 'expo-crypto';
import { Settings } from '../types';
import { getSettings, saveSettings } from '../db/queries';

function generateSalt(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let salt = '';
  for (let i = 0; i < 32; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
}

function generateRecoveryCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = password + salt;
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data
  );
}

function getDefaultSettings(): Settings {
  return {
    id: 1,
    password_hash: '',
    salt: '',
    recovery_code_hash: '',
    biometric_enabled: false,
    pattern_hash: '',
    pattern_salt: '',
    device_lock_enabled: false,
    created_at: new Date().toISOString(),
  };
}

export async function createPassword(password: string): Promise<{ settings: Settings; recoveryCode: string }> {
  const existing = await getSettings();
  const base = existing || getDefaultSettings();

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const recoveryCode = generateRecoveryCode();
  const recoveryCodeHash = await hashPassword(recoveryCode, salt);

  const settings: Settings = {
    ...base,
    password_hash: passwordHash,
    salt,
    recovery_code_hash: recoveryCodeHash,
  };

  await saveSettings(settings);
  return { settings, recoveryCode };
}

export async function verifyPassword(password: string): Promise<boolean> {
  const settings = await getSettings();
  if (!settings || !settings.password_hash) return false;

  const hash = await hashPassword(password, settings.salt);
  return hash === settings.password_hash;
}

export async function verifyRecoveryCode(code: string): Promise<boolean> {
  const settings = await getSettings();
  if (!settings || !settings.recovery_code_hash) return false;

  const hash = await hashPassword(code, settings.salt);
  return hash === settings.recovery_code_hash;
}

export async function updateBiometricSetting(enabled: boolean): Promise<void> {
  const settings = await getSettings();
  if (settings) {
    settings.biometric_enabled = enabled;
    await saveSettings(settings);
  }
}

// Device Lock (uses device PIN/pattern/fingerprint)
export async function updateDeviceLockSetting(enabled: boolean): Promise<void> {
  const settings = await getSettings();
  if (settings) {
    settings.device_lock_enabled = enabled;
    await saveSettings(settings);
  }
}

export async function authenticateWithDeviceLock(): Promise<boolean> {
  try {
    const LocalAuth = require('expo-local-authentication');
    const hasHardware = await LocalAuth.hasHardwareAsync();
    const isEnrolled = await LocalAuth.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) return false;

    const result = await LocalAuth.authenticateAsync({
      promptMessage: 'Authenticate with device lock',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    return result.success;
  } catch (e) {
    console.warn('Device lock not available');
    return false;
  }
}

export async function hasDeviceLockHardware(): Promise<boolean> {
  try {
    const LocalAuth = require('expo-local-authentication');
    const hasHardware = await LocalAuth.hasHardwareAsync();
    const isEnrolled = await LocalAuth.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch {
    return false;
  }
}

export async function clearPassword(): Promise<void> {
  const { deleteSettings } = require('../db/queries');
  await deleteSettings();
}

export async function resetAllData(): Promise<void> {
  const { deleteEntry, deleteSchedule } = require('../db/queries');
  const { getDatabase } = require('../db/schema');

  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM activities;
    DELETE FROM journal_entries;
    DELETE FROM schedules;
  `);
}
