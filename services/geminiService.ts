import { GoogleGenAI } from "@google/genai";

// getGeminiResponse handles communication with the Gemini 3 model for the Crano AI assistant.
export const getGeminiResponse = async (prompt: string, context: string = "") => {
  // Always initialize GoogleGenAI with the API key from process.env inside the function to ensure the correct key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${context}\nUser Input: ${prompt}`,
      config: {
        // Fix: Moved system context to systemInstruction as per Gemini API best practices and guidelines.
        systemInstruction: `You are Crano AI, the brain behind a revolutionary ed-tech platform. 
      Crano's vision is: "Anyone can teach." We believe if you are good at something—even a niche skill—you should be able to teach it.
      We advocate for "Personalized Care" over the generalized methods of YouTube or massive online coaching. 
      We help students find 1-on-1 online teachers or small groups (max 4) to ensure no mind is left behind.
      
      Your goal is to help students find teachers, explain concepts simply (Cram less, understand more), or help parents understand why personalized online teaching is superior to local offline options.`,
        temperature: 0.7,
        topP: 0.9,
        // When setting maxOutputTokens, you must also provide a thinkingBudget to reserve tokens for output.
        maxOutputTokens: 500,
        thinkingConfig: { thinkingBudget: 100 },
      }
    });

    // The text property of the response directly contains the generated content.
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Something went wrong with the AI service. Please try again.";
  }
};