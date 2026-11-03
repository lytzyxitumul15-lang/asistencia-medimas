const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Empresa',
    {
      nombre: { type: DataTypes.STRING(150), allowNull: false },
      zona_horaria: {
        type: DataTypes.STRING(60),
        allowNull: false,
        defaultValue: 'America/Guatemala',
      },
      configuracion: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
    },
    { tableName: 'empresas', underscored: true }
  );