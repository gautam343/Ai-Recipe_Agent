const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Recipe } = require('../models'); // Import from models/index.js to ensure relationship awareness
const { findOrGenerateRecipe, chatWithRecipe } = require('../services/smartChefAgent');
const { analyzeImage } = require('../services/visionAgent');
const { protect } = require('../middleware/authMiddleware'); // Import Auth Middleware

// Configure Multer
const upload = multer({ storage: multer.memoryStorage() });

// --- ROUTE 1: GET ALL RECIPES (Public) ---
router.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Server Error fetching recipes" });
  }
});

// --- ROUTE 2: SAVE RECIPE (PROTECTED) ---
router.post('/save-recipe', protect, async (req, res) => {
  try {
    const { recipe } = req.body;

    // We now have access to req.user.id because of the 'protect' middleware
    const newRecipe = await Recipe.create({
      userId: req.user.id, // <--- Link recipe to the logged-in user
      
      name: recipe.title || "Untitled Recipe",
      ingredients: recipe.ingredients_used,
      instructions: recipe.instructions,
      minutes: recipe.time_minutes || 15,
      difficulty: recipe.difficulty,
      description: recipe.description,
      calories: recipe.calories
    });

    res.json({ message: "Recipe saved!", id: newRecipe.id });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ message: "Failed to save recipe", error: error.message });
  }
});

// --- ROUTE 3: ANALYZE IMAGE ---
router.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });
    const ingredients = await analyzeImage(req.file.buffer, req.file.mimetype);
    res.json({ ingredients });
  } catch (error) {
    console.error("Route Error:", error);
    res.status(500).json({ message: "Failed to analyze image" });
  }
});

// --- ROUTE 4: GENERATE RECIPE ---
router.post('/generate-recipe', async (req, res) => {
  try {
    const { ingredients } = req.body;
    const userIngredients = ingredients.map(i => i.toLowerCase().trim());
    const agentResponse = await findOrGenerateRecipe(userIngredients);
    
    if (!agentResponse.results || agentResponse.results.length === 0) {
      return res.status(500).json({ message: "No recipes found." });
    }

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
    console.error("Route Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// --- ROUTE 5: CHAT WITH RECIPE ---
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