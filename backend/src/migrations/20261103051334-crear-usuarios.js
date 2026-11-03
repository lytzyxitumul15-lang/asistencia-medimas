'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      empresa_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'empresas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      sede_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sedes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      nombre: { type: Sequelize.STRING(150), allowNull: false },
      usuario: { type: Sequelize.STRING(60), allowNull: false },
      email: { type: Sequelize.STRING(200), allowNull: true },
      password_hash: { type: Sequelize.STRING(100), allowNull: false },
      rol: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'empleado',
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      debe_cambiar_password: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });

    await queryInterface.addConstraint('usuarios', {
      fields: ['rol'],
      type: 'check',
      where: { rol: ['empleado', 'admin'] },
      name: 'usuarios_rol_check',
    });

    await queryInterface.addIndex('usuarios', ['empresa_id', 'usuario'], {
      unique: true,
      name: 'usuarios_empresa_usuario_uq',
    });
    await queryInterface.addIndex('usuarios', ['sede_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('usuarios');
  },
};