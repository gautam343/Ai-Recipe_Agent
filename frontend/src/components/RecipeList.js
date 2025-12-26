import React, { useEffect, useState } from 'react';
import './RecipeList.css';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recipes');
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError('Failed to load cookbook. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER 1: Safe Data Parser ---
  // Fixes issue where DB returns string "['item']" instead of array ['item']
  const parseList = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        // Replace python-style single quotes if necessary and parse
        return JSON.parse(data.replace(/'/g, '"'));
      } catch (e) {
        return data.split(',').map(s => s.trim()); // Fallback split
      }
    }
    return [];
  };

  // --- HELPER 2: Dynamic Difficulty ---
  // Calculates difficulty if missing from DB
  const getDifficulty = (recipe) => {
    if (recipe.difficulty) return recipe.difficulty;
    const steps = parseList(recipe.steps || recipe.instructions);
    if (steps.length <= 5) return "Easy";
    if (steps.length <= 12) return "Medium";
    return "Hard";
  };

  // --- HELPER 3: Title Case ---
  // "arriba baked squash" -> "Arriba Baked Squash"
  const toTitleCase = (str) => {
    if (!str) return "Untitled Recipe";
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  // --- VIEW 1: RECIPE DETAILS ---
  if (selectedRecipe) {
    const ingredients = parseList(selectedRecipe.ingredients);
    const instructions = parseList(selectedRecipe.steps || selectedRecipe.instructions);

    return (
      <div className="recipe-list-container fade-in">
        <button className="back-btn" onClick={() => setSelectedRecipe(null)}>
          &larr; Back to Cookbook
        </button>

        <div className="detail-card">
          <div className="detail-header">
            <h2>{toTitleCase(selectedRecipe.name || selectedRecipe.title)}</h2>
            <div className="detail-meta">
              <span>⏱️ {selectedRecipe.minutes || selectedRecipe.time || 15}m</span>
              <span>📊 {getDifficulty(selectedRecipe)}</span>
              {selectedRecipe.nutrition?.calories && <span>🔥 {selectedRecipe.nutrition.calories} kcal</span>}
            </div>
            <p className="detail-desc">{selectedRecipe.description}</p>
          </div>

          <div className="detail-body">
            <div className="col-ingredients">
              <h3>🛒 Ingredients</h3>
              <ul>
                {ingredients.map((ing, i) => (
                  <li key={i}>{toTitleCase(ing)}</li>
                ))}
              </ul>
            </div>
            <div className="col-instructions">
              <h3>📝 Instructions</h3>
              <ol>
                {instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: RECIPE GRID ---
  return (
    <div className="recipe-list-container">
      <header className="list-header">
        <h1>📖 Community Cookbook</h1>
        <p>Explore {recipes.length} recipes saved by the community.</p>
      </header>

      {loading && <div className="loading">Loading recipes...</div>}
      {error && <div className="error">{error}</div>}

      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card" onClick={() => setSelectedRecipe(recipe)}>
            <div className="card-header">
              <h3>{toTitleCase(recipe.name || recipe.title)}</h3>
              <span className="time-badge">
                ⏱️ {recipe.minutes || recipe.time || '?'}m
              </span>
            </div>
            
            <p className="card-desc">
              {recipe.description ? recipe.description.slice(0, 100) + '...' : "Delicious homemade recipe."}
            </p>
            
            <div className="card-footer">
              <span className={`diff-tag ${getDifficulty(recipe).toLowerCase()}`}>
                {getDifficulty(recipe)}
              </span>
              <span className="view-link">View Recipe &rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeList;