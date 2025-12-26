import React, { useState } from 'react';
import RecipeList from './components/RecipeList';
import SmartChef from './components/SmartChef';
import './App.css'; 

function App() {
  const [view, setView] = useState('landing'); // 'landing', 'browse', 'chef'

  return (
    <div className="app-container" style={{ justifyContent: view === 'landing' ? 'center' : 'flex-start' }}>
      
      {/* Header (Always visible unless on landing) */}
      {view !== 'landing' && (
        <div className="nav-header">
           <h2 onClick={() => setView('landing')} style={{cursor: 'pointer'}}>Nebula9 🚀</h2>
           <button onClick={() => setView('browse')}>Browse All</button>
           <button onClick={() => setView('chef')}>Smart Chef</button>
        </div>
      )}

      {/* VIEW 1: Landing Page */}
      {view === 'landing' && (
        <div className="landing-content">
          <h1 className="title">Nebula9 Recipe App 🚀</h1>
          <p className="subtitle">AI-Powered Meal Planning made simple.</p>
          
          <div className="button-group">
            <button className="search-btn" onClick={() => setView('browse')}>
              📖 Browse Recipes
            </button>
            <div style={{width: '20px', display:'inline-block'}}></div>
            <button className="search-btn" style={{background: '#7c3aed'}} onClick={() => setView('chef')}>
              👨‍🍳 Ask AI Chef
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: Browse All */}
      {view === 'browse' && <RecipeList />}

      {/* VIEW 3: Smart Chef */}
      {view === 'chef' && <SmartChef />}

    </div>
  );
}

export default App;