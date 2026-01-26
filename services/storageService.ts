
import { Bracelet } from '../types';

/**
 * SERVICIO DE NUBE GLOBAL (KVDB.io)
 * Almacena los datos del catálogo para que se sincronicen en todos los dispositivos.
 */

// SEGURIDAD: Cambia este nombre por algo único y secreto para tu negocio.
// Ejemplo: 'joyeria_gt_secreto_777'. Esto evita que otros puedan ver tus datos técnicos.
const BUCKET_ID = 'golden_touch_exclusive_v1_cloud'; 
const API_URL = `https://kvdb.io/M2L7fS7M8m6H5n6Y6d6D6d/${BUCKET_ID}`;

class CloudStorageService {
  private cache: Bracelet[] = [];

  async getAllItems(): Promise<Bracelet[]> {
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error("Error de conexión");
      }
      
      const data = await response.json();
      this.cache = Array.isArray(data) ? data : [];
      localStorage.setItem(`cache_${BUCKET_ID}`, JSON.stringify(this.cache));
      return this.cache;
    } catch (error) {
      const local = localStorage.getItem(`cache_${BUCKET_ID}`);
      return local ? JSON.parse(local) : [];
    }
  }

  async saveItem(item: Bracelet): Promise<void> {
    this.cache = [item, ...this.cache];
    await this.syncWithCloud();
  }

  async deleteItem(id: string): Promise<void> {
    this.cache = this.cache.filter(i => i.id !== id);
    await this.syncWithCloud();
  }

  private async syncWithCloud(): Promise<void> {
    try {
      await fetch(API_URL, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.cache),
      });
      localStorage.setItem(`cache_${BUCKET_ID}`, JSON.stringify(this.cache));
    } catch (error) {
      console.error("Error sincronizando:", error);
      throw error;
    }
  }
}

export const CloudStorage = new CloudStorageService();
