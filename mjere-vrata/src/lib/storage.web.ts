// Web/PWA: podaci se čuvaju u localStorage pregledača.
export const storage = {
  getItemSync: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      window.alert('Чување података није успело: ' + String(e));
    }
  },
};
