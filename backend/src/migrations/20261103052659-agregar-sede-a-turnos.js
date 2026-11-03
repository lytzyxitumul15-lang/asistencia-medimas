'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('turnos', 'sede_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'sedes', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
    await queryInterface.addIndex('turnos', ['sede_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('turnos', 'sede_id');
  },
};