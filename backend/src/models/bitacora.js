const { DataTypes } = require('sequelize');

const bloquear = () => {
  throw new Error('bitacora es de solo inserción');
};

module.exports = (sequelize) =>
  sequelize.define(
    'Bitacora',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      empresa_id: { type: DataTypes.INTEGER, allowNull: false },
      actor_id: { type: DataTypes.INTEGER, allowNull: true },
      accion: { type: DataTypes.STRING(60), allowNull: false },
      entidad: { type: DataTypes.STRING(60), allowNull: false },
      entidad_id: { type: DataTypes.BIGINT, allowNull: true },
      detalle: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      ip: { type: DataTypes.STRING(45), allowNull: true },
      creada_en: { type: DataTypes.DATE, allowNull: false },
      hash_prev: { type: DataTypes.STRING(64), allowNull: true },
      hash: { type: DataTypes.STRING(64), allowNull: false },
    },
    {
      tableName: 'bitacora',
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