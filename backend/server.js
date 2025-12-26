require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 1. IMPORT SEQUELIZE DIRECTLY (Renamed from connectDB to sequelize)
const sequelize = require('./config/db'); 
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// 2. CONNECT TO DATABASE CORRECTLY
// Since 'sequelize' is an object, we use .authenticate() to test the connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
    // Optional: Sync models (create tables if they don't exist)
    return sequelize.sync(); 
  })
  .then(() => {
    console.log('📦 Models synced');
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
  });

// Routes
app.use('/api', recipeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});