const LOCAL_STORAGE_PREFIX = "sumx_";

export const localStorageService = {
  setItem: (key: string, value: unknown): void => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, serializedValue);
    } catch (error) {
      console.error("Error setting localStorage item:", error);
    }
  },

  getItem: <T>(key: string): T | null => {
    try {
      const serializedValue = localStorage.getItem(
        `${LOCAL_STORAGE_PREFIX}${key}`
      );
      return serializedValue ? (JSON.parse(serializedValue) as T) : null;
    } catch (error) {
      console.error("Error getting localStorage item:", error);
      return null;
    }
  },

  updateItem: <T>(key: string, updateFn: (prevValue: T | null) => T): void => {
    try {
      const currentValue = localStorageService.getItem<T>(key);
      const newValue = updateFn(currentValue);
      localStorageService.setItem(key, newValue);
    } catch (error) {
      console.error("Error updating localStorage item:", error);
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.error("Error removing localStorage item:", error);
    }
  },

  clear: (): void => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(LOCAL_STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing localStorage items:", error);
    }
  },
};
