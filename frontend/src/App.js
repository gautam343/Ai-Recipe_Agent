import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import SmartChef from './components/SmartChef';
import RecipeList from './components/RecipeList';
import Login from './components/Login';
import Register from './components/Register';

// Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
          <Navbar />
          
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chef" element={<SmartChef />} />
              <Route path="/browse" element={<RecipeList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;