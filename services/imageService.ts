
/**
 * IMAGE CLOUD SERVICE (Cloudinary)
 * Sube las imágenes a un servidor externo para obtener un link público.
 */
export const ImageCloudService = {
  // CONFIGURACIÓN: 
  // 1. Crea cuenta en Cloudinary.com (Gratis)
  // 2. Cambia 'demo' por tu "Cloud Name" que aparece en tu panel.
  // 3. En la configuración de Cloudinary (Upload), crea un "Unsigned Upload Preset" llamado 'ml_default'.
  
  CLOUD_NAME: 'demo', // <-- CAMBIA 'demo' POR TU NOMBRE DE USUARIO DE CLOUDINARY

  async uploadImage(base64: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', base64);
    formData.append('upload_preset', 'ml_default');

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "Error al subir a la nube");
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Fallo crítico en subida de imagen:", error);
      throw new Error("No se pudo subir la imagen. Revisa tu configuración de Cloudinary.");
    }
  }
};
