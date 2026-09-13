import { create } from 'zustand';
import { Addiction } from '../types';
import { getDatabase } from '../db/schema';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const CURRENT_ADDICTION_KEY = 'nonono_current_addiction';

interface AddictionState {
  addictions: Addiction[];
  currentAddictionId: string | null;
  loading: boolean;

  loadAddictions: () => Promise<void>;
  addAddiction: (name: string, icon: string, color: string) => Promise<void>;
  updateAddiction: (id: string, name: string, icon: string, color: string) => Promise<void>;
  deleteAddiction: (id: string) => Promise<void>;
  setCurrentAddiction: (id: string) => void;
  ensureDefaultAddiction: () => Promise<void>;
}

function getStorage() {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key),
    };
  }
  return null;
}

async function saveCurrentAddictionId(id: string) {
  const storage = getStorage();
  if (storage) {
    storage.setItem(CURRENT_ADDICTION_KEY, id);
  } else {
    try {
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync(CURRENT_ADDICTION_KEY, id);
    } catch {}
  }
}

async function loadCurrentAddictionId(): Promise<string | null> {
  const storage = getStorage();
  if (storage) {
    return storage.getItem(CURRENT_ADDICTION_KEY);
  }
  try {
    const SecureStore = require('expo-secure-store');
    return await SecureStore.getItemAsync(CURRENT_ADDICTION_KEY);
  } catch {
    return null;
  }
}

export const useAddictionStore = create<AddictionState>((set, get) => ({
  addictions: [],
  currentAddictionId: null,
  loading: false,

  loadAddictions: async () => {
    set({ loading: true });
    const db = await getDatabase();
    const addictions = await db.getAllAsync<Addiction>(
      'SELECT * FROM addictions ORDER BY created_at'
    );

    const savedId = await loadCurrentAddictionId();
    const currentId = savedId && addictions.some(a => a.id === savedId)
      ? savedId
      : addictions.length > 0
        ? addictions[0].id
        : null;

    set({ addictions, currentAddictionId: currentId, loading: false });
  },

  addAddiction: async (name, icon, color) => {
    const db = await getDatabase();
    const id = Crypto.randomUUID();
    await db.runAsync(
      'INSERT INTO addictions (id, name, icon, color) VALUES (?, ?, ?, ?)',
      [id, name, icon, color]
    );
    const addictions = await db.getAllAsync<Addiction>(
      'SELECT * FROM addictions ORDER BY created_at'
    );
    set({ addictions });
  },

  updateAddiction: async (id, name, icon, color) => {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE addictions SET name = ?, icon = ?, color = ? WHERE id = ?',
      [name, icon, color, id]
    );
    const addictions = await db.getAllAsync<Addiction>(
      'SELECT * FROM addictions ORDER BY created_at'
    );
    set({ addictions });
  },

  deleteAddiction: async (id) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM addictions WHERE id = ?', [id]);
    await db.runAsync('DELETE FROM journal_entries WHERE addiction_id = ?', [id]);
    await db.runAsync('DELETE FROM activities WHERE addiction_id = ?', [id]);
    await db.runAsync('DELETE FROM schedules WHERE addiction_id = ?', [id]);

    const addictions = await db.getAllAsync<Addiction>(
      'SELECT * FROM addictions ORDER BY created_at'
    );

    const { currentAddictionId } = get();
    let newCurrentId = currentAddictionId;
    if (currentAddictionId === id) {
      newCurrentId = addictions.length > 0 ? addictions[0].id : null;
    }

    if (newCurrentId) {
      await saveCurrentAddictionId(newCurrentId);
    }

    set({ addictions, currentAddictionId: newCurrentId });
  },

  setCurrentAddiction: (id) => {
    saveCurrentAddictionId(id);
    set({ currentAddictionId: id });
  },

  ensureDefaultAddiction: async () => {
    const db = await getDatabase();
    const count = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM addictions'
    );

    if (count && count.count === 0) {
      const id = 'default';
      await db.runAsync(
        'INSERT OR IGNORE INTO addictions (id, name, icon, color) VALUES (?, ?, ?, ?)',
        [id, 'My Addiction', '🎯', '#3D8B8B']
      );
    }
  },
}));
