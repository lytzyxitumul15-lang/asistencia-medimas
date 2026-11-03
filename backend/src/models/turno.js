const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Turno',
    {
      empresa_id: { type: DataTypes.INTEGER, allowNull: false },
      sede_id: { type: DataTypes.INTEGER, allowNull: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      hora_entrada: { type: DataTypes.TIME, allowNull: false },
      hora_salida: { type: DataTypes.TIME, allowNull: false },
      dias_semana: { type: DataTypes.ARRAY(DataTypes.INTEGER), allowNull: false },
      tolerancia_min: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: 'turnos', underscored: true }
  );