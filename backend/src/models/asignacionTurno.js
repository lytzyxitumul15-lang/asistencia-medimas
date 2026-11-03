const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'AsignacionTurno',
    {
      usuario_id: { type: DataTypes.INTEGER, allowNull: false },
      turno_id: { type: DataTypes.INTEGER, allowNull: false },
      vigente_desde: { type: DataTypes.DATEONLY, allowNull: false },
      vigente_hasta: { type: DataTypes.DATEONLY, allowNull: true },
    },
    { tableName: 'asignaciones_turno', underscored: true }
  );