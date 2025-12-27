import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Sparkles, ChefHat, BookOpen, ArrowRight, Database } from 'lucide-react'; // Added Database icon
import './Home.css';

const Home = () => {
  // ... (keep animation variants: fadeInUp, stagger) ...
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  const stagger = {
    visible: { transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="home-container">
      {/* 1. HERO SECTION */}
      <section className="hero">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="hero-content">
          {/* UPDATE 1: Changed to Gemini 2.5 */}
          <div className="badge-pill">Powered by Gemini 2.5</div>
          <h1>
            The Sous-Chef that <br />
            <span className="gradient-text">Lives in Your Pocket</span>
          </h1>
          {/* ... keep rest of hero ... */}
          <p className="hero-sub">
            Don't let ingredients go to waste. Snap a photo of your fridge, 
            and let our AI craft a gourmet recipe in seconds.
          </p>
          <div className="cta-group">
            <Link to="/chef" className="btn-primary">
              <Sparkles size={18} /> Start Cooking
            </Link>
            <Link to="/browse" className="btn-secondary">
              View Cookbook <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. HOW IT WORKS (Keep as is) */}
      <section className="how-it-works">
         {/* ... (keep existing code) ... */}
         <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <h2>How AI Chef Works</h2>
          <div className="steps-grid">
            <motion.div variants={fadeInUp} className="step-card">
              <div className="icon-box purple"><Camera size={24} /></div>
              <h3>1. Snap & Scan</h3>
              <p>Upload a photo of your open fridge or pantry. Our Vision AI identifies ingredients instantly.</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="step-card">
              <div className="icon-box pink"><Sparkles size={24} /></div>
              <h3>2. AI Magic</h3>
              <p>We analyze flavors, textures, and cooking times to generate a custom recipe just for you.</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="step-card">
              <div className="icon-box orange"><ChefHat size={24} /></div>
              <h3>3. Cook & Chat</h3>
              <p>Follow step-by-step instructions. Confused? Chat with the recipe to ask for substitutes.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 3. FEATURES & DATASET CREDIT */}
      <section className="features-split">
        <div className="feature-text">
          <h2>Not just AI. A Full Culinary Library.</h2>
          <p>
            Nebula9 isn't just a generator. It's a comprehensive cookbook manager.
            Browse thousands of community recipes, save your AI creations, and build
            your personal digital cookbook.
          </p>
          <ul className="feature-list">
            <li><BookOpen size={16} /> Access 500+ verified recipes</li>
            <li><Sparkles size={16} /> Save AI favorites permanently</li>
            {/* UPDATE 2: Added Kaggle Mention */}
            <li><Database size={16} /> Dataset sourced from Food.com (Kaggle)</li>
          </ul>
        </div>
        <div className="feature-visual">
          <div className="floating-card c1">🥗</div>
          <div className="floating-card c2">🥩</div>
          <div className="floating-card c3">🍰</div>
        </div>
      </section>
      
      {/* Optional Footer Line */}
      <footer style={{ textAlign: 'center', padding: '20px', color: '#b2bec3', fontSize: '0.8rem' }}>
        <p>Built with React, Node.js & Google Gemini 2.5 • Data via Kaggle</p>
      </footer>
    </div>
  );
};

export default Home;