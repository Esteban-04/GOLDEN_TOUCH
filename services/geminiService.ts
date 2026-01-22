
import { GoogleGenAI } from "@google/genai";

// Verificamos de forma segura si el objeto process y env existen para evitar crashes
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const GeminiService = {
  async generateLuxuryDescription(name: string, weight: number, karats: number): Promise<string> {
    const key = getApiKey();
    if (!key) return `Exclusiva manilla de oro de ${karats}K, con un peso de ${weight}g. Una pieza artesanal de Golden Touch.`;

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
      return `Manilla de oro de alta gama (${karats}K) con acabados de lujo.`;
    }
  },

  async analyzeImageAndSuggestName(base64Image: string): Promise<{ name: string; description: string }> {
    const key = getApiKey();
    if (!key) return { name: "Manilla de Oro", description: "Nueva incorporación a nuestra colección exclusiva." };

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
            { text: "Analiza esta manilla de oro. Sugiere un nombre lujoso de 2 o 3 palabras y una descripción corta y atractiva para un catálogo de alta gama." }
          ]
        }
      });
      
      const text = response.text || "";
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      
      return {
        name: lines[0]?.replace(/Nombre:|Name:|\*\*/gi, '').trim() || "Nueva Creación",
        description: text.length > 100 ? text.substring(0, 200) + '...' : text
      };
    } catch (error) {
      console.error("Image analysis failed", error);
      return { name: "Manilla Exclusiva", description: "Diseño único de Golden Touch, trabajado en oro de 18k." };
    }
  }
};
