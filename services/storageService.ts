
import { Bracelet } from '../types';

/**
 * SERVICIO DE NUBE EXCLUSIVO - GOLDEN TOUCH
 */

// Usamos una ruta totalmente nueva y única para evitar errores de saturación
const BUCKET_ID = 'golden_touch_esteban_v1_secure'; 
const API_URL = `https://kvdb.io/8xK5pM9vQ4sW2n7J3b6E/${BUCKET_ID}`;

class CloudStorageService {
  private cache: Bracelet[] = [];

  async getAllItems(): Promise<Bracelet[]> {
    try {
      const response = await fetch(API_URL, { 
        headers: { 'Accept': 'application/json' },
        cache: 'no-store' 
      });
      
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      this.cache = Array.isArray(data) ? data : [];
      return this.cache;
    } catch (error) {
      const local = localStorage.getItem(`cache_${BUCKET_ID}`);
      return local ? JSON.parse(local) : [];
    }
  }

  async saveItem(item: Bracelet): Promise<void> {
    const updatedList = [item, ...this.cache];
    await this.syncWithCloud(updatedList);
    this.cache = updatedList;
  }

  async deleteItem(id: string): Promise<void> {
    const updatedList = this.cache.filter(i => i.id !== id);
    await this.syncWithCloud(updatedList);
    this.cache = updatedList;
  }

  private async syncWithCloud(data: Bracelet[]): Promise<void> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error al guardar");
      localStorage.setItem(`cache_${BUCKET_ID}`, JSON.stringify(data));
    } catch (error) {
      console.error("Sync Error:", error);
      throw error;
    }
  }
}

export const CloudStorage = new CloudStorageService();
