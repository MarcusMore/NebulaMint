import { GoogleGenAI } from "@google/genai";
import { GenerationConfig } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateNFTImage = async (config: GenerationConfig): Promise<string> => {
  const ai = getAiClient();
  
  try {
    // Using gemini-2.5-flash-image for generation as per guidelines for general image tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: config.prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
        }
      }
    });

    let base64Image = '';

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          base64Image = `data:${mimeType};base64,${part.inlineData.data}`;
          break; // Stop after finding the first image
        }
      }
    }

    if (!base64Image) {
      throw new Error("No image data found in the response.");
    }

    return base64Image;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};