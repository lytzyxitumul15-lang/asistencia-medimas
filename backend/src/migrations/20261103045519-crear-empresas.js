'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('empresas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: { type: Sequelize.STRING(150), allowNull: false },
      zona_horaria: {
        type: Sequelize.STRING(60),
        allowNull: false,
        defaultValue: 'America/Guatemala',
      },
      configuracion: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: Sequelize.literal("'{}'::jsonb"),
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('empresas');
  },
};