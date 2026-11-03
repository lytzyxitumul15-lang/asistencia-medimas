const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Dispositivo',
    {
      usuario_id: { type: DataTypes.INTEGER, allowNull: false },
      device_id: { type: DataTypes.STRING(64), allowNull: false },
      vinculado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      user_agent: { type: DataTypes.STRING(300), allowNull: true },
      primer_uso: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      ultimo_uso: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'dispositivos', underscored: true }
  );