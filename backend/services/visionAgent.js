const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeImage(imageBuffer, mimeType) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // STRICT PROMPT to ensure only CSV format
    const prompt = `
      Analyze this image and identify the food ingredients present.
      Output Rule: Return ONLY a comma-separated list of ingredients. 
      Do NOT write full sentences. Do NOT add bullet points.
      Example Output: Chicken, Garlic, Tomato, Onion
    `;
    
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: mimeType,
      },
    };

    console.log("👀 Vision Agent analyzing...");
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Clean up any accidental periods or newlines
    const cleanText = text.replace(/\n/g, "").replace(/\./g, "").trim();

    console.log("✅ Detected:", cleanText);
    return cleanText;
  } catch (error) {
    console.error("❌ Vision Error:", error);
    return ""; // Return empty string on failure so app doesn't crash
  }
}

module.exports = { analyzeImage };