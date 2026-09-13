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

export async function createPassword(password: string): Promise<{ settings: Settings; recoveryCode: string }> {
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const recoveryCode = generateRecoveryCode();
  const recoveryCodeHash = await hashPassword(recoveryCode, salt);

  const settings: Settings = {
    id: 1,
    password_hash: passwordHash,
    salt,
    recovery_code_hash: recoveryCodeHash,
    biometric_enabled: false,
    created_at: new Date().toISOString(),
  };

  await saveSettings(settings);
  return { settings, recoveryCode };
}

export async function verifyPassword(password: string): Promise<boolean> {
  const settings = await getSettings();
  if (!settings) return false;

  const hash = await hashPassword(password, settings.salt);
  return hash === settings.password_hash;
}

export async function verifyRecoveryCode(code: string): Promise<boolean> {
  const settings = await getSettings();
  if (!settings) return false;

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
