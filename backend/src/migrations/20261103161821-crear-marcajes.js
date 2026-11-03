'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('marcajes', {
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
      sede_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sedes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      tipo: { type: Sequelize.STRING(20), allowNull: false },
      motivo_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'motivos_salida', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      motivo_texto: { type: Sequelize.STRING(300), allowNull: true },
      hora_servidor: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      hora_dispositivo: { type: Sequelize.DATE, allowNull: true },
      hora_efectiva: { type: Sequelize.DATE, allowNull: false },
      origen: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'directo',
      },
      estado_validacion: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'valido',
      },
      lat: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      lng: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      accuracy: { type: Sequelize.DECIMAL(8, 2), allowNull: true },
      distancia_m: { type: Sequelize.DECIMAL(8, 2), allowNull: true },
      device_id: { type: Sequelize.STRING(64), allowNull: true },
      client_uuid: { type: Sequelize.UUID, allowNull: false },
      corrige_marcaje_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'marcajes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      registrado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      hash_prev: { type: Sequelize.STRING(64), allowNull: true },
      hash: { type: Sequelize.STRING(64), allowNull: false },
    });

    await queryInterface.addConstraint('marcajes', {
      fields: ['tipo'],
      type: 'check',
      where: { tipo: ['entrada', 'salida', 'salida_temporal', 'regreso'] },
      name: 'marcajes_tipo_check',
    });
    await queryInterface.addConstraint('marcajes', {
      fields: ['origen'],
      type: 'check',
      where: { origen: ['directo', 'diferido', 'correccion', 'incidencia'] },
      name: 'marcajes_origen_check',
    });
    await queryInterface.addConstraint('marcajes', {
      fields: ['estado_validacion'],
      type: 'check',
      where: { estado_validacion: ['valido', 'pendiente', 'rechazado'] },
      name: 'marcajes_validacion_check',
    });

    await queryInterface.addIndex('marcajes', ['client_uuid'], {
      unique: true,
      name: 'marcajes_client_uuid_uq',
    });
    await queryInterface.addIndex('marcajes', ['hash'], {
      unique: true,
      name: 'marcajes_hash_uq',
    });
    await queryInterface.addIndex('marcajes', ['usuario_id', 'hora_efectiva']);
    await queryInterface.addIndex('marcajes', ['empresa_id', 'id']);
    await queryInterface.addIndex('marcajes', ['device_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('marcajes');
  },
};