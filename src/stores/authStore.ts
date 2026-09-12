import { create } from 'zustand';
import { Settings } from '../types';
import { getSettings } from '../db/queries';
import * as AuthUtils from '../utils/auth';
import * as LocalAuth from 'expo-local-authentication';

interface AuthState {
  isAuthenticated: boolean;
  isSetupComplete: boolean;
  settings: Settings | null;
  loading: boolean;
  init: () => Promise<void>;
  setupPassword: (password: string) => Promise<string>;
  login: (password: string) => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isSetupComplete: false,
  settings: null,
  loading: true,

  init: async () => {
    const settings = await getSettings();
    set({
      settings,
      isSetupComplete: settings !== null,
      loading: false,
    });
  },

  setupPassword: async (password: string) => {
    const { recoveryCode } = await AuthUtils.createPassword(password);
    const settings = await getSettings();
    set({ settings, isSetupComplete: true, isAuthenticated: true });
    return recoveryCode;
  },

  login: async (password: string) => {
    const valid = await AuthUtils.verifyPassword(password);
    if (valid) set({ isAuthenticated: true });
    return valid;
  },

  loginWithBiometric: async () => {
    const settings = await getSettings();
    if (!settings?.biometric_enabled) return false;

    const hasHardware = await LocalAuth.hasHardwareAsync();
    const isEnrolled = await LocalAuth.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) return false;

    const result = await LocalAuth.authenticateAsync({
      promptMessage: 'Authenticate to login',
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ isAuthenticated: false });
  },
}));
