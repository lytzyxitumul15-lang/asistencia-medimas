'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('jornadas', {
      id: {
        type: Sequelize.BIGINT,
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
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      fecha: { type: Sequelize.DATEONLY, allowNull: false },
      turno_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'turnos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      estado: { type: Sequelize.STRING(20), allowNull: false },
      hora_entrada: { type: Sequelize.DATE, allowNull: true },
      hora_salida: { type: Sequelize.DATE, allowNull: true },
      minutos_retraso: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      minutos_salida_anticipada: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      minutos_fuera: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      minutos_trabajados: { type: Sequelize.INTEGER, allowNull: true },
      cerrada: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      calculada_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });

    await queryInterface.addConstraint('jornadas', {
      fields: ['estado'],
      type: 'check',
      where: {
        estado: [
          'a_tiempo', 'tardanza', 'tardanza_grave', 'salida_anticipada',
          'ausente', 'incompleto', 'pendiente', 'en_curso',
          'libre', 'sin_actividad', 'no_laborable',
        ],
      },
      name: 'jornadas_estado_check',
    });

    await queryInterface.addIndex('jornadas', ['usuario_id', 'fecha'], {
      unique: true,
      name: 'jornadas_usuario_fecha_uq',
    });
    await queryInterface.addIndex('jornadas', ['empresa_id', 'fecha']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('jornadas');
  },
};