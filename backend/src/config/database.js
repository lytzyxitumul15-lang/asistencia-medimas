require('dotenv').config();

const base = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: true } },
};

module.exports = {
  development: base,
  production: base,
};