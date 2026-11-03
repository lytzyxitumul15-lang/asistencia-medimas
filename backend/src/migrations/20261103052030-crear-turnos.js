'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('turnos', {
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
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      hora_entrada: { type: Sequelize.TIME, allowNull: false },
      hora_salida: { type: Sequelize.TIME, allowNull: false },
      dias_semana: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
      },
      tolerancia_min: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      activo: {
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

    await queryInterface.sequelize.query(
      `ALTER TABLE turnos
       ADD CONSTRAINT turnos_dias_check
       CHECK (cardinality(dias_semana) > 0
              AND dias_semana <@ ARRAY[1,2,3,4,5,6,7])`
    );

    await queryInterface.addIndex('turnos', ['empresa_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('turnos');
  },
};