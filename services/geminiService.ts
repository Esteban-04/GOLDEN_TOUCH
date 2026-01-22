
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const GeminiService = {
  async generateLuxuryDescription(name: string, weight: number, karats: number): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Eres un redactor experto en joyería de lujo para la marca "Golden Touch". 
        Escribe una descripción corta, elegante y sofisticada (en español) para una manilla de oro 
        llamada "${name}". Pesa ${weight} gramos y es de ${karats} quilates. 
        Enfócate en la exclusividad y el brillo.`
      });
      return response.text || "Una pieza única de nuestra colección exclusiva.";
    } catch (error) {
      console.error("Gemini failed", error);
      return "Exclusiva manilla de oro artesanal de la colección Golden Touch.";
    }
  },

  async analyzeImageAndSuggestName(base64Image: string): Promise<{ name: string; description: string }> {
    try {
      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image.split(',')[1] || base64Image,
        },
      };
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            imagePart,
            { text: "Analiza esta manilla de oro. Sugiere un nombre lujoso y una descripción corta y atractiva para un catálogo de alta gama." }
          ]
        }
      });
      
      // Attempt to parse out name and description from the text if possible, or just return the text
      const text = response.text || "";
      return {
        name: text.split('\n')[0].replace(/Nombre:|Name:/i, '').trim() || "Nueva Creación",
        description: text || "Una pieza de oro exquisita."
      };
    } catch (error) {
      console.error("Image analysis failed", error);
      return { name: "Manilla Exclusiva", description: "Diseño único de Golden Touch." };
    }
  }
};
