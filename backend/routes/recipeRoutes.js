const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { findOrGenerateRecipe, chatWithRecipe } = require('../services/smartChefAgent');

// ROUTE 1: GET ALL RECIPES (For Browse All)
router.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Server Error fetching recipes" });
  }
});

// ROUTE 2: GENERATE RECIPES (AI Agent)
router.post('/generate-recipe', async (req, res) => {
  try {
    // REMOVED: mealType from destructuring
    const { ingredients } = req.body;
    
    // Normalize input
    const userIngredients = ingredients.map(i => i.toLowerCase().trim());

    // Call Agent (No 2nd argument needed anymore)
    const agentResponse = await findOrGenerateRecipe(userIngredients);
    
    if (!agentResponse.results || agentResponse.results.length === 0) {
      return res.status(500).json({ message: "No recipes found." });
    }

    // Format Data for Frontend
    const formattedOptions = agentResponse.results.map((opt, index) => {
      const data = opt.data;
      const isAI = opt.source === 'ai_generated';

      let missing = [];
      let used = [];

      if (isAI) {
        used = data.ingredients; 
      } else {
        const recipeIngredients = data.ingredients || [];
        
        used = recipeIngredients.filter(ing => 
          userIngredients.some(u => ing.toLowerCase().includes(u) || u.includes(ing.toLowerCase()))
        );

        missing = recipeIngredients.filter(ing => 
          !userIngredients.some(u => ing.toLowerCase().includes(u) || u.includes(ing.toLowerCase()))
        );
      }

      return {
        id: data.id || `ai-gen-${index}`,
        source: isAI ? '✨ AI Chef Special' : '📖 Cookbook Match',
        is_ai: isAI,
        title: data.name || data.title || "Untitled Recipe",
        time_minutes: data.minutes || data.time || 20,
        calories: data.nutrition?.calories || "N/A",
        difficulty: data.difficulty || "Medium",
        description: data.description || "A delicious option based on your ingredients.",
        ingredients_used: used,
        missing_ingredients: missing, 
        instructions: data.steps || data.instructions || []
      };
    });

    res.json(formattedOptions);

  } catch (error) {
    console.error("❌ Route Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ROUTE 3: CHAT WITH RECIPE
router.post('/chat-recipe', async (req, res) => {
  try {
    const { recipe, question, history } = req.body;
    
    const recipeContext = {
      title: recipe.title,
      ingredients: recipe.ingredients_used,
      instructions: recipe.instructions
    };

    const answer = await chatWithRecipe(recipeContext, question, history || []);
    res.json({ answer });

  } catch (error) {
    console.error("Chat Route Error:", error);
    res.status(500).json({ message: "Chat failed" });
  }
});

module.exports = router;