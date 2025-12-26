const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  minutes: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  steps: {
    type: DataTypes.ARRAY(DataTypes.TEXT), 
    defaultValue: []
  },
  ingredients: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  nutrition: {
    type: DataTypes.JSONB, 
    defaultValue: {}
  }
});

module.exports = Recipe;