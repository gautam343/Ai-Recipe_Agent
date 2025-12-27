import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Send, Loader2, Sparkles, ChefHat, Flame, Clock, 
  Save, ArrowLeft, CheckCircle, Share2, Plus, X, Lightbulb, XCircle, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast'; 
import { AuthContext } from '../context/AuthContext';
import ImageUpload from './ImageUpload';
import './SmartChef.css';

const SmartChef = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Input State
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredientsList, setIngredientsList] = useState([]);
  
  // Results State
  const [recipeOptions, setRecipeOptions] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // --- HANDLERS ---

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && ingredientInput.trim()) {
      e.preventDefault();
      addIngredient(ingredientInput.trim());
    }
  };

  const addIngredient = (ing) => {
    if (!ingredientsList.includes(ing)) {
      setIngredientsList([...ingredientsList, ing]);
    }
    setIngredientInput('');
  };

  const removeIngredient = (ing) => {
    setIngredientsList(ingredientsList.filter(item => item !== ing));
  };

  const handleImageIngredients = (detectedString) => {
    const newItems = detectedString.split(',').map(i => i.trim());
    const uniqueItems = newItems.filter(i => !ingredientsList.includes(i));
    setIngredientsList([...ingredientsList, ...uniqueItems]);
    toast.success(`Added ${uniqueItems.length} items from image! 📸`);
  };

  const handleGenerate = async () => {
    if (ingredientsList.length === 0) return;

    setLoading(true);
    setRecipeOptions([]);
    setSelectedRecipe(null);
    setChatHistory([]);

    try {
      const res = await fetch('http://localhost:5000/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingredientsList }),
      });

      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      
      if(Array.isArray(data)) {
        setRecipeOptions(data);
      } else {
        setRecipeOptions(data.results || []); 
      }
    } catch (err) {
      console.error(err);
      toast.error("Chef couldn't find recipes. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredientStatus = (ingredient, isMissing) => {
    if (!selectedRecipe) return;
    const newRecipe = JSON.parse(JSON.stringify(selectedRecipe));

    if (isMissing) {
      newRecipe.missing_ingredients = newRecipe.missing_ingredients.filter(i => i !== ingredient);
      newRecipe.ingredients_used = [...newRecipe.ingredients_used, ingredient];
      toast.success(`Marked ${ingredient} as found!`);
    } else {
      newRecipe.ingredients_used = newRecipe.ingredients_used.filter(i => i !== ingredient);
      newRecipe.missing_ingredients = [...newRecipe.missing_ingredients, ingredient];
    }
    
    setSelectedRecipe(newRecipe);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please login to save recipes!");
      return navigate('/login');
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/save-recipe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ recipe: selectedRecipe }),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success("Saved to Cookbook! 📖");
    } catch (err) {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this recipe: ${selectedRecipe.title}`);
    toast.success("Recipe name copied to clipboard!");
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
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I can't answer right now." }]);
    } finally {
      setIsChatting(false);
    }
  };

  const renderDetailView = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="detail-view"
    >
      <button className="back-btn" onClick={() => setSelectedRecipe(null)}>
        <ArrowLeft size={18} /> Back to Results
      </button>
      
      <div className="split-layout">
        <div className="recipe-panel">
          <div className="recipe-header-card">
            <div className="header-content">
              <h2>{selectedRecipe.title}</h2>
              <p className="recipe-subtitle">{selectedRecipe.description}</p>
              <div className="meta-pills">
                <span><Clock size={16}/> {selectedRecipe.time_minutes} min</span>
                <span><Flame size={16}/> {selectedRecipe.calories} kcal</span>
                <span><ChefHat size={16}/> {selectedRecipe.difficulty}</span>
              </div>
            </div>
            <div className="header-icon"><ChefHat size={60} strokeWidth={1} /></div>
          </div>

          <div className="recipe-body">
            <div className="section">
              <h3>Ingredients <span className="sub-hint">(Click to toggle)</span></h3>
              <ul className="interactive-list">
                {selectedRecipe.ingredients_used.map((ing, i) => (
                  <li key={`used-${i}`} className="ing-item found" onClick={() => toggleIngredientStatus(ing, false)}>
                    <CheckCircle className="icon-status" size={18} /> <span>{ing}</span>
                  </li>
                ))}
                {selectedRecipe.missing_ingredients.map((ing, i) => (
                  <li key={`missing-${i}`} className="ing-item missing" onClick={() => toggleIngredientStatus(ing, true)}>
                    <XCircle className="icon-status" size={18} /> <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="section">
              <h3>Instructions</h3>
              <div className="steps-container">
                {selectedRecipe.instructions.map((step, i) => (
                  <div key={i} className="step-item">
                    <div className="step-number">{i + 1}</div>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="chef-tip-box">
              <Lightbulb className="tip-icon" size={20} />
              <div><strong>Chef's Tip:</strong><p>Taste as you go!</p></div>
            </div>
            <div className="action-footer">
              {selectedRecipe.is_ai && (
                <button onClick={handleSave} className="action-btn primary" disabled={saving}>
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Recipe'}
                </button>
              )}
              <button onClick={handleShare} className="action-btn secondary"><Share2 size={18} /> Share</button>
            </div>
          </div>
        </div>

        <div className="chat-panel">
          <div className="chat-header-bar">
            <h3><Sparkles size={18} /> Chef Assistant</h3>
            <span className="status-dot"></span>
          </div>
          <div className="chat-window">
            {chatHistory.length === 0 && (
              <div className="empty-chat">
                <p>👋 Need help?</p>
                <div className="suggestions">
                  <span onClick={() => setChatInput("Can I substitute something?")}>"Substitutions?"</span>
                </div>
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.role}`}>{msg.content}</div>
            ))}
            {isChatting && <div className="chat-bubble assistant typing">Thinking...</div>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} className="chat-input-area">
            <input 
              type="text" placeholder="Ask about this recipe..." 
              value={chatInput} onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" disabled={isChatting}><Send size={18}/></button>
          </form>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="smart-chef-container">
      {!selectedRecipe && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="hero-section">
          <h1>What's in your <span className="gradient-text">Kitchen?</span></h1>
          <p>Add ingredients you have on hand and we'll create a recipe for you.</p>
        </motion.div>
      )}

      {!selectedRecipe && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="command-center">
          <div className="input-wrapper">
            <input 
              className="tag-input"
              type="text"
              placeholder="Type ingredients (e.g. Chicken)..." 
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="camera-trigger"><ImageUpload onIngredientsFound={handleImageIngredients} /></div>
          </div>
          <div className="quick-add">
            <span>Quick add:</span>
            {['Chicken', 'Rice', 'Tomatoes', 'Onion', 'Garlic'].map(item => (
              <button key={item} onClick={() => addIngredient(item)} className="pill-btn">{item} <Plus size={12}/></button>
            ))}
          </div>
          {ingredientsList.length > 0 && (
            <div className="tags-container">
              <div className="tags-list">
                {ingredientsList.map((ing, i) => (
                  <motion.span layout key={i} className="ingredient-tag">
                    {ing} <button onClick={() => removeIngredient(ing)}><X size={12}/></button>
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          <button className="generate-btn full-width" onClick={handleGenerate} disabled={loading || ingredientsList.length === 0}>
            {loading ? <Loader2 className="spin" /> : <><ChefHat size={18}/> Generate Recipe</>}
          </button>
        </motion.div>
      )}

      {/* --- RESULTS GRID WITH SOURCE LABELS --- */}
      {!selectedRecipe && recipeOptions.length > 0 && (
        <div className="results-grid">
          {recipeOptions.map((recipe, idx) => (
            <motion.div 
              key={recipe.id} 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: idx * 0.1 }} 
              className="recipe-card-clean" 
              onClick={() => setSelectedRecipe(recipe)}
            >
              <div className="clean-card-header">
                <div className="header-top-row">
                  {/* SOURCE BADGE ADDED HERE */}
                  <span className={`source-badge ${recipe.is_ai ? 'ai-source' : 'db-source'}`}>
                    {recipe.is_ai ? <><Sparkles size={10} fill="currentColor"/> AI Chef Special</> : <><BookOpen size={10}/> Cookbook Match</>}
                  </span>
                  <span className="clean-time-badge">⏱️ {recipe.time_minutes}m</span>
                </div>
                <h3>{recipe.title}</h3>
              </div>
              
              <p className="clean-card-desc">
                {recipe.description ? recipe.description.slice(0, 100) + '...' : "A delicious recipe based on your ingredients."}
              </p>
              
              <div className="clean-card-footer">
                <span className={`clean-diff-tag ${recipe.difficulty ? recipe.difficulty.toLowerCase() : 'medium'}`}>
                  {recipe.difficulty || 'Medium'}
                </span>
                <span className="clean-view-link">View Recipe &rarr;</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>{selectedRecipe && renderDetailView()}</AnimatePresence>
    </div>
  );
};

export default SmartChef;