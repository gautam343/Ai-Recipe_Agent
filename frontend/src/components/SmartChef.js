import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Loader2, Sparkles, ChefHat, Flame, Clock, 
  Save, BookOpen, ArrowLeft, CheckCircle, AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast'; 
import ImageUpload from './ImageUpload';
import './SmartChef.css';

const SmartChef = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipeOptions, setRecipeOptions] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleImageIngredients = (detectedIngredients) => {
    setIngredients((prev) => 
      prev.trim() ? `${prev}, ${detectedIngredients}` : detectedIngredients
    );
    toast.success("Ingredients detected! 🍅");
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
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
        body: JSON.stringify({ 
          ingredients: ingredients.split(',').map(i => i.trim()) 
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRecipeOptions(data);
    } catch (err) {
      setError('The Chef is confused. Please try again.');
      toast.error("Chef couldn't find recipes. Try again.");
    } finally {
      setLoading(false);
    }
  };

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
      toast.success("Recipe Saved to Cookbook! 📖");
    } catch (err) {
      toast.error("Failed to save recipe.");
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
          <div className="panel-header">
            <div className="header-top">
              <h2>{selectedRecipe.title}</h2>
              {selectedRecipe.is_ai && (
                <button onClick={handleSave} className="save-btn" disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
            <div className="stats-row">
              <span className="stat"><Clock size={16} /> {selectedRecipe.time_minutes} min</span>
              <span className="stat"><Flame size={16} /> {selectedRecipe.calories} kcal</span>
              <span className="stat badge">{selectedRecipe.difficulty}</span>
            </div>
            <p className="desc">{selectedRecipe.description}</p>
          </div>

          <div className="recipe-body">
            <div className="section">
              <h3><BookOpen size={18} /> Ingredients</h3>
              <ul className="ingredient-list">
                {selectedRecipe.ingredients_used.map((ing, i) => (
                  <li key={i} className="found"><CheckCircle size={14} /> {ing}</li>
                ))}
                {selectedRecipe.missing_ingredients.map((ing, i) => (
                  <li key={i} className="missing"><AlertTriangle size={14} /> {ing}</li>
                ))}
              </ul>
            </div>
            <div className="section">
              <h3><ChefHat size={18} /> Instructions</h3>
              <ol className="instruction-list">
                {selectedRecipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
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
                  <span>"Can I substitute butter?"</span>
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
              type="text" placeholder="Ask the Chef..." 
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
          <h1>Turn Leftovers into <span className="gradient-text">Masterpieces</span></h1>
          <p>The AI-powered sous-chef that lives in your kitchen.</p>
        </motion.div>
      )}

      {!selectedRecipe && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="command-center">
          <div className="input-container">
            <textarea 
              placeholder="Type ingredients (e.g. Chicken, Tomato) or click the camera..." 
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
            <div className="input-actions">
              <ImageUpload onIngredientsFound={handleImageIngredients} />
            </div>
          </div>
          
          <div className="action-row">
            <button className="generate-btn full-width" onClick={handleGenerate} disabled={loading || !ingredients.trim()}>
              {loading ? <Loader2 className="spin" /> : <><Sparkles size={18}/> Find Recipes</>}
            </button>
            {error && <span className="error-text">{error}</span>}
          </div>
        </motion.div>
      )}

      {!selectedRecipe && recipeOptions.length > 0 && (
        <div className="results-grid">
          {recipeOptions.map((recipe, idx) => (
            <motion.div 
              key={recipe.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: idx * 0.1 }} className="recipe-card" onClick={() => setSelectedRecipe(recipe)}
            >
              <div className={`card-badge ${recipe.is_ai ? 'ai' : 'db'}`}>
                {recipe.is_ai ? <Sparkles size={12}/> : <BookOpen size={12}/>} {recipe.source}
              </div>
              <div className="card-image-placeholder"></div>
              <div className="card-content">
                <h3>{recipe.title}</h3>
                {!recipe.is_ai && recipe.missing_ingredients.length > 0 ? (
                  <div className="missing-pill">Missing {recipe.missing_ingredients.length} items</div>
                ) : (
                  <div className="ready-pill"><CheckCircle size={12}/> Ready to Cook</div>
                )}
                <div className="card-meta">
                  <span><Clock size={14}/> {recipe.time_minutes}m</span>
                  <span><Flame size={14}/> {recipe.calories}</span>
                </div>
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