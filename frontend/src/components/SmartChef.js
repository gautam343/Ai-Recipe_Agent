import React, { useState, useRef, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import './SmartChef.css';

const SmartChef = () => {
  // --- STATE ---
  const [ingredients, setIngredients] = useState('');
  const [recipeOptions, setRecipeOptions] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false); // NEW: Saving state

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // --- HANDLERS ---
  const handleImageIngredients = (detectedIngredients) => {
    setIngredients((prev) => 
      prev.trim() ? `${prev}, ${detectedIngredients}` : detectedIngredients
    );
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!ingredients.trim()) return;
    setLoading(true);
    setError('');
    setRecipeOptions([]);
    setSelectedRecipe(null);
    setChatHistory([]); 

    try {
      const res = await fetch('http://localhost:5000/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingredients.split(',').map(i => i.trim()) }),
      });
      if (!res.ok) throw new Error('Failed to fetch recipes');
      const data = await res.json();
      setRecipeOptions(data);
    } catch (err) {
      setError('The Chef is confused. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Save Handler
  const handleSave = async () => {
    if (!selectedRecipe) return;
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/save-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe: selectedRecipe }),
      });
      
      if (!res.ok) throw new Error('Save failed');
      alert("Recipe Saved! Check 'Browse All' to see it.");
    } catch (err) {
      alert("Failed to save recipe. Is the database running?");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', content: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe: selectedRecipe,
          question: userMsg.content,
          history: chatHistory
        }),
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I can't answer that right now." }]);
    } finally {
      setIsChatting(false);
    }
  };

  // --- VIEWS ---
  const renderRecipeList = () => (
    <div className="recipe-grid fade-in">
      <h3>Found {recipeOptions.length} Options for You:</h3>
      <div className="cards-container">
        {recipeOptions.map((recipe) => (
          <div key={recipe.id} className="recipe-preview-card" onClick={() => { setSelectedRecipe(recipe); setChatHistory([]); }}>
            <div className={`badge ${recipe.is_ai ? 'badge-ai' : 'badge-db'}`}>
              {recipe.source}
            </div>
            <h4>{recipe.title}</h4>
            
            {!recipe.is_ai && recipe.missing_ingredients.length > 0 ? (
              <div className="missing-alert">
                <strong>Missing {recipe.missing_ingredients.length} items:</strong>
                <p>{recipe.missing_ingredients.slice(0, 3).join(', ')}...</p>
              </div>
            ) : (
              <div className="match-alert">✅ Ready to Cook!</div>
            )}

            <div className="preview-meta">
              <span>⏱️ {recipe.time_minutes}m</span>
              <span>🔥 {recipe.calories}</span>
            </div>
            <button className="view-btn">View Recipe &rarr;</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetailView = () => (
    <div className="recipe-detail-wrapper fade-in">
      <button className="back-btn" onClick={() => setSelectedRecipe(null)}>&larr; Back to Options</button>
      
      <div className="detail-split-layout">
        <div className="recipe-content-panel">
          <div className="recipe-header">
            <h2>{selectedRecipe.title}</h2>
            
            {/* NEW: Save Button (Only for AI recipes that aren't saved yet) */}
            {selectedRecipe.is_ai && (
              <button 
                onClick={handleSave} 
                className="save-btn" 
                disabled={saving}
              >
                {saving ? 'Saving...' : '❤️ Save to Cookbook'}
              </button>
            )}

            <div className="recipe-meta">
              <span>⏱️ {selectedRecipe.time_minutes} mins</span>
              <span>🔥 {selectedRecipe.calories} kcal</span>
              <span>📊 {selectedRecipe.difficulty}</span>
            </div>
            <p className="recipe-desc">{selectedRecipe.description}</p>
          </div>

          <div className="recipe-body">
            <div className="ingredients">
              <h3>🛒 Ingredients</h3>
              <ul className="used-list">
                {selectedRecipe.ingredients_used.map((ing, i) => (
                  <li key={i}>✅ {ing}</li>
                ))}
              </ul>
              {selectedRecipe.missing_ingredients.length > 0 && (
                <>
                  <h4 className="missing-title">⚠️ You Need:</h4>
                  <ul className="missing-list">
                    {selectedRecipe.missing_ingredients.map((ing, i) => (
                      <li key={i}>❌ {ing}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="instructions">
              <h3>📝 Instructions</h3>
              <ol>
                {selectedRecipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="chat-panel">
          <div className="chat-header">
            <h3>💬 Chef Assistant</h3>
            <p>Ask about specific steps or subs!</p>
          </div>
          <div className="chat-window">
            {chatHistory.length === 0 && (
              <div className="chat-placeholder">
                <p>Try asking:</p>
                <span>"Can I substitute butter?"</span>
                <span>"Is this spicy?"</span>
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {isChatting && <div className="chat-bubble assistant">Thinking...</div>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} className="chat-input-area">
            <input 
              type="text" 
              placeholder="Ask a question..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" disabled={isChatting}>➤</button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="smart-chef-container">
      <header className="chef-header">
        <h1>👨‍🍳 SmartChef AI</h1>
        <p>Turn your fridge leftovers into a gourmet meal.</p>
      </header>

      {!selectedRecipe && (
        <form onSubmit={handleGenerate} className="chef-form">
          <ImageUpload onIngredientsFound={handleImageIngredients} />
          <textarea 
            placeholder="Enter ingredients (e.g. Chicken, Spuds, Garlic)..." 
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
          <div className="form-actions">
            <button disabled={loading}>
              {loading ? 'Chef is thinking...' : 'Find Recipes 🍳'}
            </button>
          </div>
        </form>
      )}

      {error && <div className="error-msg">{error}</div>}
      {selectedRecipe ? renderDetailView() : (recipeOptions.length > 0 && renderRecipeList())}
    </div>
  );
};

export default SmartChef;