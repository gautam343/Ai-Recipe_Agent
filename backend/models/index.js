const sequelize = require('../config/db');
const Recipe = require('./Recipe');
const User = require('./User');

// Define Relationships
User.hasMany(Recipe, { foreignKey: 'userId' });
Recipe.belongsTo(User, { foreignKey: 'userId' });

// Sync Function
const syncDB = async () => {
  try {
    // alter: true updates tables to match models without deleting data
    await sequelize.sync({ alter: true }); 
    console.log("✅ Database Synced & Relationships Established");
  } catch (error) {
    console.error("❌ Sync Error:", error);
  }
};

module.exports = { sequelize, Recipe, User, syncDB };