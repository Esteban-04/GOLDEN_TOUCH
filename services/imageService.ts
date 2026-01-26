
/**
 * IMAGE CLOUD SERVICE (Cloudinary)
 * Optimizado para subidas ultrarrápidas mediante compresión en el cliente
 */
export const ImageCloudService = {
  CLOUD_NAME: 'dko8rwuht', 

  /**
   * Comprime y redimensiona una imagen base64 para que pese muy poco antes de subirla
   */
  async compressImage(base64: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Tamaño máximo optimizado para catálogo de lujo (1080px)
        const MAX_SIZE = 1080;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64); // Fallback si falla el canvas
          return;
        }

        // Calidad 0.7 es perfecta para joyería: mucho menos peso, mismo brillo
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = () => resolve(base64);
    });
  },

  async uploadImage(base64: string): Promise<string> {
    // PASO 1: Compresión instantánea antes de subir
    const optimizedBase64 = await this.compressImage(base64);

    const formData = new FormData();
    formData.append('file', optimizedBase64);
    formData.append('upload_preset', 'ml_default');

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "Error en Cloudinary");
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error: any) {
      console.error("Fallo de imagen:", error);
      throw new Error(error.message || "Error al conectar con Cloudinary");
    }
  }
};
