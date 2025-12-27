import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, BookOpen, LogIn, LogOut, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext); // Get user state
  
  return (
    <nav className="navbar glass">
      <div className="nav-container">
        <Link to="/" className="logo">
          Nebula<span className="highlight">9</span> 
        </Link>
        
        <div className="nav-links">
          <Link to="/browse" className={`nav-item ${location.pathname === '/browse' ? 'active' : ''}`}>
            <BookOpen size={18} />
            <span className="desktop-only">Browse</span>
          </Link>
          <Link to="/chef" className={`nav-item ${location.pathname === '/chef' ? 'active' : ''}`}>
            <ChefHat size={18} />
            <span className="desktop-only">Smart Chef</span>
          </Link>

          {/* AUTH LINKS */}
          {user ? (
            <div className="nav-user-group">
              <span className="username"><User size={16}/> {user.username}</span>
              <button onClick={logout} className="logout-btn" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              <LogIn size={18} /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;