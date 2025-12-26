const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const Recipe = require('../models/Recipe');
const { Op } = require('sequelize');
require('dotenv').config();

// Initialize Gemini 1.5 Flash for speed and cost-efficiency
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
});

/**
 * FEATURE: SEMANTIC INGREDIENT EXPANSION
 * Uses AI to find synonyms (e.g., "Spuds" -> "Potatoes") so database search is smarter.
 */
async function expandIngredients(userIngredients) {
  const prompt = `
    You are an ingredient synonym expert.
    User Input: ${userIngredients.join(", ")}
    
    Task: Return a raw JSON array containing the original ingredients PLUS common culinary synonyms.
    Example: Input ["Cilantro", "Spuds"] -> Output ["Cilantro", "Coriander", "Spuds", "Potatoes"]
    
    Return ONLY JSON array. Do not add markdown formatting.
  `;

  try {
    const result = await model.invoke(prompt);
    const cleanJson = result.content.replace(/```json|```/g, '').trim();
    const expanded = JSON.parse(cleanJson);
    // Return unique set of ingredients
    return [...new Set([...userIngredients, ...expanded])];
  } catch (error) {
    console.warn("⚠️ Semantic expansion failed, using raw input.");
    return userIngredients;
  }
}

/**
 * MAIN SEARCH & GENERATION FUNCTION
 */
async function findOrGenerateRecipe(rawIngredients) {
  console.log(`🤖 Raw Input: [${rawIngredients}]`);

  // 1. SEMANTIC EXPANSION
  const expandedIngredients = await expandIngredients(rawIngredients);
  console.log(`🧠 Expanded Semantic Search: [${expandedIngredients}]`);

  // 2. FETCH CANDIDATES (Using Expanded List)
  const candidates = await Recipe.findAll({
    where: {
      ingredients: { [Op.overlap]: expandedIngredients }
    },
    limit: 50
  });

  // 3. JACCARD SCORING (Relevance Ranking)
  const scoredRecipes = candidates.map(recipe => {
    const recipeIngs = recipe.ingredients.map(i => i.toLowerCase());
    
    // We check against the RAW ingredients for the "Perfect Match" calculation (strict)
    // But we used EXPANDED to find them (semantic search)
    const userIngsLower = rawIngredients.map(i => i.toLowerCase());
    const expandedIngsLower = expandedIngredients.map(i => i.toLowerCase());

    // Intersection: What ingredients match?
    const intersection = recipeIngs.filter(ing => 
      expandedIngsLower.some(u => ing.includes(u) || u.includes(ing))
    );

    // Union: Total unique ingredients involved
    const union = new Set([...recipeIngs, ...userIngsLower]);
    
    // Jaccard Score (0.0 - 1.0)
    const score = intersection.length / union.size;

    return {
      source: "cookbook",
      data: recipe,
      score: score,
      matchCount: intersection.length
    };
  });

  // Sort by Score (Best Fit First)
  scoredRecipes.sort((a, b) => b.score - a.score);
  const bestDbMatches = scoredRecipes.slice(0, 3);
  
  // 4. AI GENERATION (Context-Aware)
  const cookbookTitles = bestDbMatches.map(r => r.data.title).join(", ");
  
  console.log(`✨ Generating AI Recipe with Context: [${cookbookTitles}]`);

  const prompt = `
    Create a recipe using these ingredients: ${rawIngredients.join(", ")}.
    Context (Similar items in user's cookbook): ${cookbookTitles || "None"}.
    
    Task: Create ONE detailed recipe.
    - If cookbook matches are good, suggest a creative variation using ONLY provided ingredients.
    - If matches are poor, invent a new dish that fits perfectly.
    - Assume basic pantry staples (Salt, Oil, Pepper, Water).
    
    Return raw JSON: 
    { "name": "Title", "minutes": 20, "difficulty": "Easy", "nutrition": {"calories": 300}, "steps": ["Step 1"], "ingredients": ["List used ingredients"], "description": "Why this is a good choice." }
  `;

  let aiRecommendation = null;
  try {
    const result = await model.invoke(prompt);
    const cleanJson = result.content.replace(/```json|```/g, '').trim();
    aiRecommendation = JSON.parse(cleanJson);
  } catch (e) { 
    console.error("AI Gen Failed", e); 
  }

  // Combine Results: AI first, then Database matches
  const finalResults = [];
  if (aiRecommendation) {
    finalResults.push({ source: "ai_generated", data: aiRecommendation, score: 1.0 });
  }
  finalResults.push(...bestDbMatches);

  return { results: finalResults };
}

/**
 * FEATURE: CHAT WITH RECIPE
 * Allows user to ask questions about a specific recipe context.
 */
async function chatWithRecipe(recipeContext, userQuestion, chatHistory) {
  const prompt = `
    You are a professional chef.
    
    CURRENT RECIPE CONTEXT:
    Title: ${recipeContext.title}
    Ingredients: ${recipeContext.ingredients.join(", ")}
    Instructions: ${recipeContext.instructions.join(". ")}

    CHAT HISTORY:
    ${chatHistory.map(m => `${m.role}: ${m.content}`).join("\n")}

    USER QUESTION: "${userQuestion}"

    Task: Answer the user's question specifically about THIS recipe. Keep it helpful, concise, and encouraging.
  `;

  try {
    const result = await model.invoke(prompt);
    return result.content;
  } catch (error) {
    console.error("Chat Error", error);
    return "I'm having trouble analyzing this recipe right now.";
  }
}

module.exports = { findOrGenerateRecipe, chatWithRecipe };