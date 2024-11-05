const SESSION_STORAGE_PREFIX = "sumx_";

export const sessionStorageService = {
  setItem: (key: string, value: unknown): void => {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(`${SESSION_STORAGE_PREFIX}${key}`, serializedValue);
    } catch (error) {
      console.error("Error setting sessionStorage item:", error);
    }
  },

  getItem: <T>(key: string): T | null => {
    try {
      const serializedValue = sessionStorage.getItem(
        `${SESSION_STORAGE_PREFIX}${key}`
      );
      return serializedValue ? (JSON.parse(serializedValue) as T) : null;
    } catch (error) {
      console.error("Error getting sessionStorage item:", error);
      return null;
    }
  },

  updateItem: <T>(key: string, updateFn: (prevValue: T | null) => T): void => {
    try {
      const currentValue = sessionStorageService.getItem<T>(key);
      const newValue = updateFn(currentValue);
      sessionStorageService.setItem(key, newValue);
    } catch (error) {
      console.error("Error updating sessionStorage item:", error);
    }
  },

  removeItem: (key: string): void => {
    try {
      sessionStorage.removeItem(`${SESSION_STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.error("Error removing sessionStorage item:", error);
    }
  },

  clear: (): void => {
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith(SESSION_STORAGE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing sessionStorage items:", error);
    }
  },
};
