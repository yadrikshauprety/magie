import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function getGeminiResponse(userReaction: string) {
  if (!genAI) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are the "MASALA ROASTER" - a savage, chaotic, and hilarious narrator for an Indian game called "Masala Pitch Game".
    The player is in a crisis: it's 2:14 AM, they are broke, and their Maggi drawer is EMPTY.
    
    The player just reacted with: "${userReaction}"
    
    Your job is to ROAST the player's reaction. Be savage. Use Hinglish (Hindi + English). 
    Talk about Maggi, tastemakers, hostel struggles, and how pathetic/dramatic the player is being.
    Think Ashneer Grover meets a hostel warden on energy drinks.
    
    Return the response as a JSON array of beats (max 3). Each beat must have:
    - speaker: "narrator" or "pitcher"
    - text: the dialogue (make it punchy and funny)
    - mood: (for pitcher only) "shock", "cry", "confident", "nervous"
    
    Example vibe:
    "Bhai, 12 rupaye ki Maggi ke liye itna rona? Itna toh Ashneer bhi 100 crore lose karke nahi roya!"
    "Drawer khaali hai ya tera future? Tastemaker ki khushboo se hi kaam chala le ab."

    IMPORTANT: ONLY return the JSON array. No extra text.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON from the response
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [{ speaker: "narrator", text: text }];
  } catch (error: any) {
    console.error("Gemini API error:", error);
    const msg = error.message?.includes("404") ? "Model not found (404). Try gemini-pro?" : 
                error.message?.includes("403") ? "API Key error (403). Check your key!" :
                "Even the AI is speechless. (Check console)";
    return [{ speaker: "narrator", text: msg }];
  }
}
