
import { GoogleGenAI, Type } from "@google/genai";
import { WasteAnalysis, WasteType, WasteSeverity } from "../types";

export const analyzeWaste = async (
  imageB64?: string,
  userDescription?: string
): Promise<WasteAnalysis> => {
  // Requirement: Create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use gemini-3-flash-preview for general-purpose urban waste analysis tasks
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this urban waste complaint. 
    User Description: ${userDescription || "No description provided."}
    Identify the primary waste type, estimate the severity/urgency, and provide a summary.
  `;

  const parts: any[] = [{ text: prompt }];
  
  if (imageB64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageB64.split(',')[1] || imageB64
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: "The primary type of waste detected",
            enum: Object.values(WasteType)
          },
          severity: {
            type: Type.STRING,
            description: "Urgency of the cleanup",
            enum: Object.values(WasteSeverity)
          },
          description: {
            type: Type.STRING,
            description: "A short technical description of the situation"
          },
          estimatedVolume: {
            type: Type.STRING,
            description: "Estimated size/volume (e.g., Small bag, Large pile, Truckload)"
          },
          actionRequired: {
            type: Type.STRING,
            description: "Specific action recommended for the cleanup crew"
          }
        },
        required: ["type", "severity", "description", "estimatedVolume", "actionRequired"]
      }
    }
  });

  // Extracting text output from GenerateContentResponse: use .text property directly.
  const jsonStr = (response.text || "").trim();
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI analysis did not return valid JSON:", jsonStr);
    // Return a safe fallback to prevent the application from crashing
    return {
      type: WasteType.OTHER,
      severity: WasteSeverity.MEDIUM,
      description: "Automated analysis was inconclusive. View user details for info.",
      estimatedVolume: "Not determined",
      actionRequired: "On-site verification needed."
    };
  }
};
