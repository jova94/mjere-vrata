import Storage from 'expo-sqlite/kv-store';

// iOS/Android: SQLite key-value store. Web verzija je u storage.web.ts.
export const storage = {
  getItemSync: (key: string): string | null => Storage.getItemSync(key),
  setItem: (key: string, value: string) => {
    Storage.setItem(key, value);
  },
};
