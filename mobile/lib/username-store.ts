import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UsernameStore {
  username: string | null;
  setUsername: (username: string) => Promise<void>;
  loadUsername: () => Promise<void>;
  clearUsername: () => Promise<void>;
}

export const useUsernameStore = create<UsernameStore>((set, get) => ({
  username: null,

  setUsername: async (username: string) => {
    await AsyncStorage.setItem('username', username);
    set({ username });
  },

  loadUsername: async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      set({ username });
    } catch (error) {
      console.error('Error loading username:', error);
      set({ username: null });
    }
  },

  clearUsername: async () => {
    await AsyncStorage.removeItem('username');
    set({ username: null });
  },
}));
