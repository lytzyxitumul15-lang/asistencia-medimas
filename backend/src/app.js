const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const marcajesRoutes = require('./routes/marcajes');
const adminRoutes = require('./routes/admin');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

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
app.use('/api/marcajes', marcajesRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  if (err.codigo && err.estado) {
    return res
      .status(err.estado)
      .json({ error: err.message, codigo: err.codigo, ...err.extra });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;