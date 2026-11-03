const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const sequelize = require('./config/db');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await sequelize.query('SELECT 1');
    res.json({ ok: true, bd: true, hora: new Date().toISOString() });
  } catch (e) {
    console.error('Fallo en /health:', e.message);
    res.status(503).json({ ok: false, bd: false });
  }
});

module.exports = app;