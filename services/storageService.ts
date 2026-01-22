
import { Bracelet } from '../types';

const STORAGE_KEY = 'golden_touch_catalog_items';

/**
 * In a real-world scenario, this service would connect to Firebase, Supabase, 
 * or an AWS S3/DynamoDB stack to store data "in the cloud".
 * For this environment, we simulate cloud persistence with LocalStorage.
 */
export const CloudStorage = {
  async getAllItems(): Promise<Bracelet[]> {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing cloud data", e);
      return [];
    }
  },

  async saveItem(item: Bracelet): Promise<void> {
    const items = await this.getAllItems();
    const updatedItems = [item, ...items];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
  },

  async deleteItem(id: string): Promise<void> {
    const items = await this.getAllItems();
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
