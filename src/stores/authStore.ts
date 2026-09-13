import { create } from 'zustand';
import { Settings } from '../types';
import { getSettings, saveSettings } from '../db/queries';
import * as AuthUtils from '../utils/auth';

interface AuthState {
  isAuthenticated: boolean;
  hasPassword: boolean;
  hasDeviceLock: boolean;
  settings: Settings | null;
  loading: boolean;
  init: () => Promise<void>;
  setupPassword: (password: string) => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  removePassword: (password: string) => Promise<boolean>;
  resetPassword: (recoveryCode: string, newPassword: string) => Promise<boolean>;
  login: (password: string) => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
  loginWithDeviceLock: () => Promise<boolean>;
  logout: () => void;
  skipAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  hasPassword: false,
  hasDeviceLock: false,
  settings: null,
  loading: true,

  init: async () => {
    const settings = await getSettings();
    const deviceLock = settings?.device_lock_enabled || false;
    set({
      settings,
      hasPassword: settings !== null && !!settings.password_hash,
      hasDeviceLock: deviceLock,
      loading: false,
    });
  },

  setupPassword: async (password: string) => {
    const { recoveryCode } = await AuthUtils.createPassword(password);
    const settings = await getSettings();
    set({ settings, hasPassword: true, isAuthenticated: true });
    return recoveryCode;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const valid = await AuthUtils.verifyPassword(currentPassword);
    if (!valid) return false;

    await AuthUtils.createPassword(newPassword);
    const settings = await getSettings();
    set({ settings });
    return true;
  },

  removePassword: async (password: string) => {
    const valid = await AuthUtils.verifyPassword(password);
    if (!valid) return false;

    await AuthUtils.clearPassword();
    const settings = await getSettings();
    set({ settings, hasPassword: false });
    return true;
  },

  resetPassword: async (recoveryCode: string, newPassword: string) => {
    const valid = await AuthUtils.verifyRecoveryCode(recoveryCode);
    if (!valid) return false;

    await AuthUtils.createPassword(newPassword);
    const settings = await getSettings();
    set({ settings, hasPassword: true, isAuthenticated: true });
    return true;
  },

  login: async (password: string) => {
    const valid = await AuthUtils.verifyPassword(password);
    if (valid) set({ isAuthenticated: true });
    return valid;
  },

  loginWithBiometric: async () => {
    try {
      const result = await AuthUtils.authenticateWithDeviceLock();
      if (result) {
        set({ isAuthenticated: true });
        return true;
      }
    } catch (e) {
      console.warn('Biometric not available');
    }
    return false;
  },

  loginWithDeviceLock: async () => {
    const settings = await getSettings();
    if (!settings?.device_lock_enabled) return false;

    const result = await AuthUtils.authenticateWithDeviceLock();
    if (result) {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ isAuthenticated: false });
  },

  skipAuth: () => {
    set({ isAuthenticated: true });
  },
}));
