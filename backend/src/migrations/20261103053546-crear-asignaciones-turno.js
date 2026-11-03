'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('asignaciones_turno', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      turno_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'turnos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      vigente_desde: { type: Sequelize.DATEONLY, allowNull: false },
      vigente_hasta: { type: Sequelize.DATEONLY, allowNull: true },
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

    await queryInterface.sequelize.query(
      `ALTER TABLE asignaciones_turno
       ADD CONSTRAINT asignaciones_fechas_check
       CHECK (vigente_hasta IS NULL OR vigente_hasta >= vigente_desde)`
    );

    await queryInterface.addIndex(
      'asignaciones_turno',
      ['usuario_id', 'turno_id', 'vigente_desde'],
      { unique: true, name: 'asignaciones_usuario_turno_desde_uq' }
    );
    await queryInterface.addIndex('asignaciones_turno', ['turno_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('asignaciones_turno');
  },
};