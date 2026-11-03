const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Sede',
    {
      empresa_id: { type: DataTypes.INTEGER, allowNull: false },
      nombre: { type: DataTypes.STRING(150), allowNull: false },
      lat: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
        get() {
          return Number(this.getDataValue('lat'));
        },
      },
      lng: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: false,
        get() {
          return Number(this.getDataValue('lng'));
        },
      },
      radio_m: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 50 },
    },
    { tableName: 'sedes', underscored: true }
  );