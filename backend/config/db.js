const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true, // This tells Render we want a secure connection
        rejectUnauthorized: false // This fixes the self-signed certificate error often seen on cloud DBs
      }
    }
  }
);

module.exports = sequelize;