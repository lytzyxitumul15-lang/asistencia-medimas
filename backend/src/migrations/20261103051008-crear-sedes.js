'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sedes', {
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
      nombre: { type: Sequelize.STRING(150), allowNull: false },
      lat: { type: Sequelize.DECIMAL(10, 7), allowNull: false },
      lng: { type: Sequelize.DECIMAL(10, 7), allowNull: false },
      radio_m: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 50,
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

    await queryInterface.addIndex('sedes', ['empresa_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sedes');
  },
};