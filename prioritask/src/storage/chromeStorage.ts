export const chromeStorage = {
  /**
   * Retrieves a value from Chrome local storage.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.local.get(key);
      return (result[key] as T) || null;
    } catch (error) {
      console.error(`Error reading key "${key}" from storage:`, error);
      throw new Error(`Storage read error for key: ${key}`);
    }
  },

  /**
   * Saves a value to Chrome local storage.
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error(`Error writing key "${key}" to storage:`, error);
      throw new Error(`Storage write error for key: ${key}`);
    }
  },

  /**
   * Removes a value from Chrome local storage.
   */
  async remove(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      console.error(`Error removing key "${key}" from storage:`, error);
      throw new Error(`Storage remove error for key: ${key}`);
    }
  }
};