'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bitacora', {
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
      actor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      accion: { type: Sequelize.STRING(60), allowNull: false },
      entidad: { type: Sequelize.STRING(60), allowNull: false },
      entidad_id: { type: Sequelize.BIGINT, allowNull: true },
      detalle: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: Sequelize.literal("'{}'::jsonb"),
      },
      ip: { type: Sequelize.STRING(45), allowNull: true },
      creada_en: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      hash_prev: { type: Sequelize.STRING(64), allowNull: true },
      hash: { type: Sequelize.STRING(64), allowNull: false },
    });

    await queryInterface.addIndex('bitacora', ['hash'], {
      unique: true,
      name: 'bitacora_hash_uq',
    });
    await queryInterface.addIndex('bitacora', ['empresa_id', 'id']);
    await queryInterface.addIndex('bitacora', ['entidad', 'entidad_id']);
    await queryInterface.addIndex('bitacora', ['actor_id']);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER bitacora_no_update_delete
      BEFORE UPDATE OR DELETE ON bitacora
      FOR EACH ROW EXECUTE FUNCTION prevent_mutation();
    `);
    await queryInterface.sequelize.query(`
      CREATE TRIGGER bitacora_no_truncate
      BEFORE TRUNCATE ON bitacora
      FOR EACH STATEMENT EXECUTE FUNCTION prevent_mutation();
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('bitacora');
  },
};