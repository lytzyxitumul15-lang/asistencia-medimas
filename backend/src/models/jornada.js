const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Jornada',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      empresa_id: { type: DataTypes.INTEGER, allowNull: false },
      usuario_id: { type: DataTypes.INTEGER, allowNull: false },
      fecha: { type: DataTypes.DATEONLY, allowNull: false },
      turno_id: { type: DataTypes.INTEGER, allowNull: true },
      estado: { type: DataTypes.STRING(20), allowNull: false },
      hora_entrada: { type: DataTypes.DATE, allowNull: true },
      hora_salida: { type: DataTypes.DATE, allowNull: true },
      minutos_retraso: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      minutos_salida_anticipada: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      minutos_fuera: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      minutos_trabajados: { type: DataTypes.INTEGER, allowNull: true },
      cerrada: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      calculada_en: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'jornadas', underscored: true, timestamps: false }
  );