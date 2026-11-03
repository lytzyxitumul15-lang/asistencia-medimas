const { DataTypes } = require('sequelize');

const bloquear = () => {
  throw new Error('marcajes es de solo inserción');
};

module.exports = (sequelize) =>
  sequelize.define(
    'Marcaje',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      empresa_id: { type: DataTypes.INTEGER, allowNull: false },
      usuario_id: { type: DataTypes.INTEGER, allowNull: false },
      sede_id: { type: DataTypes.INTEGER, allowNull: false },
      tipo: { type: DataTypes.STRING(20), allowNull: false },
      motivo_id: { type: DataTypes.INTEGER, allowNull: true },
      motivo_texto: { type: DataTypes.STRING(300), allowNull: true },
      hora_servidor: { type: DataTypes.DATE, allowNull: false },
      hora_dispositivo: { type: DataTypes.DATE, allowNull: true },
      hora_efectiva: { type: DataTypes.DATE, allowNull: false },
      origen: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'directo' },
      estado_validacion: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'valido',
      },
      lat: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
      lng: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
      accuracy: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
      distancia_m: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
      device_id: { type: DataTypes.STRING(64), allowNull: true },
      client_uuid: { type: DataTypes.UUID, allowNull: false },
      corrige_marcaje_id: { type: DataTypes.BIGINT, allowNull: true },
      registrado_por: { type: DataTypes.INTEGER, allowNull: true },
      hash_prev: { type: DataTypes.STRING(64), allowNull: true },
      hash: { type: DataTypes.STRING(64), allowNull: false },
    },
    {
      tableName: 'marcajes',
      underscored: true,
      timestamps: false,
      hooks: {
        beforeUpdate: bloquear,
        beforeDestroy: bloquear,
        beforeBulkUpdate: bloquear,
        beforeBulkDestroy: bloquear,
      },
    }
  );