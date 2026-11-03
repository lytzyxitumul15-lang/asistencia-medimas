const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'MotivoSalida',
    {
      empresa_id: { type: DataTypes.INTEGER, allowNull: false },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      requiere_detalle: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'motivos_salida', underscored: true }
  );