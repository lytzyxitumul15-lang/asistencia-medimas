require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL_APP, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: true } },
  pool: { max: 5, min: 0, idle: 10000, acquire: 60000 },
  logging: false,
});

module.exports = sequelize;