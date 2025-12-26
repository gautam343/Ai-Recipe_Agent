const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const sequelize = require('./config/db');
const Recipe = require('./models/Recipe');

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

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Database');
    await Recipe.sync({ force: true }); 

    fs.createReadStream(path.join(__dirname, 'data', 'RAW_recipes.csv'))
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
        await Recipe.bulkCreate(results);
        console.log(`🎉 Successfully inserted ${results.length} recipes!`);
        process.exit();
      });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedRecipes();