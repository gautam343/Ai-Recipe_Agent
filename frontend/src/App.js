import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import Navbar from './components/Navbar';
import Home from './components/Home';
import SmartChef from './components/SmartChef';
import RecipeList from './components/RecipeList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* The Toaster enables the popups to show anywhere in the app */}
        <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
        
        <Navbar />
        
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chef" element={<SmartChef />} />
            <Route path="/browse" element={<RecipeList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;