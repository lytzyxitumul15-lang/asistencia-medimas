const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Usuario',
    {
      empresa_id: { type: DataTypes.INTEGER, allowNull: false },
      sede_id: { type: DataTypes.INTEGER, allowNull: false },
      nombre: { type: DataTypes.STRING(150), allowNull: false },
      usuario: { type: DataTypes.STRING(60), allowNull: false },
      email: { type: DataTypes.STRING(200), allowNull: true },
      password_hash: { type: DataTypes.STRING(100), allowNull: false },
      rol: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'empleado' },
      activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      debe_cambiar_password: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'usuarios',
      underscored: true,
      defaultScope: { attributes: { exclude: ['password_hash'] } },
      scopes: { conPassword: { attributes: { include: ['password_hash'] } } },
    }
  );