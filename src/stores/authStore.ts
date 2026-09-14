import { create } from 'zustand';
import { Platform } from 'react-native';
import { Settings } from '../types';
import { getSettings, saveSettings } from '../db/queries';
import * as AuthUtils from '../utils/auth';

const AUTH_KEY = 'nonono_auth';

function getWebStorage() {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key),
    };
  }
  return null;
}

async function getAuthState(): Promise<boolean> {
  try {
    const webStorage = getWebStorage();
    if (webStorage) {
      const data = webStorage.getItem(AUTH_KEY);
      return data === 'true';
    } else {
      const SecureStore = require('expo-secure-store');
      const data = await SecureStore.getItemAsync(AUTH_KEY);
      return data === 'true';
    }
  } catch {
    return false;
  }
}

async function setAuthState(value: boolean): Promise<void> {
  try {
    const webStorage = getWebStorage();
    if (webStorage) {
      webStorage.setItem(AUTH_KEY, value.toString());
    } else {
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync(AUTH_KEY, value.toString());
    }
  } catch {}
}

async function clearAuthState(): Promise<void> {
  try {
    const webStorage = getWebStorage();
    if (webStorage) {
      webStorage.removeItem(AUTH_KEY);
    } else {
      const SecureStore = require('expo-secure-store');
      await SecureStore.deleteItemAsync(AUTH_KEY);
    }
  } catch {}
}

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
  logout: () => Promise<void>;
  skipAuth: () => Promise<void>;
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
    const hasPassword = settings !== null && !!settings.password_hash;
    
    // If no password is set, auto-authenticate
    if (!hasPassword) {
      set({
        settings,
        hasPassword: false,
        hasDeviceLock: deviceLock,
        isAuthenticated: true,
        loading: false,
      });
      return;
    }
    
    // If password is set, check if user was previously authenticated this session
    const wasAuthenticated = await getAuthState();
    set({
      settings,
      hasPassword,
      hasDeviceLock: deviceLock,
      isAuthenticated: wasAuthenticated,
      loading: false,
    });
  },

  setupPassword: async (password: string) => {
    const { recoveryCode } = await AuthUtils.createPassword(password);
    const settings = await getSettings();
    await setAuthState(true);
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
    await clearAuthState();
    set({ settings, hasPassword: false, isAuthenticated: true });
    return true;
  },

  resetPassword: async (recoveryCode: string, newPassword: string) => {
    const valid = await AuthUtils.verifyRecoveryCode(recoveryCode);
    if (!valid) return false;

    await AuthUtils.createPassword(newPassword);
    const settings = await getSettings();
    await setAuthState(true);
    set({ settings, hasPassword: true, isAuthenticated: true });
    return true;
  },

  login: async (password: string) => {
    const valid = await AuthUtils.verifyPassword(password);
    if (valid) {
      await setAuthState(true);
      set({ isAuthenticated: true });
    }
    return valid;
  },

  loginWithBiometric: async () => {
    try {
      const result = await AuthUtils.authenticateWithDeviceLock();
      if (result) {
        await setAuthState(true);
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
      await setAuthState(true);
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: async () => {
    await clearAuthState();
    set({ isAuthenticated: false });
  },

  skipAuth: async () => {
    await setAuthState(true);
    set({ isAuthenticated: true });
  },
}));
