'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('motivos_salida', {
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
      requiere_detalle: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex('motivos_salida', ['empresa_id', 'nombre'], {
      unique: true,
      name: 'motivos_empresa_nombre_uq',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('motivos_salida');
  },
};