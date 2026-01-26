
/**
 * IMAGE CLOUD SERVICE (Cloudinary)
 * Conexión con la cuenta personal de Esteban (dko8rwuht)
 */
export const ImageCloudService = {
  // Cloud Name extraído de tu captura de pantalla
  CLOUD_NAME: 'dko8rwuht', 

  async uploadImage(base64: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', base64);
    
    // IMPORTANTE: Asegúrate de crear el preset 'ml_default' en modo 'Unsigned' 
    // en los ajustes de Cloudinary (explicado abajo).
    formData.append('upload_preset', 'ml_default');

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        // Si sale error aquí, es porque falta el 'upload_preset' en Cloudinary
        throw new Error(errData.error?.message || "Error de configuración en Cloudinary");
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error: any) {
      console.error("Fallo de imagen:", error);
      throw new Error(error.message || "Error al conectar con Cloudinary");
    }
  }
};
