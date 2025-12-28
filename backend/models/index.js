const sequelize = require('../config/db');
const Recipe = require('./Recipe');
const User = require('./User');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Define Relationships
User.hasMany(Recipe, { foreignKey: 'userId' });
Recipe.belongsTo(User, { foreignKey: 'userId' });

const parsePythonList = (str) => {
  if (!str) return [];
  try {
    return str.slice(1, -1).split("', '").map(s => s.replace(/'/g, "").trim());
  } catch (e) { return []; }
};

const parseNutrition = (str) => {
  if (!str) return {};
  try {
    const v = str.slice(1, -1).split(',').map(n => parseFloat(n.trim()));
    return { calories: v[0], totalFat: v[1], sugar: v[2], sodium: v[3], protein: v[4], satFat: v[5], carbs: v[6] };
  } catch (e) { return {}; }
};

const seedRecipes = async () => {
  const results = [];
  let count = 0;
  const LIMIT = 100; // Start with 100 to test. Increase to 5000 later!

  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '..', 'data', 'RAW_recipes.csv'))
      .pipe(csv())
      .on('data', (data) => {
        if (count < LIMIT) {
          results.push({
            name: data.name,
            minutes: parseInt(data.minutes) || 0,
            description: data.description || '',
            steps: parsePythonList(data.steps),
            ingredients: parsePythonList(data.ingredients),
            nutrition: parseNutrition(data.nutrition)
          });
          count++;
        }
      })
      .on('end', async () => {
        try {
          await Recipe.bulkCreate(results);
          console.log(`🎉 Successfully inserted ${results.length} recipes!`);
          resolve();
        } catch (error) {
          console.error('❌ Error inserting recipes:', error);
          reject(error);
        }
      })
      .on('error', reject);
  });
};

// Sync Function
const syncDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      // alter: true updates tables to match models without deleting data
      await sequelize.sync({ alter: true }); 
      console.log("✅ Database Synced & Relationships Established");

      // Check if recipes exist, if not, seed
      const recipeCount = await Recipe.count();
      if (recipeCount === 0) {
        console.log("🌱 No recipes found, seeding database...");
        await seedRecipes();
      } else {
        console.log(`📚 Found ${recipeCount} recipes in database`);
      }
      return; // Success
    } catch (error) {
      console.error(`❌ Sync Error (attempt ${i + 1}/${retries}):`, error.message);
      if (i < retries - 1) {
        console.log(`Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error("❌ Failed to sync database after all retries");
        throw error;
      }
    }
  }
};

module.exports = { sequelize, Recipe, User, syncDB };