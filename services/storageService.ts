
import { Bracelet } from '../types';

/**
 * SERVICIO DE NUBE OPTIMIZADO - GOLDEN TOUCH
 */

const CLOUD_KEY = 'v7K9pX2mQ5sW8n4J1b3D'; 
const BUCKET_ID = 'gt_exclusive_vault_esteban_final';
const API_URL = `https://kvdb.io/${CLOUD_KEY}/${BUCKET_ID}`;

class CloudStorageService {
  private cache: Bracelet[] = [];

  async getAllItems(): Promise<Bracelet[]> {
    try {
      // Usamos una señal de tiempo para evitar cache agresiva del navegador
      const response = await fetch(`${API_URL}?t=${Date.now()}`, { 
        headers: { 'Accept': 'application/json' },
        cache: 'no-store' 
      });
      
      if (!response.ok) {
        if (response.status === 404) return this.getLocalBackup();
        throw new Error(`Cloud Status: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache = Array.isArray(data) ? data : [];
      localStorage.setItem(`gt_backup_${BUCKET_ID}`, JSON.stringify(this.cache));
      return this.cache;
    } catch (error) {
      return this.getLocalBackup();
    }
  }

  private getLocalBackup(): Bracelet[] {
    const local = localStorage.getItem(`gt_backup_${BUCKET_ID}`);
    return local ? JSON.parse(local) : [];
  }

  async saveItem(item: Bracelet): Promise<void> {
    const updatedList = [item, ...this.cache];
    // Guardamos en local inmediatamente para que el usuario no espere
    this.cache = updatedList;
    localStorage.setItem(`gt_backup_${BUCKET_ID}`, JSON.stringify(updatedList));
    
    // Intentamos subir a la nube en segundo plano
    try {
      await this.syncWithCloud(updatedList);
    } catch (error) {
      console.warn("Sincronización pendiente");
      throw new Error("LocalOnly");
    }
  }

  async updateItem(updatedItem: Bracelet): Promise<void> {
    const updatedList = this.cache.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    this.cache = updatedList;
    localStorage.setItem(`gt_backup_${BUCKET_ID}`, JSON.stringify(updatedList));

    try {
      await this.syncWithCloud(updatedList);
    } catch (error) {
      throw new Error("LocalOnly");
    }
  }

  async deleteItem(id: string): Promise<void> {
    const updatedList = this.cache.filter(i => i.id !== id);
    this.cache = updatedList;
    localStorage.setItem(`gt_backup_${BUCKET_ID}`, JSON.stringify(updatedList));

    try {
      await this.syncWithCloud(updatedList);
    } catch (error) {
      console.error("Fallo al eliminar en nube");
    }
  }

  private async syncWithCloud(data: Bracelet[]): Promise<void> {
    const response = await fetch(API_URL, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Fallo de sincronización");
  }
}

export const CloudStorage = new CloudStorageService();
