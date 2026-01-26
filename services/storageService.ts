
import { Bracelet } from '../types';

/**
 * SERVICIO DE NUBE REFORZADO - GOLDEN TOUCH
 */

// Llave de acceso única generada para Esteban - Evita saturación pública
const CLOUD_KEY = 'v7K9pX2mQ5sW8n4J1b3D'; 
const BUCKET_ID = 'gt_exclusive_vault_esteban_final';
const API_URL = `https://kvdb.io/${CLOUD_KEY}/${BUCKET_ID}`;

class CloudStorageService {
  private cache: Bracelet[] = [];

  async getAllItems(): Promise<Bracelet[]> {
    try {
      // Intentamos traer datos de la nube
      const response = await fetch(API_URL, { 
        headers: { 'Accept': 'application/json' },
        cache: 'no-store' 
      });
      
      if (!response.ok) {
        if (response.status === 404) return this.getLocalBackup();
        throw new Error(`Cloud Status: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache = Array.isArray(data) ? data : [];
      
      // Actualizamos el respaldo local con lo que hay en la nube
      localStorage.setItem(`gt_backup_${BUCKET_ID}`, JSON.stringify(this.cache));
      return this.cache;
    } catch (error) {
      console.warn("Nube no disponible, cargando respaldo local...");
      return this.getLocalBackup();
    }
  }

  private getLocalBackup(): Bracelet[] {
    const local = localStorage.getItem(`gt_backup_${BUCKET_ID}`);
    return local ? JSON.parse(local) : [];
  }

  async saveItem(item: Bracelet): Promise<void> {
    const updatedList = [item, ...this.cache];
    
    try {
      // Intentamos guardar en la nube
      await this.syncWithCloud(updatedList);
      this.cache = updatedList;
    } catch (error) {
      // Si la nube falla, guardamos localmente para no perder el progreso
      this.cache = updatedList;
      localStorage.setItem(`gt_backup_${BUCKET_ID}`, JSON.stringify(updatedList));
      throw new Error("LocalOnly"); // Avisamos que solo se guardó localmente
    }
  }

  async deleteItem(id: string): Promise<void> {
    const updatedList = this.cache.filter(i => i.id !== id);
    try {
      await this.syncWithCloud(updatedList);
      this.cache = updatedList;
    } catch (error) {
      this.cache = updatedList;
      localStorage.setItem(`gt_backup_${BUCKET_ID}`, JSON.stringify(updatedList));
    }
  }

  private async syncWithCloud(data: Bracelet[]): Promise<void> {
    const response = await fetch(API_URL, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Fallo de sincronización");
    localStorage.setItem(`gt_backup_${BUCKET_ID}`, JSON.stringify(data));
  }
}

export const CloudStorage = new CloudStorageService();
