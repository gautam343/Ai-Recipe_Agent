import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, BookOpen } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar glass">
      <div className="nav-container">
        <Link to="/" className="logo">
          Nebula<span className="highlight">9</span> 🚀
        </Link>
        
        <div className="nav-links">
          <Link to="/browse" className={`nav-item ${location.pathname === '/browse' ? 'active' : ''}`}>
            <BookOpen size={18} />
            <span>Browse All</span>
          </Link>
          <Link to="/chef" className={`nav-item ${location.pathname === '/chef' ? 'active' : ''}`}>
            <ChefHat size={18} />
            <span>Smart Chef</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;