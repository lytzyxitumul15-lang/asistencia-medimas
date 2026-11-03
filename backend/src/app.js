const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();

app.set('trust proxy', 1);
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

app.use('/api/auth', authRoutes);

module.exports = app;